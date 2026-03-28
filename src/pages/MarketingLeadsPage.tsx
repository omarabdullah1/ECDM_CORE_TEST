import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Database, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MapPin,
  Briefcase,
  Tag,
  Phone,
  Mail,
  User,
  Trash2
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuthStore } from "../store/authStore.ts";
import { cn } from "../lib/utils.ts";
import { Dialog } from "../components/Dialog.tsx";
import { GoogleSheetsSyncDialog } from "../components/GoogleSheetsSyncDialog.tsx";

const MarketingLeadsPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSync, setShowSync] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk', id?: string } | null>(null);
  const { user } = useAuthStore();

  const fetchLeads = () => {
    axios.get("/api/marketing/leads").then(res => setLeads(res.data));
    setSelectedIds([]);
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const handleBulkDelete = async () => {
    try {
      await axios.delete("/api/marketing/leads/bulk", { data: { ids: selectedIds } });
      toast.success("Bulk delete successful");
      setConfirmDelete(null);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Bulk delete failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/marketing/leads/${id}`);
      toast.success("Lead deleted");
      setConfirmDelete(null);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(l => l._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing Leads</h2>
          <p className="text-neutral-500">Manage and sync leads from marketing campaigns.</p>
        </div>
        <div className="flex gap-4">
          {selectedIds.length > 0 && (user?.role === "SuperAdmin" || user?.role === "Admin") && (
            <button 
              onClick={() => setConfirmDelete({ type: 'bulk' })}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedIds.length})
            </button>
          )}
          {(user?.role === "SuperAdmin" || user?.role === "Admin") && (
            <button 
              onClick={() => setShowSync(true)}
              className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10"
            >
              <Database className="w-5 h-5" />
              Sync from Sheets
            </button>
          )}
          <button className="bg-white text-neutral-900 border border-neutral-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-50 transition-all">
            <Plus className="w-5 h-5" />
            Add Lead
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total Leads</p>
            <p className="text-xl font-bold">{leads.length}</p>
          </div>
        </div>
        {/* Add more stats if needed */}
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input 
              placeholder="Search leads..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] border-b border-neutral-100">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={leads.length > 0 && selectedIds.length === leads.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                </th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Sector</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leads.map(lead => (
                <tr key={lead._id} className={cn(
                  "hover:bg-neutral-50/50 transition-colors group",
                  selectedIds.includes(lead._id) && "bg-neutral-50"
                )}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(lead._id)}
                      onChange={() => toggleSelect(lead._id)}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-neutral-500">{lead.customerCode || "---"}</td>
                  <td className="px-6 py-4 font-bold text-neutral-900">{lead.name}</td>
                  <td className="px-6 py-4 text-neutral-600 italic text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {lead.type || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {lead.sector || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-neutral-500 max-w-[150px] truncate" title={lead.notes}>
                      {lead.notes || "---"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-400">
                    {format(new Date(lead.createdAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(user?.role === "SuperAdmin" || user?.role === "Admin") && (
                      <button 
                        onClick={() => setConfirmDelete({ type: 'single', id: lead._id })}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-neutral-400">
                    No leads found. Sync from Google Sheets to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GoogleSheetsSyncDialog
        isOpen={showSync}
        onClose={() => setShowSync(false)}
        syncType="marketing-leads"
        onSyncComplete={fetchLeads}
      />

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
          <button 
            onClick={() => setConfirmDelete(null)}
            className="flex-1 px-6 py-3 bg-neutral-100 text-neutral-600 rounded-xl font-bold hover:bg-neutral-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => confirmDelete?.type === 'bulk' ? handleBulkDelete() : handleDelete(confirmDelete.id!)}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
          >
            Delete
          </button>
        </div>
      </Dialog>
    </div>
  );
};

export default MarketingLeadsPage;
