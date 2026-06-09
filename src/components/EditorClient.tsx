"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { 
  Type, Image as ImageIcon, Save, ArrowLeft, 
  Trash2, PlusCircle, Layout, Layers
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditorClient({ magazineId }: { magazineId: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [pages, setPages] = useState<any[]>([null]); // array of canvas JSON states
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1131, // A4 aspect ratio (1:1.414)
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    setCanvas(initCanvas);

    // Fetch existing data
    fetchMagazineData(initCanvas);

    return () => {
      initCanvas.dispose();
    };
  }, []);

  const fetchMagazineData = async (initCanvas: fabric.Canvas) => {
    try {
      const res = await fetch("/api/magazines");
      const data = await res.json();
      const mag = data.find((m: any) => m.id === magazineId);
      
      if (mag && mag.canvasData) {
        setPages(mag.canvasData);
        initCanvas.loadFromJSON(mag.canvasData[0], () => {
          initCanvas.renderAll();
        });
      } else {
        // Initialize an empty state for page 1
        const emptyState = initCanvas.toJSON();
        setPages([emptyState]);
      }
    } catch {
      toast.error("Failed to load magazine data");
    } finally {
      setLoading(false);
    }
  };

  // Switch pages
  const loadPage = (index: number) => {
    if (!canvas) return;
    // Save current page state
    const currentPages = [...pages];
    currentPages[currentPage] = canvas.toJSON();
    
    // Load new page
    canvas.loadFromJSON(currentPages[index] || {}, () => {
      canvas.renderAll();
      setCurrentPage(index);
      setPages(currentPages);
    });
  };

  const addPage = () => {
    if (!canvas) return;
    const currentPages = [...pages];
    currentPages[currentPage] = canvas.toJSON(); // save current
    currentPages.push({}); // add empty
    
    setPages(currentPages);
    setCurrentPage(currentPages.length - 1);
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();
  };

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Double click to edit", {
      left: 100,
      top: 100,
      fontFamily: "Inter, sans-serif",
      fontSize: 32,
      fill: "#000000",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addImage = () => {
    const url = prompt("Enter Image URL (e.g., https://example.com/img.png):");
    if (!url || !canvas) return;
    
    fabric.Image.fromURL(url, (img) => {
      if (!img) {
        toast.error("Failed to load image from URL");
        return;
      }
      img.scaleToWidth(400);
      canvas.add(img);
      canvas.centerObject(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const handleSave = async () => {
    if (!canvas) return;
    
    const toastId = toast.loading("Saving magazine...");
    
    // update current page before saving
    const currentPages = [...pages];
    currentPages[currentPage] = canvas.toJSON();
    setPages(currentPages);

    try {
      const token = btoa("staff-123-gamo123");
      const res = await fetch("/api/magazines/canvas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          id: magazineId,
          canvasData: currentPages
        })
      });

      if (res.ok) {
        toast.success("Magazine saved successfully", { id: toastId });
      } else {
        toast.error("Failed to save", { id: toastId });
      }
    } catch {
      toast.error("An error occurred while saving", { id: toastId });
    }
  };

  if (loading) return null;

  return (
    <div className="flex h-screen bg-[#111111] overflow-hidden text-white font-sans">
      {/* Sidebar Tools */}
      <div className="w-20 bg-[#1a1a1a] border-r border-white/10 flex flex-col items-center py-6 gap-6 z-10">
        <button onClick={() => router.push("/staff/magazines")} className="p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all mb-4">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex flex-col gap-4">
          <button onClick={addText} className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group relative">
            <Type size={24} />
            <span className="absolute left-full ml-4 bg-black px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Add Text</span>
          </button>
          <button onClick={addImage} className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all group relative">
            <ImageIcon size={24} />
            <span className="absolute left-full ml-4 bg-black px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Add Image</span>
          </button>
          <div className="w-8 h-px bg-white/10 mx-auto my-2" />
          <button onClick={deleteSelected} className="p-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all group relative">
            <Trash2 size={24} />
            <span className="absolute left-full ml-4 bg-black px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Delete Selected</span>
          </button>
        </div>
        
        <button onClick={handleSave} className="mt-auto p-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all">
          <Save size={24} />
        </button>
      </div>

      {/* Pages Panel */}
      <div className="w-48 bg-[#151515] border-r border-white/5 flex flex-col py-6 z-10">
        <h3 className="px-6 text-xs font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Layers size={14} /> Pages
        </h3>
        <div className="flex-1 overflow-y-auto px-4 space-y-3">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => loadPage(idx)}
              className={`w-full aspect-[1/1.414] rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${currentPage === idx ? 'border-red-500 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-white/30 hover:border-white/30 hover:text-white/60'}`}
            >
              {idx + 1}
            </button>
          ))}
          <button onClick={addPage} className="w-full py-4 rounded-lg border border-dashed border-white/20 hover:border-white/50 text-white/40 hover:text-white/80 transition-all flex justify-center">
            <PlusCircle size={24} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col bg-[#0c0c0c] relative overflow-hidden">
        {/* Topbar */}
        <div className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#111111]/80 backdrop-blur-md absolute top-0 w-full z-10">
          <div className="flex items-center gap-3">
            <Layout className="text-red-500" size={20} />
            <h1 className="font-bold tracking-tight text-lg">Canvas Editor</h1>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/50 font-medium ml-2">Page {currentPage + 1} of {pages.length}</span>
          </div>
          <div className="text-xs font-medium text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            Double click text to edit • Drag to move • Use corners to resize
          </div>
        </div>

        {/* Scrollable Canvas Container */}
        <div className="flex-1 overflow-auto pt-24 pb-20 px-10 flex items-start justify-center">
          <div className="shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 bg-white">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
