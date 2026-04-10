import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, ExternalLink } from 'lucide-react';
import api from '../services/api';

export const DatabaseStatus: React.FC = () => {
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [ip, setIp] = useState<string>('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/health');
        setDbConnected(response.data.dbConnected);
        setIp(response.data.ip);
      } catch (error) {
        setDbConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (dbConnected === true || dbConnected === null) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-4 text-sm font-bold animate-pulse">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5" />
        <span>CRITICAL: Database Connection Not Established</span>
      </div>
      <div className="hidden md:flex flex-col items-start gap-1 opacity-90">
        <div className="flex items-center gap-2">
          <span>Whitelist this IP in cPanel:</span>
          <code className="bg-black/20 px-2 py-0.5 rounded font-mono">{ip || 'Detecting...'}</code>
        </div>
        <span className="text-[10px] opacity-75">Tip: Add <code className="bg-black/20 px-1 rounded">%</code> in cPanel Remote MySQL for a permanent fix.</span>
      </div>
      <a 
        href="https://cpanel.net" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1 underline hover:no-underline"
      >
        Open cPanel <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
