"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, Edit2, Save, BookOpen, Loader2, X,
  Image as ImageIcon, Upload, FileText, Eye, Link2,
  Copy, Check, ChevronDown, Globe, EyeOff, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Magazine {
  id: string;
  title: string;
  description: string;
  date: string;
  coverImageUrl: string | null;
  fileUrl: string | null;
  pdfPages: string[];
  pageCount: number;
  status: string;
  canvasData?: any[];
}

export default function MagazineManager() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Upload state
  const [uploadStep, setUploadStep] = useState<"select" | "processing" | "details">("select");
  const [uploadPages, setUploadPages] = useState<string[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "Draft",
  });

  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    try {
      const res = await fetch("/api/magazines");
      const data = await res.json();
      setMagazines(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load magazines");
    } finally {
      setLoading(false);
    }
  };

  // ── PDF Processing (client-side with pdf.js) ──
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setUploadProcessing(true);
    setUploadStep("processing");
    setUploadProgress(0);
    setUploadTitle(file.name.replace(/\.pdf$/i, ""));

    try {
      // Dynamically import pdfjs
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const renderedPages: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality render

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL("image/png", 0.92);
        renderedPages.push(dataUrl);

        setUploadProgress(Math.round((i / totalPages) * 100));
      }

      setUploadPages(renderedPages);
      setUploadStep("details");
    } catch (err) {
      console.error("PDF processing error:", err);
      toast.error("Failed to process PDF. Make sure it's a valid PDF file.");
      resetUpload();
    } finally {
      setUploadProcessing(false);
    }
  }, []);

  const handlePublishMagazine = async () => {
    if (!uploadTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const toastId = toast.loading("Publishing magazine...");

    try {
      const res = await fetch("/api/magazines/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          description: uploadDesc,
          pages: uploadPages,
        }),
      });

      if (res.ok) {
        toast.success("Magazine published successfully!", { id: toastId });
        resetUpload();
        setShowUploadModal(false);
        fetchMagazines();
      } else {
        toast.error("Failed to publish magazine", { id: toastId });
      }
    } catch {
      toast.error("An error occurred", { id: toastId });
    }
  };

  const resetUpload = () => {
    setUploadStep("select");
    setUploadPages([]);
    setUploadTitle("");
    setUploadDesc("");
    setUploadProgress(0);
    setUploadProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── CRUD Operations ──
  const handleEdit = (mag: Magazine) => {
    setEditingId(mag.id);
    setEditForm({
      title: mag.title,
      description: mag.description || "",
      status: mag.status || "Draft",
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title) return toast.error("Title is required");
    try {
      const token = btoa("staff-123-gamo123");
      const body = new FormData();
      body.append("token", token);
      body.append("id", editingId!);
      body.append("title", editForm.title);
      body.append("description", editForm.description);
      body.append("status", editForm.status);

      const res = await fetch("/api/magazines", { method: "PUT", body });
      if (res.ok) {
        toast.success("Magazine updated");
        setEditingId(null);
        fetchMagazines();
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this magazine? This cannot be undone.")) return;
    try {
      const token = btoa("staff-123-gamo123");
      const res = await fetch(`/api/magazines?id=${id}&token=${token}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Magazine deleted");
        fetchMagazines();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleTogglePublish = async (mag: Magazine) => {
    const newStatus = mag.status === "Published" ? "Draft" : "Published";
    try {
      const token = btoa("staff-123-gamo123");
      const body = new FormData();
      body.append("token", token);
      body.append("id", mag.id);
      body.append("status", newStatus);

      const res = await fetch("/api/magazines", { method: "PUT", body });
      if (res.ok) {
        toast.success(
          newStatus === "Published"
            ? "Magazine is now live!"
            : "Magazine unpublished"
        );
        fetchMagazines();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const copyShareLink = (id: string) => {
    const url = `${window.location.origin}/magazines/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Share link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMagazines = magazines.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-red-500 mb-4" size={32} />
        <p className="text-sm text-gray-400 font-medium">Loading magazines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Magazine Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload PDFs, convert to flipbook format, and publish with shareable links
          </p>
        </div>
        <button
          onClick={() => {
            resetUpload();
            setShowUploadModal(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold tracking-wide transition-all shadow-lg shadow-red-600/20 hover:shadow-red-500/30"
        >
          <Upload size={16} />
          Upload PDF
        </button>
      </div>

      {/* ── Search ── */}
      {magazines.length > 0 && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search magazines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
          />
        </div>
      )}

      {/* ── Stats Bar ── */}
      {magazines.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <p className="text-2xl font-bold text-gray-900">{magazines.length}</p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
              Total Magazines
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <p className="text-2xl font-bold text-emerald-600">
              {magazines.filter((m) => m.status === "Published").length}
            </p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
              Published
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
            <p className="text-2xl font-bold text-amber-500">
              {magazines.filter((m) => m.status !== "Published").length}
            </p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
              Drafts
            </p>
          </div>
        </div>
      )}

      {/* ── Magazine Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredMagazines.map((mag) => (
            <motion.div
              key={mag.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all shadow-sm group"
            >
              {editingId === mag.id ? (
                /* ── Edit Mode ── */
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Edit Magazine
                    </h3>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50"
                    placeholder="Title"
                  />
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50 resize-none"
                    placeholder="Description..."
                  />
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View Mode ── */
                <>
                  {/* Cover Image */}
                  <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border-b border-gray-100 overflow-hidden">
                    {mag.coverImageUrl ||
                    (mag.pdfPages && mag.pdfPages.length > 0) ? (
                      <img
                        src={
                          mag.coverImageUrl ||
                          (mag.pdfPages ? mag.pdfPages[0] : "")
                        }
                        alt={mag.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <BookOpen size={40} strokeWidth={1.5} />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          No Cover
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                          mag.status === "Published"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-white/90 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {mag.status === "Published" ? (
                          <Globe size={10} />
                        ) : (
                          <EyeOff size={10} />
                        )}
                        {mag.status || "Draft"}
                      </span>
                    </div>

                    {/* Page Count */}
                    {(mag.pageCount || mag.pdfPages?.length) && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wide">
                        {mag.pageCount || mag.pdfPages?.length || 0} pages
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText size={13} className="text-red-500" />
                      <span className="text-[11px] text-gray-400 font-medium">
                        {new Date(mag.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1">
                      {mag.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {mag.description || "No description provided."}
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                      {/* View / Preview */}
                      <a
                        href={`/magazines/${mag.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all"
                      >
                        <Eye size={13} />
                        Preview
                      </a>

                      {/* Copy Share Link */}
                      <button
                        onClick={() => copyShareLink(mag.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          copiedId === mag.id
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {copiedId === mag.id ? (
                          <Check size={13} />
                        ) : (
                          <Copy size={13} />
                        )}
                        {copiedId === mag.id ? "Copied!" : "Copy Link"}
                      </button>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Publish Toggle */}
                      <button
                        onClick={() => handleTogglePublish(mag)}
                        className={`p-2 rounded-lg transition-all ${
                          mag.status === "Published"
                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                            : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                        title={
                          mag.status === "Published"
                            ? "Unpublish"
                            : "Publish"
                        }
                      >
                        {mag.status === "Published" ? (
                          <EyeOff size={14} />
                        ) : (
                          <Globe size={14} />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(mag)}
                        className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(mag.id)}
                        className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Empty State ── */}
      {filteredMagazines.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
            <BookOpen size={36} className="text-gray-300" />
          </div>
          <p className="text-base font-semibold text-gray-500">
            {searchQuery ? "No magazines match your search" : "No magazines yet"}
          </p>
          <p className="text-sm mt-1 text-gray-400">
            {searchQuery
              ? "Try a different search term"
              : "Upload a PDF to create your first flipbook magazine"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                resetUpload();
                setShowUploadModal(true);
              }}
              className="mt-6 flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all"
            >
              <Upload size={16} />
              Upload Your First PDF
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ── PDF Upload Modal ── */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !uploadProcessing) {
                setShowUploadModal(false);
                resetUpload();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {uploadStep === "select"
                      ? "Upload PDF"
                      : uploadStep === "processing"
                      ? "Processing PDF..."
                      : "Magazine Details"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {uploadStep === "select"
                      ? "Select a PDF file to convert into a flipbook magazine"
                      : uploadStep === "processing"
                      ? "Rendering pages to high-quality images"
                      : `${uploadPages.length} pages ready to publish`}
                  </p>
                </div>
                {!uploadProcessing && (
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUpload();
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Step 1: File Select */}
                {uploadStep === "select" && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-red-400 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-red-50/30 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5 group-hover:bg-red-100 transition-colors">
                      <Upload
                        size={28}
                        className="text-red-500"
                      />
                    </div>
                    <p className="text-base font-semibold text-gray-700 mb-1">
                      Click to select a PDF
                    </p>
                    <p className="text-sm text-gray-400">
                      or drag and drop your file here
                    </p>
                    <p className="text-xs text-gray-300 mt-3">
                      PDF files only • Max recommended: 50 pages
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Step 2: Processing */}
                {uploadStep === "processing" && (
                  <div className="py-12 flex flex-col items-center">
                    <div className="relative mb-8">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#f3f4f6"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#dc2626"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - uploadProgress / 100)}`}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">
                        {uploadProgress}%
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Rendering pages...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Converting PDF pages to high-quality flipbook format
                    </p>
                  </div>
                )}

                {/* Step 3: Details & Preview */}
                {uploadStep === "details" && (
                  <div className="space-y-5">
                    {/* Page Preview Strip */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                        Page Preview ({uploadPages.length} pages)
                      </label>
                      <div className="flex gap-3 overflow-x-auto py-2 px-1 -mx-1">
                        {uploadPages.map((page, i) => (
                          <div
                            key={i}
                            className="flex-shrink-0 w-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group"
                          >
                            <img
                              src={page}
                              alt={`Page ${i + 1}`}
                              className="w-full aspect-[1/1.414] object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-1 px-1.5">
                              <span className="text-[9px] font-bold text-white">
                                {i + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Magazine Title
                      </label>
                      <input
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="e.g. Air Canada Monthly — June 2026"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all bg-gray-50"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Description (optional)
                      </label>
                      <textarea
                        value={uploadDesc}
                        onChange={(e) => setUploadDesc(e.target.value)}
                        rows={3}
                        placeholder="What's in this issue?"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all bg-gray-50 resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          resetUpload();
                        }}
                        className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Start Over
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowUploadModal(false);
                            resetUpload();
                          }}
                          className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handlePublishMagazine}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                        >
                          <Globe size={14} />
                          Publish Magazine
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
