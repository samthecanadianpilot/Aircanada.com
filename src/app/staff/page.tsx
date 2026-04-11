"use client";

import { motion } from "framer-motion";
import { Shield, Plane, Users, FileText, BarChart3, Radio } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Active Dispatch", value: "12", icon: Radio },
  { label: "Staff On-Duty", value: "48", icon: Users },
  { label: "Pending Enlist", value: "3", icon: FileText },
  { label: "Fleet Readiness", value: "98%", icon: Plane },
];

export default function StaffPortal() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col items-start gap-4">
        <div className="px-3 py-1 bg-red-600/10 border border-red-500/20 text-red-500 rounded text-[9px] font-black uppercase tracking-[0.4em] italic shadow-[0_0_15px_rgba(220,38,38,0.1)]">
          System Operational
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
          Command <br /> <span className="text-red-600">Overview</span>
        </h1>
        <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase max-w-sm mt-4 font-bold leading-relaxed">
           Welcome to the Air Canada PTFS Decentralized Management Grid. 
           Strategic operations, fleet logic, and personnel management are authorized via this portal only.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-red-500/20 transition-all group overflow-hidden relative"
          >
            <stat.icon className="text-white/10 group-hover:text-red-500 transition-colors mb-4" size={24} />
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">{stat.value}</h3>
            <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mt-1 leading-none">{stat.label}</p>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl space-y-6">
           <h4 className="text-[11px] font-black uppercase tracking-widest text-white/40 italic">Recent Transmissions</h4>
           <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-1 h-8 bg-red-600/20 rounded-full mt-1" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider">Fleet Alert: Update {i}x-AC</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <Link href="/staff/news" className="p-6 bg-red-600 hover:bg-red-700 rounded-2xl transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] flex flex-col justify-end">
              <h4 className="text-sm font-black uppercase italic tracking-tighter">Publish Hub</h4>
              <p className="text-[9px] uppercase tracking-widest text-white/80 mt-1">Launch Dispatch</p>
           </Link>
           <Link href="/staff/team" className="p-6 bg-white hover:bg-neutral-200 rounded-2xl transition-all flex flex-col justify-end text-black">
              <h4 className="text-sm font-black uppercase italic tracking-tighter">Team Grid</h4>
              <p className="text-[9px] uppercase tracking-widest text-black/60 mt-1">Personnel Sync</p>
           </Link>
        </div>
      </div>
    </div>
  );
}
