"use client";

import { useState, useEffect } from "react";
import { Check, X, Shield, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ApprovalsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/approvals");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (username: string, newStatus: string) => {
    try {
      const token = btoa("staff-123-gamo123");
      const res = await fetch("/api/auth/approvals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, username, status: newStatus })
      });
      if (res.ok) {
        toast.success(`User ${newStatus}`);
        fetchUsers();
      } else {
        toast.error("Failed to update status");
      }
    } catch { toast.error("Error updating status"); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" /></div>;

  const pendingUsers = users.filter(u => u.status === 'pending');
  const approvedUsers = users.filter(u => u.status === 'approved');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Enlistment Approvals</h1>
        <p className="text-sm text-gray-500 mt-0.5">Approve or reject new staff applications</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Shield size={16} className="text-amber-500" />
          Pending Applications ({pendingUsers.length})
        </h2>
        
        {pendingUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-sm text-gray-400">No pending applications at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingUsers.map(user => (
              <motion.div layout key={user.username} className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{user.username}</h3>
                    <p className="text-xs text-gray-500">Roblox ID: <span className="font-medium text-gray-700">{user.robloxId}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStatusChange(user.username, 'approved')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors">
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => handleStatusChange(user.username, 'rejected')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors">
                    <X size={14} /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-8 border-t border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Recently Approved</h2>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {approvedUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-400">No approved users yet.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Roblox ID</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {approvedUsers.map(user => (
                  <tr key={user.username}>
                    <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 text-gray-500">{user.robloxId}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleStatusChange(user.username, 'rejected')} className="text-red-500 hover:text-red-700 text-xs font-semibold">
                        Revoke Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
