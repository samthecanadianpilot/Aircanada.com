"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function PublicForm() {
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/forms")
      .then(res => res.json())
      .then(data => {
        const found = data.find((f: any) => f.id === id);
        setForm(found);
        if (found && !found.isProtected) setIsAuthorized(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a server-side check. 
    // For this prototype, we'll use a hardcoded pass if needed, or assume 'gamo123'
    if (password === "aircanada") {
       setIsAuthorized(true);
    } else {
       toast.error("Access Denied");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        body: JSON.stringify({
          action: "submit",
          formId: id,
          data: responses
        })
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      toast.error("Transmission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#050505]">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  if (!form || !form.isLive) return (
    <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
      <div className="text-center">
        <h1 className="text-2xl font-black uppercase tracking-widest text-red-600 mb-2">Module Offline</h1>
        <p className="text-[10px] uppercase tracking-widest text-white/40">This data uplink has been decommissioned.</p>
      </div>
    </div>
  );

  if (!isAuthorized) return (
    <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm p-8 text-center">
          <ShieldCheck className="mx-auto text-red-600 mb-6" size={48} />
          <h2 className="text-sm font-black uppercase tracking-widest mb-8">Secure Transmission Entry</h2>
          <form onSubmit={handlePassword} className="space-y-4">
             <input 
              type="password" 
              placeholder="ENTRY_KEY"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 text-center text-sm font-bold uppercase tracking-[0.5em] outline-none focus:border-red-600 transition-colors"
             />
             <button className="w-full py-4 bg-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors">Authenticate</button>
             <p className="text-[8px] uppercase tracking-[0.2em] text-white/20">Authorized Personnel Only</p>
          </form>
       </motion.div>
    </div>
  );

  if (submitted) return (
    <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-6" size={64} />
          <h2 className="text-xl font-black uppercase tracking-widest mb-2">Transmission Received</h2>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Your data has been securely uplinked to Command.</p>
          <button onClick={() => window.location.href = "/"} className="mt-8 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-colors">Return to Base</button>
       </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white py-20 px-6">
       <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">{form.name}</h1>
            <div className="h-1 w-20 bg-red-600 mx-auto" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Official Air Canada PTFS Data Intake</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {form.fields.map((field: any) => (
              <div key={field.id} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">{field.label}</label>
                {field.type === "Long Text" ? (
                  <textarea 
                    required
                    onChange={e => setResponses({ ...responses, [field.label]: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 p-4 text-sm font-medium outline-none focus:border-red-600/50 transition-colors min-h-[150px]"
                  />
                ) : (
                  <input 
                    required
                    type={field.type === "File Upload" ? "file" : "text"}
                    onChange={e => setResponses({ ...responses, [field.label]: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 p-4 text-sm font-medium outline-none focus:border-red-600/50 transition-colors"
                  />
                )}
              </div>
            ))}

            <button 
              disabled={submitting}
              className="w-full py-5 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-700 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] flex items-center justify-center"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
              Transmit Protocol
            </button>
          </form>

          <p className="text-center text-[8px] uppercase tracking-[0.5em] text-white/10 pt-12 border-t border-white/5">
            Secured via Air Canada PTFS Command Center Intelligence
          </p>
       </div>
    </div>
  );
}
