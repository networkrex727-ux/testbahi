import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { AIChatbot } from './AIChatbot';

interface SupportConfig {
  telegram: string;
  whatsapp: string;
  enabled: boolean;
}

interface ChatbotConfig {
  enabled: boolean;
  botName: string;
  systemPrompt: string;
}

export const FloatingSupport: React.FC = () => {
  const [config, setConfig] = useState<SupportConfig>({
    telegram: 'https://t.me/SahidAnime',
    whatsapp: '',
    enabled: true
  });
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>({
    enabled: true,
    botName: 'SahidAnime Assistant',
    systemPrompt: 'You are a helpful assistant.'
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsChatOpen(true);
      setIsOpen(false);
    };

    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

  if (!config.enabled) return null;

  const hasWhatsapp = !!config.whatsapp;
  const isChatbotEnabled = chatbotConfig.enabled;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isChatOpen && (
          <AIChatbot onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isChatOpen && (
          <div className="flex flex-col gap-3 mb-2">
            {hasWhatsapp && (
              <motion.a
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                href={config.whatsapp.startsWith('http') ? config.whatsapp : `https://wa.me/${config.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                title="WhatsApp Support"
              >
                <MessageSquare className="w-7 h-7" />
              </motion.a>
            )}
            {isChatbotEnabled && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: 0.05 }}
                onClick={() => {
                  setIsChatOpen(true);
                  setIsOpen(false);
                }}
                className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                title="AI Chatbot"
              >
                <Bot className="w-7 h-7" />
              </motion.button>
            )}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          if (isChatOpen) {
            setIsChatOpen(false);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90",
          (isOpen || isChatOpen) ? "bg-zinc-800 text-white rotate-90" : "bg-blue-600 text-white"
        )}
      >
        {(isOpen || isChatOpen) ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </button>
    </div>
  );
};
