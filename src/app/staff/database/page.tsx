"use client";

import { useState, useEffect } from "react";
import { User, CheckCircle2, ShieldCore, Database, Search, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function UserDatabase() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/profiles");
      let data = await res.json();
      
      // If DB is completely empty, show some initial state
      if (data.length === 0) {
        data = [
          { discordId: "123456789", discord_name: "Admin (Demo)", rank: "BOD", points: 1500, flights_booked: 20 }
        ];
      }
      
      setUsers(data);
    } catch {
      toast.error("Failed to load user database");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => u.discord_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const saveEdits = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          discordId: selectedUser.discordId,
          updates: {
             points: selectedUser.points,
             flights_booked: selectedUser.flights_booked
          }
        })
      });
      if (res.ok) {
        toast.success("Profile saved securely to database.");
        setSelectedUser(null);
        fetchProfiles();
      } else {
        toast.error("Failed to save profile.");
      }
    } catch {
      toast.error("Network error saving profile.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <Database size={16} className="text-red-500" />
             <h1 className="text-xl font-bold text-gray-900">User Database</h1>
           </div>
           <p className="text-sm text-gray-500">Manage Discord members, roles, points, and booked flights.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Side: User Table */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-3">
             <div className="relative flex-1">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-medium"
                 placeholder="Search Discord users..."
               />
             </div>
          </div>
          
          <table className="w-full text-sm text-left">
             <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
               <tr>
                 <th className="p-4">Discord User</th>
                 <th className="p-4">Authority</th>
                 <th className="p-4">Earned Points</th>
                 <th className="p-4 text-right">Action</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {filteredUsers.map((user) => (
                 <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                   <td className="p-4">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                         {user.discord_name.charAt(0)}
                       </div>
                       <span className="font-semibold text-gray-900">{user.discord_name}</span>
                     </div>
                   </td>
                   <td className="p-4">
                     <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                       user.rank === 'BOD' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-gray-100 text-gray-600 border-gray-200'
                     }`}>
                       {user.rank}
                     </span>
                   </td>
                   <td className="p-4 font-mono text-gray-600">{user.points.toLocaleString()}</td>
                   <td className="p-4 text-right">
                     <button 
                       onClick={() => setSelectedUser(user)}
                       className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 shadow-sm"
                     >
                       Edit Profile
                     </button>
                   </td>
                 </tr>
               ))}
               {filteredUsers.length === 0 && (
                 <tr>
                   <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">No members found matching that scan.</td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>

        {/* Right Side: Profile Editor */}
        <div className="col-span-12 lg:col-span-4">
           {selectedUser ? (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-5">
               <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                 <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold border border-indigo-200">
                   {selectedUser.discord_name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-gray-900">{selectedUser.discord_name}</h3>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                     <ShieldCore size={12} className="text-red-500" />
                     {selectedUser.rank} Active
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Earned Points</label>
                   <input 
                     type="number"
                     defaultValue={selectedUser.points}
                     className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Total Flights Booked</label>
                   <input 
                     type="number"
                     defaultValue={selectedUser.flights_booked}
                     className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                   />
                 </div>
               </div>

               <div className="pt-2">
                 <button onClick={saveEdits} className="w-full flex justify-center items-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm">
                   Commit Changes
                 </button>
               </div>
             </motion.div>
           ) : (
             <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <User size={32} className="mb-3 text-gray-300" />
                <p className="text-sm font-medium">Select a Discord user from the database to modify their statistics.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
