import React, { createContext, useContext, useState, useEffect } from 'react';
import { Anime } from '../data/animeData';
import api from '../services/api';

interface AnimeContextType {
  animes: Anime[];
  loading: boolean;
  refreshAnimes: () => Promise<void>;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

export const AnimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnimes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/anime');
      setAnimes(response.data);
    } catch (error) {
      console.error('Failed to fetch animes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimes();
  }, []);

  return (
    <AnimeContext.Provider value={{ animes, loading, refreshAnimes: fetchAnimes }}>
      {children}
    </AnimeContext.Provider>
  );
};

export const useAnime = () => {
  const context = useContext(AnimeContext);
  if (context === undefined) {
    throw new Error('useAnime must be used within an AnimeProvider');
  }
  return context;
};
