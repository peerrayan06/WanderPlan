import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, MapPin, Search, Calendar, Heart, ArrowRight, Star } from 'lucide-react';
import { PRESET_DESTINATIONS, PresetDestination } from '../types';

interface ExploreProps {
  onStartPlanning: (destinationName: string) => void;
}

export default function Explore({ onStartPlanning }: ExploreProps) {
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const toggleLike = (name: string) => {
    setLiked(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const filtered = PRESET_DESTINATIONS.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.country.toLowerCase().includes(search.toLowerCase())
  );

  const getTagsForCity = (city: string) => {
    switch(city) {
      case "Paris": return ["Art Gallery", "Café Culture", "Romantic"];
      case "Tokyo": return ["Neon Sights", "Culinary VIP", "Bullet Trains"];
      case "Rome": return ["Ruins Walk", "Gelato Lovers", "Renaissance"];
      case "New York": return ["Broadway", "Bespoke Dining", "Skyscrapers"];
      case "Sydney": return ["Harbor Surf", "Coastal Path", "Coffee Hub"];
      case "Bali": return ["Tropical Zen", "Beach Retreat", "Temples"];
      case "Barcelona": return ["Gaudi Art", "Tapas & Paella", "Gothic Quarter"];
      default: return ["Scenic Paths", "Local Insights", "Culture Tour"];
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32 pt-6 px-4 selection:bg-[#2563EB] selection:text-white text-left">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Intro */}
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#2563EB] active-spin" />
            Wanderlust Feed
          </h1>
          <p className="text-xs text-slate-500">Pick an elite destination template to bootstrap your itinerary in seconds.</p>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cities, countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-blue-500 shadow-sm font-semibold text-slate-800"
          />
        </div>

        {/* Explore Feed Cards Grid */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((city) => (
              <div
                key={city.name}
                className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-sm relative group"
              >
                {/* Full visual image */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  {city.coverUrl ? (
                    <img 
                      src={city.coverUrl} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={city.name} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Compass className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  {/* Hearts bookmark button */}
                  <button
                    onClick={() => toggleLike(city.name)}
                    className="absolute top-3.5 right-3.5 p-2 bg-white/20 backdrop-blur-md rounded-full text-white cursor-pointer hover:bg-white/40 active:scale-95 transition-all"
                  >
                    <Heart className={`w-4 h-4 ${liked[city.name] ? 'fill-red-500 stroke-red-500 animate-[bounce_0.5s]' : ''}`} />
                  </button>

                  <div className="absolute top-3.5 left-3.5 bg-[#2563EB]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 rotate-12" />
                    <span>PRESET TEMPLATE READY</span>
                  </div>

                  {/* Destination titles inside container */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{city.flag}</span>
                      <h3 className="font-display font-bold text-lg">{city.name}, {city.country}</h3>
                    </div>
                  </div>
                </div>

                {/* Additional metadata info area */}
                <div className="p-4 space-y-3.5">
                  {/* Category badges list */}
                  <div className="flex flex-wrap gap-1.5 min-h-[30px]">
                    {getTagsForCity(city.name).map(tag => (
                      <span key={tag} className="text-[9px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action CTA list */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-0.5 text-xs text-orange-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-slate-800">4.9</span>
                      <span className="text-slate-400 font-normal ml-0.5">(240 guides)</span>
                    </div>

                    <button
                      onClick={() => onStartPlanning(city.name)}
                      className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm text-nowrap cursor-pointer hover:shadow transition-colors"
                    >
                      Plan Itinerary <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-150 space-y-2">
              <span className="text-2xl block">🗺️</span>
              <h3 className="font-bold text-slate-800 text-sm">No curated path matches</h3>
              <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto">
                No preset template found for "{search}". You can still type custom locations inside the <strong>New Trip planner Wizard</strong> directly!
              </p>
              <button
                onClick={() => onStartPlanning(search)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg mt-1"
              >
                Create Custom Trip
              </button>
            </div>
          )}
        </div>

        {/* General Travel Insights Checklist */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3 text-left">
          <div className="flex items-center gap-1.5 text-blue-400">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <h4 className="font-display font-extrabold text-sm tracking-wide uppercase">Wanderer Smart Tip</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Planning multi-stop tracks? Pin stops inside the <strong>Map tab</strong> sequentially to prevent backtracking, and auto-seed checklists before embarking!
          </p>
        </div>

      </div>
    </div>
  );
}
