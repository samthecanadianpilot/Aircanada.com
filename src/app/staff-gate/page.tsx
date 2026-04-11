"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function StaffGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "gamo123") {
      Cookies.set("staff_session", "gamo123", { expires: 7 });
      router.push("/staff");
    } else {
      setError(true);
      setTimeout(() => setError(false), 800);
      setPassword("");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0d0d0d] text-white selection:bg-red-600">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,0,0.05)_0%,_transparent_100%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-sm text-center px-8"
      >
        <div className="flex flex-col items-center mb-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-bold tracking-[0.4em] uppercase text-white/90">Air Canada PTFS</h1>
            <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Internal Command Center</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ACCESS_KEY"
            className={`w-full bg-transparent border-b outline-none py-3 text-center text-xl font-mono tracking-[0.5em] transition-all duration-500 ${
              error ? "border-red-600 text-red-600 scale-95" : "border-white/10 focus:border-red-600 placeholder-white/10"
            }`}
          />
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-8 left-0 right-0 text-[10px] font-bold text-red-600 uppercase tracking-widest"
              >
                Access Invalid
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        <p className="mt-20 text-[8px] text-white/10 uppercase tracking-[0.8em]">Secure Environment 03x-AC</p>
      </motion.div>
    </div>
  );
}
