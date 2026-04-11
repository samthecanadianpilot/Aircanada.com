"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, AlertTriangle, Plane, Calendar, Compass, Users, Loader2, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const categories = [
  { label: "Alert", icon: AlertTriangle, color: "bg-red-100 text-red-600 border-red-200" },
  { label: "Fleet", icon: Plane, color: "bg-blue-100 text-blue-600 border-blue-200" },
  { label: "Event", icon: Calendar, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "Flight", icon: Compass, color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  { label: "Community", icon: Users, color: "bg-purple-100 text-purple-600 border-purple-200" },
];

export default function NewsHub() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [newPost, setNewPost] = useState({
    headline: "",
    content: "",
    category: "Alert",
    image: null as string | null
  });

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setPosts(data);
    } catch { toast.error("Failed to load news"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newPost.headline || !newPost.content) return toast.error("Required fields missing");
    try {
      const token = btoa("staff-123-gamo123");
      const body = new FormData();
      body.append("token", token);
      body.append("headline", newPost.headline);
      body.append("content", newPost.content);
      body.append("category", newPost.category);
      const res = await fetch("/api/news", { method: "POST", body });
      if (res.ok) {
        toast.success("Dispatch published");
        setIsCreating(false);
        setNewPost({ headline: "", content: "", category: "Alert", image: null });
        fetchNews();
      }
    } catch { toast.error("Failed to publish"); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-red-500" size={28} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">News Feed</h1>
          <p className="text-sm text-gray-500 mt-0.5">Publish alerts, events, and fleet updates</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          <Plus size={14} />
          New Dispatch
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">New Dispatch</h2>
                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <input
                placeholder="Headline"
                value={newPost.headline}
                onChange={e => setNewPost({ ...newPost, headline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50"
              />
              <div className="flex gap-3">
                <select
                  value={newPost.category}
                  onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-700"
                >
                  {categories.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                </select>
              </div>
              <textarea
                rows={4}
                placeholder="Write the dispatch content..."
                value={newPost.content}
                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50 resize-none"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button onClick={handleCreate} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors">
                  Publish
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts */}
      <div className="space-y-3">
        {posts.map(post => {
          const cat = categories.find(c => c.label === post.category) || categories[0];
          const isExpanded = expandedId === post.id;
          const isLong = post.content.length > 200;

          return (
            <motion.div
              key={post.id}
              layout
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${cat.color}`}>
                        <cat.icon size={10} />
                        {post.category}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-[15px] leading-snug">{post.headline}</h3>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Smooth expand content */}
                <motion.div
                  initial={false}
                  animate={{
                    height: isExpanded || !isLong ? "auto" : "3.2em",
                    opacity: 1
                  }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden mt-3"
                >
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </motion.div>

                {isLong && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : post.id)}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                  >
                    {isExpanded ? "Show Less" : "Read More"}
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={12} />
                    </motion.div>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
