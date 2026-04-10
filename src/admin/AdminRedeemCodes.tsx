import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Loader2, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

interface RedeemCode {
  id: number;
  code: string;
  plan_id: string;
  is_used: boolean;
  used_by: number | null;
  used_by_name: string | null;
  created_at: string;
}

export const AdminRedeemCodes: React.FC = () => {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState({ code: '', planId: 'VIP' });
  const [search, setSearch] = useState('');

  const fetchCodes = async () => {
    try {
      const response = await api.get('/admin/redeem-codes');
      setCodes(response.data);
    } catch (error) {
      toast.error('Failed to fetch redeem codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code.trim()) return;

    setIsCreating(true);
    try {
      await api.post('/admin/redeem-codes', {
        code: newCode.code.trim().toUpperCase(),
        planId: newCode.planId
      });
      toast.success('Redeem code created!');
      setNewCode({ code: '', planId: 'VIP' });
      fetchCodes();
    } catch (error) {
      toast.error('Failed to create code');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCodes = codes.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.plan_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-blue-500" />
            Redeem Codes
          </h1>
          <p className="text-zinc-500">Create and manage subscription redeem codes</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 sticky top-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Generate New Code
            </h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1">Code String</label>
                <input 
                  type="text"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  placeholder="SAHID-XXXX-XXXX"
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 ml-1">Plan Type</label>
                <select 
                  value={newCode.planId}
                  onChange={(e) => setNewCode({ ...newCode, planId: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="Garib Pro Max">Garib Pro Max (₹50)</option>
                  <option value="VIP">VIP (₹100)</option>
                  <option value="Yearly">Yearly (₹800)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isCreating || !newCode.code.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Code'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-500">Code</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-500">Plan</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="p-6 text-xs font-black uppercase tracking-widest text-zinc-500">Used By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-700" />
                      </td>
                    </tr>
                  ) : filteredCodes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-zinc-500">
                        No redeem codes found
                      </td>
                    </tr>
                  ) : (
                    filteredCodes.map((code) => (
                      <tr key={code.id} className="group hover:bg-zinc-800/30 transition-colors">
                        <td className="p-6">
                          <code className="text-sm font-mono font-bold text-blue-400">{code.code}</code>
                        </td>
                        <td className="p-6">
                          <span className="text-xs font-bold px-3 py-1 bg-zinc-800 rounded-full text-zinc-300">
                            {code.plan_id}
                          </span>
                        </td>
                        <td className="p-6">
                          {code.is_used ? (
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
                              <XCircle className="w-4 h-4 text-red-500/50" />
                              Used
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-500 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              Active
                            </div>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="text-xs">
                            {code.used_by_name ? (
                              <span className="text-white font-bold">{code.used_by_name}</span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                            <div className="text-[10px] text-zinc-500 mt-1">
                              {new Date(code.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
