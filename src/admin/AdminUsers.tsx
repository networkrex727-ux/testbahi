import React, { useState, useEffect } from 'react';
import { Users, ShieldAlert, Loader2, Mail, Globe, Calendar, Shield, Crown, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  country: string;
  subscription_status: 'active' | 'pending' | 'rejected' | 'none';
  created_at: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin') => {
    setActionLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSubscription = async (userId: string, status: string) => {
    setActionLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/subscription`, { status });
      setUsers(users.map(u => u.id === userId ? { ...u, subscription_status: status as any } : u));
      toast.success(`Subscription status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update subscription');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight">User Management</h1>
        <p className="text-zinc-500">Manage user accounts and subscriptions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          <UserIcon className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit",
                        user.role === 'admin' ? "bg-purple-500/10 text-purple-500" : "bg-zinc-500/10 text-zinc-500"
                      )}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit",
                        user.subscription_status === 'active' ? "bg-green-500/10 text-green-500" : 
                        user.subscription_status === 'pending' ? "bg-yellow-500/10 text-yellow-500" : "bg-zinc-500/10 text-zinc-500"
                      )}>
                        {user.subscription_status === 'active' ? <Crown className="w-3 h-3" /> : null}
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{user.country}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          disabled={actionLoading === user.id}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] py-1 px-2 focus:outline-none focus:border-blue-500"
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                        >
                          <option value="user">Set User</option>
                          <option value="admin">Set Admin</option>
                        </select>
                        <select 
                          disabled={actionLoading === user.id}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] py-1 px-2 focus:outline-none focus:border-blue-500"
                          value={user.subscription_status}
                          onChange={(e) => handleUpdateSubscription(user.id, e.target.value)}
                        >
                          <option value="none">No Plan</option>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
