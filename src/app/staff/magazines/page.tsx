"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, BookOpen, Loader2, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function MagazineManager() {
  const [magazines, setMagazines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newMag, setNewMag] = useState({
    title: "",
    description: "",
    fileUrl: "",
    coverImageUrl: ""
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    fileUrl: "",
    coverImageUrl: "",
    status: "Draft"
  });

  useEffect(() => { fetchMagazines(); }, []);

  const fetchMagazines = async () => {
    try {
      const res = await fetch("/api/magazines");
      const data = await res.json();
      setMagazines(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load magazines"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newMag.title) return toast.error("Title is required");
    try {
      const token = btoa("staff-123-gamo123");
      const body = new FormData();
      body.append("token", token);
      body.append("title", newMag.title);
      body.append("description", newMag.description);
      body.append("fileUrl", newMag.fileUrl);
      body.append("coverImageUrl", newMag.coverImageUrl);
      
      const res = await fetch("/api/magazines", { method: "POST", body });
      if (res.ok) {
        toast.success("Magazine created");
        setIsCreating(false);
        setNewMag({ title: "", description: "", fileUrl: "", coverImageUrl: "" });
        fetchMagazines();
      }
    } catch { toast.error("Failed to create magazine"); }
  };

  const handleEdit = (mag: any) => {
    setEditingId(mag.id);
    setEditForm({
      title: mag.title,
      description: mag.description || "",
      fileUrl: mag.fileUrl || "",
      coverImageUrl: mag.coverImageUrl || "",
      status: mag.status || "Draft"
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title) return toast.error("Title is required");
    try {
      const token = btoa("staff-123-gamo123");
      const body = new FormData();
      body.append("token", token);
      body.append("id", editingId!);
      body.append("title", editForm.title);
      body.append("description", editForm.description);
      body.append("fileUrl", editForm.fileUrl);
      body.append("coverImageUrl", editForm.coverImageUrl);
      body.append("status", editForm.status);

      const res = await fetch("/api/magazines", { method: "PUT", body });
      if (res.ok) {
        toast.success("Magazine updated");
        setEditingId(null);
        fetchMagazines();
      }
    } catch { toast.error("Failed to update magazine"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this magazine?")) return;
    try {
      const token = btoa("staff-123-gamo123");
      const res = await fetch(`/api/magazines?id=${id}&token=${token}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Magazine deleted");
        fetchMagazines();
      }
    } catch { toast.error("Failed to delete magazine"); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-red-500" size={28} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Magazine Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create, edit and publish magazines</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          <Plus size={14} />
          New Magazine
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">New Magazine</h2>
                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <input
                placeholder="Title"
                value={newMag.title}
                onChange={e => setNewMag({ ...newMag, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50"
              />
              <textarea
                rows={2}
                placeholder="Description..."
                value={newMag.description}
                onChange={e => setNewMag({ ...newMag, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50 resize-none"
              />
              <div className="flex gap-4">
                <input
                  placeholder="Cover Image URL"
                  value={newMag.coverImageUrl}
                  onChange={e => setNewMag({ ...newMag, coverImageUrl: e.target.value })}
                  className="w-1/2 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50"
                />
                <input
                  placeholder="PDF / Content Link"
                  value={newMag.fileUrl}
                  onChange={e => setNewMag({ ...newMag, fileUrl: e.target.value })}
                  className="w-1/2 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button onClick={handleCreate} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors">
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Magazine List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {magazines.map((mag: any) => (
          <motion.div
            key={mag.id}
            layout
            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all shadow-sm group flex flex-col"
          >
            {editingId === mag.id ? (
              <div className="p-5 space-y-3 flex-1 flex flex-col">
                <input
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50"
                  placeholder="Title"
                />
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 resize-none"
                  placeholder="Description..."
                />
                <input
                  value={editForm.coverImageUrl}
                  onChange={e => setEditForm({ ...editForm, coverImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50"
                  placeholder="Cover Image URL"
                />
                <input
                  value={editForm.fileUrl}
                  onChange={e => setEditForm({ ...editForm, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50"
                  placeholder="PDF / Content Link"
                />
                <div className="mt-auto pt-4 flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                  <button onClick={handleSaveEdit} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"><Save size={14}/> Save</button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative h-48 bg-gray-100 flex items-center justify-center border-b border-gray-100">
                  {mag.coverImageUrl ? (
                    <img src={mag.coverImageUrl} alt={mag.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ImageIcon size={32} />
                      <span className="text-xs font-medium uppercase tracking-wider">No Cover</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${mag.status === 'Published' ? 'bg-emerald-500/90 text-white' : 'bg-white/90 text-gray-700'}`}>
                      {mag.status || 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={14} className="text-red-500" />
                        <span className="text-[11px] text-gray-400">
                          {new Date(mag.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg leading-snug">{mag.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {mag.description || "No description provided."}
                  </p>
                  
                  <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-50">
                    <a href={mag.fileUrl || '#'} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                      View Content →
                    </a>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                      <button onClick={() => handleEdit(mag)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(mag.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
      
      {magazines.length === 0 && !loading && !isCreating && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <BookOpen size={48} className="mb-4 opacity-20" />
          <p className="text-sm font-medium">No magazines found</p>
          <p className="text-xs mt-1">Create your first magazine to get started</p>
        </div>
      )}
    </div>
  );
}
