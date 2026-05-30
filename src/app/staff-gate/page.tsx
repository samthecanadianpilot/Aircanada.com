"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

export default function StaffGate() {
  const [discordId, setDiscordId] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [step, setStep] = useState<"id" | "code">("id");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerError = (msg: string) => {
    setError(msg);
    setLoading(false);
    setTimeout(() => setError(null), 3000);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordId.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/discord', {
        method: 'POST',
        body: JSON.stringify({ action: 'send_code', discordId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        triggerError(data.error || "Verification failed");
        return;
      }

      setUsername(data.username);
      setStep("code");
      setLoading(false);
    } catch {
      triggerError("Network transmission error");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/discord', {
        method: 'POST',
        body: JSON.stringify({ action: 'verify_code', discordId, code: authCode })
      });
      const data = await res.json();
      
      if (!res.ok) {
        triggerError(data.error || "Invalid code");
        setAuthCode("");
        return;
      }

      // Success! Cookie is set by the API route.
      router.push("/staff");
    } catch {
      triggerError("Network transmission error");
    }
  };

  const hasInput = step === "id" ? discordId.length > 0 : authCode.length > 0;

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
            Encrypted Gateway · v4.0
          </p>
        </motion.div>

        {/* Terminal-style input */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {step === "id" ? (
              <motion.form 
                key="id-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendCode} 
                className="space-y-8"
              >
                <div className="relative">
                  <div className="flex flex-col mb-4">
                    <span className="text-[9px] uppercase tracking-widest text-white/40 mb-2 font-mono">Authenticate Identity</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-red-600/60 text-xs font-mono mr-3 select-none">›</span>
                    <input
                      type="text"
                      autoFocus
                      value={discordId}
                      onChange={(e) => setDiscordId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="ENTER_DISCORD_ID"
                      className={`w-full bg-transparent outline-none text-sm font-mono tracking-widest transition-colors duration-500 placeholder:text-white/10 ${
                        error ? "text-red-500" : "text-white/80"
                      }`}
                    />
                  </div>
                  <div className={`mt-3 h-px transition-all duration-700 ${
                    error ? "bg-red-600" : hasInput ? "bg-white/20" : "bg-white/5"
                  }`} />
                </div>

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
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                      Transmitting
                    </motion.span>
                  ) : "Request Access"}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form 
                key="code-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyCode} 
                className="space-y-8"
              >
                <div className="relative">
                  <div className="flex flex-col mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#5865F2] font-bold mb-1">DM Sent to {username}</span>
                    <span className="text-[8px] uppercase tracking-wider text-white/30 font-mono">Verify 6-Digit Payload</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#5865F2]/60 text-xs font-mono mr-3 select-none">›</span>
                    <input
                      type="text"
                      autoFocus
                      maxLength={6}
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="XXXXXX"
                      className={`w-full bg-transparent outline-none text-xl tracking-[0.5em] text-center transition-colors duration-500 placeholder:text-white/10 font-mono ${
                        error ? "text-red-500" : "text-white/80"
                      }`}
                    />
                  </div>
                  <div className={`mt-3 h-px transition-all duration-700 ${
                    error ? "bg-red-600" : hasInput ? "bg-[#5865F2]/50" : "bg-white/5"
                  }`} />
                </div>

                <motion.button
                  type="submit"
                  disabled={!hasInput || loading || authCode.length < 6}
                  className={`w-full py-3.5 text-[10px] font-bold tracking-[0.4em] uppercase transition-all duration-500 border ${
                    authCode.length === 6
                      ? "bg-[#5865F2] border-[#5865F2] text-white shadow-[0_0_30px_rgba(88,101,242,0.15)] hover:shadow-[0_0_40px_rgba(88,101,242,0.25)] hover:bg-[#4752c4]"
                      : "bg-transparent border-white/5 text-white/15 cursor-not-allowed"
                  }`}
                  whileTap={authCode.length === 6 ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                      Verifying
                    </motion.span>
                  ) : "Confirm Code"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Error feedback */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-[8px] font-mono text-red-600/80 uppercase tracking-[0.2em] leading-relaxed"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Bottom marker */}
        <div className="mt-20 space-y-2">
          <div className="w-px h-8 bg-gradient-to-b from-white/5 to-transparent mx-auto" />
          <p className="text-[7px] text-white/8 uppercase tracking-[0.8em] font-mono">
            Secure Node Auth
          </p>
        </div>
      </motion.div>
    </div>
  );
}
