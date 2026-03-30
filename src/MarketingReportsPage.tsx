import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileBarChart, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Edit2
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { cn } from "./lib/utils";
import { Dialog } from "./components/Dialog";
import { useAuthStore } from "./store/authStore";

const MarketingReportsPage = () => {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    reportName: "",
    period: "Monthly",
    totalSpend: 0,
    totalLeads: 0,
    conversionRate: 0,
    topChannel: "",
    summary: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  console.log("MarketingReportsPage: user", user);

  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";
  const isOwner = (report: any) => report.marketingCreator === user?.email;
  const canEdit = (report: any) => isAdmin || isOwner(report);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/marketing/reports");
      setReports(res.data);
    } catch (error) {
      console.error("Failed to fetch marketing reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenModal = (report?: any) => {
    if (report) {
      setSelectedReport(report);
      setFormData({
        reportName: report.reportName || "",
        period: report.period || "Monthly",
        totalSpend: report.totalSpend || 0,
        totalLeads: report.totalLeads || 0,
        conversionRate: report.conversionRate || 0,
        topChannel: report.topChannel || "",
        summary: report.summary || ""
      });
    } else {
      setSelectedReport(null);
      setFormData({
        reportName: "",
        period: "Monthly",
        totalSpend: 0,
        totalLeads: 0,
        conversionRate: 0,
        topChannel: "",
        summary: ""
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const config = {
        headers: {
          "X-Idempotency-Key": crypto.randomUUID()
        }
      };
      if (selectedReport) {
        await axios.patch(`/api/marketing/reports/${selectedReport._id}`, formData, config);
        toast.success("Marketing report updated successfully");
      } else {
        await axios.post("/api/marketing/reports", formData, config);
        toast.success("Marketing report added successfully");
      }
      setShowModal(false);
      fetchReports();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save report");
    } finally {
      setIsSaving(false);
    }
  };

  const isPreviewOnly = selectedReport && !canEdit(selectedReport);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Marketing Reports</h2>
          <p className="text-neutral-500">Comprehensive summaries of marketing performance and ROI.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
        >
          <Plus className="w-4 h-4" />
          Create Report
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Spend", value: `$${reports.reduce((acc, curr) => acc + (curr.totalSpend || 0), 0).toLocaleString()}`, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Leads", value: reports.reduce((acc, curr) => acc + (curr.totalLeads || 0), 0).toLocaleString(), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Avg. Conv. Rate", value: `${(reports.reduce((acc, curr) => acc + (curr.conversionRate || 0), 0) / (reports.length || 1)).toFixed(2)}%`, icon: PieChart, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Reports Generated", value: reports.length, icon: FileBarChart, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-all">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
                <th className="px-6 py-4">Report Name</th>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Spend / Leads</th>
                <th className="px-6 py-4">Conversion Rate</th>
                <th className="px-6 py-4">Top Channel</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400">Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400">No reports found.</td></tr>
              ) : (
                reports.map((report, i) => (
                  <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900">{report.reportName}</p>
                      <p className="text-xs text-neutral-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-bold uppercase">
                        {report.period}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900">${report.totalSpend.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">{report.totalLeads.toLocaleString()} leads</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{report.conversionRate}%</span>
                        {report.conversionRate > 5 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600 font-medium">{report.topChannel}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenModal(report)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                      >
                        {canEdit(report) ? <Edit2 className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedReport ? (isPreviewOnly ? "Preview Marketing Report" : "Edit Marketing Report") : "Create Marketing Report"}
        description={isPreviewOnly ? "Viewing report details in read-only mode." : "Summarize performance for a specific period."}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {isPreviewOnly && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-sm font-medium flex items-center gap-2">
              <Search className="w-4 h-4" />
              Preview Only: You don't have permission to edit this report.
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Report Name</label>
            <input 
              required
              disabled={isPreviewOnly}
              type="text" 
              placeholder="e.g., Q1 2024 Performance"
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all disabled:opacity-50"
              value={formData.reportName}
              onChange={(e) => setFormData({...formData, reportName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Period</label>
              <select 
                disabled={isPreviewOnly}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all disabled:opacity-50"
                value={formData.period}
                onChange={(e) => setFormData({...formData, period: e.target.value})}
              >
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Top Channel</label>
              <input 
                disabled={isPreviewOnly}
                type="text" 
                placeholder="e.g., Facebook Ads"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all disabled:opacity-50"
                value={formData.topChannel}
                onChange={(e) => setFormData({...formData, topChannel: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Total Spend ($)</label>
              <input 
                disabled={isPreviewOnly}
                type="number" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all disabled:opacity-50"
                value={formData.totalSpend}
                onChange={(e) => setFormData({...formData, totalSpend: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Total Leads</label>
              <input 
                disabled={isPreviewOnly}
                type="number" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all disabled:opacity-50"
                value={formData.totalLeads}
                onChange={(e) => setFormData({...formData, totalLeads: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Conversion Rate (%)</label>
              <input 
                disabled={isPreviewOnly}
                type="number" 
                step="0.01"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all disabled:opacity-50"
                value={formData.conversionRate}
                onChange={(e) => setFormData({...formData, conversionRate: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Executive Summary</label>
            <textarea 
              disabled={isPreviewOnly}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all resize-none disabled:opacity-50"
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
            />
          </div>

          {!isPreviewOnly && (
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : (selectedReport ? "Update Report" : "Save Report")}
            </button>
          )}
        </form>
      </Dialog>
    </div>
  );
};

export default MarketingReportsPage;
