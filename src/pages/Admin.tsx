import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trash2, ShieldAlert, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Confession, Stats } from '../types';
import { format } from 'date-fns';

export default function Admin() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('/api/confessions'),
        fetch('/api/stats')
      ]);
      setConfessions(await cRes.json());
      setStats(await sRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this confession?')) return;
    
    try {
      const res = await fetch(`/api/confessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfessions(prev => prev.filter(c => c.id !== id));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Moderation Dashboard</h1>
          <p className="text-slate-400">Overview of community activity and pending actions.</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: ShieldAlert, label: 'Total Confessions', value: stats?.totalConfessions || 0, trend: '+5.2%', color: 'text-blue-400' },
          { icon: Clock, label: 'Pending Review', value: '42', trend: '+12%', color: 'text-yellow-400' },
          { icon: AlertTriangle, label: 'Reported Content', value: '15', trend: '+2 new', color: 'text-red-400' },
          { icon: Trash2, label: 'Deleted Posts', value: '8', trend: 'Today', color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={stat.label} className="p-6 rounded-2xl bg-brand-card border border-brand-border">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 ${stat.color}`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-sm text-slate-500 font-medium mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div className="flex gap-4">
            <button className="px-4 py-1.5 bg-brand-accent text-white text-xs font-bold rounded-lg">All Posts</button>
            <button className="px-4 py-1.5 text-slate-500 hover:text-slate-300 text-xs font-bold">Reported</button>
          </div>
          <div className="text-xs text-slate-500">
            Showing 1-{confessions.length} of {stats?.totalConfessions} results
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-brand-border">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Content Preview</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Likes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {confessions.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">#{c.id}</td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="text-sm text-slate-300 line-clamp-1">{c.text}</p>
                      <span className="text-[10px] text-brand-accent font-bold uppercase">{c.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300">{format(new Date(c.createdAt), 'MMM d, yyyy')}</div>
                    <div className="text-[10px] text-slate-500">{format(new Date(c.createdAt), 'h:mm a')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="text-sm">❤️</span>
                      {c.likes}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
