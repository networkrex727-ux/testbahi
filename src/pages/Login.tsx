import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COUNTRIES = ['India', 'Pakistan', 'Bangladesh', 'Other'];

const BACKGROUND_IMAGES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh42_6VZ-3svZWN8VOBQbLQHHdqfTgLnCXc3O3ikja7adL2rzhnEszfXY&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXrFAEx_5TZ9gp_GZOvJqKqpnqNVAaNEKed6t9W0-oFA&s=10"
];

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: 'India'
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        login(response.data.token, response.data.user);
        toast.success('Welcome back!');
      } else {
        const response = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          country: formData.country
        });
        login(response.data.token, response.data.user);
        toast.success('Account created successfully!');
      }
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden italic">
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImageIndex}
            src={BACKGROUND_IMAGES[currentImageIndex]} 
            alt="Anime Background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover opacity-60 scale-100"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-5 mb-8"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 shadow-2xl shadow-blue-500/20">
              <img 
                src="https://i.ibb.co/r2BqPyM1/IMG-20260406-235046-639.jpg" 
                alt="sahidanime logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-black tracking-tight text-white leading-none flex gap-2">
                <span>SAHID</span>
                <span className="text-blue-500">ANIME</span>
              </h2>
              <p className="text-blue-500 text-[10px] font-bold tracking-[0.2em] uppercase">Anime Streaming</p>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-zinc-400">
            {isLogin ? 'Continue your epic journey' : 'Start your anime adventure today'}
          </p>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 rounded-[2rem] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative group overflow-hidden"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required={!isLogin}
                    className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative group"
              >
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <select
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  {COUNTRIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                </select>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-zinc-500 hover:text-white transition-colors text-sm font-medium"
            >
              {isLogin ? (
                <span>New to sahidanime? <span className="text-blue-500 font-bold">Sign Up</span></span>
              ) : (
                <span>Already have an account? <span className="text-blue-500 font-bold">Sign In</span></span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
