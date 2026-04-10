import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Save, 
  Shield, 
  Bell, 
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbSaving, setDbSaving] = useState(false);
  const [dbConfig, setDbConfig] = useState({
    host: '',
    user: '',
    password: '',
    database: '',
    port: 3306
  });
  const [config, setConfig] = useState({
    botToken: '',
    chatId: '',
    telegramSupport: '',
    whatsappSupport: '',
    botName: 'SahidAnime Assistant',
    systemPrompt: 'You are SahidAnime AI Assistant...',
    VITE_SUPABASE_ANON_KEY: '',
    GEMINI_API_KEY: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settingsRes, dbRes] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/admin/db-config')
        ]);
        
        const data = settingsRes.data;
        setConfig(prev => ({
          ...prev,
          botToken: data.botToken || '',
          chatId: data.chatId || '',
          telegramSupport: data.telegramSupport || '',
          whatsappSupport: data.whatsappSupport || '',
          botName: data.botName || 'SahidAnime Assistant',
          systemPrompt: data.systemPrompt || 'You are SahidAnime AI Assistant...',
          VITE_SUPABASE_ANON_KEY: data.VITE_SUPABASE_ANON_KEY || '',
          GEMINI_API_KEY: data.GEMINI_API_KEY || ''
        }));

        if (dbRes.data) {
          setDbConfig(dbRes.data);
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/settings', config);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDbSave = async () => {
    if (!window.confirm('WARNING: Changing database settings will disconnect the current DB and attempt to connect to the new one. If the new credentials are wrong, the website will stop working. Continue?')) return;
    
    setDbSaving(true);
    try {
      await api.post('/admin/db-config', dbConfig);
      toast.success("Database configuration updated and reconnected!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update database config");
    } finally {
      setDbSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight">Platform Settings</h1>
        <p className="text-zinc-500">Manage global configuration and integrations</p>
      </div>

      <div className="grid gap-8">
        {/* Telegram Integration Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Telegram Notifications</h2>
                <p className="text-sm text-zinc-500">Receive real-time alerts for transactions</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Bot Token</label>
              <input 
                type="password"
                value={config.botToken}
                onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Chat ID</label>
              <input 
                type="text"
                value={config.chatId}
                onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Support Links Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Support Links</h2>
                <p className="text-sm text-zinc-500">Configure Telegram and WhatsApp support links</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Telegram Link</label>
              <input 
                type="text"
                value={config.telegramSupport}
                onChange={(e) => setConfig({ ...config, telegramSupport: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp Link</label>
              <input 
                type="text"
                value={config.whatsappSupport}
                onChange={(e) => setConfig({ ...config, whatsappSupport: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-green-500 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* AI Agent Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Agent Config</h2>
                <p className="text-sm text-zinc-500">Customize the behavior of your AI assistant</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Bot Name</label>
              <input 
                type="text"
                value={config.botName}
                onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">System Prompt</label>
              <textarea 
                value={config.systemPrompt}
                onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Supabase Anon Key (AI Proxy)</label>
              <input 
                type="password"
                value={config.VITE_SUPABASE_ANON_KEY}
                onChange={(e) => setConfig({ ...config, VITE_SUPABASE_ANON_KEY: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 transition-all"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Gemini API Key (For TTS/Voice)</label>
              <input 
                type="password"
                value={config.GEMINI_API_KEY}
                onChange={(e) => setConfig({ ...config, GEMINI_API_KEY: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-purple-500 transition-all"
                placeholder="AIzaSy..."
              />
              <p className="text-[10px] text-zinc-500 ml-1">Leave empty to use server default. Only needed if Voice/TTS fails.</p>
            </div>
          </div>
        </motion.div>

        {/* Database Configuration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Database Configuration</h2>
                <p className="text-sm text-zinc-500">Manage Remote MySQL Connection (DANGEROUS)</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Host</label>
              <input 
                type="text"
                value={dbConfig.host}
                onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Database Name</label>
              <input 
                type="text"
                value={dbConfig.database}
                onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Username</label>
              <input 
                type="text"
                value={dbConfig.user}
                onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Password</label>
              <input 
                type="password"
                value={dbConfig.password}
                onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Port</label>
              <input 
                type="number"
                value={dbConfig.port}
                onChange={(e) => setDbConfig({ ...dbConfig, port: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleDbSave}
            disabled={dbSaving}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-red-600/20"
          >
            {dbSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Database & Reconnect</>}
          </button>
        </motion.div>

        {/* Global Save Button */}
        <div className="sticky bottom-6 z-20">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xl shadow-white/10"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save All Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};
