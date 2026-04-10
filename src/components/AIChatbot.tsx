import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, ExternalLink, Trash2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { usePlans } from '../hooks/usePlans';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { analyzeImage, generateSpeech, chatWithAI, ChatMessage } from '../services/aiService';
import { useAnime } from '../context/AnimeContext';
import { toast } from 'react-hot-toast';

interface ChatbotConfig {
  enabled: boolean;
  botName: string;
  systemPrompt: string;
}

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export const AIChatbot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { animes } = useAnime();
  const { plans, paymentMethods, paymentProviders, loading: plansLoading } = usePlans();
  const [config, setConfig] = useState<ChatbotConfig>({
    enabled: true,
    botName: 'SahidAnime Assistant',
    systemPrompt: 'You are the official SahidAnime Assistant. Reply in "Hinglish" style (Indian Hindi-English mix). Be friendly, helpful, and act like you have the authority to guide users through any issue.'
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [aiHistory, setAiHistory] = useState<ChatMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messages.length === 0) {
      let initialMessage = `Assalamu alaikum! Main aapka ${config.botName} hoon. Aaj main aapki kaise help kar sakta hoon?`;
      setMessages([{ role: 'bot', content: initialMessage }]);
    }
  }, [config, messages.length]);

  useEffect(() => {
    if (!plansLoading) {
      setAiHistory([
        {
          role: 'system',
          content: `
            ${config.systemPrompt}
            
            Current Dynamic Data:
            - Current Page: ${location.pathname}
            - Plans: ${JSON.stringify(plans)}
            - Payment Methods: ${JSON.stringify(paymentMethods)}
            - Payment Providers: ${JSON.stringify(paymentProviders)}
            - User Status: ${user?.subscription_status || 'free'}
            
            Instructions for Payments:
            If the user asks how to pay, list the available payment providers for their currency.
            ALWAYS prioritize INR (₹) for Indian users.
            
            Available Providers: ${paymentProviders.filter(p => p.enabled).map(p => `${p.name} (${p.currency}): ${p.upiId} - Recipient: ${p.recipientName}`).join(' | ')}
            
            Always be helpful and guide them to complete the payment.
          `
        }
      ]);
    }
  }, [plans, paymentMethods, plansLoading, config, user, location.pathname]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSpeak = async (text: string, index: number) => {
    if (isSpeaking === index) {
      audioRef.current?.pause();
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(index);
    try {
      const audioUrl = await generateSpeech(text);
      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          audioRef.current.onended = () => setIsSpeaking(null);
        } else {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.play();
          audio.onended = () => setIsSpeaking(null);
        }
      } else {
        setIsSpeaking(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(null);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      if (isLiveMode) {
        setTimeout(() => {
          handleSubmit({ preventDefault: () => {} } as any, transcript);
        }, 500);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image size should be less than 5MB');
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setMessages(prev => [...prev, { role: 'user', content: "Sent an image for analysis." }]);
      setIsAnalyzing(true);

      try {
        const premiumPlans = plans.filter(p => p.id !== 'free');
        const countryCode = user?.country || 'IN';
        const planDetails = `Available Plans: ${premiumPlans.map(p => `${p.name}: ${p.prices[countryCode]?.symbol || '₹'}${p.prices[countryCode]?.amount || 0}`).join(", ")}`;
        const validRecipients = paymentProviders.filter(p => p.enabled).map(p => p.recipientName);

        const aiResponse = await analyzeImage(base64String, planDetails, validRecipients);
        let aiResult;
        try {
          const jsonStr = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
          aiResult = JSON.parse(jsonStr);
        } catch (e) {
          aiResult = { type: 'GENERAL', generalInfo: { description: "AI could not parse JSON.", reaction: aiResponse } };
        }

        if (aiResult.type === 'PAYMENT') {
          const pInfo = aiResult.paymentInfo;
          if (pInfo.status === 'APPROVED') {
            setMessages(prev => [...prev, { 
              role: 'bot', 
              content: `✅ **Payment Verified!** (Local Mode)\n\nAapka payment verify ho gaya hai. Local mode mein coupon generate nahi ho sakta, par aapka support message admin ko mil jayega.` 
            }]);
          } else {
            setMessages(prev => [...prev, { 
              role: 'bot', 
              content: `❌ **Verification Failed**\n\nReason: ${pInfo.reason || 'Invalid screenshot'}.` 
            }]);
          }
        } else {
          const gInfo = aiResult.generalInfo;
          setMessages(prev => [...prev, { 
            role: 'bot', 
            content: `📸 **Image Analysis:**\n\n${gInfo.description}\n\n${gInfo.reaction}` 
          }]);
        }
      } catch (error: any) {
        setMessages(prev => [...prev, { role: 'bot', content: "Error analyzing image: " + error.message }]);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const messageToSend = overrideInput || input.trim();
    if (!messageToSend || isLoading || isAnalyzing) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    try {
      const newHistory: ChatMessage[] = [
        ...aiHistory,
        { role: 'user', content: messageToSend }
      ];

      const response = await chatWithAI(newHistory);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
      setAiHistory([...newHistory, { role: 'assistant', content: response }]);

      if (autoSpeak || isLiveMode) {
        handleSpeak(response, messages.length + 1);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="w-full sm:w-[450px] h-[85vh] sm:h-[600px] bg-zinc-950 border border-zinc-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[100]"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-2xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">{config.botName}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={cn("p-2 rounded-xl transition-all", isLiveMode ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400")}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400")}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn("p-3 rounded-2xl text-sm leading-relaxed", msg.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none")}>
              {msg.role === 'bot' ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown> : msg.content}
            </div>
          </div>
        ))}
        {(isLoading || isAnalyzing) && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-xs text-zinc-500 font-medium">{isAnalyzing ? "Analyzing image..." : "Thinking..."}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all text-zinc-200"
          />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-zinc-800 text-zinc-400 rounded-2xl hover:bg-zinc-700 transition-all">
            <Sparkles className="w-4 h-4" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <button type="submit" disabled={!input.trim() || isLoading} className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};
