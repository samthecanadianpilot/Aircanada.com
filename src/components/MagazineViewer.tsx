"use client";

import { useEffect, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { toast } from "sonner";
import {
  BookOpen,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Home,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Link from "next/link";

export default function MagazineViewer({
  magazineId,
}: {
  magazineId: string;
}) {
  const [magazine, setMagazine] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flipBookRef, setFlipBookRef] = useState<any>(null);

  useEffect(() => {
    fetchMagazine();
  }, [magazineId]);

  const fetchMagazine = async () => {
    try {
      const res = await fetch("/api/magazines");
      const data = await res.json();
      const mag = data.find((m: any) => m.id === magazineId);

      if (!mag) {
        setLoading(false);
        return;
      }

      setMagazine(mag);

      // NEW: If the magazine has pdfPages (base64 images from PDF upload)
      if (mag.pdfPages && mag.pdfPages.length > 0) {
        setImages(mag.pdfPages);
        setLoading(false);
        return;
      }

      // LEGACY: If the magazine has canvasData (from Fabric.js editor)
      if (mag.canvasData && mag.canvasData.length > 0) {
        try {
          const { fabric } = await import("fabric");
          renderCanvasPages(fabric, mag.canvasData);
        } catch {
          setLoading(false);
        }
        return;
      }

      setLoading(false);
    } catch {
      toast.error("Failed to load magazine");
      setLoading(false);
    }
  };

  const renderCanvasPages = (fabricLib: any, canvasData: any[]) => {
    const tempCanvasEl = document.createElement("canvas");
    tempCanvasEl.width = 800;
    tempCanvasEl.height = 1131;
    const fabricCanvas = new fabricLib.StaticCanvas(tempCanvasEl, {
      width: 800,
      height: 1131,
      backgroundColor: "#ffffff",
    });

    const renderedImages: string[] = [];

    const processPage = (index: number) => {
      if (index >= canvasData.length) {
        setImages(renderedImages);
        setLoading(false);
        fabricCanvas.dispose();
        return;
      }

      fabricCanvas.loadFromJSON(canvasData[index] || {}, () => {
        fabricCanvas.renderAll();
        const dataUrl = fabricCanvas.toDataURL({
          format: "png",
          multiplier: 1,
        });
        renderedImages.push(dataUrl);
        processPage(index + 1);
      });
    };

    processPage(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Share link copied to clipboard!");
  };

  const handleFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  if (loading) {
    return null; // Handled by the page's Suspense/loading
  }

  if (!magazine) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
          <BookOpen size={40} className="text-white/15" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Magazine Not Found
        </h1>
        <p className="text-white/40 mb-8">
          This magazine doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all"
        >
          <Home size={14} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* ── Top Bar ── */}
      <div className="h-16 border-b border-white/[0.06] bg-[#0c0c0c]/90 backdrop-blur-xl flex items-center justify-between px-6 md:px-8 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all"
          >
            <Home size={16} />
          </Link>
          <div className="w-px h-6 bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              <BookOpen size={14} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-white text-sm leading-tight truncate max-w-[300px]">
                {magazine.title}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                {magazine.pageCount || images.length} pages •{" "}
                {new Date(magazine.date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Page indicator */}
          <span className="hidden sm:inline text-xs text-white/40 font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 mr-2">
            Page {currentPage + 1} of {images.length}
          </span>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 size={16} />
            ) : (
              <Maximize2 size={16} />
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-all border border-white/[0.08]"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ── Flipbook Area ── */}
      <div className="flex-1 flex items-center justify-center py-6 md:py-10 px-4 overflow-hidden relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-red-600/[0.06] blur-[120px] rounded-full pointer-events-none" />

        {images.length > 0 ? (
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={() => flipBookRef?.pageFlip()?.flipPrev()}
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 p-3 text-white/20 hover:text-white/80 hover:bg-white/5 rounded-xl transition-all z-20 hidden md:flex items-center justify-center"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => flipBookRef?.pageFlip()?.flipNext()}
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 p-3 text-white/20 hover:text-white/80 hover:bg-white/5 rounded-xl transition-all z-20 hidden md:flex items-center justify-center"
            >
              <ChevronRight size={24} />
            </button>

            {/* Flipbook */}
            <div className="shadow-[0_30px_80px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden">
              {/* @ts-ignore */}
              <HTMLFlipBook
                ref={(el: any) => setFlipBookRef(el)}
                width={500}
                height={707}
                size="stretch"
                minWidth={300}
                maxWidth={900}
                minHeight={400}
                maxHeight={1300}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={handleFlip}
                className="magazine-flipbook"
              >
                {images.map((src, i) => (
                  <div key={i} className="bg-white">
                    <img
                      src={src}
                      alt={`Page ${i + 1}`}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      draggable={false}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-white/30">
            <BookOpen size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-semibold">
              This magazine has no pages yet.
            </p>
            <p className="text-sm mt-1 text-white/20">
              The publisher hasn't added content to this issue.
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom Bar (mobile page nav) ── */}
      {images.length > 0 && (
        <div className="h-14 border-t border-white/[0.06] bg-[#0c0c0c]/90 backdrop-blur-xl flex items-center justify-center gap-4 px-6 md:hidden">
          <button
            onClick={() => flipBookRef?.pageFlip()?.flipPrev()}
            className="p-2 text-white/40 hover:text-white bg-white/5 rounded-lg transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-white/50 font-semibold tracking-wide">
            {currentPage + 1} / {images.length}
          </span>
          <button
            onClick={() => flipBookRef?.pageFlip()?.flipNext()}
            className="p-2 text-white/40 hover:text-white bg-white/5 rounded-lg transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
