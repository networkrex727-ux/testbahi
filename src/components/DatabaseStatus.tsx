import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, ExternalLink, Settings, Save, Loader2, X } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export const DatabaseStatus: React.FC = () => {
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [clientIp, setClientIp] = useState<string>('');
  const [serverIp, setServerIp] = useState<string>('');
  const [showSetup, setShowSetup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dbConfig, setDbConfig] = useState({
    host: '',
    user: '',
    password: '',
    database: '',
    port: 3306
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/health');
        setDbConnected(response.data.dbConnected);
        setClientIp(response.data.clientIp);
        setServerIp(response.data.serverIp);
      } catch (error) {
        setDbConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    
    setSaving(true);
    try {
      const response = await api.post('/api/public/db-config', dbConfig);
      if (response.data.success) {
        toast.success("Database connected successfully!");
        setDbConnected(true);
        setShowSetup(false);
        // Small delay before reload to let user see success
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(response.data.error || "Unknown error occurred");
      }
    } catch (error: any) {
      console.error('Setup failed:', error);
      const message = error.response?.data?.error || error.message || "Failed to connect to database";
      toast.error(message, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  if (dbConnected === true || dbConnected === null) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white px-4 py-2 flex items-center justify-between gap-4 text-sm font-bold shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span>CRITICAL: Database Connection Not Established</span>
          </div>
          <div className="hidden lg:flex items-center gap-4 opacity-90 border-l border-white/20 pl-4">
            <div className="flex items-center gap-2">
              <span>Whitelist this SERVER IP in cPanel:</span>
              <code className="bg-black/20 px-2 py-0.5 rounded font-mono text-yellow-400">{serverIp || 'Detecting...'}</code>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSetup(true)}
            className="bg-white text-red-600 px-4 py-1.5 rounded-xl flex items-center gap-2 hover:bg-zinc-100 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4" />
            SETUP DATABASE
          </button>
          <a 
            href="https://cpanel.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 underline hover:no-underline opacity-80"
          >
            Open cPanel <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight">Database Setup</h2>
                  <p className="text-zinc-500 text-sm">Enter your Remote MySQL details</p>
                  <div className="mt-2 text-[10px] bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-red-400 font-bold">
                    TIP: cPanel mein Remote MySQL whitelist karein using this IP: <span className="text-white font-mono">{serverIp}</span>
                  </div>
                </div>
                <button onClick={() => setShowSetup(false)} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSetupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Host</label>
                  <input 
                    required
                    type="text"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all text-white"
                    placeholder="e.g. 51.195.40.96"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Database</label>
                    <input 
                      required
                      type="text"
                      value={dbConfig.database}
                      onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Port</label>
                    <input 
                      required
                      type="number"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig({ ...dbConfig, port: parseInt(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Username</label>
                  <input 
                    required
                    type="text"
                    value={dbConfig.user}
                    onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</label>
                  <input 
                    required
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-red-600/20 mt-4"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> CONNECT DATABASE</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
