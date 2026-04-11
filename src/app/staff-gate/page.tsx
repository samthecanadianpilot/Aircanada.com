"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

export default function StaffGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setLoading(true);
    
    // Simulate encrypted handshake delay
    setTimeout(() => {
      if (password === "gamo123") {
        Cookies.set("staff_session", "gamo123", { expires: 7 });
        router.push("/staff");
      } else {
        setError(true);
        setLoading(false);
        setTimeout(() => setError(false), 1200);
        setPassword("");
      }
    }, 600);
  };

  const hasInput = password.length > 0;

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white overflow-hidden relative select-none">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Scanning line animation */}
      {mounted && (
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent"
          animate={{ top: ['-2%', '102%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 w-full max-w-xs text-center px-6"
      >
        {/* Logo mark */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-16"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-red-600 to-transparent mx-auto mb-6" />
          <h1 className="text-[10px] font-medium tracking-[0.6em] uppercase text-white/30">
            Air Canada PTFS
          </h1>
          <p className="text-[8px] tracking-[0.3em] text-white/15 uppercase mt-2">
            Encrypted Gateway · v3.1
          </p>
        </motion.div>

        {/* Terminal-style input */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            animate={error ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div className="flex items-center">
              <span className="text-red-600/60 text-xs font-mono mr-3 select-none">›</span>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="enter_access_key"
                className={`w-full bg-transparent outline-none text-sm font-mono tracking-widest transition-colors duration-500 placeholder:text-white/10 ${
                  error ? "text-red-500" : "text-white/80"
                }`}
              />
            </div>
            <div className={`mt-3 h-px transition-all duration-700 ${
              error ? "bg-red-600" : hasInput ? "bg-white/20" : "bg-white/5"
            }`} />
          </motion.div>

          {/* Confirm button — only lights up with input */}
          <motion.button
            type="submit"
            disabled={!hasInput || loading}
            className={`w-full py-3.5 text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-500 border ${
              hasInput
                ? "bg-red-600 border-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.15)] hover:shadow-[0_0_40px_rgba(220,38,38,0.25)] hover:bg-red-500"
                : "bg-transparent border-white/5 text-white/15 cursor-not-allowed"
            }`}
            whileTap={hasInput ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                Authenticating
              </motion.span>
            ) : (
              "Confirm Identity"
            )}
          </motion.button>
        </form>

        {/* Error feedback */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-[9px] font-mono text-red-600/80 uppercase tracking-[0.3em]"
            >
              Access Denied · Key Mismatch
            </motion.p>
          )}
        </AnimatePresence>

        {/* Bottom marker */}
        <div className="mt-20 space-y-2">
          <div className="w-px h-8 bg-gradient-to-b from-white/5 to-transparent mx-auto" />
          <p className="text-[7px] text-white/8 uppercase tracking-[0.8em] font-mono">
            Ghost Protocol Active
          </p>
        </div>
      </motion.div>
    </div>
  );
}
