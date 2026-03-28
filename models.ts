import { Schema, model, Document, Types } from "mongoose";

// --- User & HR ---
export type UserRole = "SuperAdmin" | "Admin" | "Manager" | "Sales" | "Marketing" | "Operations" | "Finance" | "HR" | "CustomerService";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  targetSales: number;
  targetBudget: number;
  refreshToken?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["SuperAdmin", "Admin", "Manager", "Sales", "Marketing", "Operations", "Finance", "HR", "CustomerService"], default: "Sales" },
  targetSales: { type: Number, default: 0 },
  targetBudget: { type: Number, default: 0 },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", UserSchema);

// --- CRM & Sales ---
export interface ICustomer extends Document {
  customerCode: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  notes?: string;
  createdAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  customerCode: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  company: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

CustomerSchema.pre("save", async function() {
  if (!this.customerCode) {
    const lastCustomer = await (this.constructor as any).findOne().sort({ customerCode: -1 });
    let nextId = 1;
    if (lastCustomer && lastCustomer.customerCode) {
      const match = lastCustomer.customerCode.match(/\d+/);
      if (match) {
        nextId = parseInt(match[0]) + 1;
      }
    }
    this.customerCode = `CUST-${String(nextId).padStart(5, '0')}`;
  }
});

CustomerSchema.index({ name: 1, phone: 1 }, { unique: true });

export const Customer = model<ICustomer>("Customer", CustomerSchema);

export type FollowUpStatus = "Pending" | "Contacted" | "Quoted" | "Accepted" | "Scheduled" | "Rejected";

export interface ISalesOrder extends Document {
  salesPersonId: Types.ObjectId;
  customerId?: Types.ObjectId; // Link to Customer model
  customerName: string; // Keep for legacy/quick entry
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  
  // 3-Stage Follow-up
  quotationStatusFirstFollowUp: FollowUpStatus;
  statusSecondFollowUp: FollowUpStatus;
  finalStatusThirdFollowUp: FollowUpStatus;
  
  automationTriggered: boolean; // For idempotency
  notes: string;
  createdAt: Date;
}

const SalesOrderSchema = new Schema<ISalesOrder>({
  salesPersonId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  
  quotationStatusFirstFollowUp: { type: String, enum: ["Pending", "Contacted", "Quoted", "Accepted", "Scheduled", "Rejected"], default: "Pending" },
  statusSecondFollowUp: { type: String, enum: ["Pending", "Contacted", "Quoted", "Accepted", "Scheduled", "Rejected"], default: "Pending" },
  finalStatusThirdFollowUp: { type: String, enum: ["Pending", "Contacted", "Quoted", "Accepted", "Scheduled", "Rejected"], default: "Pending" },
  
  automationTriggered: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const SalesOrder = model<ISalesOrder>("SalesOrder", SalesOrderSchema);

// --- Operations ---
export interface ICustomerOrder extends Document {
  salesOrderId: Types.ObjectId;
  orderContext: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    totalAmount: number;
    engineerName?: string;
    visitDate?: Date;
  };
  status: "Processing" | "Completed" | "Cancelled";
  createdAt: Date;
}

const CustomerOrderSchema = new Schema<ICustomerOrder>({
  salesOrderId: { type: Schema.Types.ObjectId, ref: "SalesOrder", required: true },
  orderContext: {
    customerName: String,
    customerPhone: String,
    customerEmail: String,
    totalAmount: Number,
    engineerName: String,
    visitDate: Date,
  },
  status: { type: String, enum: ["Processing", "Completed", "Cancelled"], default: "Processing" },
  createdAt: { type: Date, default: Date.now },
});

export const CustomerOrder = model<ICustomerOrder>("CustomerOrder", CustomerOrderSchema);

export interface IWorkOrder extends Document {
  customerOrderId: Types.ObjectId;
  partsUsed: Array<{ partId: Types.ObjectId; quantity: number }>;
  status: "Pending" | "In Progress" | "Completed";
  createdAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>({
  customerOrderId: { type: Schema.Types.ObjectId, ref: "CustomerOrder", required: true },
  partsUsed: [{
    partId: { type: Schema.Types.ObjectId, ref: "Inventory" },
    quantity: Number
  }],
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export const WorkOrder = model<IWorkOrder>("WorkOrder", WorkOrderSchema);

// --- Supply Chain ---
export interface ISupplier extends Document {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  createdAt: Date;
}

const SupplierSchema = new Schema<ISupplier>({
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Supplier = model<ISupplier>("Supplier", SupplierSchema);

export interface IPurchaseOrder extends Document {
  supplierId: Types.ObjectId;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
  status: "Draft" | "Sent" | "Received" | "Cancelled";
  createdAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
  items: [{
    name: String,
    quantity: Number,
    unitPrice: Number
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Draft", "Sent", "Received", "Cancelled"], default: "Draft" },
  createdAt: { type: Date, default: Date.now },
});

export const PurchaseOrder = model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);

// --- Inventory & Finance ---
export interface IInventory extends Document {
  name: string;
  stockNumber: number;
  price: number;
  category: string;
}

const InventorySchema = new Schema<IInventory>({
  name: { type: String, required: true, unique: true },
  stockNumber: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true, default: 0 },
  category: { type: String },
});

export const Inventory = model<IInventory>("Inventory", InventorySchema);

export interface IInvoice extends Document {
  customerOrderId: Types.ObjectId;
  total: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  issueDate: Date;
  paidAt?: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  customerOrderId: { type: Schema.Types.ObjectId, ref: "CustomerOrder", required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ["Draft", "Sent", "Paid", "Overdue"], default: "Draft" },
  issueDate: { type: Date, default: Date.now },
  paidAt: { type: Date },
});

export const Invoice = model<IInvoice>("Invoice", InvoiceSchema);

export interface IStockMovement extends Document {
  partId: Types.ObjectId;
  quantity: number;
  type: "IN" | "OUT";
  reference: string;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>({
  partId: { type: Schema.Types.ObjectId, ref: "Inventory", required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ["IN", "OUT"], required: true },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const StockMovement = model<IStockMovement>("StockMovement", StockMovementSchema);

// --- Governance ---
export interface IModificationRequest extends Document {
  entityId: Types.ObjectId;
  entityType: "SalesOrder";
  requestedBy: Types.ObjectId;
  changes: any;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: Date;
}

const ModificationRequestSchema = new Schema<IModificationRequest>({
  entityId: { type: Schema.Types.ObjectId, required: true },
  entityType: { type: String, default: "SalesOrder" },
  requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  changes: { type: Schema.Types.Mixed },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export const ModificationRequest = model<IModificationRequest>("ModificationRequest", ModificationRequestSchema);

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  entityId: { type: String },
  details: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);

// --- Automation Artifacts ---
export interface IFollowUpReminder extends Document {
  salesOrderId: Types.ObjectId;
  type: "Quoted" | "Rejected";
  status: "Draft" | "Sent";
  content: string;
  createdAt: Date;
}

const FollowUpReminderSchema = new Schema<IFollowUpReminder>({
  salesOrderId: { type: Schema.Types.ObjectId, ref: "SalesOrder", required: true },
  type: { type: String, enum: ["Quoted", "Rejected"], required: true },
  status: { type: String, enum: ["Draft", "Sent"], default: "Draft" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FollowUpReminder = model<IFollowUpReminder>("FollowUpReminder", FollowUpReminderSchema);

// --- Marketing & Leads ---
export interface IMarketingLead extends Document {
  customerCode?: string;
  name: string;
  phone: string;
  email?: string;
  type?: string;
  sector?: string;
  address?: string;
  source: string;
  status: "New" | "Contacted" | "Qualified" | "Converted" | "Lost";
  notes?: string;
  createdAt: Date;
}

const MarketingLeadSchema = new Schema<IMarketingLead>({
  customerCode: { type: String },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  type: { type: String },
  sector: { type: String },
  address: { type: String },
  source: { type: String, default: "Google Sheets" },
  status: { type: String, enum: ["New", "Contacted", "Qualified", "Converted", "Lost", "Have"], default: "New" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

MarketingLeadSchema.index({ name: 1, phone: 1 }, { unique: true });

export const MarketingLead = model<IMarketingLead>("MarketingLead", MarketingLeadSchema);

export interface ISalesLead extends Document {
  customerCode?: string;
  name: string;
  email?: string;
  phone: string;
  source: string;
  status: "New" | "Contacted" | "Qualified" | "Converted" | "Lost" | "Have" | "No Potential";
  type?: string;
  sector?: string;
  address?: string;
  issue?: string;
  reason?: string;
  notes?: string;
  assignedTo?: string;
  isMarketingLead?: boolean;
  createdAt: Date;
}

const SalesLeadSchema = new Schema<ISalesLead>({
  customerCode: { type: String },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  source: { type: String, default: "Marketing" },
  status: { type: String, enum: ["New", "Contacted", "Qualified", "Converted", "Lost", "Have", "No Potential"], default: "New" },
  type: { type: String },
  sector: { type: String },
  address: { type: String },
  issue: { type: String },
  reason: { type: String },
  notes: { type: String },
  assignedTo: { type: String },
  isMarketingLead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

SalesLeadSchema.index({ name: 1, phone: 1 }, { unique: true });

export const SalesLead = model<ISalesLead>("SalesLead", SalesLeadSchema);

export interface IMarketingCampaign extends Document {
  name: string;
  platform: string;
  budget: number;
  status: "Active" | "Paused" | "Completed" | "Scheduled";
  results?: {
    leadsGenerated: number;
    conversions: number;
    revenue: number;
    roi: number;
  };
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

const MarketingCampaignSchema = new Schema<IMarketingCampaign>({
  name: { type: String, required: true },
  platform: { type: String, required: true },
  budget: { type: Number, required: true },
  status: { type: String, enum: ["Active", "Paused", "Completed", "Scheduled"], default: "Active" },
  results: {
    leadsGenerated: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const MarketingCampaign = model<IMarketingCampaign>("MarketingCampaign", MarketingCampaignSchema);

// --- New Marketing & Campaign Trackers ---

export interface IContentTracker extends Document {
  name: string;
  phone: string;
  type: string;
  sector: string;
  details?: string;
  owner?: string;
  status: string;
  postDate?: Date;
  file?: string;
  notes?: string;
  createdAt: Date;
}

const ContentTrackerSchema = new Schema<IContentTracker>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String },
  sector: { type: String },
  details: { type: String },
  owner: { type: String },
  status: { type: String },
  postDate: { type: Date },
  file: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

ContentTrackerSchema.index({ name: 1, phone: 1 }, { unique: true });

export const ContentTracker = model<IContentTracker>("ContentTracker", ContentTrackerSchema);

export interface ICampaignResult extends Document {
  campaign: string;
  status: string;
  impressions: number;
  conversions: number;
  salesRevenue: number;
  region1?: string;
  region2?: string;
  region3?: string;
  nextSteps?: string;
  notes?: string;
  createdAt: Date;
}

const CampaignResultSchema = new Schema<ICampaignResult>({
  campaign: { type: String, required: true },
  status: { type: String },
  impressions: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  salesRevenue: { type: Number, default: 0 },
  region1: { type: String },
  region2: { type: String },
  region3: { type: String },
  nextSteps: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const CampaignResult = model<ICampaignResult>("CampaignResult", CampaignResultSchema);

export interface ICampaignTracker extends Document {
  campaign: string;
  type: string;
  owner: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  assets?: string;
  notes?: string;
  createdAt: Date;
}

const CampaignTrackerSchema = new Schema<ICampaignTracker>({
  campaign: { type: String, required: true },
  type: { type: String },
  owner: { type: String },
  status: { type: String },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  assets: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const CampaignTracker = model<ICampaignTracker>("CampaignTracker", CampaignTrackerSchema);

export interface IMarketingReport extends Document {
  campaignNumber: number;
  campaignName: string;
  budgetAllocated: number;
  budgetUsed: number;
  leadsGenerated: number;
  leadsConverted: number;
  conversionRate: number;
  engagement: string;
  marketingCreator: string;
  hrApproved: boolean;
  revenueFromCampaign: number;
  roas: number;
  notes?: string;
  createdAt: Date;
}

const MarketingReportSchema = new Schema<IMarketingReport>({
  campaignNumber: { type: Number },
  campaignName: { type: String, required: true },
  budgetAllocated: { type: Number, default: 0 },
  budgetUsed: { type: Number, default: 0 },
  leadsGenerated: { type: Number, default: 0 },
  leadsConverted: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  engagement: { type: String },
  marketingCreator: { type: String },
  hrApproved: { type: Boolean, default: false },
  revenueFromCampaign: { type: Number, default: 0 },
  roas: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const MarketingReport = model<IMarketingReport>("MarketingReport", MarketingReportSchema);

// --- Sync Configuration ---
export interface ISyncConfig extends Document {
  name: string;
  type: string;
  spreadsheetId: string;
  sheetName: string;
  serviceAccountKey: string;
  lastSyncAt?: Date;
  createdAt: Date;
}

const SyncConfigSchema = new Schema<ISyncConfig>({
  name: { type: String, required: true },
  type: { type: String, required: true, default: "marketing-leads" },
  spreadsheetId: { type: String, required: true },
  sheetName: { type: String, default: "Sheet1" },
  serviceAccountKey: { type: String, required: true },
  lastSyncAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const SyncConfig = model<ISyncConfig>("SyncConfig", SyncConfigSchema);
