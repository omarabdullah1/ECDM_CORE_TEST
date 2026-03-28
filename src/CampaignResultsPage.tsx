import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart3, 
  RefreshCw, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter,
  Download,
  FileSpreadsheet,
  Plus,
  Trash2
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { cn } from "./lib/utils";
import { Dialog } from "./components/Dialog";
import { GoogleSheetsSyncDialog } from "./components/GoogleSheetsSyncDialog";

const CampaignResultsPage = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const resResults = await axios.get("/api/marketing/campaign-results");
      setResults(resResults.data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.length === results.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map(r => r._id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete("/api/marketing/campaign-results/bulk", { data: { ids: selectedIds } });
      toast.success("Selected results deleted successfully");
      setSelectedIds([]);
      setConfirmDelete(false);
      fetchResults();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Bulk delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Results</h2>
          <p className="text-neutral-500">Analyze performance metrics across all marketing campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
          >
            <RefreshCw className="w-4 h-4" />
            Sync from Sheets
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Impressions", value: results.reduce((acc, curr) => acc + (curr.impressions || 0), 0).toLocaleString(), icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Conversions", value: results.reduce((acc, curr) => acc + (curr.conversions || 0), 0).toLocaleString(), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Revenue", value: `$${results.reduce((acc, curr) => acc + (curr.salesRevenue || 0), 0).toLocaleString()}`, icon: Download, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Avg. Conversion Rate", value: `${results.length > 0 ? ((results.reduce((acc, curr) => acc + (curr.conversions || 0), 0) / results.reduce((acc, curr) => acc + (curr.impressions || 1), 1)) * 100).toFixed(2) : 0}%`, icon: RefreshCw, color: "text-orange-600", bg: "bg-orange-50" },
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
              placeholder="Search campaigns..." 
              className="w-full pl-11 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-all">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={results.length > 0 && selectedIds.length === results.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                </th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Impressions</th>
                <th className="px-6 py-4">Conversions</th>
                <th className="px-6 py-4">Revenue</th>
                <th className="px-6 py-4">Next Steps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-400">Loading results...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-400">No results found. Try syncing from Google Sheets.</td></tr>
              ) : (
                results.map((res, i) => (
                  <tr key={i} className={cn("hover:bg-neutral-50/50 transition-colors", selectedIds.includes(res._id) && "bg-neutral-50")}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(res._id)}
                        onChange={() => handleSelectOne(res._id)}
                        className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900">{res.campaign}</p>
                      <p className="text-xs text-neutral-500">{new Date(res.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        res.status === "Active" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-700"
                      )}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-600">{res.impressions.toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-neutral-600">{res.conversions.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-neutral-900">${res.salesRevenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500 max-w-xs truncate">{res.nextSteps}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Modal */}
      <GoogleSheetsSyncDialog
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        syncType="campaign-results"
        onSyncComplete={fetchResults}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Confirm Delete"
        description={`Are you sure you want to delete ${selectedIds.length} selected campaign results? This action cannot be undone.`}
        maxWidth="md"
      >
        <div className="flex gap-4 mt-6">
          <button 
            onClick={() => setConfirmDelete(false)}
            className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-900 rounded-xl font-bold hover:bg-neutral-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleBulkDelete}
            disabled={deleting}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default CampaignResultsPage;
