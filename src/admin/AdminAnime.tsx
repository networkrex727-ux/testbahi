import React, { useState, useEffect } from 'react';
import { useAnime } from '../context/AnimeContext';
import { Plus, Trash2, Edit2, Upload, Loader2, Film, ListPlus, X, Check, ChevronRight, ArrowLeft, List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { Anime, Episode } from '../data/animeData';
import api from '../services/api';

export const AdminAnime: React.FC = () => {
  const { animes: initialAnimes, loading: animeLoading, refreshAnimes } = useAnime();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [showEpisodeManager, setShowEpisodeManager] = useState(false);
  const [editingAnimeId, setEditingAnimeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    posterUrl: '',
    rating: '0.0',
    status: 'Ongoing',
    type: 'TV Series',
    releaseYear: new Date().getFullYear().toString()
  });

  useEffect(() => {
    if (!animeLoading) {
      setAnimes(initialAnimes);
    }
  }, [initialAnimes, animeLoading]);

  const handleAddAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/anime', {
        id: editingAnimeId,
        ...formData
      });
      
      await refreshAnimes();
      toast.success(editingAnimeId ? 'Anime updated successfully' : 'Anime added successfully');
      setShowAddModal(false);
      setEditingAnimeId(null);
      setFormData({
        title: '',
        description: '',
        genre: '',
        posterUrl: '',
        rating: '0.0',
        status: 'Ongoing',
        type: 'TV Series',
        releaseYear: new Date().getFullYear().toString()
      });
    } catch (error) {
      console.error('Failed to save anime:', error);
      toast.error('Failed to save anime');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnime = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this anime?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/admin/anime/${id}`);
      await refreshAnimes();
      toast.success('Anime deleted successfully');
    } catch (error) {
      console.error('Failed to delete anime:', error);
      toast.error('Failed to delete anime');
    } finally {
      setLoading(false);
    }
  };

  const openEditAnime = (anime: Anime) => {
    setFormData({
      title: anime.title,
      description: anime.description,
      genre: anime.genre,
      posterUrl: anime.posterUrl,
      rating: anime.rating || '0.0',
      status: anime.status || 'Ongoing',
      type: anime.type || 'TV Series',
      releaseYear: anime.releaseYear || '2024'
    });
    setEditingAnimeId(anime.id);
    setShowAddModal(true);
  };

  if (showEpisodeManager && selectedAnime) {
    return (
      <EpisodeManager 
        anime={selectedAnime} 
        onBack={() => {
          setShowEpisodeManager(false);
          setSelectedAnime(null);
          refreshAnimes();
        }} 
      />
    );
  }

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Manage Anime</h1>
          <p className="text-zinc-500">Real-time Database Mode: Changes are permanent</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" /> Add New Anime
        </button>
      </div>

      {animeLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animes.map((anime) => (
            <div key={anime.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={anime.posterUrl} 
                  alt={anime.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm truncate">{anime.title}</h3>
                  <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 shrink-0">{anime.genre}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      setSelectedAnime(anime);
                      setShowEpisodeManager(true);
                    }}
                    className="flex-1 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <List className="w-3 h-3" /> Manage Eps
                  </button>
                  <button 
                    onClick={() => openEditAnime(anime)}
                    className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAnime(anime.id)}
                    className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-xl space-y-6 shadow-2xl relative">
            <button 
              onClick={() => {
                setShowAddModal(false);
                setEditingAnimeId(null);
                setFormData({ title: '', description: '', genre: '', posterUrl: '', rating: '0.0', status: 'Ongoing', type: 'TV Series', releaseYear: '2024' });
              }} 
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Film className="w-6 h-6 text-blue-500" />
              {editingAnimeId ? 'Edit Anime' : 'Add New Anime'}
            </h2>
            <form onSubmit={handleAddAnime} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Anime Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Description</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Genre</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Poster URL</label>
                <input 
                  type="url" 
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                />
              </div>
              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Save Anime'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface EpisodeManagerProps {
  anime: Anime;
  onBack: () => void;
}

const EpisodeManager: React.FC<EpisodeManagerProps> = ({ anime, onBack }) => {
  const [episodes, setEpisodes] = useState<Episode[]>(anime.episodes || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    downloadUrl: '',
    accessType: 'free' as 'free' | 'premium',
    order: (episodes.length + 1).toString()
  });

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/episodes', {
        id: editingEpisodeId,
        animeId: anime.id,
        ...formData,
        order: parseInt(formData.order)
      });
      
      // Refresh local episodes
      const response = await api.get('/anime');
      const updatedAnime = response.data.find((a: any) => a.id === anime.id);
      if (updatedAnime) {
        setEpisodes(updatedAnime.episodes.sort((a: any, b: any) => a.order - b.order));
      }

      toast.success(editingEpisodeId ? 'Episode updated successfully' : 'Episode added successfully');
      setShowAddModal(false);
      setEditingEpisodeId(null);
      setFormData({
        title: '',
        videoUrl: '',
        downloadUrl: '',
        accessType: 'free',
        order: (episodes.length + 2).toString()
      });
    } catch (error) {
      console.error('Failed to save episode:', error);
      toast.error('Failed to save episode');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!window.confirm('Delete this episode?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/admin/episodes/${id}`);
      setEpisodes(episodes.filter(e => e.id !== id));
      toast.success('Episode deleted successfully');
    } catch (error) {
      console.error('Failed to delete episode:', error);
      toast.error('Failed to delete episode');
    } finally {
      setLoading(false);
    }
  };

  const openEditEpisode = (ep: Episode) => {
    setFormData({
      title: ep.title,
      videoUrl: ep.videoUrl,
      downloadUrl: ep.downloadUrl || '',
      accessType: ep.accessType as any,
      order: ep.order.toString()
    });
    setEditingEpisodeId(ep.id);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">Manage Episodes</h1>
            <p className="text-zinc-500">{anime.title}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" /> Add Episode
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Access</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {episodes.map((ep) => (
                <tr key={ep.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-blue-500">#{ep.order}</td>
                  <td className="px-6 py-4 font-bold">{ep.title}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      ep.accessType === 'free' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {ep.accessType}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openEditEpisode(ep)} className="p-2 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteEpisode(ep.id)} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-xl space-y-6 shadow-2xl relative">
            <button 
              onClick={() => {
                setShowAddModal(false);
                setEditingEpisodeId(null);
                setFormData({ title: '', videoUrl: '', downloadUrl: '', accessType: 'free', order: (episodes.length + 1).toString() });
              }} 
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ListPlus className="w-6 h-6 text-blue-500" />
              {editingEpisodeId ? 'Edit Episode' : 'Add Episode'}
            </h2>
            <form onSubmit={handleAddEpisode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Episode Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">Video URL</label>
                <input 
                  type="url" 
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400">Order</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-400">Access</label>
                  <select 
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 transition-all"
                    value={formData.accessType}
                    onChange={(e) => setFormData({ ...formData, accessType: e.target.value as any })}
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Save Episode'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
