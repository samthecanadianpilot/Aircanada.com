"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Layout, Inbox, Lock, Unlock, Download, Loader2, Save, 
  Settings, GripVertical, CheckCircle2, Type, AlignLeft, List, UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type FieldType = "Short Text" | "Long Text" | "Multiple Choice" | "File Upload";

interface FormField {
  id: string;
  type: FieldType;
  label: string;
}

interface Form {
  id: string;
  name: string;
  isLive: boolean;
  isProtected: boolean;
  fields: FormField[];
  responses: any[];
}

const fieldIcons: Record<FieldType, any> = {
  "Short Text": Type,
  "Long Text": AlignLeft,
  "Multiple Choice": List,
  "File Upload": UploadCloud,
};

function SortableField({ field, onRemove, onChangeLabel, isDragOverlay }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const Icon = fieldIcons[field.type as FieldType] || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-xl border p-4 flex items-center gap-3 ${
        isDragging ? "border-red-200 bg-red-50/30 shadow-none z-10" : isDragOverlay ? "border-red-300 shadow-xl ring-2 ring-red-500/20" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-1 -ml-1">
        <GripVertical size={16} />
      </button>
      
      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-gray-500" />
      </div>
      
      <div className="flex-1">
        <input 
          value={field.label}
          onChange={(e) => onChangeLabel(e.target.value)}
          className="w-full text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0 placeholder-gray-300"
          placeholder="Enter field label..."
        />
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">{field.type}</p>
      </div>

      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function FormBuilder() {
  const [activeTab, setActiveTab] = useState<"builder" | "inbox">("builder");
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const activeForm = forms.find(f => f.id === selectedFormId) || forms[0];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/forms");
      const data = await res.json();
      setForms(data);
      if (data.length > 0 && !selectedFormId) setSelectedFormId(data[0].id);
    } catch { toast.error("Failed to load forms"); } 
    finally { setLoading(false); }
  };

  const createForm = async () => {
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        body: JSON.stringify({ action: "create", definition: { name: "New Form", fields: [] } })
      });
      if (res.ok) { toast.success("Form created"); fetchForms(); }
    } catch { toast.error("Failed to create form"); }
  };

  const saveActiveForm = async () => {
    if (!activeForm) return;
    setIsSaving(true);
    try {
      await fetch("/api/forms", {
        method: "POST",
        body: JSON.stringify({ action: "save", formId: activeForm.id, definition: activeForm })
      });
      toast.success("Changes deployed successfully!");
    } catch { toast.error("Failed to save changes"); }
    finally { setIsSaving(false); }
  };

  const addField = (type: FieldType) => {
    if (!activeForm) return;
    setForms(forms.map(f => f.id === selectedFormId 
      ? { ...f, fields: [...f.fields, { id: "f" + Date.now(), type, label: `New ${type}` }] } 
      : f));
  };

  const removeField = (fieldId: string) => {
    setForms(forms.map(f => f.id === selectedFormId 
      ? { ...f, fields: f.fields.filter(fld => fld.id !== fieldId) } 
      : f));
  };

  const updateFieldLabel = (fieldId: string, label: string) => {
    setForms(forms.map(f => f.id === selectedFormId 
      ? { ...f, fields: f.fields.map(fld => fld.id === fieldId ? { ...fld, label } : fld) } 
      : f));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id || !activeForm) return;
    const oldIdx = activeForm.fields.findIndex(f => f.id === active.id);
    const newIdx = activeForm.fields.findIndex(f => f.id === over.id);
    const newOrder = arrayMove(activeForm.fields, oldIdx, newIdx);
    setForms(forms.map(f => f.id === selectedFormId ? { ...f, fields: newOrder } : f));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={28} /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-5 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Custom Forms</h1>
          <div className="mt-3 flex items-center space-x-2">
            <select 
              value={selectedFormId || ""} 
              onChange={e => setSelectedFormId(e.target.value)}
              className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <button onClick={createForm} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
          <button onClick={() => setActiveTab("builder")} className={`flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "builder" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}>
            <Layout size={14} className="mr-2" /> Builder
          </button>
          <button onClick={() => setActiveTab("inbox")} className={`flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "inbox" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`}>
            <Inbox size={14} className="mr-2" /> Inbox
          </button>
        </div>
      </div>

      {!activeForm ? (
        <div className="p-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <p className="text-sm font-medium text-gray-400">No active forms found</p>
          <button onClick={createForm} className="mt-4 px-6 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:bg-red-700">Create Form</button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Builder Area */}
          <div className="col-span-12 md:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === "builder" ? (
                <motion.div key="builder" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[500px]">
                    <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                      <input 
                        value={activeForm.name} 
                        onChange={(e) => setForms(forms.map(f => f.id === selectedFormId ? { ...f, name: e.target.value } : f))}
                        className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0 hover:bg-gray-50 rounded px-2 -ml-2 w-full max-w-sm transition-colors"
                      />
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={e => setActiveDragId(e.active.id as string)} onDragEnd={handleDragEnd}>
                      <SortableContext items={activeForm.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {activeForm.fields.map((field) => (
                            <SortableField key={field.id} field={field} 
                              onChangeLabel={(val: string) => updateFieldLabel(field.id, val)}
                              onRemove={() => removeField(field.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                      <DragOverlay>
                        {activeDragId ? <SortableField field={activeForm.fields.find(f => f.id === activeDragId)} isDragOverlay /> : null}
                      </DragOverlay>
                    </DndContext>

                    {activeForm.fields.length === 0 && (
                      <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 mt-4">
                        <Layout className="mx-auto text-gray-300 mb-3" size={32} />
                        <p className="text-sm font-medium text-gray-500">Form is empty. Add fields from the toolbox.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="inbox" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Applicant Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeForm.responses.map(res => (
                          <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 text-gray-500 font-mono text-xs">{new Date(res.timestamp).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                                New
                              </span>
                            </td>
                            <td className="p-4 text-gray-700 truncate max-w-[250px]">{JSON.stringify(res.data)}</td>
                          </tr>
                        ))}
                        {activeForm.responses.length === 0 && (
                          <tr><td colSpan={3} className="p-12 text-center text-gray-400 font-medium">No submissions yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toolbox Sidebar */}
          <div className="col-span-12 md:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
               <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-2">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Form Privacy</h3>
                 <button 
                  onClick={() => setForms(forms.map(f => f.id === selectedFormId ? { ...f, isProtected: !f.isProtected } : f))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activeForm.isProtected ? 'bg-red-600' : 'bg-gray-200'}`}
                 >
                   <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activeForm.isProtected ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
               </div>
               {activeForm.isProtected && (
                 <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                   <Lock size={14} className="text-red-500 shrink-0 mt-0.5" />
                   <p className="text-xs text-red-800 font-medium leading-relaxed">This form requires authorization key to access. Unprotected forms are fully public.</p>
                 </div>
               )}
            </div>

            {activeTab === "builder" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 pb-4 border-b border-gray-100">Toolbox Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(fieldIcons) as [FieldType, any][]).map(([type, Icon]) => (
                    <button 
                      key={type}
                      onClick={() => addField(type)}
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors group"
                    >
                      <Icon size={20} className="text-gray-400 group-hover:text-red-500 mb-2 transition-colors" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 group-hover:text-red-600">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={saveActiveForm}
              disabled={isSaving}
              className="w-full flex items-center justify-center p-4 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 transition-colors shadow-sm mt-4"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
