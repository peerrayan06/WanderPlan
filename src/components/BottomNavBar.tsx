import React from 'react';
import { Home, Compass, Plus, Map, User } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavBarProps {
  activeView: 'dashboard' | 'explore' | 'trip-wizard' | 'past-trips' | 'profile' | 'trip-detail';
  onNavigate: (view: 'dashboard' | 'explore' | 'trip-wizard' | 'past-trips' | 'profile') => void;
}

export default function BottomNavBar({ activeView, onNavigate }: BottomNavBarProps) {
  
  // Maps active views to active navbar slots
  const getIsActive = (slots: string[]) => {
    if (activeView === 'trip-detail' && slots.includes('dashboard')) return true;
    return slots.includes(activeView);
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, slots: ['dashboard'] },
    { id: 'explore', label: 'Explore', icon: Compass, slots: ['explore'] },
    { id: 'past-trips', label: 'History', icon: Map, slots: ['past-trips'] },
    { id: 'profile', label: 'Account', icon: User, slots: ['profile'] },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2.5 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)] md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 md:rounded-t-3xl md:border-x">
      <div className="flex justify-around items-center relative">
        
        {/* HOME button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            getIsActive(['dashboard']) ? 'text-brand-primary font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${getIsActive(['dashboard']) ? 'scale-110 stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Home</span>
        </button>

        {/* EXPLORE button */}
        <button
          onClick={() => onNavigate('explore')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            getIsActive(['explore']) ? 'text-brand-primary font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Compass className={`w-5 h-5 transition-transform ${getIsActive(['explore']) ? 'scale-110 stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Explore</span>
        </button>

        {/* NEW TRIP floating thumb button */}
        <div className="relative -top-5 shrink-0">
          <button
            id="nav-new-trip-fab"
            onClick={() => onNavigate('trip-wizard')}
            className="w-11 h-11 bg-brand-primary hover:bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white"
          >
            <Plus className="w-6 h-6 stroke-[3px]" />
          </button>
          <span className="absolute -bottom-5.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#64748B] text-nowrap select-none">
            New Trip
          </span>
        </div>

        {/* PAST TRIPS button */}
        <button
          onClick={() => onNavigate('past-trips')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            getIsActive(['past-trips']) ? 'text-brand-primary font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <Map className={`w-5 h-5 transition-transform ${getIsActive(['past-trips']) ? 'scale-110 stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">History</span>
        </button>

        {/* PROFILE button */}
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
            getIsActive(['profile']) ? 'text-brand-primary font-bold' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          <User className={`w-5 h-5 transition-transform ${getIsActive(['profile']) ? 'scale-110 stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Profile</span>
        </button>

      </div>
    </div>
  );
}
