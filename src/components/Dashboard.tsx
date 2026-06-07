import React from 'react';
import { motion } from 'motion/react';
import { Compass, Calendar, Plus, MapPin, Wallet, CheckSquare, Sparkles, AlertTriangle, ArrowRight, Clock, Users, User, Image as ImageIcon } from 'lucide-react';
import { Trip, ItineraryEvent, Expense } from '../types';
import { getEventsForTrip, getExpensesForTrip, getCurrencySymbol, deleteTrip } from '../lib/storage';
import ConfirmModal from './ConfirmModal';

interface DashboardProps {
  user: { name: string; avatar: string };
  trips: Trip[];
  onSelectTrip: (tripId: string) => void;
  onRefresh: () => void;
  onNavigate: (view: 'trip-wizard' | 'explore' | 'past-trips' | 'profile') => void;
}

export default function Dashboard({ user, trips, onSelectTrip, onRefresh, onNavigate }: DashboardProps) {
  const [deleteTripId, setDeleteTripId] = React.useState<string | null>(null);
  
  // Find next upcoming trip (starting in future, closest to today)
  const today = new Date();
  today.setHours(0,0,0,0);

  // Filter active vs archived
  const activeTrips = trips.filter(t => !t.archived && new Date(t.endDate) >= today);

  const upcomingTrips = activeTrips
    .filter(t => new Date(t.startDate) >= today)
    .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const nextHeroTrip = upcomingTrips[0] || activeTrips[0];

  // Helper calculations for a trip card
  const getCardStats = (trip: Trip) => {
    const events = getEventsForTrip(trip.id);
    const expenses = getExpensesForTrip(trip.id);
    
    // Itinerary progress %
    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.done).length;
    const progressPercent = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    // Budget spent
    const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budgetPct = (spent / trip.budget) * 100;

    // Remaining countdown
    const tripStart = new Date(trip.startDate);
    const msDiff = tripStart.getTime() - today.getTime();
    const daysToGo = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    return {
      progressPercent,
      completedEvents,
      totalEvents,
      spent,
      budgetPct,
      daysToGo
    };
  };

  const getBudgetCss = (pct: number) => {
    if (pct >= 100) return 'text-red-650 bg-red-50 border border-red-200';
    if (pct >= 80) return 'text-yellow-650 bg-yellow-50 border border-yellow-250';
    return 'text-green-650 bg-green-50 border border-green-200';
  };

  // Human date formats
  const formatDateString = (dtStr: string) => {
    const d = new Date(dtStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleDeleteTrip = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    setDeleteTripId(tripId);
  };

  const executeDelete = () => {
    if (deleteTripId) {
      deleteTrip(deleteTripId);
      setDeleteTripId(null);
      onRefresh();
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen pb-40 pt-8 px-5 selection:bg-brand-primary selection:text-white">
      <ConfirmModal 
        isOpen={deleteTripId !== null}
        title="Remove Journey?"
        message="Permanently remove this journey? This will erase all logged trails and budgets. This action cannot be reversed."
        confirmText="Erase Permanently"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTripId(null)}
      />
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Greeting */}
        <div className="flex justify-between items-start">
          <div className="space-y-1 text-left">
            <h1 className="font-display font-bold text-[#0F172A] text-3xl tracking-tight leading-tight">
              {getGreeting()}, <br />
              {user.name}
            </h1>
            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-[0.2em] pt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('profile')}
              className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white shadow-premium hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer bg-slate-100 flex items-center justify-center border border-slate-100"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  className="w-full h-full object-cover" 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Hero Upcoming Trip Countdown */}
        {nextHeroTrip ? (
          (() => {
            const stats = getCardStats(nextHeroTrip);
            return (
              <div 
                onClick={() => onSelectTrip(nextHeroTrip.id)}
                className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-200 cursor-pointer hover:border-slate-300 hover:shadow-md transition-all text-left relative group active:scale-[0.99]"
              >
                {/* Hero cover image */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 flex items-center justify-center">
                  {nextHeroTrip.coverUrl ? (
                    <img 
                      src={nextHeroTrip.coverUrl} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={nextHeroTrip.destination} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <ImageIcon className="w-10 h-10 opacity-20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">No Cover Illustration</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  
                  {/* Countdown Badge overlay */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1 bg-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {stats.daysToGo > 0 
                        ? `${stats.daysToGo} days to go` 
                        : stats.daysToGo === 0 
                          ? "Starting today! 🚀" 
                          : "Ongoing Voyage"}
                    </span>
                  </div>

                  {/* Quick Delete overlay */}
                  <button
                    onClick={(e) => handleDeleteTrip(e, nextHeroTrip.id)}
                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>

                  {/* Destination Info on Left-Bottom */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      UPCOMING ADVENTURE
                    </span>
                    <h2 className="font-display text-xl font-bold mt-1.5 leading-tight">
                      {nextHeroTrip.title}
                    </h2>
                    <p className="text-xs text-slate-200 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      {nextHeroTrip.destination}
                    </p>
                  </div>
                </div>

                {/* Card metrics detail panel */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-semibold">{formatDateString(nextHeroTrip.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-semibold">{nextHeroTrip.partySize} {nextHeroTrip.partySize === 1 ? 'traveller' : 'travellers'}</span>
                    </div>
                  </div>

                  {/* Progress bars row */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                        <span>Itinerary</span>
                        <span className="text-[#2563EB]">{stats.progressPercent}% DONE</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#2563EB] rounded-full transition-all duration-300" 
                          style={{ width: `${stats.progressPercent}%` }} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                        <span>Budget limits</span>
                        <span className={stats.budgetPct > 100 ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{Math.round(stats.budgetPct)}% SPENT</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${stats.budgetPct > 100 ? 'bg-[#DC2626]' : stats.budgetPct >= 80 ? 'bg-[#EAB308]' : 'bg-[#16A34A]'}`}
                          style={{ width: `${Math.min(100, stats.budgetPct)}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Micro Quick Action Summary */}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                      <Wallet className="w-4 h-4 text-slate-400" />
                      {getCurrencySymbol()}{stats.spent} spent of {getCurrencySymbol()}{nextHeroTrip.budget} cap
                    </span>
                    <span className="text-[#2563EB] font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Open schedule <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            );
          })()
        ) : (
          /* Empty State Illustration */
          <div className="bg-white p-8 rounded-[24px] border border-slate-200 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8 animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-[#0F172A]">Your Wanderlust is Calling</h3>
              <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                No scheduled voyages. Launch your travel checklist, log budget guidelines, and layout day trails in 10 minutes.
              </p>
            </div>
            <button
              onClick={() => onNavigate('trip-wizard')}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-sm cursor-pointer"
            >
              Plan First Trip
            </button>
          </div>
        )}

        {/* Quick Actions Grid Shortcuts */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-widest text-left">Quick Navigation</h3>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('trip-wizard')}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1.5 shadow-sm active:scale-95 transition-all cursor-pointer text-left"
            >
              <div className="w-9 h-9 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto">
                <Plus className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <span className="text-xs font-bold text-slate-800 block leading-tight text-center">New Trip</span>
            </button>

            <button
              onClick={() => onNavigate('explore')}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1.5 shadow-sm active:scale-95 transition-all cursor-pointer text-left"
            >
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 block leading-tight text-center">Explore</span>
            </button>

            <button
              id="dashboard-archived-btn"
              onClick={() => onNavigate('past-trips')}
              className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1.5 shadow-sm active:scale-95 transition-all cursor-pointer text-left"
            >
              <div className="w-9 h-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 block leading-tight text-center">Archived</span>
            </button>
          </div>
        </div>

        {/* Horizontal Trip Scroll of Remaining Active Trips */}
        {activeTrips.length > 1 && (
          <div className="space-y-2 text-left">
            <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-widest">My Travel Portfolio ({activeTrips.length})</h3>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
              {activeTrips.map((tour) => {
                const results = getCardStats(tour);
                return (
                  <div
                    key={tour.id}
                    onClick={() => onSelectTrip(tour.id)}
                    className="w-64 bg-white rounded-[24px] border border-slate-200 p-3.5 shadow-sm shrink-0 snap-center cursor-pointer hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="relative h-28 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                      {tour.coverUrl ? (
                         <img 
                           src={tour.coverUrl} 
                           className="w-full h-full object-cover" 
                           alt={tour.destination} 
                           referrerPolicy="no-referrer"
                         />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-200" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      
                      <button
                        onClick={(e) => handleDeleteTrip(e, tour.id)}
                        className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg backdrop-blur-md transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 rotate-45" />
                      </button>

                      <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                        <strong className="font-display block truncate">{tour.title}</strong>
                        <span className="text-[10px] text-slate-300 block truncate">{tour.destination}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] text-slate-550 font-bold">
                      <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg text-slate-600">
                        {tour.partySize} travellers
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg ${getBudgetCss(results.budgetPct)}`}>
                        {getCurrencySymbol()}{results.spent} logged
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-[#64748B]">
                        <span>Itinerary trails</span>
                        <span>{results.progressPercent}% DONE</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${results.progressPercent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
