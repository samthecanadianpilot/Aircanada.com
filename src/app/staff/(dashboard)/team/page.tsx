"use client";

import { useState, useEffect } from "react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UserPlus, GripVertical, Edit2, Trash2, Camera, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  pfp: string | null;
  order: number;
}

function MemberCard({ member, onEdit, onDelete, isDragOverlay }: {
  member: TeamMember; onEdit: () => void; onDelete: () => void; isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${
        isDragging ? "border-red-200 bg-red-50/30 shadow-none" : isDragOverlay ? "border-red-300 shadow-xl shadow-red-500/10 ring-2 ring-red-500/20" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      {/* Drag Handle — the 6-dot icon */}
      <button
        {...attributes}
        {...listeners}
        className="flex flex-col gap-[2px] p-1.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0 outline-none touch-none"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
        {member.pfp ? (
          <img src={member.pfp} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-gray-400 uppercase">
            {member.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{member.name}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Edit2 size={13} />
        </button>
        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function MeetTheTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "", pfp: "" as string | null });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try { const res = await fetch("/api/team"); setMembers(await res.json()); }
    catch { toast.error("Failed to load roster"); }
    finally { setLoading(false); }
  };

  const handleDragStart = (event: any) => setActiveDragId(event.active.id);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = members.findIndex(i => i.id === active.id);
    const newIdx = members.findIndex(i => i.id === over.id);
    const newOrder = arrayMove(members, oldIdx, newIdx);
    setMembers(newOrder);
    try {
      await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ members: newOrder }) });
      toast.success("Order saved");
    } catch { toast.error("Failed to save"); fetchMembers(); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (data.url) { setFormData(p => ({ ...p, pfp: data.url })); toast.success("Image uploaded"); }
    } catch { toast.error("Upload failed"); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) return toast.error("Name and role required");
    try {
      const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { toast.success("Member added"); fetchMembers(); setIsModalOpen(false); setFormData({ name: "", role: "", pfp: null }); }
    } catch { toast.error("Failed to save"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this member?")) return;
    try { await fetch(`/api/team?id=${id}`, { method: "DELETE" }); setMembers(m => m.filter(x => x.id !== id)); toast.success("Removed"); }
    catch { toast.error("Failed"); }
  };

  const draggedMember = activeDragId ? members.find(m => m.id === activeDragId) : null;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={28} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">Drag cards to reorder the public hierarchy</p>
        </div>
        <button onClick={() => { setEditingMember(null); setFormData({ name: "", role: "", pfp: null }); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
          <UserPlus size={14} /> Add Member
        </button>
      </div>

      {/* Card Grid with DnD */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={members.map(m => m.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {members.map(member => (
              <MemberCard key={member.id} member={member}
                onEdit={() => { setEditingMember(member); setFormData({ name: member.name, role: member.role, pfp: member.pfp }); setIsModalOpen(true); }}
                onDelete={() => handleDelete(member.id)}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay — the lifted card following the cursor */}
        <DragOverlay>
          {draggedMember ? (
            <div className="bg-white rounded-xl border border-red-300 shadow-xl shadow-red-500/10 ring-2 ring-red-500/20 p-4 flex items-center gap-4">
              <GripVertical size={16} className="text-red-400" />
              <div className="w-11 h-11 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                {draggedMember.pfp ? <img src={draggedMember.pfp} className="w-full h-full object-cover rounded-full" /> : <span className="text-xs font-bold text-gray-400">{draggedMember.name.charAt(0)}</span>}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{draggedMember.name}</h4>
                <p className="text-xs text-gray-400">{draggedMember.role}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {members.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-sm text-gray-400">No team members yet. Add your first member above.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{editingMember ? "Edit Member" : "Add Member"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
              </div>
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <label className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-red-400 transition-colors overflow-hidden group">
                    {formData.pfp ? <img src={formData.pfp} className="w-full h-full object-cover" /> : <Camera size={20} className="text-gray-300 group-hover:text-red-400" />}
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    {isUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="animate-spin text-red-500" size={16} /></div>}
                  </label>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Upload Photo</p>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Name</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50" placeholder="e.g. GAMO" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Role</label>
                  <input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50" placeholder="e.g. CEO & Founder" />
                </div>
                <div className="flex gap-3 pt-3">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={handleSubmit} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">Confirm</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
