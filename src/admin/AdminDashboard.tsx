import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Crown, 
  Tv, 
  TrendingUp, 
  Plus, 
  Settings, 
  Clock,
  Film,
  CreditCard,
  Bell,
  Ticket,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useAnime } from '../context/AnimeContext';
import api from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { animes } = useAnime();
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalAnime: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalAnime: animes.length
    }));
  }, [animes]);

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
    { name: 'Premium Users', value: stats.premiumUsers, icon: Crown, color: 'yellow' },
    { name: 'Total Anime', value: stats.totalAnime, icon: Tv, color: 'purple' },
    { name: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'red' },
  ];

  return (
    <div className="space-y-10 py-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500">Manage your anime streaming platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/settings"
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors relative"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors relative">
            <Bell className="w-5 h-5" />
          </button>
          <Link 
            to="/admin/anime" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" /> Add Anime
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl space-y-4 hover:border-zinc-700 transition-colors group"
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
              stat.color === 'blue' && "bg-blue-500/10 text-blue-500",
              stat.color === 'yellow' && "bg-yellow-500/10 text-yellow-500",
              stat.color === 'purple' && "bg-purple-500/10 text-purple-500",
              stat.color === 'red' && "bg-red-500/10 text-red-500",
            )}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-zinc-500 text-sm font-medium">{stat.name}</p>
              <p className="text-3xl font-black">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Quick Management
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              to="/admin/anime"
              className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-6 hover:bg-zinc-900 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Film className="w-7 h-7 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Manage Anime</h3>
                <p className="text-sm text-zinc-500">Add, edit or remove anime series</p>
              </div>
            </Link>
            <Link 
              to="/admin/requests"
              className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-6 hover:bg-zinc-900 hover:border-yellow-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7 text-yellow-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Purchase Requests</h3>
                <p className="text-sm text-zinc-500">Review and approve subscriptions</p>
              </div>
            </Link>
            <Link 
              to="/admin/plans"
              className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-6 hover:bg-zinc-900 hover:border-purple-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7 text-purple-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Manage Plans</h3>
                <p className="text-sm text-zinc-500">Configure subscription pricing</p>
              </div>
            </Link>
            <Link 
              to="/admin/users"
              className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-6 hover:bg-zinc-900 hover:border-green-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-green-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Manage Users</h3>
                <p className="text-sm text-zinc-500">Manage accounts and subscriptions</p>
              </div>
            </Link>
            <Link 
              to="/admin/settings"
              className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-6 hover:bg-zinc-900 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Platform Settings</h3>
                <p className="text-sm text-zinc-500">Configure platform integrations</p>
              </div>
            </Link>

            <Link 
              to="/admin/redeem-codes"
              className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-6 hover:bg-zinc-900 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Ticket className="w-7 h-7 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Redeem Codes</h3>
                <p className="text-sm text-zinc-500">Manage subscription codes</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-500" />
            Recent Activity
          </h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <div className="text-center py-10 text-zinc-500 text-sm">
              Recent activity will appear here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
