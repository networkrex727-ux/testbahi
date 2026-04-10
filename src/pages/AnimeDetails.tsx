import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAnime } from '../context/AnimeContext';
import { Play, Lock, Crown, Info, List, Star, Share2, Plus, X, Globe, CreditCard, Loader2, Zap, ArrowRight, Upload, Heart, MessageCircle, Send, Trash2 as TrashIcon, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import { Anime, Episode } from '../data/animeData';

export const AnimeDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { animes, loading: animeLoading } = useAnime();
  const { theme } = useTheme();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const isPremium = user?.subscription_status === 'active' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (selectedEpisode && !canWatch(selectedEpisode)) {
      setSelectedEpisode(null);
      setShowPlayer(false);
      if (selectedEpisode.accessType === 'premium') {
        setShowPremiumModal(true);
      }
    }
  }, [user, selectedEpisode]);

  useEffect(() => {
    if (!id || animeLoading) return;

    const foundAnime = animes.find(a => a.id === id);
    if (foundAnime) {
      setAnime(foundAnime);
      setEpisodes(foundAnime.episodes.sort((a, b) => b.order - a.order));
      // Fetch likes and comments from API
      fetchEngagementData(id);
    }
    setLoading(false);
  }, [id, animes, animeLoading]);

  const fetchEngagementData = async (animeId: string) => {
    try {
      const response = await api.get(`/anime/${animeId}/engagement`);
      setLikesCount(response.data.likesCount);
      setIsLiked(response.data.isLiked);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Failed to fetch engagement data:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error('Please login to like');
    try {
      const response = await api.post(`/anime/${id}/like`);
      setIsLiked(response.data.isLiked);
      setLikesCount(prev => response.data.isLiked ? prev + 1 : prev - 1);
    } catch (error) {
      toast.error('Failed to like');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to comment');
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      const response = await api.post(`/anime/${id}/comment`, { text: newComment.trim() });
      setComments([response.data, ...comments]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comment/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const canWatch = (episode: Episode) => {
    if (!episode) return false;
    if (user?.role === 'admin') return true;
    if (episode.accessType === 'free') return true;
    if (episode.accessType === 'premium' && user?.subscription_status === 'active') return true;
    return false;
  };

  const handleEpisodeSelect = (ep: Episode) => {
    if (canWatch(ep)) {
      setSelectedEpisode(ep);
      setShowPlayer(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ep.accessType === 'premium') {
      setShowPremiumModal(true);
    } else {
      toast.error('This episode is currently locked');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: anime?.title || 'SahidAnime',
      text: `Watch ${anime?.title} - Episode ${selectedEpisode?.order || ''} on SahidAnime!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    if (!selectedEpisode?.downloadUrl) {
      toast.error('Download link not available for this episode');
      return;
    }
    window.open(selectedEpisode.downloadUrl, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="bg-zinc-900 lg:rounded-2xl overflow-hidden shadow-2xl border-b lg:border border-zinc-800 relative">
        {selectedEpisode ? (
          <div className="aspect-video relative">
            {isAdmin && (
              <div className="absolute top-4 left-4 z-20 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                <Zap className="w-3 h-3 fill-current" /> Admin Access
              </div>
            )}
            <VideoPlayer 
              key={selectedEpisode.id}
              src={selectedEpisode.videoUrl} 
              title={`${anime?.title} - Episode ${selectedEpisode.order}`} 
            />
          </div>
        ) : (
          <div className="relative aspect-video">
            <img 
              src={anime?.posterUrl} 
              alt={anime?.title}
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter">{anime?.title}</h1>
              <p className="text-zinc-400 text-sm max-w-xl line-clamp-2">{anime?.description}</p>
              {episodes.length > 0 && (
                <button 
                  onClick={() => handleEpisodeSelect(episodes[0])}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Start Watching
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{anime?.title}</h2>
                <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-1 text-blue-500">
                    <Star className="w-3.5 h-3.5 fill-current" /> 9.8 Rating
                  </span>
                  <span>•</span>
                  <span>{anime?.genre}</span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 bg-blue-600/10 text-blue-500 rounded-md text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                    Fan Dub
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-bold text-sm",
                    isLiked 
                      ? "bg-red-600/10 border-red-500/50 text-red-500" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                  {likesCount > 0 && <span>{likesCount}</span>}
                </button>
                <button className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {selectedEpisode?.downloadUrl && (
                  <button 
                    onClick={() => {
                      if (!isPremium) {
                        setShowPremiumModal(true);
                        toast.error('Premium subscription required to download');
                        return;
                      }
                      handleDownload();
                    }}
                    className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-green-600/20 overflow-hidden"
                  >
                    <div className="absolute -top-1 -right-1 bg-white text-green-600 px-2 py-0.5 rounded-bl-lg text-[8px] font-black tracking-tighter uppercase shadow-sm z-10">
                      {isPremium ? '4K Ultra' : <Lock className="w-2 h-2" />}
                    </div>
                    <div className="relative">
                      {isPremium ? (
                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                      ) : (
                        <Crown className="w-5 h-5 text-yellow-400" />
                      )}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] text-green-100 font-bold uppercase tracking-widest mb-0.5">
                        {isPremium ? 'Direct Link' : 'Premium Only'}
                      </span>
                      <span>{isPremium ? 'Download Now' : 'Unlock Download'}</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-2xl border transition-colors",
              theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            )}>
              <h3 className={cn(
                "text-sm font-bold mb-2",
                theme === 'dark' ? "text-zinc-400" : "text-zinc-500"
              )}>Description</h3>
              <p className={cn(
                "text-sm leading-relaxed",
                theme === 'dark' ? "text-zinc-300" : "text-zinc-700"
              )}>
                {anime?.description}
              </p>
            </div>

            {selectedEpisode && (
              <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    Comments ({comments.length})
                  </h3>
                </div>

                <form onSubmit={handleAddComment} className="relative">
                  <input
                    type="text"
                    placeholder={user ? "Add a public comment..." : "Login to comment"}
                    disabled={!user || isCommenting}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-blue-500 transition-all text-sm"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!user || isCommenting || !newComment.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
                  >
                    {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 group">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden">
                        {comment.userPhoto ? (
                          <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                            {comment.userName?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-zinc-200">{comment.userName}</span>
                            <span className="text-[10px] text-zinc-500">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {(user?.id === comment.userId || user?.role === 'admin') && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-10 text-zinc-500 text-sm">
                      No comments yet. Be the first to share your thoughts!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <List className="w-4 h-4 text-blue-500" />
              Episodes
            </h3>
            <span className="text-xs text-zinc-500">{episodes.length} Total</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => handleEpisodeSelect(ep)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                  selectedEpisode?.id === ep.id 
                    ? "bg-blue-600/10 border-blue-500/50" 
                    : theme === 'dark'
                      ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
                )}
              >
                <div className={cn(
                  "w-10 h-10 shrink-0 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform",
                  theme === 'dark' ? "bg-zinc-800" : "bg-zinc-200"
                )}>
                  {selectedEpisode?.id === ep.id ? (
                    <Play className="w-4 h-4 text-blue-500 fill-current" />
                  ) : (
                    <span className="text-zinc-500 font-bold text-xs">{ep.order}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-bold text-xs truncate",
                    selectedEpisode?.id === ep.id 
                      ? "text-blue-500" 
                      : theme === 'dark' ? "text-zinc-200" : "text-zinc-900"
                  )}>
                    {ep.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {ep.accessType === 'premium' && (
                      <span className="flex items-center gap-1 text-[8px] font-bold text-yellow-500 uppercase">
                        <Crown className="w-2.5 h-2.5" /> Premium
                      </span>
                    )}
                    {ep.accessType === 'free' && (
                      <span className="text-[8px] font-bold text-green-500 uppercase">Free</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showPremiumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-10 w-full max-w-md text-center space-y-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full" />
            
            <button 
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                <Crown className="w-10 h-10 text-blue-500" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white">Unlock Premium</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Premium content dekhne ke liye aapko subscription chahiye. 
                  Aap **Chatbot** se plan select karke payment verify kar sakte hain.
                </p>
              </div>

              <button 
                onClick={() => {
                  setShowPremiumModal(false);
                  window.dispatchEvent(new CustomEvent('open-chatbot', { 
                    detail: { message: 'I need a plan' } 
                  }));
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-blue-600/20"
              >
                Get Premium via Chatbot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
