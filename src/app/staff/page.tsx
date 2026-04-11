"use client";

import { motion } from "framer-motion";
import { Shield, Plane, Users, FileText, BarChart3, Radio, Newspaper, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Active Dispatch", value: "12", icon: Radio, color: "text-red-500 bg-red-50" },
  { label: "Staff On-Duty", value: "48", icon: Users, color: "text-blue-500 bg-blue-50" },
  { label: "Pending Enlist", value: "3", icon: FileText, color: "text-amber-500 bg-amber-50" },
  { label: "Fleet Readiness", value: "98%", icon: Plane, color: "text-emerald-500 bg-emerald-50" },
];

const quickLinks = [
  { label: "Create Dispatch", href: "/staff/news", icon: Newspaper, color: "bg-red-600 hover:bg-red-700 text-white" },
  { label: "Manage Roster", href: "/staff/team", icon: Users, color: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200" },
  { label: "Form Builder", href: "/staff/forms", icon: FileText, color: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200" },
  { label: "Active Polls", href: "/staff/polls", icon: BarChart3, color: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200" },
];

export default function StaffPortal() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            System Online
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Command Overview
        </h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Welcome to the Air Canada PTFS management dashboard. Monitor operations, manage the team, and publish dispatches.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-semibold transition-all ${link.color} group`}
            >
              <link.icon size={16} />
              <span className="flex-1">{link.label}</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { msg: "Fleet Alert: Boeing 787 added to roster", time: "2 hours ago", type: "alert" },
            { msg: "Poll completed: A350-1000 fleet decision", time: "5 hours ago", type: "poll" },
            { msg: "New staff application received", time: "1 day ago", type: "form" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                item.type === 'alert' ? 'bg-red-400' : item.type === 'poll' ? 'bg-blue-400' : 'bg-amber-400'
              }`} />
              <p className="text-sm text-gray-700 flex-1">{item.msg}</p>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
