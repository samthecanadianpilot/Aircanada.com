"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WebsiteAssistant from '@/components/WebsiteAssistant';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = pathname?.startsWith('/staff') || pathname?.startsWith('/staff-gate');

  if (isStaffRoute) {
    return <main className="w-full h-full min-h-screen bg-[#0a0a0a]">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WebsiteAssistant />
    </>
  );
}
