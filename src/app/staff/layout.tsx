"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Newspaper, 
  Settings, 
  LogOut,
  ChevronRight,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "News & Dispatch", href: "/staff/news", icon: Newspaper },
  { name: "Meet the Team", href: "/staff/team", icon: Users },
  { name: "Form Builder", href: "/staff/forms", icon: FileText },
  { name: "Staff Polling", href: "/staff/polls", icon: BarChart3 },
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
    router.push("/staff-gate");
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#ededed]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0a] flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-red-600/10 border border-red-600/20">
            <Shield size={20} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase text-white/90">Command Center</h2>
            <p className="text-[8px] tracking-widest text-white/30 uppercase mt-0.5">Air Canada PTFS</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-all rounded-md relative",
                pathname === item.href 
                  ? "bg-red-600/10 text-red-500" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={16} className={cn("mr-3", pathname === item.href ? "text-red-500" : "text-white/20 group-hover:text-white/60")} />
              {item.name}
              {pathname === item.href && (
                <div className="absolute left-0 w-1 h-4 bg-red-600 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 text-[11px] font-bold tracking-widest uppercase text-white/20 hover:text-red-500 hover:bg-red-600/5 transition-all rounded-md"
          >
            <LogOut size={16} className="mr-3" />
            Decommission
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#050505]">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
