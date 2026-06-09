"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Disable SSR for the Fabric.js canvas editor since it relies heavily on the window/DOM
const EditorClient = dynamic(() => import("@/components/EditorClient"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-[#0c0c0c] text-white">
      <Loader2 className="animate-spin mr-3 text-red-500" size={32} />
      <span className="text-xl font-bold tracking-tight">Loading Canvas Engine...</span>
    </div>
  ),
});

export default function EditMagazinePage({ params }: { params: { id: string } }) {
  return <EditorClient magazineId={params.id} />;
}
