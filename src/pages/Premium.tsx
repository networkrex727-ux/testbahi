import React, { useState } from 'react';
import { usePlans } from '../hooks/usePlans';
import { 
  Check, 
  Zap, 
  Star, 
  Crown, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard, 
  Upload, 
  Loader2,
  AlertCircle,
  Copy,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export const Premium: React.FC = () => {
  const { plans, paymentMethods, loading } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    utr: '',
    screenshotUrl: ''
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    if (!formData.utr.trim() || !formData.screenshotUrl.trim()) {
      return toast.error('Please fill all fields');
    }

    setIsSubmitting(true);
    try {
      await api.post('/user/request-subscription', {
        planId: selectedPlan.id,
        amount: selectedPlan.prices['India']?.amount || 0,
        utr: formData.utr,
        screenshotUrl: formData.screenshotUrl
      });
      toast.success('Request submitted! Admin will verify soon.');
      setSelectedPlan(null);
      setFormData({ utr: '', screenshotUrl: '' });
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-black uppercase tracking-widest"
        >
          <Zap className="w-4 h-4" />
          Upgrade Your Experience
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
          Choose Your <span className="text-blue-500">Plan</span>
        </h1>
        <p className="text-zinc-500 text-lg">
          Unlock premium features, ad-free streaming, and exclusive content.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 flex flex-col space-y-8 relative group transition-all duration-500 hover:border-blue-500/30",
              plan.id === 'vip' && "border-blue-500/50 shadow-2xl shadow-blue-600/10"
            )}
          >
            {plan.id === 'vip' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xl">
                Most Popular
              </div>
            )}

            <div className="space-y-4">
              <div className={cn(
                "w-16 h-16 rounded-[2rem] flex items-center justify-center",
                plan.id === 'vip' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
              )}>
                {plan.id === 'vip' ? <Crown className="w-8 h-8" /> : <Star className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-3xl font-black">{plan.name}</h3>
                <p className="text-zinc-500 text-sm mt-1">{plan.description}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">₹{plan.prices['India']?.amount}</span>
              <span className="text-zinc-500 text-sm font-bold">/{plan.prices['India']?.duration}</span>
            </div>

            <div className="space-y-4 flex-1">
              {plan.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-blue-500" />
                  </div>
                  <span className="text-zinc-400 text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedPlan(plan)}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95",
                plan.id === 'vip' ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-800 text-white hover:bg-zinc-700"
              )}
            >
              Select Plan
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 md:p-12 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-8 right-8 p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <XCircle className="w-8 h-8 text-zinc-500" />
              </button>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Left Side: Instructions */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black">Complete Payment</h2>
                    <p className="text-zinc-500">Follow the steps below to upgrade to <span className="text-blue-500 font-bold">{selectedPlan.name}</span></p>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(paymentMethods).map(([key, method]: [string, any]) => (
                      <div key={key} className="bg-black/40 border border-zinc-800 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 font-black">
                              {key}
                            </div>
                            <div>
                              <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">{method.method}</p>
                              <p className="font-bold">{method.name}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleCopy(method.details)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4 text-zinc-500" />
                          </button>
                        </div>
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 font-mono text-blue-400 text-center text-lg font-bold">
                          {method.details}
                        </div>
                        <p className="text-[10px] text-zinc-500 italic text-center">
                          {method.instruction}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex gap-4">
                    <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Pay exactly <span className="text-white font-bold">₹{selectedPlan.prices['India']?.amount}</span>. 
                      After payment, paste your UTR/Transaction ID and upload the screenshot.
                    </p>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="bg-black/40 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">UTR / Transaction ID</label>
                      <input 
                        type="text"
                        value={formData.utr}
                        onChange={(e) => setFormData({ ...formData, utr: e.target.value })}
                        placeholder="Enter 12-digit UTR number"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Screenshot URL</label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={formData.screenshotUrl}
                          onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
                          placeholder="Paste image link from PostImages/Imgur"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500 transition-all"
                        />
                        <Upload className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-2">
                        Upload your screenshot to <a href="https://postimages.org" target="_blank" className="text-blue-500 hover:underline">PostImages</a> and paste the direct link here.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.utr || !formData.screenshotUrl}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/10"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Submit for Verification</>}
                  </button>

                  <div className="text-center">
                    <p className="text-[10px] text-zinc-500">
                      Verification usually takes 30-60 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
