import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Calendar, 
  User, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Edit2
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { cn } from "./lib/utils";
import { Dialog } from "./components/Dialog";
import { useAuthStore } from "./store/authStore";

const ContentTrackerPage = () => {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    contentType: "Video",
    platform: "Facebook",
    status: "Pending",
    assignedTo: "",
    deadline: "",
    notes: ""
  });

  const isAdmin = user?.role === "SuperAdmin" || user?.role === "Admin";
  const isOwner = (item: any) => item?.owner === user?.email;
  const canEdit = (item: any) => isAdmin || isOwner(item);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/marketing/content-tracker");
      setItems(res.data);
    } catch (error) {
      console.error("Failed to fetch content tracker items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await axios.patch(`/api/marketing/content-tracker/${selectedItem._id}`, formData);
        toast.success("Content tracker item updated successfully");
      } else {
        await axios.post("/api/marketing/content-tracker", formData);
        toast.success("Content tracker item added successfully");
      }
      setShowAddModal(false);
      setSelectedItem(null);
      setFormData({
        name: "",
        phone: "",
        contentType: "Video",
        platform: "Facebook",
        status: "Pending",
        assignedTo: "",
        deadline: "",
        notes: ""
      });
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save item");
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      phone: item.phone || "",
      contentType: item.contentType || "Video",
      platform: item.platform || "Facebook",
      status: item.status || "Pending",
      assignedTo: item.assignedTo || "",
      deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : "",
      notes: item.notes || ""
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Content Tracker</h2>
          <p className="text-neutral-500">Track content production and distribution across platforms.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedItem(null);
            setFormData({
              name: "",
              phone: "",
              contentType: "Video",
              platform: "Facebook",
              status: "Pending",
              assignedTo: "",
              deadline: "",
              notes: ""
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
        >
          <Plus className="w-4 h-4" />
          Add Content
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Pending Production", count: items.filter(i => i.status === "Pending").length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "In Progress", count: items.filter(i => i.status === "In Progress").length, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Completed", count: items.filter(i => i.status === "Completed").length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
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
              placeholder="Search content..." 
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
                <th className="px-6 py-4">Content Name</th>
                <th className="px-6 py-4">Type / Platform</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400">Loading content...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400">No content items found.</td></tr>
              ) : (
                items.map((item, i) => (
                  <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900">{item.name}</p>
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Phone className="w-3 h-3" />
                        {item.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-700">{item.contentType}</p>
                      <p className="text-xs text-neutral-500">{item.platform}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        item.status === "Completed" ? "bg-green-100 text-green-700" : 
                        item.status === "In Progress" ? "bg-blue-100 text-blue-700" : 
                        "bg-orange-100 text-orange-700"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-600 uppercase">
                          {item.assignedTo?.substring(0, 2) || "NA"}
                        </div>
                        <span className="text-sm text-neutral-600">{item.assignedTo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Calendar className="w-4 h-4" />
                        {item.deadline ? new Date(item.deadline).toLocaleDateString() : "No deadline"}
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
        title={selectedItem ? (canEdit(selectedItem) ? "Edit Content Item" : "Preview Content Item") : "Add Content Item"}
        description={selectedItem ? "" : "Create a new content production task."}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {!canEdit(selectedItem) && selectedItem && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700 text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>This record belongs to another employee. You are in preview-only mode.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Content Name</label>
              <input 
                required
                readOnly={selectedItem && !canEdit(selectedItem)}
                type="text" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Phone Number</label>
              <input 
                required
                readOnly={selectedItem && !canEdit(selectedItem)}
                type="text" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Content Type</label>
              <select 
                disabled={selectedItem && !canEdit(selectedItem)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.contentType}
                onChange={(e) => setFormData({...formData, contentType: e.target.value})}
              >
                <option>Video</option>
                <option>Image</option>
                <option>Article</option>
                <option>Ad Copy</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Platform</label>
              <select 
                disabled={selectedItem && !canEdit(selectedItem)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
              >
                <option>Facebook</option>
                <option>Instagram</option>
                <option>TikTok</option>
                <option>YouTube</option>
                <option>LinkedIn</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Status</label>
              <select 
                disabled={selectedItem && !canEdit(selectedItem)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Deadline</label>
              <input 
                readOnly={selectedItem && !canEdit(selectedItem)}
                type="date" 
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Assigned To</label>
            <input 
              readOnly={selectedItem && !canEdit(selectedItem)}
              type="text" 
              placeholder="Employee name"
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
              value={formData.assignedTo}
              onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Notes</label>
            <textarea 
              readOnly={selectedItem && !canEdit(selectedItem)}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-neutral-900 transition-all resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          {(!selectedItem || canEdit(selectedItem)) ? (
            <button 
              type="submit"
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
            >
              {selectedItem ? "Save Changes" : "Create Content Item"}
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

export default ContentTrackerPage;
