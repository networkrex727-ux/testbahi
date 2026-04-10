import React, { useState } from 'react';
import { usePlans, Plan, PaymentMethod } from '../hooks/usePlans';
import { Check, ShieldCheck, Zap, Star, Globe, Edit2, Save, X, Plus, Trash2, CreditCard, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminPlans: React.FC = () => {
  const { plans, paymentMethods, loading, updatePlan, updatePaymentMethod } = usePlans();
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingMethod, setEditingMethod] = useState<{ key: string; method: PaymentMethod } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    setIsSaving(true);
    try {
      await updatePlan(editingPlan);
      toast.success('Plan updated locally!');
      setEditingPlan(null);
    } catch (error) {
      toast.error('Failed to update plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMethod = async () => {
    if (!editingMethod) return;
    setIsSaving(true);
    try {
      await updatePaymentMethod(editingMethod.key, editingMethod.method);
      toast.success('Payment method updated locally!');
      setEditingMethod(null);
    } catch (error) {
      toast.error('Failed to update payment method');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Zap className="w-8 h-8 text-blue-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Subscription Plans</h1>
          <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-2 rounded-xl w-fit border border-green-500/20">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-xs font-bold uppercase tracking-wider">Database Mode: Changes are permanent</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={cn(
            "bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 relative group transition-all duration-500 hover:border-blue-500/30",
            plan.id === 'vip' && "border-blue-500/50 shadow-2xl shadow-blue-600/10"
          )}>
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <button 
                onClick={() => setEditingPlan(plan)}
                className="p-2 bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white rounded-xl transition-all shadow-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                plan.id === 'vip' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
              )}>
                {plan.id === 'vip' ? <Crown className="w-6 h-6" /> : <Star className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className="text-zinc-500 text-xs mt-1 font-medium">{plan.description}</p>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Regional Pricing</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(plan.prices).map(([country, data]: [string, any]) => (
                    <div key={country} className="bg-black/40 p-2 rounded-lg border border-zinc-800/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Globe className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-bold text-zinc-400">{country}</span>
                      </div>
                      <p className="text-sm font-black text-white">{data.symbol}{data.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Included Benefits</p>
              {plan.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-blue-500" />
                  </div>
                  <span className="text-zinc-400 text-xs font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Methods Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-black tracking-tight">Payment Methods</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(paymentMethods).map(([key, method]: [string, PaymentMethod]) => (
            <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 group relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button 
                  onClick={() => setEditingMethod({ key, method })}
                  className="p-2 bg-zinc-800 hover:bg-blue-600 text-zinc-400 hover:text-white rounded-xl transition-all shadow-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 font-black">
                  {key}
                </div>
                <div>
                  <h4 className="font-black text-lg">{method.method}</h4>
                  <p className="text-zinc-500 text-xs">{method.name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-black/40 p-3 rounded-xl border border-zinc-800/50">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Details</p>
                  <p className="text-sm font-mono text-blue-400">{method.details}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-xl border border-zinc-800/50">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Instructions</p>
                  <p className="text-xs text-zinc-400 italic">{method.instruction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Plan Modal */}
      <AnimatePresence>
        {editingPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Edit Plan: {editingPlan.name}</h2>
                <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-zinc-800 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Plan Name</label>
                    <input 
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Description</label>
                    <input 
                      type="text"
                      value={editingPlan.description}
                      onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
                >
                  {isSaving ? <Zap className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes Locally
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Payment Method Modal */}
      <AnimatePresence>
        {editingMethod && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Edit Method: {editingMethod.key}</h2>
                <button onClick={() => setEditingMethod(null)} className="p-2 hover:bg-zinc-800 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Method Name</label>
                  <input 
                    type="text"
                    value={editingMethod.method.method}
                    onChange={(e) => setEditingMethod({ ...editingMethod, method: { ...editingMethod.method, method: e.target.value } })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Account Name</label>
                  <input 
                    type="text"
                    value={editingMethod.method.name}
                    onChange={(e) => setEditingMethod({ ...editingMethod, method: { ...editingMethod.method, name: e.target.value } })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Details (Number/ID)</label>
                  <input 
                    type="text"
                    value={editingMethod.method.details}
                    onChange={(e) => setEditingMethod({ ...editingMethod, method: { ...editingMethod.method, details: e.target.value } })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Instructions</label>
                  <textarea 
                    value={editingMethod.method.instruction}
                    onChange={(e) => setEditingMethod({ ...editingMethod, method: { ...editingMethod.method, instruction: e.target.value } })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-none"
                  />
                </div>

                <button 
                  onClick={handleSaveMethod}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
                >
                  {isSaving ? <Zap className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes Locally
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Crown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);
