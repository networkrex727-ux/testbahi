import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  subscription_plan: string;
  subscription_status: 'active' | 'pending' | 'rejected' | 'none';
  country: string;
  photoURL?: string;
  subscription_updated_at?: any;
  subscription_expiry?: any;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isAuthReady: boolean;
  login: (token: string, user: UserData) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setIsAuthReady(true);
      return;
    }

    try {
      const response = await api.get('/user/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token: string, userData: UserData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthReady, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
