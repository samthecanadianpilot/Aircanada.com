"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        Cookies.set("staff_session", "authenticated", { expires: 1 });
        router.push("/staff");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Login failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] p-8 rounded-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-600/30 blur-[60px] rounded-full pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
            <Plane size={24} className="text-white -rotate-45" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Staff Command</h1>
          <p className="text-sm text-white/40 mt-2">Enter your credentials to access the portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider pl-1">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                required
                type="text"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.06] transition-all text-sm"
                placeholder="pilot123"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/60 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                required
                type="password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.06] transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3.5 rounded-xl transition-all flex justify-center items-center mt-2 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Authenticate"}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Don't have an account? <Link href="/staff/signup" className="text-white hover:text-red-400 transition-colors">Apply here</Link>
        </p>
      </div>
    </div>
  );
}
