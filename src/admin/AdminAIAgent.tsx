import React, { useState } from 'react';
import { Bot, Send, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronDown, List, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { useAnime } from '../context/AnimeContext';
import { chatWithAI } from '../services/aiService';
import api from '../services/api';

export const AdminAIAgent: React.FC = () => {
  const { animes, refreshAnimes } = useAnime();
  const [selectedAnimeId, setSelectedAnimeId] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!selectedAnimeId) {
      toast.error("Please select an anime first!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const selectedAnime = animes.find(a => a.id === selectedAnimeId);
      const prompt = `
        You are an expert data extractor for an anime streaming site.
        The user wants to add episodes to the anime: "${selectedAnime?.title}".
        
        User Input:
        "${input}"
        
        Extract all episodes mentioned. For each episode, find:
        1. Title (e.g., "Episode 1", "The Beginning")
        2. Video URL (The link provided. Look for patterns like http://, https://, or embed links. Specifically handle Dailymotion and Anime DD links)
        3. Order (The episode number. If not explicitly mentioned, infer it from the sequence)
        
        CRITICAL: 
        - Auto-convert "Anime DD" and "Dailymotion" links into their proper embed or direct formats if possible.
        - If multiple links are provided for the same episode, pick the best one.
        - If a link is just a number or text without a protocol, ignore it unless it's clearly a URL.
        - Respond ONLY with a JSON array of objects. No conversational text.
        
        Format:
        [
          { "title": "string", "videoUrl": "string", "order": number }
        ]
        
        If no episodes are found, return an empty array [].
      `;

      const aiResponse = await chatWithAI([{ role: 'user', content: prompt }]);
      
      let episodesToAdd = [];
      try {
        // More robust JSON extraction using regex
        const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
          episodesToAdd = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback to cleaning markdown
          const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
          episodesToAdd = JSON.parse(jsonStr);
        }
      } catch (e) {
        console.error("Failed to parse AI response:", aiResponse);
        throw new Error("AI returned invalid data format. Please try again with clearer links.");
      }

      if (episodesToAdd.length === 0) {
        throw new Error("No episodes could be extracted from your input.");
      }

      // Add episodes one by one
      let addedCount = 0;
      for (const ep of episodesToAdd) {
        try {
          await api.post('/admin/episodes', {
            animeId: selectedAnimeId,
            title: ep.title,
            videoUrl: ep.videoUrl,
            accessType: 'free',
            order: ep.order
          });
          addedCount++;
        } catch (err) {
          console.error(`Failed to add episode ${ep.order}:`, err);
        }
      }

      await refreshAnimes();
      setResult({ 
        success: true, 
        animeTitle: selectedAnime?.title,
        added: addedCount,
        total: episodesToAdd.length
      });
      toast.success(`AI Agent successfully added ${addedCount} episodes!`);
    } catch (error: any) {
      console.error("AI Agent Error:", error);
      toast.error(error.message || "AI Agent failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-blue-500" />
          AI Admin Agent
        </h1>
        <p className="text-zinc-500">Real-time AI Mode: AI actions are permanent and affect the database</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
        <form onSubmit={handleAISubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 ml-1">Select Anime</label>
            <select 
              value={selectedAnimeId}
              onChange={(e) => setSelectedAnimeId(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
            >
              <option value="">-- Choose an Anime --</option>
              {animes.map(anime => (
                <option key={anime.id} value={anime.id}>{anime.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-500 ml-1">Paste Links & Instructions</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: Add episodes 1 to 5 with these links: 
1. https://link1.com
2. https://link2.com..."
              className="w-full h-48 bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-white"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !input.trim() || !selectedAnimeId}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Process & Add to Database</>}
          </button>
        </form>

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-bold">Successfully Processed!</p>
                <p className="text-sm opacity-80">Anime: {result.animeTitle}</p>
                <p className="text-sm opacity-80">Added {result.added} out of {result.total} episodes found.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
