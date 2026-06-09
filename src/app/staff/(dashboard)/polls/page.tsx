"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, BarChart3, Users, Loader2, Lock, History, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PollOption {
  label: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  votedIps: string[];
  timestamp: string;
}

export default function StaffPolling() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["Affirmative", "Negative"]
  });

  useEffect(() => { fetchPolls(); }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch("/api/polls");
      setPolls(await res.json());
    } catch { toast.error("Failed to load polls"); } 
    finally { setLoading(false); }
  };

  const createPoll = async () => {
    if (!newPoll.question) return toast.error("Question required");
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        body: JSON.stringify({ action: "create", ...newPoll })
      });
      if (res.ok) {
        toast.success("Poll published");
        setIsCreating(false);
        setNewPoll({ question: "", options: ["Affirmative", "Negative"] });
        fetchPolls();
      }
    } catch { toast.error("Creation failed"); }
  };

  const castVote = async (pollId: string, optionIndex: number) => {
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        body: JSON.stringify({ action: "vote", pollId, optionIndex })
      });
      const data = await res.json();
      
      if (data.error === "IP_ALREADY_VOTED") toast.error("You have already voted on this poll");
      else if (res.ok) { toast.success("Vote recorded"); fetchPolls(); }
    } catch { toast.error("Vote failed"); }
  };

  const deletePoll = async (id: string) => {
    if (!confirm("Permanently delete this poll?")) return;
    try { await fetch(`/api/polls?id=${id}`, { method: "DELETE" }); toast.success("Poll deleted"); fetchPolls(); }
    catch { toast.error("Delete failed"); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={28} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Active Polls</h1>
          <p className="text-sm text-gray-500 mt-0.5">Staff decision making and voting</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold tracking-wide shadow-sm transition-colors"
        >
          <Plus size={14} />
          New Poll
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Initialize Poll</h2>
                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question</label>
                <input 
                  value={newPoll.question}
                  onChange={e => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50"
                  placeholder="What should we decide?"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Options</label>
                <div className="space-y-2">
                  {newPoll.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        value={opt}
                        onChange={e => {
                          const newOpts = [...newPoll.options];
                          newOpts[i] = e.target.value;
                          setNewPoll({ ...newPoll, options: newOpts });
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                      />
                      <button 
                        onClick={() => setNewPoll({ ...newPoll, options: newPoll.options.filter((_, idx) => idx !== i) })}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ""] })}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors py-1"
                  >
                    + Add Option
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                 <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">Cancel</button>
                 <button onClick={createPoll} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm">Deploy Poll</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
          
          return (
            <div key={poll.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm group hover:border-gray-300 transition-colors">
               <div className="flex items-start justify-between mb-6">
                 <div className="flex gap-4">
                   <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0 border border-red-100 text-red-500">
                      <BarChart3 size={20} />
                   </div>
                   <div>
                      <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{poll.question}</h3>
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                         <span className="flex items-center gap-1"><Users size={12} /> {totalVotes} Votes</span>
                         <span className="flex items-center gap-1"><History size={12} /> {new Date(poll.timestamp).toLocaleDateString()}</span>
                      </div>
                   </div>
                 </div>
                 <button onClick={() => deletePoll(poll.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={16} />
                 </button>
               </div>

               <div className="space-y-3">
                 {poll.options.map((option, idx) => {
                   const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                   return (
                     <button 
                       key={idx}
                       onClick={() => castVote(poll.id, idx)}
                       className="w-full relative h-12 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-all overflow-hidden text-left group/opt"
                     >
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         className="absolute inset-y-0 left-0 bg-red-100/50"
                       />
                       <div className="absolute inset-0 px-4 flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700 group-hover/opt:text-red-600 transition-colors z-10">{option.label}</span>
                          <span className="text-xs font-bold text-gray-500 z-10">{Math.round(percentage)}%</span>
                       </div>
                     </button>
                   );
                 })}
               </div>
            </div>
          );
        })}
        
        {polls.length === 0 && (
          <div className="p-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <BarChart3 className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-sm font-medium text-gray-500">No active polls available</p>
          </div>
        )}
      </div>
    </div>
  );
}
