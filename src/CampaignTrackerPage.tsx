import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MapPin,
  Edit2
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { cn } from "./lib/utils";
import { Dialog } from "./components/Dialog";
import { useAuthStore } from "./store/authStore";

const CampaignTrackerPage = () => {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    campaignName: "",
    status: "Planning",
    budget: 0,
    spent: 0,
    startDate: "",
    endDate: "",
    targetAudience: "",
    channels: [] as string[],
    goals: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user?.role === "SuperAdmin" || user?.role === "Admin";
  const isOwner = (item: any) => item?.owner === user?.email;
  const canEdit = (item: any) => isAdmin || isOwner(item);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/marketing/campaign-tracker");
      setItems(res.data);
    } catch (error) {
      console.error("Failed to fetch campaign tracker items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
      if (selectedItem) {
        await axios.patch(`/api/marketing/campaign-tracker/${selectedItem._id}`, formData, config);
        toast.success("Campaign tracker item updated successfully");
      } else {
        await axios.post("/api/marketing/campaign-tracker", formData, config);
        toast.success("Campaign tracker item added successfully");
      }
      setShowAddModal(false);
      setSelectedItem(null);
      setFormData({
        campaignName: "",
        status: "Planning",
        budget: 0,
        spent: 0,
        startDate: "",
        endDate: "",
        targetAudience: "",
        channels: [],
        goals: ""
      });
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData({
      campaignName: item.campaignName || "",
      status: item.status || "Planning",
      budget: item.budget || 0,
      spent: item.spent || 0,
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : "",
      endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : "",
      targetAudience: item.targetAudience || "",
      channels: item.channels || [],
      goals: item.goals || ""
    });
    setShowAddModal(true);
  };

  const toggleChannel = (channel: string) => {
    if (selectedItem && !canEdit(selectedItem)) return;
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel) 
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Campaign Tracker</h2>
          <p className="text-neutral-500">Manage and monitor all active and planned marketing campaigns.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedItem(null);
            setFormData({
              campaignName: "",
              status: "Planning",
              budget: 0,
              spent: 0,
              startDate: "",
              endDate: "",
              targetAudience: "",
              channels: [],
              goals: ""
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Campaigns", count: items.filter(i => i.status === "Active").length, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "In Planning", count: items.filter(i => i.status === "Planning").length, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Budget", count: `$${items.reduce((acc, curr) => acc + (curr.budget || 0), 0).toLocaleString()}`, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stat.count}</h3>
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-neutral-400 text-xs font-bold uppercase tracking-widest border-b border-neutral-100">
                <th className="px-6 py-4">Campaign Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Budget / Spent</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4">Channels</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400">Loading campaigns...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400">No campaigns found.</td></tr>
              ) : (
                items.map((item, i) => (
                  <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900">{item.campaignName}</p>
                      <p className="text-xs text-neutral-500">{item.targetAudience}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        item.status === "Active" ? "bg-green-100 text-green-700" : 
                        item.status === "Planning" ? "bg-blue-100 text-blue-700" : 
                        "bg-neutral-100 text-neutral-700"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900">${item.budget.toLocaleString()}</p>
                      <div className="w-full bg-neutral-100 h-1 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="bg-neutral-900 h-full transition-all" 
                          style={{ width: `${Math.min((item.spent / item.budget) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-1">${item.spent.toLocaleString()} spent</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Calendar className="w-4 h-4" />
                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : "TBD"} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : "TBD"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.channels.map((c: string, idx: number) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[10px] font-medium uppercase">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
                      >
                        {canEdit(item) ? <Edit2 className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedItem ? (canEdit(selectedItem) ? "Edit Campaign" : "Preview Campaign") : "New Campaign"}
        description={selectedItem ? "" : "Plan and track your next marketing initiative."}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {!canEdit(selectedItem) && selectedItem && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>This record belongs to another employee. You are in preview-only mode.</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Campaign Name</label>
            <input 
              required
              readOnly={selectedItem && !canEdit(selectedItem)}
              type="text" 
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              value={formData.campaignName}
              onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Status</label>
              <select 
                disabled={selectedItem && !canEdit(selectedItem)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option>Planning</option>
                <option>Active</option>
                <option>Paused</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Target Audience</label>
              <input 
                readOnly={selectedItem && !canEdit(selectedItem)}
                type="text" 
                placeholder="e.g., Tech Professionals"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Budget ($)</label>
              <input 
                readOnly={selectedItem && !canEdit(selectedItem)}
                type="number" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Spent ($)</label>
              <input 
                readOnly={selectedItem && !canEdit(selectedItem)}
                type="number" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.spent}
                onChange={(e) => setFormData({...formData, spent: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Start Date</label>
              <input 
                readOnly={selectedItem && !canEdit(selectedItem)}
                type="date" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">End Date</label>
              <input 
                readOnly={selectedItem && !canEdit(selectedItem)}
                type="date" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Channels</label>
            <div className="flex flex-wrap gap-2">
              {["Facebook", "Instagram", "TikTok", "YouTube", "LinkedIn", "Google Ads", "Email"].map(channel => (
                <button
                  key={channel}
                  type="button"
                  disabled={selectedItem && !canEdit(selectedItem)}
                  onClick={() => toggleChannel(channel)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                    formData.channels.includes(channel)
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-900",
                    selectedItem && !canEdit(selectedItem) && "opacity-60 cursor-not-allowed"
                  )}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Goals & Objectives</label>
            <textarea 
              readOnly={selectedItem && !canEdit(selectedItem)}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all resize-none"
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
            />
          </div>

          {(!selectedItem || canEdit(selectedItem)) ? (
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : (selectedItem ? "Save Changes" : "Create Campaign Tracker")}
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => setShowAddModal(false)}
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
            >
              Close Preview
            </button>
          )}
        </form>
      </Dialog>
    </div>
  );
};

export default CampaignTrackerPage;
