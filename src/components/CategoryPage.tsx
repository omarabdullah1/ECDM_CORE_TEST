import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const CategoryPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/inventory/categories");
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await axios.post("/api/inventory/categories", { name: newCategory }, {
        headers: {
          "X-Idempotency-Key": crypto.randomUUID()
        }
      });
      toast.success("Category added");
      setNewCategory("");
      fetchCategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to add category";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/inventory/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to delete category";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </header>

      <form onSubmit={handleAdd} className="flex gap-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category Name"
          className="flex-1 p-3 border border-neutral-200 rounded-xl"
          required
        />
        <button 
          type="submit" 
          disabled={isSaving}
          className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> {isSaving ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Name</th>
              <th className="px-6 py-4 text-left font-bold text-neutral-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-6 py-4">{cat.name}</td>
                <td className="px-6 py-4">
                  <button onClick={() => { setDeleteId(cat._id); setIsDeleteConfirmOpen(true); }} className="text-neutral-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-neutral-600 mb-6">Are you sure you want to delete this category? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 text-neutral-500 hover:text-neutral-900">Cancel</button>
              <button onClick={() => { if (deleteId) handleDelete(deleteId); setIsDeleteConfirmOpen(false); }} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
