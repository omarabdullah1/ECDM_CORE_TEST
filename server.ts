import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { z } from "zod";
import { google } from "googleapis";
import { 
  User, 
  SalesOrder, 
  CustomerOrder, 
  WorkOrder, 
  Inventory, 
  StockMovement, 
  ModificationRequest, 
  AuditLog,
  Invoice,
  FollowUpReminder,
  Customer,
  Supplier,
  PurchaseOrder,
  SalesLead,
  MarketingCampaign,
  MarketingLead,
  SyncConfig,
  ContentTracker,
  CampaignResult,
  CampaignTracker,
  MarketingReport,
  Category,
  ProcessedRequest,
  IUser,
  UserRole
} from "./models.ts";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Idempotency Middleware
const checkIdempotency = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.header("X-Idempotency-Key");
  if (!key) return next();

  try {
    const existing = await ProcessedRequest.findOne({ idempotencyKey: key });
    if (existing) {
      return res.status(existing.responseStatus).json(existing.responseBody);
    }

    // Wrap res.json to capture the response for future requests with the same key
    const originalJson = res.json;
    res.json = function (body) {
      const responseStatus = res.statusCode;
      // We don't await here to avoid blocking the response, but ideally we should handle errors
      ProcessedRequest.create({
        idempotencyKey: key,
        responseStatus,
        responseBody: body
      }).catch(err => console.error("Failed to store idempotency key:", err));
      
      return originalJson.call(this, body);
    };

    next();
  } catch (err) {
    console.error("Idempotency check failed:", err);
    next();
  }
};

// Trust proxy for Cloud Run/Nginx
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow Vite in dev
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
});
app.use("/api/", limiter);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsDir));

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_123";

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecdm_core";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Fix duplicate key error by dropping the unique email index if it exists
    try {
      const db = mongoose.connection.db;
      await db.collection('customers').dropIndex('email_1').catch(() => {});
      await db.collection('customers').dropIndex('phone_1').catch(() => {});
      await db.collection('marketingleads').dropIndex('phone_1').catch(() => {});
      await db.collection('salesleads').dropIndex('phone_1').catch(() => {});
      await db.collection('salesleads').dropIndex('name_1_phone_1').catch(() => {});
      await db.collection('suppliers').dropIndex('email_1').catch(() => {});
      await db.collection('users').dropIndex('email_1').catch(() => {});
      await db.collection('inventories').dropIndex('name_1').catch(() => {});
      console.log("Dropped unique indexes to ensure clean state");
    } catch (e) {
      // Ignore errors
    }

    // Seed SuperAdmin if not exists
    const adminExists = await User.findOne({ role: "SuperAdmin" });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("admin123", salt);
      await User.create({
        name: "Super Admin",
        email: "superadmin@ecdm.com",
        passwordHash,
        role: "SuperAdmin",
        targetSales: 500000,
        targetBudget: 200000,
      });
      console.log("Seeded SuperAdmin: superadmin@ecdm.com / admin123");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

// Middleware

// --- Zod Schemas ---
const SalesOrderSchemaZod = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.string().email(),
  totalAmount: z.number().positive(),
  notes: z.string().optional(),
  quotationItems: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().positive(),
    price: z.number().nonnegative(),
  })).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
});

// --- Auth Utilities ---
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// --- Auth Middleware ---
interface AuthRequest extends Request {
  user?: IUser;
  file?: any;
}

const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) return res.status(401).json({ error: "Unauthorized", code: "TOKEN_EXPIRED" });

  try {
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found", code: "TOKEN_EXPIRED" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
  }
};

const authorize = (roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

// --- Audit Log Middleware ---
const auditLogger = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && res.statusCode < 400) {
      AuditLog.create({
        userId: req.user?._id,
        action: `${req.method} ${req.originalUrl}`,
        details: `Body: ${JSON.stringify(req.body)}`,
        ipAddress: req.ip || "unknown",
      }).catch(console.error);
    }
    return originalSend.apply(res, arguments as any);
  };
  next();
};

// --- Maker-Checker Middleware ---
const makerChecker = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "Sales" || req.method !== "PATCH") return next();

  const protectedFields = ["customerName", "customerPhone", "customerEmail", "totalAmount"];
  const { id } = req.params;
  
  try {
    const order = await SalesOrder.findById(id);
    if (!order) return next();

    const protectedChanges: any = {};
    const hasProtectedChanges = Object.keys(req.body).some(key => {
      if (!protectedFields.includes(key)) return false;
      const isChanged = String(req.body[key]) !== String((order as any)[key]);
      if (isChanged) {
        protectedChanges[key] = req.body[key];
      }
      return isChanged;
    });

    if (hasProtectedChanges) {
      await ModificationRequest.create({
        entityId: new mongoose.Types.ObjectId(id),
        entityType: "SalesOrder",
        requestedBy: req.user?._id,
        changes: protectedChanges,
      });
      
      // Remove protected fields from req.body so they are not updated immediately
      protectedFields.forEach(field => {
        delete req.body[field];
      });
      
      // Set a flag to inform the next handler that some fields are pending approval
      (req as any).pendingApproval = true;
    }
  } catch (error) {
    console.error("MakerChecker error:", error);
  }
  next();
};

// --- API Routes ---

// Inventory
// --- Inventory: Categories ---
app.get("/api/inventory/categories", authenticate, async (req: AuthRequest, res: Response) => {
  const categories = await Category.find();
  res.json(categories);
});

app.post("/api/inventory/categories", authenticate, authorize(["SuperAdmin", "Admin", "Operations"]), checkIdempotency, async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/inventory/categories/:id", authenticate, authorize(["SuperAdmin", "Admin", "Operations"]), async (req: AuthRequest, res: Response) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/inventory", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

app.post("/api/inventory", authenticate, authorize(["SuperAdmin", "Admin", "Operations"]), upload.single("dataSheet"), checkIdempotency, async (req: AuthRequest, res: Response) => {
  try {
    const { itemName, specification, category, unitPrice, stockNumber, notes } = req.body;
    const lastItem = await Inventory.findOne().sort({ createdAt: -1 });
    const lastId = lastItem && lastItem.sparePartsId ? parseInt(lastItem.sparePartsId.split('-')[1] || '0') : 0;
    const sparePartsId = `SP-${lastId + 1}`;
    
    let dataSheetUrl = "";
    if (req.file) {
      dataSheetUrl = `/uploads/${req.file.filename}`;
    }

    const item = await Inventory.create({
      sparePartsId,
      itemName,
      specification,
      category,
      unitPrice,
      stockNumber,
      notes,
      dataSheetUrl
    });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create inventory item" });
  }
});

app.patch("/api/inventory/:id", authenticate, authorize(["SuperAdmin", "Admin", "Operations"]), upload.single("dataSheet"), checkIdempotency, async (req: AuthRequest, res: Response) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.dataSheetUrl = `/uploads/${req.file.filename}`;
    }
    const item = await Inventory.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update inventory item" });
  }
});

app.delete("/api/inventory/:id", authenticate, authorize(["SuperAdmin", "Admin", "Operations"]), async (req: AuthRequest, res: Response) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

// Auth
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (user.isActive === false) {
    return res.status(403).json({ error: "Account is deactivated. Please contact an administrator." });
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({ user: { id: user._id, name: user.name, role: user.role, email: user.email, maxDiscountPercentage: user.maxDiscountPercentage, isActive: user.isActive } });
});

app.post("/api/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const tokens = generateTokens(user._id.toString());
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie("accessToken", tokens.accessToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: "Token refreshed" });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

app.post("/api/auth/logout", authenticate, async (req: AuthRequest, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save();
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

app.get("/api/auth/me", authenticate, (req: AuthRequest, res) => {
  res.json({ user: { id: req.user?._id, name: req.user?.name, role: req.user?.role, email: req.user?.email, maxDiscountPercentage: req.user?.maxDiscountPercentage, isActive: req.user?.isActive } });
});

// CRM & Sales
app.get("/api/sales/orders", authenticate, async (req: AuthRequest, res) => {
  const filter = ["SuperAdmin", "Admin", "Manager"].includes(req.user?.role || "") 
    ? {} 
    : { salesPersonId: req.user?._id };
  const orders = await SalesOrder.find(filter).populate("salesPersonId", "email name");
  res.json(orders);
});

app.post("/api/sales/orders", authenticate, auditLogger, checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const validatedData = SalesOrderSchemaZod.parse(req.body);
    
    // Discount Validation for Sales
    if (validatedData.discountPercentage && req.user?.role === "Sales") {
      if (validatedData.discountPercentage > (req.user.maxDiscountPercentage || 0)) {
        return res.status(400).json({ error: `Discount exceeds your limit of ${req.user.maxDiscountPercentage}%` });
      }
    }

    // Price Validation for Sales
    if (validatedData.quotationItems && req.user?.role === "Sales") {
      for (const item of validatedData.quotationItems) {
        const inv = await Inventory.findById(item.itemId);
        if (inv && item.price !== inv.unitPrice) {
          return res.status(400).json({ error: `You are not authorized to change the price of ${inv.itemName}` });
        }
      }
    }

    const order = await SalesOrder.create({
      ...validatedData,
      salesPersonId: req.user?._id,
    });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.errors || "Validation failed" });
  }
});

// Cascading Automation Trigger
app.patch("/api/sales/orders/:id", authenticate, makerChecker, auditLogger, checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const order = await SalesOrder.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Ownership check
    if (!["SuperAdmin", "Admin", "Manager"].includes(req.user?.role || "") && order.salesPersonId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Discount Validation for Sales
    if (req.body.discountPercentage && req.user?.role === "Sales") {
      if (req.body.discountPercentage > (req.user.maxDiscountPercentage || 0)) {
        return res.status(400).json({ error: `Discount exceeds your limit of ${req.user.maxDiscountPercentage}%` });
      }
    }

    // Price Validation for Sales
    if (req.body.quotationItems && req.user?.role === "Sales") {
      for (const item of req.body.quotationItems) {
        const inv = await Inventory.findById(item.itemId);
        if (inv && item.price !== inv.unitPrice) {
          return res.status(400).json({ error: `You are not authorized to change the price of ${inv.itemName}` });
        }
      }
    }

    const updatedOrder = await SalesOrder.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedOrder) return res.status(404).json({ error: "Order not found" });

    if ((req as any).pendingApproval) {
      return res.json({ 
        message: "Order details updated. Note: Changes to Name, Phone, Email, or Amount require admin approval and have been submitted for review.", 
        status: "PENDING_APPROVAL",
        order: updatedOrder
      });
    }

    const isWon = 
      updatedOrder.quotationStatusFirstFollowUp === "Accepted" || 
      updatedOrder.finalStatusThirdFollowUp === "Accepted";
      
    const isLost = 
      updatedOrder.quotationStatusFirstFollowUp === "Rejected" ||
      updatedOrder.finalStatusThirdFollowUp === "Not Potential";

    if (isLost) {
      // Move to No Potential
      await SalesLead.create({
        name: updatedOrder.customerName,
        phone: updatedOrder.customerPhone,
        email: updatedOrder.customerEmail,
        status: "No Potential",
        notes: `Copied from SalesOrder: ${updatedOrder._id}. Reason: Status is Not Potential.`,
      });
      await SalesOrder.findByIdAndDelete(id);
      return res.json({ message: "Order moved to SalesLead as 'No Potential'." });
    }

    if (isWon && !updatedOrder.automationTriggered) {
      // Idempotency: Mark as triggered
      updatedOrder.automationTriggered = true;
      await updatedOrder.save();

      // 1. Create Customer Order (Snapshot Context)
      const customerOrder = await CustomerOrder.create({
        salesOrderId: updatedOrder._id,
        orderContext: {
          customerName: updatedOrder.customerName,
          customerPhone: updatedOrder.customerPhone,
          customerEmail: updatedOrder.customerEmail,
          totalAmount: updatedOrder.totalAmount,
        },
      });

      // 2. Auto-generate Work Order
      await WorkOrder.create({
        customerOrderId: customerOrder._id,
      });

      // 3. Auto-generate Invoice Draft
      await Invoice.create({
        customerOrderId: customerOrder._id,
        total: updatedOrder.totalAmount,
        status: "Draft",
      });
    }

    res.json(updatedOrder);
  } catch (err: any) {
    console.error("Error updating order:", err);
    res.status(400).json({ error: err.errors || "Update failed" });
  }
});

// Governance & Modification Requests
app.get("/api/governance/requests", authenticate, authorize(["SuperAdmin", "Admin", "Manager"]), async (req, res) => {
  const requests = await ModificationRequest.find({ status: "Pending" })
    .populate("requestedBy", "name email")
    .populate("entityId");
  res.json(requests);
});

// Work Orders
app.get("/api/ops/work-orders", authenticate, authorize(["SuperAdmin", "Admin", "Operations"]), async (req, res) => {
  const orders = await WorkOrder.find().populate("customerOrderId");
  res.json(orders);
});

app.post("/api/governance/requests/:id/resolve", authenticate, authorize(["SuperAdmin", "Admin"]), auditLogger, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "Approved" | "Rejected"

  const request = await ModificationRequest.findById(id);
  if (!request) return res.status(404).json({ error: "Request not found" });

  if (status === "Approved") {
    if (request.entityType === "SalesOrder") {
      await SalesOrder.findByIdAndUpdate(request.entityId, request.changes);
    }
    request.status = "Approved";
  } else {
    request.status = "Rejected";
  }

  await request.save();
  res.json({ message: `Request ${status}` });
});

// --- CRM: Customers ---
async function ensureCustomerAndGetCode(name: string, phone: string, address?: string, type?: string, sector?: string, sheetId?: string) {
  let customer = await Customer.findOne({ name, phone });
  if (!customer) {
    customer = new Customer({ 
      name, 
      phone, 
      address, 
      customerCode: sheetId, // If provided from sheet, use it
      notes: `Lead Type: ${type}, Sector: ${sector}` 
    });
    await customer.save(); // Triggers pre-save hook for customerCode if not provided
  } else {
    if (address) customer.address = address;
    if (sheetId && !customer.customerCode) customer.customerCode = sheetId;
    await customer.save();
  }
  return customer.customerCode;
}

app.get("/api/crm/customers", authenticate, async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

app.post("/api/crm/customers", authenticate, authorize(["SuperAdmin", "Admin", "Sales"]), checkIdempotency, async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Supply Chain: Suppliers & Purchase Orders ---
app.get("/api/scm/suppliers", authenticate, async (req, res) => {
  const suppliers = await Supplier.find();
  res.json(suppliers);
});

app.post("/api/scm/suppliers", authenticate, authorize(["SuperAdmin", "Admin", "Operations"]), checkIdempotency, async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(supplier);
});

app.get("/api/scm/purchase-orders", authenticate, async (req, res) => {
  const pos = await PurchaseOrder.find().populate("supplierId");
  res.json(pos);
});

app.post("/api/scm/purchase-orders", authenticate, authorize(["SuperAdmin", "Admin", "Operations"]), checkIdempotency, async (req, res) => {
  const po = await PurchaseOrder.create(req.body);
  res.status(201).json(po);
});

// --- Reports & Exports ---
app.get("/api/reports/inventory/export", authenticate, authorize(["SuperAdmin", "Admin", "Manager"]), async (req, res) => {
  try {
    const items = await Inventory.find().lean();
    const worksheet = XLSX.utils.json_to_sheet(items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=inventory_report.xlsx");
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reports/invoice/:id/pdf", authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("customerOrderId");
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("ECDM Core - INVOICE", 10, 20);
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoice._id}`, 10, 30);
    doc.text(`Date: ${invoice.issueDate.toDateString()}`, 10, 40);
    doc.text(`Status: ${invoice.status}`, 10, 50);
    doc.text(`Total Amount: $${invoice.total}`, 10, 60);

    const buffer = Buffer.from(doc.output("arraybuffer"));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${invoice._id}.pdf`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// User Management
app.get("/api/users", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  const users = await User.find({}, "-passwordHash");
  res.json(users);
});

app.post("/api/users", authenticate, authorize(["SuperAdmin", "Admin"]), auditLogger, checkIdempotency, async (req, res) => {
  try {
    const { name, email, password, role, targetSales, targetBudget, maxDiscountPercentage, isActive } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, passwordHash, role, targetSales, targetBudget, maxDiscountPercentage, isActive: isActive !== undefined ? isActive : true });
    res.status(201).json({ user: { id: user._id, name: user.name, role: user.role, email: user.email, isActive: user.isActive } });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/users/:id", authenticate, authorize(["SuperAdmin", "Admin"]), auditLogger, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    res.json(user);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: error.message });
  }
});

// Seed SuperAdmin
const seedSuperAdmin = async () => {
  const superAdmin = await User.findOne({ role: "SuperAdmin" });
  if (!superAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("admin123", salt);
    await User.create({
      name: "System SuperAdmin",
      email: "superadmin@ecdm.com",
      passwordHash,
      role: "SuperAdmin",
      targetSales: 1000000,
      targetBudget: 500000
    });
    console.log("SuperAdmin seeded");
  }
};
seedSuperAdmin();

// Follow-up Reminders
app.get("/api/sales/reminders", authenticate, authorize(["SuperAdmin", "Admin", "Manager", "Sales"]), async (req, res) => {
  const reminders = await FollowUpReminder.find().populate("salesOrderId");
  res.json(reminders);
});

// Operations & Atomic Transactions
app.post("/api/ops/work-orders/:id/complete", authenticate, authorize(["Admin", "SuperAdmin", "Operations"]), auditLogger, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { partsUsed } = req.body; // [{ partId, quantity }]

    const workOrder = await WorkOrder.findById(id).session(session);
    if (!workOrder) throw new Error("Work order not found");

    for (const item of partsUsed) {
      const inv = await Inventory.findById(item.partId).session(session);
      if (!inv || inv.stockNumber < item.quantity) {
        throw new Error(`Insufficient stock for ${inv?.itemName || "item"}`);
      }
      inv.stockNumber -= item.quantity;
      await inv.save({ session });

      await StockMovement.create([{
        partId: item.partId,
        quantity: item.quantity,
        type: "OUT",
        reference: `WorkOrder ${id}`,
      }], { session });
    }

    workOrder.status = "Completed";
    workOrder.partsUsed = partsUsed;
    await workOrder.save({ session });

    await session.commitTransaction();
    res.json({ message: "Work order completed and stock deducted atomically" });
  } catch (err: any) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

// Financial Aggregations
app.get("/api/dashboard/summary", authenticate, authorize(["SuperAdmin", "Admin", "Manager"]), async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const summary = await Invoice.aggregate([
    {
      $facet: {
        realRevenue: [
          { $match: { status: "Paid", paidAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ],
        projectedRevenue: [
          { $match: { status: { $in: ["Sent", "Overdue"] }, issueDate: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$total" } } }
        ],
        inventoryValuation: [
          {
            $lookup: {
              from: "inventories",
              pipeline: [
                { $project: { value: { $multiply: ["$stockNumber", "$price"] } } },
                { $group: { _id: null, total: { $sum: "$value" } } }
              ],
              as: "inv"
            }
          }
        ]
      }
    }
  ]);

  res.json(summary[0]);
});

// Marketing & Leads
app.get("/api/marketing/leads", authenticate, async (req, res) => {
  const leads = await MarketingLead.find().sort({ createdAt: -1 });
  res.json(leads);
});

// Sync Config Endpoints
app.get("/api/marketing/sync-config", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  const type = req.query.type || "marketing-leads";
  const configs = await SyncConfig.find({ type }).sort({ createdAt: -1 });
  res.json(configs);
});

app.post("/api/marketing/sync-config", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { name, type = "marketing-leads", spreadsheetId, sheetName, serviceAccountKey } = req.body;
    let config = await SyncConfig.findOne({ name, type });
    if (config) {
      config.spreadsheetId = spreadsheetId;
      config.sheetName = sheetName;
      config.serviceAccountKey = serviceAccountKey;
      await config.save();
    } else {
      config = await SyncConfig.create({ name, type, spreadsheetId, sheetName, serviceAccountKey });
    }
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/marketing/leads/bulk", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });
    await MarketingLead.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Bulk delete successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/marketing/leads/:id", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    await MarketingLead.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/sales/orders/bulk", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });
    await SalesOrder.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Bulk delete successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/sales/orders/:id", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    await SalesOrder.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/crm/customers/bulk", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });
    await Customer.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Bulk delete successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/crm/customers/:id", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/scm/suppliers/bulk", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });
    await Supplier.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Bulk delete successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/scm/suppliers/:id", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/marketing/leads", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      source: req.body.source || "Manual Entry"
    };
    
    // Use findOneAndUpdate with upsert to prevent duplicates
    const mLead = await MarketingLead.findOneAndUpdate(
      { name: leadData.name, phone: leadData.phone },
      leadData,
      { upsert: true, new: true }
    );
    
    const sLead = await SalesLead.findOneAndUpdate(
      { name: leadData.name, phone: leadData.phone },
      { ...leadData, source: "Marketing Manual" },
      { upsert: true, new: true }
    );
    
    let customer = await Customer.findOneAndUpdate(
      { name: leadData.name, phone: leadData.phone },
      { 
        address: leadData.address,
        $setOnInsert: { notes: `Lead Type: ${leadData.type}, Sector: ${leadData.sector}` }
      },
      { upsert: true, new: true }
    );
    
    res.status(201).json({ mLead, sLead, customer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/marketing/sheets", authenticate, authorize(["SuperAdmin", "Admin"]), upload.single("serviceAccountFile"), checkIdempotency, async (req: AuthRequest, res: Response) => {
  let { spreadsheetId, serviceAccountKey } = req.body;
  
  if (req.file) {
    serviceAccountKey = req.file.buffer.toString("utf-8");
  }

  if (!spreadsheetId) return res.status(400).json({ error: "Spreadsheet ID is required" });

  try {
    const finalKey = serviceAccountKey || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!finalKey) return res.status(400).json({ error: "No Google credentials provided." });

    const key = JSON.parse(finalKey);
    const auth = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
    
    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheetNames = response.data.sheets?.map(s => s.properties?.title).filter(Boolean) || [];
    res.json(sheetNames);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/marketing/leads/preview-sync", authenticate, authorize(["SuperAdmin", "Admin"]), upload.single("serviceAccountFile"), checkIdempotency, async (req: AuthRequest, res: Response) => {
  let { spreadsheetId, sheetName, serviceAccountKey, saveConfig, name } = req.body;
  
  if (req.file) {
    serviceAccountKey = req.file.buffer.toString("utf-8");
  }

  if (!spreadsheetId) return res.status(400).json({ error: "Spreadsheet ID is required" });

  try {
    // If saveConfig is true, save the configuration for later use
    if (saveConfig === "true" || saveConfig === true) {
      if (!name) return res.status(400).json({ error: "Connection name is required to save configuration" });
      let config = await SyncConfig.findOne({ name, type: "marketing-leads" });
      if (config) {
        config.spreadsheetId = spreadsheetId;
        config.sheetName = sheetName || "Marketing Leads!A:H";
        if (serviceAccountKey) config.serviceAccountKey = serviceAccountKey;
        await config.save();
      } else {
        await SyncConfig.create({ 
          name,
          type: "marketing-leads",
          spreadsheetId, 
          sheetName: sheetName || "Marketing Leads!A:H", 
          serviceAccountKey: serviceAccountKey || "" 
        });
      }
    }
    const finalKey = serviceAccountKey || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!finalKey) return res.status(400).json({ error: "No Google credentials provided." });

    const key = JSON.parse(finalKey);
    const auth = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
    
    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName || "Marketing Leads!A:H",
    });
    const rows = response.data.values || [];

    if (rows.length === 0) return res.json([]);

    const previewData = await Promise.all(rows.map(async (row) => {
      // Mapping based on the provided Google Sheet image:
      // A (0): ID (Ignore for data, but can be used for tracking)
      // B (1): Name
      // C (2): Phone
      // D (3): Source / Platform (e.g. Facebook, Instagram)
      // E (4): Sector / Type (e.g. B2B, B2C)
      // F (5): Date
      // G (6): Notes
      // H (7): Column 1
      
      const name = row[1] ? String(row[1]).trim() : "";
      const phone = row[2] ? String(row[2]).trim() : "";
      const type = row[3] ? String(row[3]).trim() : "";
      const sector = row[4] ? String(row[4]).trim() : "";
      const source = "Google Sheets Sync";
      const address = ""; // Not in sheet
      const notes = row[6] ? String(row[6]).trim() : "";
      const createdAt = row[5] ? new Date(row[5]) : new Date();

      if (!phone || !name) return null;

      const existingLead = await MarketingLead.findOne({ name, phone });
      
      return {
        name,
        phone,
        type,
        sector,
        address,
        source,
        notes,
        createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
        status: existingLead ? 'update' : 'new',
        existingData: existingLead || null
      };
    }));

    res.json(previewData.filter(Boolean));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/marketing/leads/commit-sync", authenticate, authorize(["SuperAdmin", "Admin"]), checkIdempotency, async (req, res) => {
  const { leads } = req.body;
  if (!leads || !Array.isArray(leads)) return res.status(400).json({ error: "Leads array required" });

  try {
    const results = [];
    for (const leadData of leads) {
      const { name, phone, type, sector, address, notes, createdAt } = leadData;
      
      const customerCode = await ensureCustomerAndGetCode(name, phone, address, type, sector);

      // Update or Create in MarketingLead
      const mLead = await MarketingLead.findOneAndUpdate(
        { name, phone },
        { 
          name, 
          phone, 
          type, 
          sector, 
          address, 
          source: "Google Sheets Sync", 
          status: "Have", 
          customerCode,
          notes,
          createdAt: createdAt ? new Date(createdAt) : new Date()
        },
        { upsert: true, new: true }
      );

      // Also update/create in SalesLead
      await SalesLead.findOneAndUpdate(
        { name, phone },
        { 
          name, 
          phone, 
          type, 
          sector, 
          address, 
          source: "Google Sheets Sync", 
          status: "Have", 
          customerCode,
          notes,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
          isMarketingLead: true
        },
        { upsert: true }
      );
      
      results.push(mLead);
    }
    res.json({ message: `Successfully committed ${results.length} leads`, count: results.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/marketing/leads/sync-sheets", authenticate, authorize(["SuperAdmin", "Admin"]), upload.single("serviceAccountFile"), checkIdempotency, async (req: AuthRequest, res: Response) => {
  let { spreadsheetId, sheetName, serviceAccountKey, saveConfig, name } = req.body;
  
  // If a file was uploaded, use its content as the service account key
  if (req.file) {
    serviceAccountKey = req.file.buffer.toString("utf-8");
  }

  if (!spreadsheetId) return res.status(400).json({ error: "Spreadsheet ID is required" });

  try {
    // If saveConfig is true, save the configuration for later use
    if (saveConfig === "true" || saveConfig === true) {
      if (!name) return res.status(400).json({ error: "Connection name is required to save configuration" });
      let config = await SyncConfig.findOne({ name, type: "marketing-leads" });
      if (config) {
        config.spreadsheetId = spreadsheetId;
        config.sheetName = sheetName || "Marketing Leads!A:H";
        if (serviceAccountKey) config.serviceAccountKey = serviceAccountKey;
        await config.save();
      } else {
        await SyncConfig.create({ 
          name,
          type: "marketing-leads",
          spreadsheetId, 
          sheetName: sheetName || "Marketing Leads!A:H", 
          serviceAccountKey: serviceAccountKey || "" 
        });
      }
    }

    let rows: any[][] = [];
    
    // If serviceAccountKey is provided, use it. Otherwise, fallback to env
    const finalKey = serviceAccountKey || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    if (finalKey) {
      const key = JSON.parse(finalKey);
      const auth = new google.auth.JWT({
        email: key.client_email,
        key: key.private_key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
      });
      
      const sheets = google.sheets({ version: "v4", auth });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName || "Marketing Leads!A:H", // ID, Name, Phone, Source, Sector, Date, Notes, Col1
      });
      rows = response.data.values || [];
    } else {
      return res.status(400).json({ error: "No Google credentials provided. Please upload a JSON key or provide it as text." });
    }

    if (rows.length === 0) return res.json({ message: "No data found in sheet" });

    const results = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows or rows missing name/phone (Name at index 1, Phone at index 2)
      if (!row || row.length < 3 || !row[1] || !row[2]) {
        continue;
      }

      // Skip header row if it contains header-like text (case insensitive)
      const nameCell = String(row[1]).toLowerCase();
      const phoneCell = String(row[2]).toLowerCase();
      if (
        (nameCell.includes("name") || nameCell.includes("الاسم")) && 
        (phoneCell.includes("phone") || phoneCell.includes("هاتف") || phoneCell.includes("رقم"))
      ) {
        continue;
      }

      const leadData = {
        name: String(row[1]).trim(),
        phone: String(row[2]).trim(),
        type: row[3] ? String(row[3]).trim() : "",
        sector: row[4] ? String(row[4]).trim() : "",
        source: "Google Sheets Sync",
        address: "",
        notes: row[6] ? String(row[6]).trim() : "",
        createdAt: row[5] ? new Date(row[5]) : new Date()
      };
      
      // Ensure createdAt is a valid date
      if (isNaN(leadData.createdAt.getTime())) {
        leadData.createdAt = new Date();
      }
      
      try {
        const customerCode = await ensureCustomerAndGetCode(leadData.name, leadData.phone, leadData.address, leadData.type, leadData.sector);

        // Implement the Cycle: Marketing -> Sales -> Customer
        // Use findOneAndUpdate with upsert to prevent duplicates
        const mLead = await MarketingLead.findOneAndUpdate(
          { name: leadData.name, phone: leadData.phone },
          { ...leadData, status: "Have", customerCode },
          { upsert: true, new: true }
        );

        const sLead = await SalesLead.findOneAndUpdate(
          { name: leadData.name, phone: leadData.phone },
          { ...leadData, isMarketingLead: true, status: "Have", customerCode },
          { upsert: true, new: true }
        );
        
        results.push({ mLead, sLead, customerCode });
      } catch (err: any) {
        console.error(`Failed to process row ${i + 1}:`, err.message);
        // Continue to next row instead of failing the whole sync
      }
    }

    res.json({ message: `Successfully synced ${results.length} leads.`, count: results.length });
  } catch (error: any) {
    console.error("Sync Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/sales/leads", authenticate, async (req, res) => {
  try {
    const leads = await SalesLead.find({ status: { $ne: "No Potential" } })
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

app.get("/api/sales/leads/non-potential", authenticate, async (req, res) => {
  try {
    const leads = await SalesLead.find({ status: "No Potential" })
      .sort({ createdAt: -1 });
    res.json(leads);
  } catch (error: any) {
    console.error("Error fetching non-potential leads:", error);
    res.status(500).json({ error: "Failed to fetch non-potential leads" });
  }
});

app.patch("/api/sales/leads/:id", authenticate, authorize(["SuperAdmin", "Admin", "Sales"]), checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { orderCreated, ...updateData } = req.body;
    console.log("req.body:", req.body);
    console.log("orderCreated:", orderCreated);
    console.log("updateData:", updateData);
    
    const lead = await SalesLead.findById(id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    // Ownership check: Only Admins or the assigned salesperson can edit.
    // If it's not assigned, anyone with Sales role can edit (and it will be assigned to them).
    const isAdmin = ["SuperAdmin", "Admin"].includes(req.user.role);
    if (!isAdmin && lead.assignedTo && lead.assignedTo !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized: This lead is assigned to another employee." });
    }

    // If marketing sync data, prevent editing core fields
    if (lead.source.includes("Marketing")) {
      delete updateData.name;
      delete updateData.phone;
      delete updateData.email;
      delete updateData.address;
      delete updateData.type;
      delete updateData.sector;
      delete updateData.customerCode;
    }

    if (orderCreated === "yes") {
      updateData.status = "Converted";
      // Create SalesOrder
      await SalesOrder.create({
        salesPersonId: req.user._id,
        customerCode: lead.customerCode,
        customerName: lead.name,
        customerPhone: lead.phone,
        customerEmail: lead.email || "N/A",
        address: lead.address,
        sector: lead.sector,
        initialIssue: lead.issue,
        totalAmount: 0,
        quotationStatusFirstFollowUp: "Select Status",
        statusSecondFollowUp: "Select Status",
        finalStatusThirdFollowUp: "Select Final Status",
      });
    } else if (orderCreated === "no") {
      updateData.status = "Lost"; // Update original lead status to Lost
      // Create a copy of the lead with "No Potential" status
      await SalesLead.create({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        status: "No Potential",
        type: lead.type,
        sector: lead.sector,
        address: lead.address,
        issue: lead.issue,
        reason: lead.reason,
        notes: `Copy of lead ${lead._id}. Reason: Order marked as No.`,
        assignedTo: lead.assignedTo,
        isMarketingLead: lead.isMarketingLead,
      });
      console.log("No Potential lead copy created successfully.");

      // Delete SalesOrder if exists
      console.log("Deleting SalesOrder for phone:", lead.phone);
      const deletedOrder = await SalesOrder.findOneAndDelete({ customerPhone: lead.phone });
      console.log("SalesOrder deleted:", deletedOrder);
    }

    // Automatically assign to the current user if they are a Sales role and it's not already assigned
    if (req.user.role === "Sales" && !lead.assignedTo) {
      updateData.assignedTo = req.user.email;
    }

    console.log("orderCreated:", orderCreated);
    console.log("updateData before update:", updateData);
    const updatedLead = await SalesLead.findByIdAndUpdate(id, updateData, { new: true });
    
    // If orderCreated is yes, we might want to create a SalesOrder automatically
    if (orderCreated === "yes" && updatedLead) {
      // Check if order already exists for this lead to avoid duplicates
      const existingOrder = await SalesOrder.findOne({ customerPhone: updatedLead.phone });
      if (!existingOrder) {
        await SalesOrder.create({
          salesPersonId: req.user._id,
          customerCode: updatedLead.customerCode,
          customerName: updatedLead.name,
          customerPhone: updatedLead.phone,
          customerEmail: updatedLead.email || "no-email@provided.com",
          address: updatedLead.address,
          sector: updatedLead.sector,
          initialIssue: updatedLead.issue,
          totalAmount: 0,
          quotationStatusFirstFollowUp: "Select Status",
          statusSecondFollowUp: "Select Status",
          finalStatusThirdFollowUp: "Select Final Status",
          notes: `Converted from Sales Lead. Source: ${updatedLead.source}. Notes: ${updatedLead.notes || ""}`
        });
      }
    }

    res.json(updatedLead);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/sales/leads/bulk", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });
    await SalesLead.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Bulk delete successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/sales/leads/:id", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    await SalesLead.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead deleted" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Removed old sync endpoint from sales

app.get("/api/marketing/campaigns", authenticate, async (req, res) => {
  const campaigns = await MarketingCampaign.find().sort({ createdAt: -1 });
  res.json(campaigns);
});

app.post("/api/marketing/campaigns", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req, res) => {
  try {
    const campaign = await MarketingCampaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/marketing/campaigns/:id/results", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req, res) => {
  const { id } = req.params;
  const { results } = req.body;
  try {
    const campaign = await MarketingCampaign.findByIdAndUpdate(id, { results }, { new: true });
    res.json(campaign);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Content Tracker Endpoints ---
app.get("/api/marketing/content-tracker", authenticate, async (req, res) => {
  const items = await ContentTracker.find().sort({ createdAt: -1 });
  res.json(items);
});

app.post("/api/marketing/content-tracker", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const item = await ContentTracker.create({ ...req.body, owner: req.user.email });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/marketing/content-tracker/:id", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const item = await ContentTracker.findById(id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const isAdmin = ["SuperAdmin", "Admin"].includes(req.user.role);
    if (!isAdmin && item.owner && item.owner !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized: This record belongs to another employee." });
    }

    const updatedItem = await ContentTracker.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Campaign Tracker Endpoints ---
app.get("/api/marketing/campaign-tracker", authenticate, async (req, res) => {
  const items = await CampaignTracker.find().sort({ createdAt: -1 });
  res.json(items);
});

app.post("/api/marketing/campaign-tracker", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const item = await CampaignTracker.create({ ...req.body, owner: req.user.email });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/marketing/campaign-tracker/:id", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const item = await CampaignTracker.findById(id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const isAdmin = ["SuperAdmin", "Admin"].includes(req.user.role);
    if (!isAdmin && item.owner && item.owner !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized: This record belongs to another employee." });
    }

    const updatedItem = await CampaignTracker.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Marketing Reports Endpoints ---
app.get("/api/marketing/reports", authenticate, async (req, res) => {
  const reports = await MarketingReport.find().sort({ createdAt: -1 });
  res.json(reports);
});

app.post("/api/marketing/reports", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const report = await MarketingReport.create({ ...req.body, marketingCreator: req.user.email });
    res.status(201).json(report);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.patch("/api/marketing/reports/:id", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const report = await MarketingReport.findById(id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const isAdmin = ["SuperAdmin", "Admin"].includes(req.user.role);
    if (!isAdmin && report.marketingCreator && report.marketingCreator !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized: This record belongs to another employee." });
    }

    const updatedReport = await MarketingReport.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedReport);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Campaign Results Sync Endpoints ---
app.get("/api/marketing/campaign-results", authenticate, async (req, res) => {
  const results = await CampaignResult.find().sort({ createdAt: -1 });
  res.json(results);
});

app.post("/api/marketing/campaign-results/preview-sync", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), upload.single("serviceAccountFile"), checkIdempotency, async (req: AuthRequest, res: Response) => {
  let { spreadsheetId, sheetName, serviceAccountKey, saveConfig, name } = req.body;
  if (req.file) serviceAccountKey = req.file.buffer.toString("utf-8");
  if (!spreadsheetId) return res.status(400).json({ error: "Spreadsheet ID is required" });

  try {
    // If saveConfig is true, save the configuration for later use
    if (saveConfig === "true" || saveConfig === true) {
      if (!name) return res.status(400).json({ error: "Connection name is required to save configuration" });
      let config = await SyncConfig.findOne({ name, type: "campaign-results" });
      if (config) {
        config.spreadsheetId = spreadsheetId;
        config.sheetName = sheetName || "Sheet1";
        if (serviceAccountKey) config.serviceAccountKey = serviceAccountKey;
        await config.save();
      } else {
        await SyncConfig.create({ 
          name,
          type: "campaign-results",
          spreadsheetId, 
          sheetName: sheetName || "Sheet1", 
          serviceAccountKey: serviceAccountKey || "" 
        });
      }
    }

    const finalKey = serviceAccountKey || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!finalKey) return res.status(400).json({ error: "No Google credentials provided." });

    const key = JSON.parse(finalKey);
    const auth = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });
    
    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName || "Sheet1!A2:I", // Campaign, Status, Impressions, Conversions, Revenue, Region1, Region2, Region3, NextSteps
    });
    const rows = response.data.values || [];
    if (rows.length === 0) return res.json([]);

    const previewData = rows.map((row) => {
      const [campaign, status, impressions, conversions, revenue, r1, r2, r3, nextSteps] = row;
      if (!campaign) return null;
      return {
        campaign,
        status,
        impressions: Number(impressions) || 0,
        conversions: Number(conversions) || 0,
        salesRevenue: Number(revenue) || 0,
        region1: r1,
        region2: r2,
        region3: r3,
        nextSteps,
      };
    }).filter(Boolean);

    res.json(previewData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/marketing/campaign-results/commit-sync", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), checkIdempotency, async (req, res) => {
  const { results } = req.body;
  if (!results || !Array.isArray(results)) return res.status(400).json({ error: "Results array required" });

  try {
    const savedResults = [];
    for (const data of results) {
      const res = await CampaignResult.findOneAndUpdate(
        { campaign: data.campaign },
        data,
        { upsert: true, new: true }
      );
      savedResults.push(res);
    }
    res.json({ message: `Successfully committed ${savedResults.length} campaign results`, count: savedResults.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/marketing/campaign-results/bulk", authenticate, authorize(["SuperAdmin", "Admin", "Marketing"]), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });
    await CampaignResult.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Bulk delete successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// --- Seed Data ---
app.post("/api/seed", authenticate, authorize(["SuperAdmin"]), async (req, res) => {
  try {
    // Seed Customers
    const customers = await Customer.insertMany([
      { name: "Acme Corp", email: "contact@acme.com", phone: "123456789", address: "123 Industrial Way" },
      { name: "Globex", email: "info@globex.com", phone: "987654321", address: "456 Tech Park" }
    ]);
    
    // Seed Suppliers
    const suppliers = await Supplier.insertMany([
      { name: "Steel Supply Co", email: "sales@steelsupply.com", category: "Raw Materials" },
      { name: "Electronics Hub", email: "orders@elechub.com", category: "Components" }
    ]);
    
    // Seed Inventory
    const inventory = await Inventory.insertMany([
      { sparePartsId: "PL-1", itemName: "Item1", specification: "aaa", category: "Maintenance", unitPrice: 50, notes: "-" },
      { sparePartsId: "PL-2", itemName: "Item2", specification: "bbb", category: "Components", unitPrice: 15, notes: "-" }
    ]);
    
    res.json({ message: "Seed successful", customers, suppliers, inventory });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
