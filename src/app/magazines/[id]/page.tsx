"use client";

import dynamic from "next/dynamic";
import { Loader2, BookOpen } from "lucide-react";
import { use } from "react";

const MagazineViewer = dynamic(() => import("@/components/MagazineViewer"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center">
          <BookOpen size={28} className="text-red-500" />
        </div>
        <Loader2
          className="animate-spin text-red-500 absolute -top-2 -right-2"
          size={20}
        />
      </div>
      <span className="text-lg font-semibold tracking-tight text-white/60">
        Loading Magazine...
      </span>
      <p className="text-xs text-white/25 mt-2">
        Preparing your flipbook experience
      </p>
    </div>
  ),
});

export default function ViewMagazinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <MagazineViewer magazineId={id} />;
}
