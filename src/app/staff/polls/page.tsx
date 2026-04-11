"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  BarChart3, 
  Users, 
  ShieldAlert,
  Loader2,
  Lock,
  History
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

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch("/api/polls");
      const data = await res.json();
      setPolls(data);
    } catch (err) {
      toast.error("Telemetry failed");
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async () => {
    if (!newPoll.question) return toast.error("Question required");
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        body: JSON.stringify({ action: "create", ...newPoll })
      });
      if (res.ok) {
        toast.success("Poll synchronized");
        setIsCreating(false);
        setNewPoll({ question: "", options: ["Affirmative", "Negative"] });
        fetchPolls();
      }
    } catch (err) {
      toast.error("Creation failed");
    }
  };

  const castVote = async (pollId: string, optionIndex: number) => {
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        body: JSON.stringify({ action: "vote", pollId, optionIndex })
      });
      const data = await res.json();
      
      if (data.error === "IP_ALREADY_VOTED") {
        toast.error("Integrity Protocol: Vote already recorded from this IP");
      } else if (res.ok) {
        toast.success("Vote encrypted and stored");
        fetchPolls();
      }
    } catch (err) {
      toast.error("Transmission error");
    }
  };

  const deletePoll = async (id: string) => {
    if (!confirm("Decommission this poll and purge data?")) return;
    try {
      await fetch(`/api/polls?id=${id}`, { method: "DELETE" });
      toast.success("Poll purged");
      fetchPolls();
    } catch (err) {
      toast.error("Purge failed");
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Voting Booth</h1>
          <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold mt-1">Integrity-First Staff Decisions</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center shadow-[0_0_15px_rgba(220,38,38,0.2)]"
        >
          <Plus size={14} className="mr-2" />
          Initialize Poll
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 bg-white/5 border border-white/10 rounded-xl space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Inquiry Question</label>
              <input 
                value={newPoll.question}
                onChange={e => setNewPoll({ ...newPoll, question: e.target.value })}
                className="w-full bg-transparent border-b border-white/10 p-2 text-sm font-bold uppercase tracking-wider outline-none focus:border-red-600 transition-colors"
                placeholder="PROPOSAL DESCRIPTION"
              />
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Options</label>
              {newPoll.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                   <input 
                    value={opt}
                    onChange={e => {
                      const newOpts = [...newPoll.options];
                      newOpts[i] = e.target.value;
                      setNewPoll({ ...newPoll, options: newOpts });
                    }}
                    className="flex-1 bg-white/5 border border-white/5 p-3 text-[10px] font-bold uppercase tracking-widest rounded outline-none focus:border-white/20 transition-colors"
                  />
                  <button 
                    onClick={() => setNewPoll({ ...newPoll, options: newPoll.options.filter((_, idx) => idx !== i) })}
                    className="p-3 text-white/20 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ""] })}
                className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white"
              >
                + Append Option
              </button>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
               <button onClick={() => setIsCreating(false)} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white">Abort</button>
               <button onClick={createPoll} className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded">Deploy Poll</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);
          
          return (
            <div key={poll.id} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-2xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => deletePoll(poll.id)} className="text-white/10 hover:text-red-600 p-2">
                    <Trash2 size={16} />
                  </button>
               </div>

               <div className="flex items-start space-x-6">
                 <div className="w-12 h-12 rounded bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                    <BarChart3 className="text-red-500" size={20} />
                 </div>
                 
                 <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">{poll.question}</h3>
                      <div className="flex items-center space-x-3 text-[9px] font-bold uppercase tracking-widest text-white/20">
                         <span className="flex items-center"><Users size={10} className="mr-1" /> {totalVotes} Transmissions</span>
                         <span className="flex items-center"><History size={10} className="mr-1" /> {new Date(poll.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {poll.options.map((option, idx) => {
                        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                        return (
                          <button 
                            key={idx}
                            onClick={() => castVote(poll.id, idx)}
                            className="w-full relative h-12 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all overflow-hidden group/opt text-left"
                          >
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className="absolute inset-y-0 left-0 bg-red-600/10 border-r border-red-600/20"
                            />
                            <div className="absolute inset-0 px-4 flex justify-between items-center">
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover/opt:text-white">{option.label}</span>
                               <span className="text-[10px] font-mono text-white/40">{Math.round(percentage)}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                 </div>
               </div>
            </div>
          );
        })}
        {polls.length === 0 && (
          <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <Lock className="mx-auto text-white/10 mb-4" size={32} />
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">No Active Proposals Found</p>
          </div>
        )}
      </div>
    </div>
  );
}
