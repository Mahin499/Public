import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Clock, Search, MessageSquare } from 'lucide-react';
import { Confession } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function Feed() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [search, setSearch] = useState('');
  const [likedIds, setLikedIds] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('liked_confessions');
    if (saved) setLikedIds(JSON.parse(saved));
    fetchConfessions();
  }, [sortBy]);

  const fetchConfessions = async () => {
    const res = await fetch(`/api/confessions?sort=${sortBy === 'popular' ? 'likes' : 'newest'}`);
    const data = await res.json();
    setConfessions(data);
  };

  const handleLike = async (id: number) => {
    if (likedIds.includes(id)) return;

    try {
      const res = await fetch(`/api/confessions/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setConfessions(prev => prev.map(c => c.id === id ? updated : c));
        const newLiked = [...likedIds, id];
        setLikedIds(newLiked);
        localStorage.setItem('liked_confessions', JSON.stringify(newLiked));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = confessions.filter(c => 
    c.text.toLowerCase().includes(search.toLowerCase()) || 
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">Latest Confessions</h1>
          <p className="text-slate-400">Real stories, rumors, and confessions from students on campus. Anonymous and unfiltered.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search secrets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-brand-card border border-brand-border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 w-full sm:w-64"
            />
          </div>
          <div className="flex bg-brand-card border border-brand-border rounded-xl p-1">
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'newest' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Newest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'popular' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Most Liked
            </button>
          </div>
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((confession) => (
            <motion.div
              layout
              key={confession.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="break-inside-avoid p-6 rounded-2xl bg-brand-card border border-brand-border card-hover group"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-brand-accent" />
                  </div>
                  <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                    {confession.category}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {formatDistanceToNow(new Date(confession.createdAt))} ago
                </span>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                {confession.text}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                    #campuslife
                  </span>
                </div>
                <button
                  onClick={() => handleLike(confession.id)}
                  disabled={likedIds.includes(confession.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    likedIds.includes(confession.id)
                      ? 'bg-pink-500/20 text-pink-500'
                      : 'bg-white/5 text-slate-400 hover:bg-pink-500/10 hover:text-pink-500'
                  }`}
                >
                  <span className="text-sm">❤️</span>
                  {confession.likes}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500">No confessions found matching your search.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <button className="px-6 py-3 bg-white/5 border border-brand-border hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all">
          Load more confessions
        </button>
      </div>
    </div>
  );
}
