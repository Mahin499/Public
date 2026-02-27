import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, MessageSquare, Flame, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import MusicPlayer from './MusicPlayer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: MessageSquare },
    { name: 'Feed', path: '/feed', icon: Flame },
    { name: 'Admin', path: '/admin', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-brand-accent rounded-lg group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Campus Confessions</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    location.pathname === item.path ? "text-white" : "text-slate-400"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/feed"
                className="px-4 py-2 bg-brand-accent hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-brand-accent/20"
              >
                Read Feed
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <MusicPlayer />

      <footer className="border-t border-brand-border py-12 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-50">
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm">© 2024 Campus Confessions. Anonymity guaranteed.</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-300">Guidelines</a>
              <a href="#" className="hover:text-slate-300">Support</a>
              <a href="#" className="hover:text-slate-300">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
