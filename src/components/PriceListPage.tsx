import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, X, Eye, Download } from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "../store/authStore";
import { PDFPreviewModal } from "./PDFPreviewModal";

export const PriceListPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isMultiDeleteConfirmOpen, setIsMultiDeleteConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/inventory");
      setItems(res.data);
    } catch (err) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/inventory/categories");
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const formData = new FormData();
    Object.keys(currentItem).forEach(key => formData.append(key, currentItem[key]));
    if (file) formData.append("dataSheet", file);

    const idempotencyKey = crypto.randomUUID();

    try {
      const config = {
        headers: {
          "X-Idempotency-Key": idempotencyKey
        }
      };

      if (currentItem._id) {
        await axios.patch(`/api/inventory/${currentItem._id}`, formData, config);
        toast.success("Item updated");
      } else {
        await axios.post("/api/inventory", formData, config);
        toast.success("Item created");
      }
      setIsModalOpen(false);
      setFile(null);
      fetchItems();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to save item";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/inventory/${id}`);
      toast.success("Item deleted");
      fetchItems();
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const handleMultiDelete = async () => {
    try {
      await Promise.all(selectedItems.map(id => axios.delete(`/api/inventory/${id}`)));
      toast.success("Items deleted");
      setSelectedItems([]);
      fetchItems();
    } catch (err) {
      toast.error("Failed to delete items");
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const isAdmin = ["SuperAdmin", "Admin"].includes(user?.role || "");

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Price List</h2>
        <div className="flex gap-2">
          {isAdmin && selectedItems.length > 0 && (
            <button onClick={() => setIsMultiDeleteConfirmOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-red-700">
              <Trash2 className="w-4 h-4" /> Delete Selected
            </button>
          )}
          <button
            onClick={() => { setCurrentItem({}); setIsModalOpen(true); }}
            className="bg-neutral-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {isAdmin && <th className="px-6 py-4"></th>}
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Spare Parts ID</th>
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Item Name</th>
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Specification</th>
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Category</th>
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Unit Price</th>
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Data Sheet</th>
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer" onClick={() => { setCurrentItem(item); setIsModalOpen(true); }}>
                {isAdmin && <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedItems.includes(item._id)} onChange={() => toggleSelectItem(item._id)} /></td>}
                <td className="px-6 py-4">{item.sparePartsId}</td>
                <td className="px-6 py-4">{item.itemName}</td>
                <td className="px-6 py-4">{item.specification}</td>
                <td className="px-6 py-4">{item.category}</td>
                <td className="px-6 py-4">${(item.unitPrice ?? 0).toFixed(2)}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  {item.dataSheetUrl && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setPreviewUrl(item.dataSheetUrl);
                          setPreviewTitle(item.itemName + " Data Sheet");
                        }}
                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-bold"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <a href={item.dataSheetUrl} download className="text-neutral-500 hover:text-neutral-900 flex items-center gap-1 text-xs">
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setDeleteId(item._id); setIsDeleteConfirmOpen(true); }} className="text-neutral-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PDFPreviewModal 
        isOpen={!!previewUrl} 
        onClose={() => setPreviewUrl(null)} 
        url={previewUrl || ""} 
        title={previewTitle} 
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{currentItem._id ? "Edit Item" : "Add Item"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" placeholder="Item Name" value={currentItem.itemName || ""} onChange={e => setCurrentItem({...currentItem, itemName: e.target.value})} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl" required />
              <input type="text" placeholder="Specification" value={currentItem.specification || ""} onChange={e => setCurrentItem({...currentItem, specification: e.target.value})} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl" />
              <select value={currentItem.category || ""} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl" required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
              <input type="number" placeholder="Unit Price" value={currentItem.unitPrice || ""} onChange={e => setCurrentItem({...currentItem, unitPrice: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl" required />
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700">Data Sheet</label>
                {currentItem.dataSheetUrl ? (
                  <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                    <span className="text-sm text-neutral-600 truncate max-w-[200px]">
                      {currentItem.dataSheetUrl.split('/').pop()?.split('-').slice(1).join('-') || currentItem.dataSheetUrl.split('/').pop()}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setCurrentItem({...currentItem, dataSheetUrl: ""})}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input 
                    type="file" 
                    onChange={e => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        // Check if file with same name was already there (even if removed in this session, we check the original)
                        // But since we use timestamps, we just check the base name
                        setFile(selectedFile);
                      }
                    }} 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl" 
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => { setIsModalOpen(false); setFile(null); }} className="px-4 py-2 text-neutral-500 hover:text-neutral-900" disabled={isSaving}>Cancel</button>
                <button type="submit" className="bg-neutral-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-neutral-600 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 text-neutral-500 hover:text-neutral-900">Cancel</button>
              <button onClick={() => { if (deleteId) handleDelete(deleteId); setIsDeleteConfirmOpen(false); }} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {isMultiDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Confirm Multi-Delete</h3>
            <p className="text-neutral-600 mb-6">Are you sure you want to delete {selectedItems.length} selected items? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsMultiDeleteConfirmOpen(false)} className="px-4 py-2 text-neutral-500 hover:text-neutral-900">Cancel</button>
              <button onClick={() => { handleMultiDelete(); setIsMultiDeleteConfirmOpen(false); }} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700">Delete All</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
