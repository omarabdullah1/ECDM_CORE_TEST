import React, { useEffect, useState } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useLocation,
  useNavigate
} from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  Package, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  Menu,
  X,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  BarChart3,
  Users,
  ShieldAlert,
  ShieldCheck,
  FileBarChart,
  ClipboardCheck,
  Activity,
  History,
  Truck,
  FileText,
  BarChart as BarChartIcon,
  Download,
  Database,
  Megaphone,
  Target,
  Headphones,
  ClipboardList,
  Wallet,
  Calendar,
  CreditCard,
  Star
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import { useAuthStore } from "./store/authStore.ts";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Dialog } from "./components/Dialog.tsx";

import MarketingLeadsPage from "./pages/MarketingLeadsPage.tsx";
import ContentTrackerPage from "./ContentTrackerPage.tsx";
import CampaignTrackerPage from "./CampaignTrackerPage.tsx";
import CampaignResultsPage from "./CampaignResultsPage.tsx";
import MarketingReportsPage from "./MarketingReportsPage.tsx";

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    axios.get("/api/sales/orders").then(res => setOrders(res.data));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Customer Orders</h2>
        <p className="text-neutral-500">View and track all customer orders (Customer Service View).</p>
      </header>
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-neutral-900">{order.customerName}</p>
                  <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                </td>
                <td className="px-6 py-4 font-mono font-bold">${order.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">
                    {order.finalStatusThirdFollowUp || "Processing"}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/users").then(res => setEmployees(res.data));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
        <p className="text-neutral-500">Manage company staff and roles (HR View).</p>
      </header>
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {employees.map(emp => (
              <tr key={emp._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-neutral-900">{emp.name}</td>
                <td className="px-6 py-4 text-neutral-600">{emp.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-[10px] font-bold uppercase">{emp.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AttendancePage = () => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <p className="text-neutral-500">Track employee clock-in/out records (HR View).</p>
      </header>
      <div className="bg-white p-12 rounded-3xl border border-dashed border-neutral-200 text-center">
        <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500 font-medium">Attendance tracking system is being initialized.</p>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const sections = [
    {
      title: "Main",
      icon: LayoutDashboard,
      roles: ["SuperAdmin", "Admin", "Manager", "Sales", "Marketing", "Operations", "Finance", "HR"],
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["SuperAdmin", "Admin", "Manager"] },
      ]
    },
    {
      title: "Marketing",
      icon: Megaphone,
      roles: ["SuperAdmin", "Admin", "Manager", "Marketing"],
      items: [
        { name: "Marketing Leads", icon: TrendingUp, path: "/marketing/leads", roles: ["SuperAdmin", "Admin", "Manager", "Marketing"] },
        { name: "Content Tracker", icon: FileText, path: "/marketing/content", roles: ["SuperAdmin", "Admin", "Manager", "Marketing"] },
        { name: "Campaign Tracker", icon: Target, path: "/marketing/tracker", roles: ["SuperAdmin", "Admin", "Manager", "Marketing"] },
        { name: "Campaign Results", icon: BarChart3, path: "/marketing/results", roles: ["SuperAdmin", "Admin", "Manager", "Marketing"] },
      ]
    },
    {
      title: "Sales",
      icon: ShoppingCart,
      roles: ["SuperAdmin", "Admin", "Manager", "Sales"],
      items: [
        { name: "Sales Leads", icon: Target, path: "/sales/leads", roles: ["SuperAdmin", "Admin", "Manager", "Sales"] },
        { name: "Sales Data", icon: Database, path: "/sales/data", roles: ["SuperAdmin", "Admin", "Manager", "Sales"] },
        { name: "Sales Orders", icon: ClipboardList, path: "/sales", roles: ["SuperAdmin", "Admin", "Manager", "Sales"] },
        { name: "Non-Potential", icon: Trash2, path: "/sales/non-potential", roles: ["SuperAdmin", "Admin", "Manager", "Sales"] },
      ]
    },
    {
      title: "Customer Services",
      icon: Headphones,
      roles: ["SuperAdmin", "Admin", "Manager", "CustomerService"],
      items: [
        { name: "Customers List", icon: Users, path: "/customers", roles: ["SuperAdmin", "Admin", "Manager", "CustomerService"] },
        { name: "Customer Orders", icon: Package, path: "/customers/orders", roles: ["SuperAdmin", "Admin", "Manager", "CustomerService"] },
        { name: "Follow-Up", icon: ClipboardList, path: "/followups", roles: ["SuperAdmin", "Admin", "Manager", "CustomerService"] },
        { name: "Feedback", icon: Megaphone, path: "/customers/feedback", roles: ["SuperAdmin", "Admin", "Manager", "CustomerService"] },
      ]
    },
    {
      title: "Finance",
      icon: DollarSign,
      roles: ["SuperAdmin", "Admin", "Manager", "Finance"],
      items: [
        { name: "Order Finance", icon: DollarSign, path: "/finance/orders", roles: ["SuperAdmin", "Admin", "Manager", "Finance"] },
        { name: "inventoryFinance", icon: Package, path: "/finance/inventory", roles: ["SuperAdmin", "Admin", "Manager", "Finance"] },
        { name: "General Expenses", icon: CreditCard, path: "/finance/expenses", roles: ["SuperAdmin", "Admin", "Manager", "Finance"] },
        { name: "Salaries", icon: Wallet, path: "/finance/salaries", roles: ["SuperAdmin", "Admin", "Manager", "Finance"] },
      ]
    },
    {
      title: "Operations",
      icon: Wrench,
      roles: ["SuperAdmin", "Admin", "Operations"],
      items: [
        { name: "Work Orders", icon: Wrench, path: "/ops", roles: ["SuperAdmin", "Admin", "Operations"] },
        { name: "Price List", icon: FileText, path: "/ops/price-list", roles: ["SuperAdmin", "Admin", "Operations"] },
        { name: "Performance Reports", icon: Star, path: "/ops/performance", roles: ["SuperAdmin", "Admin", "Operations"] },
      ]
    },
    {
      title: "HR",
      icon: Users,
      roles: ["SuperAdmin", "Admin", "HR"],
      items: [
        { name: "Employees", icon: Users, path: "/hr/employees", roles: ["SuperAdmin", "Admin", "HR"] },
        { name: "Attendance", icon: Calendar, path: "/hr/attendance", roles: ["SuperAdmin", "Admin", "HR"] },
      ]
    },
    {
      title: "Administration",
      icon: ShieldCheck,
      roles: ["SuperAdmin", "Admin", "Manager"],
      items: [
        { name: "User Management", icon: Users, path: "/users", roles: ["SuperAdmin", "Admin", "Manager"] },
        { name: "Modification Requests", icon: ShieldAlert, path: "/governance", roles: ["SuperAdmin", "Admin", "Manager"] },
        { name: "Audit Logs", icon: History, path: "/admin/audit", roles: ["SuperAdmin", "Admin", "Manager"] },
        { name: "Net Profit Report", icon: TrendingUp, path: "/admin/profit", roles: ["SuperAdmin", "Admin", "Manager"] },
      ]
    },
    {
      title: "Reports",
      icon: FileBarChart,
      roles: ["SuperAdmin", "Admin", "Manager"],
      items: [
        { name: "Sales Report", icon: FileText, path: "/reports/sales", roles: ["SuperAdmin", "Admin", "Manager"] },
        { name: "Marketing Reports", icon: FileBarChart, path: "/marketing/reports", roles: ["SuperAdmin", "Admin", "Manager", "Marketing"] },
        { name: "Operation Members", icon: Users, path: "/reports/operations", roles: ["SuperAdmin", "Admin", "Manager"] },
        { name: "Employee Evaluation", icon: ClipboardCheck, path: "/reports/evaluation", roles: ["SuperAdmin", "Admin", "Manager"] },
        { name: "HR Efficiency", icon: Activity, path: "/reports/hr", roles: ["SuperAdmin", "Admin", "Manager"] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-neutral-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50 overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b border-neutral-800 shrink-0">
        <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-neutral-900">E</div>
          ECDM_Core
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-8">
        {sections.map((section, idx) => {
          const visibleItems = section.items.filter(item => item.roles.includes(user?.role || ""));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-2">
              <div className="px-4 flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  {section.icon && <section.icon className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />}
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] group-hover:text-white transition-colors">{section.title}</p>
                </div>
                {section.title !== "Main" && <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-white transition-transform" />}
              </div>
              <div className="space-y-1 ml-4 border-l border-neutral-800">
                {visibleItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm",
                      location.pathname === item.path 
                        ? "bg-white text-neutral-900 shadow-lg font-bold" 
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800 shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-neutral-500 truncate uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all text-sm font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Pages ---

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-8">
    <header>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p className="text-neutral-500">This module is currently under development.</p>
    </header>
    <div className="bg-white p-12 rounded-3xl border border-neutral-200 shadow-sm text-center">
      <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Clock className="w-10 h-10 text-neutral-300" />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
      <p className="text-neutral-500 max-w-md mx-auto">
        We're working hard to bring you the {title} module. Stay tuned for updates!
      </p>
    </div>
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState("superadmin@ecdm.com");
  const [password, setPassword] = useState("admin123");
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-neutral-900 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6">E</div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">ECDM_Core</h1>
          <p className="text-neutral-500 mt-2">Enterprise Resource Planning Suite</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
              placeholder="admin@ecdm.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Secure Access Only</p>
        </div>
      </motion.div>
    </div>
  );
};

const DashboardPage = () => {
  const [summary, setSummary] = useState<any>(null);
  const { user } = useAuthStore();

  const fetchSummary = () => {
    axios.get("/api/dashboard/summary").then(res => setSummary(res.data));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleSeed = async () => {
    try {
      await axios.post("/api/seed");
      toast.success("System seeded with dummy data");
      fetchSummary();
    } catch (err) {
      toast.error("Seed failed");
    }
  };

  if (!summary) return <div className="p-8 text-neutral-400">Loading metrics...</div>;

  const realRev = summary.realRevenue?.[0]?.total || 0;
  const projRev = summary.projectedRevenue?.[0]?.total || 0;
  const invVal = summary.inventoryValuation?.[0]?.inv?.[0]?.total || 0;

  const chartData = [
    { name: "Real Revenue", value: realRev },
    { name: "Projected", value: projRev },
    { name: "Inventory", value: invVal },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enterprise Dashboard</h2>
          <p className="text-neutral-500">Real-time performance and financial health.</p>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === "SuperAdmin" && (
            <button 
              onClick={handleSeed}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-900 rounded-xl font-bold hover:bg-neutral-200 transition-all"
            >
              <Database className="w-4 h-4" />
              Seed Data
            </button>
          )}
          <div className="text-right">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Last Updated</p>
            <p className="text-sm font-medium">{format(new Date(), "HH:mm:ss")}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 rounded-2xl text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-semibold text-neutral-500 mb-1">Real Revenue (Paid)</p>
          <h3 className="text-3xl font-bold tracking-tight">${realRev.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-semibold text-neutral-500 mb-1">Projected Revenue</p>
          <h3 className="text-3xl font-bold tracking-tight">${projRev.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-semibold text-neutral-500 mb-1">Inventory Valuation</p>
          <h3 className="text-3xl font-bold tracking-tight">${invVal.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-neutral-900 text-white rounded-3xl p-10 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h4 className="text-4xl font-bold mb-6 tracking-tight">System Integrity through Automation</h4>
            <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
              Every sales activity automatically triggers operational workflows and financial updates. 
              Mongoose transactions ensure atomic integrity for inventory movements.
            </p>
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Audit Coverage</p>
              </div>
              <div className="w-px bg-neutral-800"></div>
              <div>
                <p className="text-3xl font-bold">Real-time</p>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">Sync Engine</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
            <div className="w-64 h-64 border-8 border-white/5 rounded-full flex items-center justify-center">
              <div className="w-48 h-48 border-4 border-white/10 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-20 h-20 text-white/20" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

const FollowUpsPage = () => {
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/sales/reminders").then(res => setReminders(res.data));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Follow-up Reminders</h2>
        <p className="text-neutral-500">Automated drafts for quoted or rejected leads.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.map(rem => (
          <div key={rem._id} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                rem.type === "Quoted" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
              )}>{rem.type}</span>
              <span className="text-xs text-neutral-400 font-mono">{format(new Date(rem.createdAt), "MMM d, HH:mm")}</span>
            </div>
            <h4 className="font-bold text-neutral-900 mb-2">{rem.salesOrderId?.customerName}</h4>
            <p className="text-sm text-neutral-600 mb-6">{rem.content}</p>
            <button className="w-full bg-neutral-50 text-neutral-900 py-3 rounded-xl font-bold hover:bg-neutral-100 transition-all border border-neutral-200">
              Review Draft
            </button>
          </div>
        ))}
        {reminders.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-400">No follow-ups generated yet.</div>
        )}
      </div>
    </div>
  );
};

const WorkOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const { user } = useAuthStore();

  const fetchOrders = () => {
    axios.get("/api/ops/work-orders").then(res => setOrders(res.data));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      // For demo, we assume we use 1 unit of a part
      // In a real app, this would be dynamic
      const inventory = await axios.get("/api/inventory");
      const firstItem = inventory.data[0];
      if (!firstItem) throw new Error("No inventory items found for demo");

      await axios.post(`/api/ops/work-orders/${id}/complete`, {
        partsUsed: [{ partId: firstItem._id, quantity: 1 }] 
      });
      toast.success("Work Order Completed & Inventory Deducted");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Completion failed");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Work Orders</h2>
        <p className="text-neutral-500">Operational execution and resource allocation.</p>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-neutral-500">{order._id}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    order.status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{format(new Date(order.createdAt), "MMM d, yyyy")}</td>
                <td className="px-6 py-4 text-right">
                  {order.status !== "Completed" && (
                    <button 
                      onClick={() => handleComplete(order._id)}
                      className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-all"
                    >
                      Complete Order
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const fetchItems = () => {
    axios.get("/api/inventory").then(res => setItems(res.data));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Control</h2>
          <p className="text-neutral-500">Real-time stock levels and valuation.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10"
        >
          <Plus className="w-5 h-5" />
          Add Stock Item
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map(item => (
              <tr key={item._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-neutral-900">{item.name}</td>
                <td className="px-6 py-4 font-mono text-xs text-neutral-500">{item.sku}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "font-bold",
                    item.stockNumber < 10 ? "text-red-600" : "text-neutral-900"
                  )}>{item.stockNumber}</span>
                </td>
                <td className="px-6 py-4 text-neutral-600">${item.price.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-neutral-900">${(item.stockNumber * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Inventory Item"
        maxWidth="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          try {
            await axios.post("/api/inventory", { 
              ...data, 
              stockNumber: Number(data.stockNumber), 
              price: Number(data.price) 
            });
            toast.success("Item added");
            setShowAdd(false);
            fetchItems();
          } catch (err: any) {
            toast.error("Failed to add item");
          }
        }} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Name</label>
            <input name="name" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">SKU</label>
            <input name="sku" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Stock Number</label>
              <input name="stockNumber" type="number" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Price</label>
              <input name="price" type="number" step="0.01" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
          </div>
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all">
            Add Item
          </button>
        </form>
      </Dialog>
    </div>
  );
};

const GovernancePage = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = () => {
    axios.get("/api/governance/requests").then(res => setRequests(res.data));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResolve = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await axios.post(`/api/governance/requests/${id}/resolve`, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      toast.error("Resolution failed");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Governance & Compliance</h2>
        <p className="text-neutral-500">Maker-Checker approval queue for sensitive modifications.</p>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">Requested By</th>
              <th className="px-6 py-4">Entity</th>
              <th className="px-6 py-4">Changes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {requests.map(req => (
              <tr key={req._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-neutral-900">{req.requestedBy.name}</p>
                  <p className="text-xs text-neutral-500">{req.requestedBy.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold bg-neutral-100 px-2 py-1 rounded uppercase">{req.entityType}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    {Object.entries(req.changes).map(([k, v]: any) => (
                      <div key={k}><span className="font-bold">{k}:</span> {v}</div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleResolve(req._id, "Approved")}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleResolve(req._id, "Rejected")}
                      className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-400">No pending requests</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk', id?: string } | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "SuperAdmin" || user?.role === "Admin";

  const fetchCustomers = () => {
    axios.get("/api/crm/customers").then(res => {
      setCustomers(res.data);
      setSelectedIds([]);
    });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/crm/customers/${id}`);
      toast.success("Customer deleted");
      setConfirmDelete(null);
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to delete customer");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.delete("/api/crm/customers/bulk", { data: { ids: selectedIds } });
      toast.success("Bulk delete successful");
      setConfirmDelete(null);
      fetchCustomers();
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === customers.length) setSelectedIds([]);
    else setSelectedIds(customers.map(c => c._id));
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Relationship</h2>
          <p className="text-neutral-500">Manage your enterprise client base.</p>
        </div>
        <div className="flex gap-4">
          {selectedIds.length > 0 && isAdmin && (
            <button 
              onClick={() => setConfirmDelete({ type: 'bulk' })}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === customers.length && customers.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </th>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.map(c => (
              <tr key={c._id} className={cn(
                "hover:bg-neutral-50/50 transition-colors",
                selectedIds.includes(c._id) && "bg-neutral-50"
              )}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(c._id)}
                    onChange={() => toggleSelect(c._id)}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                </td>
                <td className="px-6 py-4 font-mono text-xs text-neutral-500">{c.customerCode || "---"}</td>
                <td className="px-6 py-4 font-bold text-neutral-900">{c.name}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{c.email}</p>
                  <p className="text-xs text-neutral-500">{c.phone}</p>
                </td>
                <td className="px-6 py-4 text-neutral-600">{c.company || "N/A"}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">{format(new Date(c.createdAt), "MMM d, yyyy")}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setConfirmDelete({ type: 'single', id: c._id })}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirm Delete"
        description={
          confirmDelete?.type === 'bulk' 
            ? `Are you sure you want to delete ${selectedIds.length} selected customers? This action cannot be undone.`
            : "Are you sure you want to delete this customer? This action cannot be undone."
        }
        maxWidth="md"
        zIndex={110}
      >
        <div className="flex gap-4">
          <button onClick={() => setConfirmDelete(null)} className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-all">Cancel</button>
          <button 
            onClick={() => confirmDelete?.type === 'bulk' ? handleBulkDelete() : handleDelete(confirmDelete.id!)}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
          >
            Delete
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Customer"
        maxWidth="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          try {
            await axios.post("/api/crm/customers", data);
            toast.success("Customer added");
            setShowAdd(false);
            fetchCustomers();
          } catch (err) {
            toast.error("Failed to add customer");
          }
        }} className="space-y-4">
          <input name="name" placeholder="Full Name" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          <input name="email" type="email" placeholder="Email" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          <input name="phone" placeholder="Phone" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          <input name="company" placeholder="Company" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all">Save Customer</button>
        </form>
      </Dialog>
    </div>
  );
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk', id?: string } | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "SuperAdmin" || user?.role === "Admin";

  const fetchSuppliers = () => {
    axios.get("/api/scm/suppliers").then(res => {
      setSuppliers(res.data);
      setSelectedIds([]);
    });
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/scm/suppliers/${id}`);
      toast.success("Supplier deleted");
      setConfirmDelete(null);
      fetchSuppliers();
    } catch (err) {
      toast.error("Failed to delete supplier");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.delete("/api/scm/suppliers/bulk", { data: { ids: selectedIds } });
      toast.success("Bulk delete successful");
      setConfirmDelete(null);
      fetchSuppliers();
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === suppliers.length) setSelectedIds([]);
    else setSelectedIds(suppliers.map(s => s._id));
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Supply Chain</h2>
          <p className="text-neutral-500">Manage your vendors and material sources.</p>
        </div>
        <div className="flex gap-4">
          {selectedIds.length > 0 && isAdmin && (
            <button 
              onClick={() => setConfirmDelete({ type: 'bulk' })}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedIds.length})
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 shadow-lg">
            <Plus className="w-5 h-5" />
            Add Supplier
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === suppliers.length && suppliers.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </th>
              <th className="px-6 py-4">Supplier Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Created At</th>
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {suppliers.map(s => (
              <tr key={s._id} className={cn(
                "hover:bg-neutral-50/50 transition-colors",
                selectedIds.includes(s._id) && "bg-neutral-50"
              )}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(s._id)}
                    onChange={() => toggleSelect(s._id)}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                </td>
                <td className="px-6 py-4 font-bold text-neutral-900">{s.name}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-neutral-100 rounded text-xs font-bold uppercase">{s.category}</span></td>
                <td className="px-6 py-4 text-sm text-neutral-600">{s.email}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">{format(new Date(s.createdAt), "MMM d, yyyy")}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setConfirmDelete({ type: 'single', id: s._id })}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirm Delete"
        description={
          confirmDelete?.type === 'bulk' 
            ? `Are you sure you want to delete ${selectedIds.length} selected suppliers? This action cannot be undone.`
            : "Are you sure you want to delete this supplier? This action cannot be undone."
        }
        maxWidth="md"
        zIndex={110}
      >
        <div className="flex gap-4">
          <button onClick={() => setConfirmDelete(null)} className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-all">Cancel</button>
          <button 
            onClick={() => confirmDelete?.type === 'bulk' ? handleBulkDelete() : handleDelete(confirmDelete.id!)}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
          >
            Delete
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Supplier"
        maxWidth="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          try {
            await axios.post("/api/scm/suppliers", data);
            toast.success("Supplier added");
            setShowAdd(false);
            fetchSuppliers();
          } catch (err) {
            toast.error("Failed to add supplier");
          }
        }} className="space-y-4">
          <input name="name" placeholder="Supplier Name" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          <input name="email" type="email" placeholder="Email" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          <input name="category" placeholder="Category (e.g. Raw Materials)" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all">Save Supplier</button>
        </form>
      </Dialog>
    </div>
  );
};

const PurchaseOrdersPage = () => {
  const [pos, setPos] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const fetchPOs = () => {
    axios.get("/api/scm/purchase-orders").then(res => setPos(res.data));
  };

  const fetchSuppliers = () => {
    axios.get("/api/scm/suppliers").then(res => setSuppliers(res.data));
  };

  useEffect(() => {
    fetchPOs();
    fetchSuppliers();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-neutral-500">Manage procurement and vendor orders.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 shadow-lg">
          <Plus className="w-5 h-5" />
          New PO
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">PO Number</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {pos.map(po => (
              <tr key={po._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-neutral-900">{po.poNumber}</td>
                <td className="px-6 py-4 text-neutral-600">{po.supplierId?.name || "N/A"}</td>
                <td className="px-6 py-4 font-bold">${po.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    po.status === "Received" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  )}>{po.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">{format(new Date(po.createdAt), "MMM d, yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Purchase Order"
        maxWidth="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          try {
            await axios.post("/api/scm/purchase-orders", {
              ...data,
              items: [{ description: "Bulk Parts", quantity: 1, unitPrice: data.totalAmount }]
            });
            toast.success("PO created");
            setShowAdd(false);
            fetchPOs();
          } catch (err) {
            toast.error("Failed to create PO");
          }
        }} className="space-y-4">
          <select name="supplierId" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none">
            <option value="">Select Supplier</option>
            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <input name="totalAmount" type="number" placeholder="Total Amount" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all">Create PO</button>
        </form>
      </Dialog>
    </div>
  );
};

const ReportsPage = () => {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    axios.get("/api/dashboard/summary").then(res => setSummary(res.data));
  }, []);

  const handleExportInventory = () => {
    window.open("/api/reports/inventory/export", "_blank");
  };

  if (!summary) return <div className="p-8 text-neutral-400">Loading reports...</div>;

  const realRev = summary.realRevenue?.[0]?.total || 0;
  const projRev = summary.projectedRevenue?.[0]?.total || 0;
  const invVal = summary.inventoryValuation?.[0]?.inv?.[0]?.total || 0;

  const data = [
    { name: "Real Revenue", value: realRev },
    { name: "Projected", value: projRev },
    { name: "Inventory", value: invVal },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#a855f7"];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enterprise Intelligence</h2>
          <p className="text-neutral-500">Advanced analytics and data exports.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExportInventory}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-all"
          >
            <Download className="w-5 h-5" />
            Export Inventory (XLSX)
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Financial Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                <Tooltip cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  const fetchUsers = () => {
    axios.get("/api/users").then(res => setUsers(res.data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Directory</h2>
          <p className="text-neutral-500">Manage system access and role assignments.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10"
        >
          <Plus className="w-5 h-5" />
          Create User
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Targets</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-neutral-900">{u.name}</td>
                <td className="px-6 py-4 text-neutral-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-700">{u.role}</span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">
                  S: ${u.targetSales?.toLocaleString()} | B: ${u.targetBudget?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Create New User"
        maxWidth="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          try {
            await axios.post("/api/users", { 
              ...data,
              targetSales: Number(data.targetSales || 0),
              targetBudget: Number(data.targetBudget || 0)
            });
            toast.success("User created");
            setShowAdd(false);
            fetchUsers();
          } catch (err: any) {
            toast.error("Failed to create user");
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name</label>
            <input name="name" required className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input name="password" type="password" required className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Role</label>
            <select name="role" required className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none">
              {["SuperAdmin", "Admin", "Manager", "Sales", "Marketing", "Operations", "Finance", "HR", "CustomerService"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Sales Target</label>
              <input name="targetSales" type="number" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Budget Target</label>
              <input name="targetBudget" type="number" className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all mt-4">
            Create User
          </button>
        </form>
      </Dialog>
    </div>
  );
};

const SalesOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk', id?: string } | null>(null);
  const { user } = useAuthStore();

  const fetchOrders = () => {
    axios.get("/api/sales/orders").then(res => {
      setOrders(res.data);
      setSelectedIds([]);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/sales/orders/${id}`);
      toast.success("Order deleted");
      setConfirmDelete(null);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to delete order");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.delete("/api/sales/orders/bulk", { data: { ids: selectedIds } });
      toast.success("Bulk delete successful");
      setConfirmDelete(null);
      fetchOrders();
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) setSelectedIds([]);
    else setSelectedIds(orders.map(o => o._id));
  };

  const handleStageUpdate = async (id: string, stage: string, status: string) => {
    try {
      const res = await axios.patch(`/api/sales/orders/${id}`, { [stage]: status });
      if (res.data.status === "PENDING_APPROVAL") {
        toast.info(res.data.message);
      } else {
        toast.success("Stage updated");
        fetchOrders();
        if (selectedOrder) setSelectedOrder({ ...selectedOrder, [stage]: status });
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const isOwner = (order: any) => order.salesPersonId._id === user?.id;
  const isAdmin = user?.role === "SuperAdmin" || user?.role === "Admin";

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Funnel</h2>
          <p className="text-neutral-500">Manage leads and track order progression across 3 stages.</p>
        </div>
        <div className="flex gap-4">
          {selectedIds.length > 0 && isAdmin && (
            <button 
              onClick={() => setConfirmDelete({ type: 'bulk' })}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10"
          >
            <Plus className="w-5 h-5" />
            New Sales Order
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Sales Person (Email)</th>
              <th className="px-6 py-4">Stages (1/2/3)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map(order => {
              const owned = isOwner(order) || isAdmin;
              return (
                <tr 
                  key={order._id} 
                  className={cn(
                    "hover:bg-neutral-50/50 transition-colors",
                    !owned && "opacity-50 grayscale",
                    selectedIds.includes(order._id) && "bg-neutral-50"
                  )}
                >
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(order._id)}
                      onChange={() => toggleSelect(order._id)}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-neutral-900">{order.customerName}</p>
                    <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold">${order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-600">
                    {order.salesPersonId.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {[order.quotationStatusFirstFollowUp, order.statusSecondFollowUp, order.finalStatusThirdFollowUp].map((s, i) => (
                        <div key={i} className={cn(
                          "w-3 h-3 rounded-full",
                          s === "Accepted" || s === "Scheduled" ? "bg-green-500" :
                          s === "Rejected" ? "bg-red-500" :
                          s === "Pending" ? "bg-neutral-200" : "bg-blue-500"
                        )} title={s}></div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                      >
                        {owned ? <Edit2 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => setConfirmDelete({ type: 'single', id: order._id })}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirm Delete"
        description={
          confirmDelete?.type === 'bulk'
            ? `Are you sure you want to delete ${selectedIds.length} selected orders? This action cannot be undone.`
            : "Are you sure you want to delete this order? This action cannot be undone."
        }
        maxWidth="md"
        zIndex={110}
      >
        <div className="flex gap-4">
          <button onClick={() => setConfirmDelete(null)} className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-all">Cancel</button>
          <button 
            onClick={() => confirmDelete?.type === 'bulk' ? handleBulkDelete() : handleDelete(confirmDelete!.id!)}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
          >
            Delete
          </button>
        </div>
      </Dialog>

      {/* Detail / Edit Modal */}
      <Dialog
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.customerName || "Order Details"}
        description="Sales Order Management"
        maxWidth="2xl"
      >
        {selectedOrder && (
          <>
            <div className="grid grid-cols-3 gap-6 mb-10">
              {[
                { label: "Stage 1", key: "quotationStatusFirstFollowUp" },
                { label: "Stage 2", key: "statusSecondFollowUp" },
                { label: "Stage 3", key: "finalStatusThirdFollowUp" }
              ].map((stage, i) => (
                <div key={i} className="space-y-3">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{stage.label}</label>
                  <select 
                    disabled={!isOwner(selectedOrder) && !isAdmin}
                    value={selectedOrder[stage.key]}
                    onChange={(e) => handleStageUpdate(selectedOrder._id, stage.key, e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {["Pending", "Contacted", "Quoted", "Accepted", "Scheduled", "Rejected"].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Total Amount</span>
                <span className="font-bold font-mono text-lg">${selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Automation Status</span>
                <span className={cn(
                  "font-bold px-2 py-0.5 rounded-lg",
                  selectedOrder.automationTriggered ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"
                )}>
                  {selectedOrder.automationTriggered ? "Triggered" : "Idle"}
                </span>
              </div>
            </div>

            {selectedOrder.automationTriggered && (
              <div className="mt-8 flex items-center gap-3 text-sm text-green-600 font-bold bg-green-50 p-4 rounded-xl border border-green-100">
                <CheckCircle2 className="w-5 h-5" />
                Workflow automation has generated Customer & Work Orders.
              </div>
            )}
          </>
        )}
      </Dialog>

      {/* Add Modal */}
      <Dialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Create Sales Order"
        maxWidth="xl"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          try {
            await axios.post("/api/sales/orders", { ...data, totalAmount: Number(data.totalAmount) });
            toast.success("Order created");
            setShowAdd(false);
            fetchOrders();
          } catch (err: any) {
            toast.error(err.response?.data?.error?.[0]?.message || "Creation failed");
          }
        }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">Customer Name</label>
              <input name="customerName" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Phone</label>
              <input name="customerPhone" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input name="customerEmail" type="email" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold mb-2">Total Amount ($)</label>
              <input name="totalAmount" type="number" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
          </div>
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all">
            Submit Order
          </button>
        </form>
      </Dialog>
    </div>
  );
};

const NoPotentialPage = () => {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/sales/leads/non-potential").then(res => setLeads(res.data));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">No Potential Leads</h2>
        <p className="text-neutral-500">Leads that were marked as having no potential.</p>
      </header>
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {leads.map(lead => (
              <tr key={lead._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-neutral-900">{lead.name}</td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{lead.email}</p>
                  <p className="text-xs text-neutral-500">{lead.phone}</p>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{lead.source}</td>
                <td className="px-6 py-4 text-sm text-neutral-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-neutral-400">No non-potential leads found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SalesLeadsPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk', id?: string } | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [orderCreated, setOrderCreated] = useState<string>("");
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === "SuperAdmin" || user?.role === "Admin";
  const isOwner = (lead: any) => lead?.assignedTo === user?.email;
  const canEdit = (lead: any) => isAdmin || (user?.role === "Sales" && (!lead?.assignedTo || isOwner(lead)));

  const fetchLeads = () => {
    axios.get("/api/sales/leads").then(res => {
      setLeads(res.data);
      setSelectedIds([]);
    });
  };

  const fetchUsers = () => {
    axios.get("/api/users").then(res => {
      setUsers(res.data.filter((u: any) => u.role === "Sales" || u.role === "Admin" || u.role === "SuperAdmin"));
    });
  };

  useEffect(() => {
    fetchLeads();
    if (isAdmin) fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/sales/leads/${id}`);
      toast.success("Lead deleted");
      setConfirmDelete(null);
      fetchLeads();
    } catch (err) {
      toast.error("Failed to delete lead");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.delete("/api/sales/leads/bulk", { data: { ids: selectedIds } });
      toast.success("Bulk delete successful");
      setConfirmDelete(null);
      fetchLeads();
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    try {
      await axios.patch(`/api/sales/leads/${selectedLead._id}`, {
        ...data,
        orderCreated
      });
      toast.success("Lead updated");
      setSelectedLead(null);
      fetchLeads();
      
      if (orderCreated === "yes") {
        navigate("/sales");
      } else if (orderCreated === "no") {
        navigate("/sales/non-potential");
      }
    } catch (err) {
      toast.error("Failed to update lead");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) setSelectedIds([]);
    else setSelectedIds(leads.map(l => l._id));
  };

  // Check if data is from marketing sync
  const isMarketingData = (lead: any) => lead.isMarketingLead || lead.source?.includes("Marketing");

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Leads</h2>
          <p className="text-neutral-500">Manage potential customers flowing from Marketing.</p>
        </div>
        <div className="flex gap-4">
          {selectedIds.length > 0 && isAdmin && (
            <button 
              onClick={() => setConfirmDelete({ type: 'bulk' })}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-4 py-4 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === leads.length && leads.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
              </th>
              <th className="px-4 py-4">ID</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Phone</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Sector</th>
              <th className="px-4 py-4">Issue</th>
              <th className="px-4 py-4">Order</th>
              <th className="px-4 py-4">Reason</th>
              <th className="px-4 py-4">SalesPerson ID</th>
              <th className="px-4 py-4">Date</th>
              <th className="px-4 py-4">Notes</th>
              {isAdmin && <th className="px-4 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {leads.map(lead => (
              <tr 
                key={lead._id} 
                onClick={() => {
                  setSelectedLead(lead);
                  setOrderCreated(lead.status === "Converted" ? "yes" : lead.status === "No Potential" ? "no" : "");
                }}
                className={cn(
                  "hover:bg-neutral-50/50 transition-colors cursor-pointer text-xs",
                  selectedIds.includes(lead._id) && "bg-neutral-50"
                )}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(lead._id)}
                    onChange={() => toggleSelect(lead._id)}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                </td>
                <td className="px-4 py-4 font-mono text-neutral-500">{lead.customerCode || "---"}</td>
                <td className="px-4 py-4 font-bold text-neutral-900">{lead.name}</td>
                <td className="px-4 py-4 text-neutral-600 italic">{lead.phone}</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">{lead.type || "---"}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">{lead.sector || "---"}</span>
                </td>
                <td className="px-4 py-4 text-neutral-500">{lead.issue || "---"}</td>
                <td className="px-4 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full font-bold text-white",
                    lead.status === "Converted" ? "bg-green-600" : 
                    lead.status === "No Potential" ? "bg-red-600" : "bg-neutral-200 text-neutral-500"
                  )}>
                    {lead.status === "Converted" ? "YES" : lead.status === "No Potential" ? "NO" : "---"}
                  </span>
                </td>
                <td className="px-4 py-4 text-neutral-500">{lead.reason || "---"}</td>
                <td className="px-4 py-4 italic text-neutral-400">{lead.assignedTo || "---"}</td>
                <td className="px-4 py-4 text-neutral-500">
                  {new Date(lead.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-4 text-neutral-400 truncate max-w-[150px]">{lead.notes || "---"}</td>
                {isAdmin && (
                  <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setConfirmDelete({ type: 'single', id: lead._id })}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={isAdmin ? 12 : 11} className="px-6 py-12 text-center text-neutral-400">No leads found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Confirm Delete"
        description={
          confirmDelete?.type === 'bulk'
            ? `Are you sure you want to delete ${selectedIds.length} selected leads? This action cannot be undone.`
            : "Are you sure you want to delete this lead? This action cannot be undone."
        }
        maxWidth="md"
        zIndex={110}
      >
        <div className="flex gap-4">
          <button onClick={() => setConfirmDelete(null)} className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-all">Cancel</button>
          <button 
            onClick={() => confirmDelete?.type === 'bulk' ? handleBulkDelete() : handleDelete(confirmDelete!.id!)}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
          >
            Delete
          </button>
        </div>
      </Dialog>

      <Dialog
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={canEdit(selectedLead) ? `Edit Sales Lead: ${selectedLead?.customerCode || "New"}` : `Preview Sales Lead: ${selectedLead?.customerCode || "---"}`}
        maxWidth="lg"
      >
        {selectedLead && (
          <form onSubmit={handleUpdateLead} className="space-y-8">
            {!canEdit(selectedLead) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700 text-sm font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>This lead is assigned to another employee. You are in preview-only mode.</p>
              </div>
            )}
            {/* Section 1: Non-Editable Data */}
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest border-b border-neutral-200 pb-2">Lead Information (Read-Only)</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">ID (Customer Code)</label>
                  <p className="text-sm font-medium text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-200">{selectedLead.customerCode || "---"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Full Name</label>
                  <p className="text-sm font-medium text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-200">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Phone Number</label>
                  <p className="text-sm font-medium text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-200 italic">{selectedLead.phone}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Type</label>
                  <p className="text-sm font-medium text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-200">{selectedLead.type || "---"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Sector</label>
                  <p className="text-sm font-medium text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-200">{selectedLead.sector || "---"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Created Date</label>
                  <p className="text-sm font-medium text-neutral-600 bg-white px-3 py-2 rounded-lg border border-neutral-200">{new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Editable Data */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest border-b border-neutral-200 pb-2">Update Lead Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Reason</label>
                  <textarea 
                    name="reason" 
                    defaultValue={selectedLead.reason} 
                    readOnly={!canEdit(selectedLead)} 
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 resize-none" 
                    placeholder="Enter reason for lead status..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Issue</label>
                  <textarea 
                    name="issue" 
                    defaultValue={selectedLead.issue} 
                    readOnly={!canEdit(selectedLead)} 
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 resize-none" 
                    placeholder="Describe the issue or requirement..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Notes</label>
                  <textarea 
                    name="notes" 
                    defaultValue={selectedLead.notes} 
                    readOnly={!canEdit(selectedLead)} 
                    rows={4} 
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 resize-none" 
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {isAdmin && (
                    <div>
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">SalesPerson (Admin Only)</label>
                      <select 
                        name="assignedTo" 
                        defaultValue={selectedLead.assignedTo} 
                        className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <option value="">Select Salesperson</option>
                        {users.map(u => (
                          <option key={u._id} value={u.email}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className={isAdmin ? "" : "col-span-2"}>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Order Created?</label>
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setOrderCreated("yes")}
                        disabled={!canEdit(selectedLead)}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-bold border transition-all",
                          orderCreated === "yes" ? "bg-green-600 text-white border-green-600" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                          !canEdit(selectedLead) && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        Yes
                      </button>
                      <button 
                        type="button"
                        onClick={() => setOrderCreated("no")}
                        disabled={!canEdit(selectedLead)}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-bold border transition-all",
                          orderCreated === "no" ? "bg-red-600 text-white border-red-600" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50",
                          !canEdit(selectedLead) && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {canEdit(selectedLead) && (
              <div className="flex gap-4 pt-4 border-t border-neutral-100">
                <button type="button" onClick={() => setSelectedLead(null)} className="flex-1 py-4 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20">Save Changes</button>
              </div>
            )}
            {!canEdit(selectedLead) && (
              <div className="flex gap-4 pt-4 border-t border-neutral-100">
                <button type="button" onClick={() => setSelectedLead(null)} className="flex-1 py-4 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all">Close Preview</button>
              </div>
            )}
          </form>
        )}
      </Dialog>
    </div>
  );
};

const MarketingPage = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showResults, setShowResults] = useState<string | null>(null);

  const fetchCampaigns = () => {
    axios.get("/api/marketing/campaigns").then(res => setCampaigns(res.data));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const marketingData = campaigns.map(c => ({
    name: c.platform,
    value: c.results?.leadsGenerated || 0
  }));

  const COLORS = ["#1877F2", "#EA4335", "#FBBC05", "#34A853", "#8E44AD"];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing Hub</h2>
          <p className="text-neutral-500">Manage campaigns and track lead generation performance.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all"
        >
          <Megaphone className="w-5 h-5" />
          New Campaign
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Active Campaigns</h3>
          <div className="space-y-4">
            {campaigns.map(c => (
              <div key={c._id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Target className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{c.name}</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">{c.platform}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">{c.results?.leadsGenerated || 0} Leads</p>
                  <p className="text-xs text-green-600 font-bold">{c.results?.conversions || 0} Conv.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono font-bold">${c.budget.toLocaleString()}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">{c.status}</span>
                  </div>
                  <button 
                    onClick={() => setShowResults(c._id)}
                    className="p-2 hover:bg-neutral-200 rounded-lg transition-all"
                    title="Record Results"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <p className="text-center py-12 text-neutral-400">No campaigns found. Create one to get started.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Lead Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketingData.length > 0 ? marketingData : [{ name: "None", value: 1 }]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {marketingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {marketingData.length === 0 && <Cell fill="#f3f4f6" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {marketingData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Results Modal */}
      <Dialog
        isOpen={!!showResults}
        onClose={() => setShowResults(null)}
        title="Record Campaign Results"
        maxWidth="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const results = {
            leadsGenerated: Number(formData.get("leadsGenerated")),
            conversions: Number(formData.get("conversions")),
            revenue: Number(formData.get("revenue")),
            roi: Number(formData.get("roi")),
          };
          try {
            await axios.patch(`/api/marketing/campaigns/${showResults}/results`, { results });
            toast.success("Results updated");
            setShowResults(null);
            fetchCampaigns();
          } catch (err: any) {
            toast.error("Update failed");
          }
        }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Leads Generated</label>
              <input name="leadsGenerated" type="number" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Conversions</label>
              <input name="conversions" type="number" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Revenue ($)</label>
              <input name="revenue" type="number" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">ROI (%)</label>
              <input name="roi" type="number" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
          </div>
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all">
            Save Results
          </button>
        </form>
      </Dialog>

      {/* New Campaign Modal */}
      <Dialog
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Campaign"
        maxWidth="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const data = Object.fromEntries(formData);
          try {
            await axios.post("/api/marketing/campaigns", { ...data, budget: Number(data.budget) });
            toast.success("Campaign created");
            setShowAdd(false);
            fetchCampaigns();
          } catch (err: any) {
            toast.error("Creation failed");
          }
        }} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Campaign Name</label>
            <input name="name" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Platform</label>
            <select name="platform" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900">
              <option>Facebook</option>
              <option>Google</option>
              <option>Instagram</option>
              <option>LinkedIn</option>
              <option>Email</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Budget ($)</label>
            <input name="budget" type="number" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold hover:bg-neutral-800 transition-all">
            Create Campaign
          </button>
        </form>
      </Dialog>
    </div>
  );
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/finance/invoices").then(res => setInvoices(res.data));
  }, []);

  const handleDownloadPDF = (id: string) => {
    window.open(`/api/reports/invoice/${id}/pdf`, "_blank");
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Financial Invoices</h2>
        <p className="text-neutral-500">Track all generated invoices and payment statuses.</p>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {invoices.map(inv => (
              <tr key={inv._id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-neutral-900">{inv.invoiceNumber}</td>
                <td className="px-6 py-4 text-neutral-600">{inv.salesOrderId?.customerName}</td>
                <td className="px-6 py-4 font-bold">${inv.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    inv.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>{inv.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDownloadPDF(inv._id)}
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-400">No invoices generated yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        
        <Route path="/dashboard" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><DashboardPage /></Layout> : <Navigate to="/sales" />
        } />
        
        <Route path="/marketing" element={
          user && ["SuperAdmin", "Admin", "Manager", "Marketing"].includes(user.role) ? <Layout><MarketingPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/marketing/leads" element={
          user && ["SuperAdmin", "Admin", "Manager", "Marketing"].includes(user.role) ? <Layout><MarketingLeadsPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/marketing/content" element={
          user && ["SuperAdmin", "Admin", "Manager", "Marketing"].includes(user.role) ? <Layout><ContentTrackerPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/marketing/tracker" element={
          user && ["SuperAdmin", "Admin", "Manager", "Marketing"].includes(user.role) ? <Layout><CampaignTrackerPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/marketing/results" element={
          user && ["SuperAdmin", "Admin", "Manager", "Marketing"].includes(user.role) ? <Layout><CampaignResultsPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/marketing/reports" element={
          user && ["SuperAdmin", "Admin", "Manager", "Marketing"].includes(user.role) ? <Layout><MarketingReportsPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/sales/leads" element={
          user && ["SuperAdmin", "Admin", "Manager", "Sales"].includes(user.role) ? <Layout><SalesLeadsPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/sales/data" element={
          user && ["SuperAdmin", "Admin", "Manager", "Sales"].includes(user.role) ? <Layout><PlaceholderPage title="Sales Data" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/sales/non-potential" element={
          user && ["SuperAdmin", "Admin", "Manager", "Sales"].includes(user.role) ? <Layout><NoPotentialPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/sales" element={
          user ? <Layout><SalesOrdersPage /></Layout> : <Navigate to="/login" />
        } />

        <Route path="/customers/orders" element={
          user && ["SuperAdmin", "Admin", "Manager", "CustomerService"].includes(user.role) ? <Layout><CustomerOrdersPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/customers/feedback" element={
          user && ["SuperAdmin", "Admin", "Manager", "CustomerService"].includes(user.role) ? <Layout><PlaceholderPage title="Feedback" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/followups" element={
          user && ["SuperAdmin", "Admin", "Manager", "CustomerService"].includes(user.role) ? <Layout><FollowUpsPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/finance/orders" element={
          user && ["SuperAdmin", "Admin", "Manager", "Finance"].includes(user.role) ? <Layout><PlaceholderPage title="Order Finance" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/finance/inventory" element={
          user && ["SuperAdmin", "Admin", "Manager", "Finance"].includes(user.role) ? <Layout><PlaceholderPage title="Inventory Finance" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/finance/expenses" element={
          user && ["SuperAdmin", "Admin", "Manager", "Finance"].includes(user.role) ? <Layout><PlaceholderPage title="General Expenses" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/finance/salaries" element={
          user && ["SuperAdmin", "Admin", "Manager", "Finance"].includes(user.role) ? <Layout><PlaceholderPage title="Salaries" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/ops" element={
          user && ["SuperAdmin", "Admin", "Operations"].includes(user.role) ? <Layout><WorkOrdersPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/ops/price-list" element={
          user && ["SuperAdmin", "Admin", "Operations"].includes(user.role) ? <Layout><PlaceholderPage title="Price List" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/ops/performance" element={
          user && ["SuperAdmin", "Admin", "Operations"].includes(user.role) ? <Layout><PlaceholderPage title="Performance Reports" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/hr/employees" element={
          user && ["SuperAdmin", "Admin", "HR"].includes(user.role) ? <Layout><EmployeesPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/hr/attendance" element={
          user && ["SuperAdmin", "Admin", "HR"].includes(user.role) ? <Layout><AttendancePage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/admin/audit" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><PlaceholderPage title="Audit Logs" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/admin/profit" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><PlaceholderPage title="Net Profit Report" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/reports/sales" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><PlaceholderPage title="Sales Report" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/reports/marketing" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><PlaceholderPage title="Marketing Report" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/reports/operations" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><PlaceholderPage title="Operation Members" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/reports/evaluation" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><PlaceholderPage title="Employee Evaluation" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/reports/hr" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><PlaceholderPage title="HR Efficiency" /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/inventory" element={
          user && ["SuperAdmin", "Admin", "Operations"].includes(user.role) ? <Layout><InventoryPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/customers" element={
          user && ["SuperAdmin", "Admin", "Manager", "CustomerService"].includes(user.role) ? <Layout><CustomersPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/suppliers" element={
          user && ["SuperAdmin", "Admin", "Operations"].includes(user.role) ? <Layout><SuppliersPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/purchase-orders" element={
          user && ["SuperAdmin", "Admin", "Operations"].includes(user.role) ? <Layout><PurchaseOrdersPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/finance/invoices" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><InvoicesPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/reports" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><ReportsPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/governance" element={
          user && ["SuperAdmin", "Admin", "Manager"].includes(user.role) ? <Layout><GovernancePage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="/users" element={
          user && ["SuperAdmin", "Admin"].includes(user.role) ? <Layout><UserManagementPage /></Layout> : <Navigate to="/sales" />
        } />

        <Route path="*" element={<Navigate to={user ? (["SuperAdmin", "Admin", "Manager"].includes(user.role) ? "/dashboard" : "/sales") : "/login"} />} />
      </Routes>
    </Router>
  );
}
