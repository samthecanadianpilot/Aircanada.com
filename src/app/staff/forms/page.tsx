"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Settings, 
  Inbox, 
  Layout, 
  Eye, 
  ChevronRight,
  Shield,
  Clock,
  Unlock,
  Lock,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

export default function FormBuilder() {
  const [activeTab, setActiveTab] = useState<"builder" | "inbox">("builder");
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeForm = forms.find(f => f.id === selectedFormId) || forms[0];

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/forms");
      const data = await res.json();
      setForms(data);
      if (data.length > 0 && !selectedFormId) {
        setSelectedFormId(data[0].id);
      }
    } catch (err) {
      toast.error("Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  const createForm = async () => {
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        body: JSON.stringify({
          action: "create",
          definition: { name: "New Application Form", fields: [] }
        })
      });
      if (res.ok) {
        toast.success("New module initialized");
        fetchForms();
      }
    } catch (err) {
      toast.error("Generation failed");
    }
  };

  const saveActiveForm = async () => {
    if (!activeForm) return;
    setIsSaving(true);
    try {
      await fetch("/api/forms", {
        method: "POST",
        body: JSON.stringify({
          action: "save",
          formId: activeForm.id,
          definition: activeForm
        })
      });
      toast.success("Changes deployed");
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setIsSaving(false);
    }
  };

  const addField = (type: FieldType) => {
    if (!activeForm) return;
    const updatedForms = forms.map(f => {
      if (f.id === selectedFormId) {
        return {
          ...f,
          fields: [...f.fields, { id: "f" + Date.now(), type, label: `New ${type} Field` }]
        };
      }
      return f;
    });
    setForms(updatedForms);
  };

  const removeField = (fieldId: string) => {
    setForms(forms.map(f => {
      if (f.id === selectedFormId) {
        return {
          ...f,
          fields: f.fields.filter(fld => fld.id !== fieldId)
        };
      }
      return f;
    }));
  };

  const updateFieldLabel = (fieldId: string, label: string) => {
    setForms(forms.map(f => {
      if (f.id === selectedFormId) {
        return {
          ...f,
          fields: f.fields.map(fld => fld.id === fieldId ? { ...fld, label } : fld)
        };
      }
      return f;
    }));
  };

  const toggleFormSetting = (key: 'isLive' | 'isProtected') => {
    setForms(forms.map(f => {
      if (f.id === selectedFormId) {
        return { ...f, [key]: !f[key] };
      }
      return f;
    }));
  };

  const deleteForm = async (id: string) => {
    if (!confirm("Permanently destroy this form and all data?")) return;
    try {
      await fetch(`/api/forms?id=${id}`, { method: "DELETE" });
      toast.success("Module decommissioned");
      fetchForms();
    } catch (err) {
      toast.error("Decommissioning failed");
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Form Intelligence</h1>
          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold mt-1">Native Form-as-a-Service Hub</p>
          
          <div className="mt-4 flex items-center space-x-2">
            <select 
              value={selectedFormId || ""} 
              onChange={e => setSelectedFormId(e.target.value)}
              className="bg-[#0f0f0f] border border-white/5 p-2 rounded text-[10px] font-bold uppercase tracking-widest text-white/80 outline-none focus:border-red-600"
            >
              {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <button onClick={createForm} className="p-2 text-white/20 hover:text-red-500 transition-colors">
              <Plus size={16} />
            </button>
            {activeForm && (
              <button 
                onClick={() => deleteForm(activeForm.id)}
                className="p-2 text-white/10 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex bg-[#0a0a0a] border border-white/5 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("builder")}
            className={cn(
              "flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md",
              activeTab === "builder" ? "bg-red-600/10 text-red-500 shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]" : "text-white/20 hover:text-white"
            )}
          >
            <Layout size={14} className="mr-2" />
            Module Builder
          </button>
          <button 
            onClick={() => setActiveTab("inbox")}
            className={cn(
              "flex items-center px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md",
              activeTab === "inbox" ? "bg-red-600/10 text-red-500 shadow-[inset_0_0_10px_rgba(220,38,38,0.1)]" : "text-white/20 hover:text-white"
            )}
          >
            <Inbox size={14} className="mr-2" />
            Central Inbox
          </button>
        </div>
      </div>

      {!activeForm ? (
        <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
          <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">No Active Data Modules</p>
          <button onClick={createForm} className="mt-4 px-6 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded">Initiate First Module</button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar / Settings */}
          <div className="col-span-3 space-y-6">
            <div className="p-5 bg-white/5 border border-white/5 rounded-xl space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Status Protocol</h3>
               <div className="space-y-3">
                  <button 
                    onClick={() => toggleFormSetting('isLive')}
                    className={cn(
                      "w-full flex justify-between items-center p-3 rounded border transition-all",
                      activeForm.isLive ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-red-500/5 border-red-500/20 text-red-500"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-tighter">Live Status</span>
                    {activeForm.isLive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  </button>

                  <button 
                    onClick={() => toggleFormSetting('isProtected')}
                    className={cn(
                      "w-full flex justify-between items-center p-3 rounded border transition-all",
                      activeForm.isProtected ? "bg-amber-500/5 border-amber-500/20 text-amber-500" : "bg-white/5 border-white/10 text-white/20"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-tighter">Privacy Lock</span>
                    {activeForm.isProtected ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
               </div>
            </div>

            <div className="space-y-2">
               <button 
                onClick={saveActiveForm}
                disabled={isSaving}
                className="w-full flex items-center justify-center p-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-700 transition-colors shadow-[0_10px_20px_rgba(220,38,38,0.1)]"
               >
                 {isSaving ? <Loader2 size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                 Synchronize Database
               </button>
               <button className="w-full flex items-center justify-center p-3 bg-white/5 border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest rounded hover:bg-white/10 transition-colors leading-none h-12">
                 <Download size={14} className="mr-2" />
                 CSV Extraction
               </button>
            </div>
          </div>

          {/* Builder Area */}
          <div className="col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === "builder" ? (
                <motion.div 
                  key="builder"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex gap-4 mb-8">
                    {["Short Text", "Long Text", "Multiple Choice", "File Upload"].map((type) => (
                      <button 
                        key={type}
                        onClick={() => addField(type as FieldType)}
                        className="flex-1 p-3 bg-white/5 border border-white/5 rounded hover:border-red-500/40 hover:bg-red-500/5 text-[9px] font-black uppercase tracking-tighter transition-all"
                      >
                        + {type}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {activeForm.fields.map((field, idx) => (
                      <div key={field.id} className="group flex items-center p-4 bg-[#0a0a0a] border border-white/5 rounded-lg hover:border-white/10">
                        <span className="text-[10px] font-mono text-white/20 mr-4">{(idx + 1).toString().padStart(2, '0')}</span>
                        <div className="flex-1 text-left">
                          <input 
                            value={field.label}
                            onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                            className="bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest w-full text-white/90 selection:bg-red-600"
                          />
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">{field.type}</p>
                        </div>
                        <button 
                          onClick={() => removeField(field.id)}
                          className="p-2 text-white/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {activeForm.fields.length === 0 && (
                      <div className="p-12 text-center text-white/10 border border-dashed border-white/5 rounded-xl">
                        <p className="text-[10px] uppercase tracking-widest font-black">Structure Empty</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="inbox"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="overflow-hidden border border-white/5 rounded-xl">
                    <table className="w-full text-[10px] text-left">
                      <thead className="bg-white/5 text-white/40 uppercase tracking-widest">
                        <tr>
                          <th className="p-4 font-black">Timestamp</th>
                          <th className="p-4 font-black">IP Source</th>
                          <th className="p-4 font-black">Data Payload</th>
                          <th className="p-4 font-black text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeForm.responses.map(res => (
                          <tr key={res.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono text-white/60">{new Date(res.timestamp).toLocaleTimeString()}</td>
                            <td className="p-4 font-mono text-blue-500">{res.ip}</td>
                            <td className="p-4 truncate max-w-[200px]">{JSON.stringify(res.data)}</td>
                            <td className="p-4 text-right">
                               <button className="p-2 text-red-500 hover:text-white transition-colors">
                                 <Eye size={14} />
                               </button>
                            </td>
                          </tr>
                        ))}
                        {activeForm.responses.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-white/10 uppercase tracking-widest font-black">No submissions detected</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
