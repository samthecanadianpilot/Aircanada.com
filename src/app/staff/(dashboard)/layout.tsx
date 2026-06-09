"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Newspaper, 
  LogOut,
  Shield,
  ChevronRight,
  Plane,
  Database,
  BookOpen
} from "lucide-react";
import Cookies from "js-cookie";

const navItems = [
  { name: "News Feed", href: "/staff/news", icon: Newspaper, desc: "Dispatch & Alerts" },
  { name: "Magazine Manager", href: "/staff/magazines", icon: BookOpen, desc: "Publications" },
  { name: "Team Manager", href: "/staff/team", icon: Users, desc: "Personnel Hierarchy" },
  { name: "Custom Forms", href: "/staff/forms", icon: FileText, desc: "Application Builder" },
  { name: "Active Polls", href: "/staff/polls", icon: BarChart3, desc: "Staff Decisions" },
  { name: "User Database", href: "/staff/database", icon: Database, desc: "Discord Profiles" },
  { name: "Approvals", href: "/staff/approvals", icon: Shield, desc: "Pending Requests" },
];

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("staff_session");
    router.push("/staff/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6f8]">
      {/* ── Dark Sidebar ── */}
      <aside className="w-[260px] bg-[#0c0c0c] flex flex-col shrink-0 border-r border-white/[0.04]">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)] p-1.5 border border-red-500/30">
              <img src="/logo-roundel.png" alt="Air Canada" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <div>
              <h2 className="text-[12px] font-bold tracking-[0.15em] uppercase text-white shadow-sm">
                Air Canada
              </h2>
              <p className="text-[9px] tracking-[0.1em] text-white/40 uppercase mt-0.5">
                Command Center
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/35 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-r-full" />
                )}
                <item.icon
                  size={17}
                  className={active ? "text-red-500" : "text-white/20 group-hover:text-white/40"}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-semibold tracking-wide block">
                    {item.name}
                  </span>
                  <span className="text-[9px] tracking-wider text-white/20 uppercase block mt-px">
                    {item.desc}
                  </span>
                </div>
                {active && <ChevronRight size={12} className="text-white/20" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-white/20 hover:text-red-400 hover:bg-red-600/[0.06] transition-all rounded-lg"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Canvas (Light) ── */}
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8]">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
