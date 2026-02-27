import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, AlertCircle, Shield, Users, Building2, MessageCircle, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, BLOCKED_WORDS } from '../constants';
import { Confession, Stats } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 5) {
      setError("Confession must be at least 5 characters long.");
      return;
    }

    const hasBadWords = BLOCKED_WORDS.some(word => text.toLowerCase().includes(word));
    if (hasBadWords) {
      setError("Profanity detected. Please keep it clean for our community guidelines.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category }),
      });

      if (res.ok) {
        navigate('/feed');
      } else {
        const data = await res.json();
        setError(data.error || "Failed to post confession.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest mb-6"
        >
          100% Anonymous
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-7xl font-bold text-white tracking-tight mb-6"
        >
          Unburden Yourself.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Share your deepest secrets, campus crushes, or funny mishaps. No login required. 
          Your voice is heard, but your identity remains yours.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[
          { icon: MessageCircle, label: 'Confessions Posted', value: stats?.totalConfessions?.toLocaleString() || '12,450', color: 'text-blue-400' },
          { icon: Users, label: 'Reading Now', value: '850', color: 'text-emerald-400' },
          { icon: Building2, label: 'Campuses Active', value: '24', color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-6 rounded-2xl bg-brand-card border border-brand-border flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-brand-card border border-brand-border rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-accent/20 rounded-lg">
            <Send className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Submit a Confession</h2>
            <p className="text-sm text-slate-500">Be honest, be kind, be anonymous.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I have a crush on the barista at the campus library..."
              className="w-full h-48 bg-brand-bg/50 border border-brand-border rounded-2xl p-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all resize-none"
              maxLength={500}
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono">
              {text.length}/500
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  category === cat 
                    ? 'bg-brand-accent text-white' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <Shield className="w-4 h-4" />
              <span>Your IP address is scrambled and never stored. Posting is completely untraceable.</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-4 bg-brand-accent hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-brand-accent/20"
            >
              {isSubmitting ? 'Posting...' : 'Go Live'}
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </motion.div>

      <div className="mt-20">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-white">Just Posted</h2>
          <button 
            onClick={() => navigate('/feed')}
            className="text-sm font-semibold text-brand-accent hover:underline"
          >
            View all →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats?.topLiked?.slice(0, 2)?.map((confession, i) => (
            <div key={confession.id} className="p-6 rounded-2xl bg-brand-card border border-brand-border card-hover">
              <div className="flex justify-between items-center mb-4">
                <span className="px-2 py-1 rounded bg-brand-accent/10 text-brand-accent text-[10px] font-bold uppercase tracking-wider">
                  {confession.category}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatDistanceToNow(new Date(confession.createdAt))} ago
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                {confession.text}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">❤️</span>
                  {confession.likes}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
