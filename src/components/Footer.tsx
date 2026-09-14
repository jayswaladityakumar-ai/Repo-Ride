import React from 'react';
import { PageTab } from '../types';
import { RepoRideLogo } from './RepoRideLogo';
import { ShieldCheck, Heart, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: PageTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-2">
            <RepoRideLogo inverted size={36} />
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              The verified student ride-sharing network. Connecting students across all hostels, campus gates, and academic blocks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('book')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Find Rides
            </button>
            <button
              onClick={() => onNavigate('match')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Match Students
            </button>
            <button
              onClick={() => onNavigate('live')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Campus Auto Paths
            </button>
            <button
              onClick={() => onNavigate('my-rides')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              My Bookings
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Built exclusively for university students</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://maps.app.goo.gl/9mhLf4ZKg2RzUr2F9"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <MapPin className="w-3 h-3 text-red-400" />
              <span>Open Audi Road GPS</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Campus Students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
