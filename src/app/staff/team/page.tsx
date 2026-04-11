"use client";

import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UserPlus, GripVertical, Edit2, Trash2, Camera, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  pfp: string | null;
  order: number;
}

function SortableMember({ member, onEdit, onDelete }: { member: TeamMember, onEdit: () => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center p-4 bg-white/5 border border-white/5 rounded-lg transition-all",
        isDragging ? "opacity-50 scale-102 border-red-500/50 bg-red-500/5" : "hover:border-white/10"
      )}
    >
      <button 
        {...attributes} 
        {...listeners} 
        className="mr-4 p-2 text-white/10 hover:text-white/40 cursor-grab active:cursor-grabbing outline-none"
      >
        <GripVertical size={18} />
      </button>

      <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
        {member.pfp ? (
           <img src={member.pfp} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/20 text-xs font-black uppercase tracking-tighter">AC</div>
        )}
      </div>

      <div className="ml-4 flex-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-white/90">{member.name}</h4>
        <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">{member.role}</p>
      </div>

      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-white/40 hover:text-white transition-colors">
          <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="p-2 text-white/40 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
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
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    pfp: "" as string | null
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      toast.error("Failed to load roster");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = members.findIndex((i) => i.id === active.id);
      const newIndex = members.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(members, oldIndex, newIndex);
      
      setMembers(newOrder);

      try {
        await fetch("/api/team", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ members: newOrder }),
        });
        toast.success("Structure updated");
      } catch (err) {
        toast.error("Failed to save order");
        fetchMembers(); // Revert
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, pfp: data.url }));
        toast.success("Image processed");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.role) {
      toast.error("Missing required fields");
      return;
    }

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success("Member enlisted");
        fetchMembers();
        setIsModalOpen(false);
        setFormData({ name: "", role: "", pfp: null });
      }
    } catch (err) {
      toast.error("Failed to save member");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm decommissioning?")) return;

    try {
      await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      setMembers(members.filter(m => m.id !== id));
      toast.success("Personnel removed");
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Team Roster</h1>
          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold mt-1">Personnel Management & Ordering</p>
        </div>
        <button 
          onClick={() => {
            setEditingMember(null);
            setFormData({ name: "", role: "", pfp: null });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center shadow-[0_0_15px_rgba(220,38,38,0.2)]"
        >
          <UserPlus size={14} className="mr-2" />
          Enlist Member
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-red-600" size={32} />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={members.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-3">
                {members.map((member) => (
                  <SortableMember 
                    key={member.id} 
                    member={member} 
                    onEdit={() => {
                      setEditingMember(member);
                      setFormData({ name: member.name, role: member.role, pfp: member.pfp });
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDelete(member.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Basic Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 p-8 rounded-xl shadow-2xl"
            >
              <h2 className="text-sm font-black uppercase tracking-widest text-red-500 mb-8 italic">
                {editingMember ? "Personnel Modification" : "Enlistment Protocol"}
              </h2>
              
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <label className="relative w-24 h-24 rounded-full bg-black border-2 border-dashed border-white/10 flex items-center justify-center group cursor-pointer hover:border-red-500/50 transition-colors overflow-hidden">
                    {formData.pfp ? (
                      <img src={formData.pfp} className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className={cn("text-white/20 group-hover:text-red-500/50", isUploading && "animate-pulse")} />
                    )}
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-white" size={16} />
                      </div>
                    )}
                  </label>
                  <p className="text-[8px] uppercase tracking-widest text-white/20">Alpha-Channel PFP Auto-Crop</p>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">Callsign / Name</label>
                      <input 
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded p-3 text-[11px] font-bold uppercase tracking-widest text-white outline-none focus:border-red-600 transition-colors" 
                        placeholder="e.g. ALPHA-1" 
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">Assigned Role</label>
                      <input 
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded p-3 text-[11px] font-bold uppercase tracking-widest text-white outline-none focus:border-red-600 transition-colors" 
                        placeholder="e.g. FLIGHT OPS" 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-transparent hover:border-white/5 rounded">Abort</button>
                  <button 
                    onClick={handleSubmit} 
                    className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-[0_0_15px_rgba(220,38,38,0.2)] flex items-center justify-center"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
