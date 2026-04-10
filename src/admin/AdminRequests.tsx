import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, Loader2, ExternalLink, User, Calendar, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { cn } from '../lib/utils';

interface PurchaseRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_id: string;
  amount: number;
  utr: string;
  screenshot_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/admin/requests');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      await api.post(`/admin/requests/${id}/${action}`);
      toast.success(`Request ${action}d successfully!`);
      fetchRequests();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-blue-500" />
          Purchase Requests
        </h1>
        <p className="text-zinc-500">Review and manage user subscription requests</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-20 text-center text-zinc-500">
            No purchase requests found
          </div>
        ) : (
          requests.map((request) => (
            <motion.div 
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row gap-8"
            >
              {/* Screenshot Preview */}
              <div className="w-full md:w-48 h-64 md:h-auto bg-black rounded-3xl overflow-hidden border border-zinc-800 relative group">
                <img 
                  src={request.screenshot_url} 
                  alt="Payment Screenshot" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <a 
                  href={request.screenshot_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-6 h-6 text-white" />
                </a>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-bold">{request.user_name}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{request.user_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                      request.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" :
                      request.status === 'approved' ? "bg-green-500/10 text-green-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Plan</p>
                    <p className="text-sm font-bold text-white">{request.plan_id}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Amount</p>
                    <p className="text-sm font-bold text-green-500">₹{request.amount}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50 col-span-2 md:col-span-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">UTR / Trans ID</p>
                    <p className="text-sm font-mono font-bold text-blue-400">{request.utr || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold">
                  <Calendar className="w-3 h-3" />
                  {new Date(request.created_at).toLocaleString()}
                </div>

                {request.status === 'pending' && (
                  <div className="flex items-center gap-4 pt-4 border-t border-zinc-800/50">
                    <button 
                      onClick={() => handleAction(request.id, 'approve')}
                      disabled={processingId !== null}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Approve</>}
                    </button>
                    <button 
                      onClick={() => handleAction(request.id, 'reject')}
                      disabled={processingId !== null}
                      className="flex-1 bg-zinc-800 hover:bg-red-600/20 hover:text-red-500 text-zinc-400 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {processingId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4" /> Reject</>}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
