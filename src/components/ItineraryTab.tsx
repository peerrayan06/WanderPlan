import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Compass, Clock, MapPin, Plus, Trash2, CheckCircle2, ChevronUp, ChevronDown, CheckSquare, Sparkles, Utensils, Bed, Train, Plane, Info, AlertCircle, TrendingUp } from 'lucide-react';
import { Trip, ItineraryEvent, EventCategory } from '../types';
import { getEventsForTrip, saveEvent, deleteEvent, saveEvents, saveTrip } from '../lib/storage';

interface ItineraryTabProps {
  trip: Trip;
  onRefresh?: () => void;
}

export default function ItineraryTab({ trip, onRefresh }: ItineraryTabProps) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [events, setEvents] = useState<ItineraryEvent[]>(() => getEventsForTrip(trip.id));

  // Sync events state on trip change
  useEffect(() => {
    setEvents(getEventsForTrip(trip.id));
  }, [trip.id]);
  
  // Sheet bottom pop-up state
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showAddDaysModal, setShowAddDaysModal] = useState(false);
  const [daysToAdd, setDaysToAdd] = useState(1);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<EventCategory>('activity');
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Total trip days count calculation
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const timeDiff = end.getTime() - start.getTime();
  const dayCount = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1);

  const activeDayEvents = events
    .filter(e => e.day === selectedDay)
    .sort((a,b) => a.time.localeCompare(b.time));

  const handleToggleDone = (event: ItineraryEvent) => {
    const updated = { ...event, done: !event.done };
    saveEvent(updated);
    setEvents(getEventsForTrip(trip.id));
  };

  const handleDelete = (eventId: string) => {
    deleteEvent(eventId);
    setEvents(getEventsForTrip(trip.id));
  };

  const handleMoveUp = (currEvent: ItineraryEvent, idx: number) => {
    if (idx === 0) return;
    const prevEvent = activeDayEvents[idx - 1];
    
    // Swap Times temporarily for basic chronological re-ordering!
    const tempTime = currEvent.time;
    currEvent.time = prevEvent.time;
    prevEvent.time = tempTime;

    saveEvent(currEvent);
    saveEvent(prevEvent);
    setEvents(getEventsForTrip(trip.id));
  };

  const handleMoveDown = (currEvent: ItineraryEvent, idx: number) => {
    if (idx === activeDayEvents.length - 1) return;
    const nextEvent = activeDayEvents[idx + 1];

    const tempTime = currEvent.time;
    currEvent.time = nextEvent.time;
    nextEvent.time = tempTime;

    saveEvent(currEvent);
    saveEvent(nextEvent);
    setEvents(getEventsForTrip(trip.id));
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Approximate Coordinates for preset major cities if matches destination
    let lat = 41.9028;
    let lng = 12.4964;
    if (trip.destination.toLowerCase().includes('tokyo')) { lat = 35.6762; lng = 139.6503; }
    else if (trip.destination.toLowerCase().includes('paris')) { lat = 48.8566; lng = 2.3522; }
    else if (trip.destination.toLowerCase().includes('york')) { lat = 40.7128; lng = -74.0060; }
    
    // Add minor offsets to avoid stack overlapping on map
    const randOffsetName = name.length * 0.003;
    lat += (Math.random() - 0.5) * 0.015;
    lng += (Math.random() - 0.5) * 0.015;

    const newEvent: ItineraryEvent = {
      id: `event-${Date.now()}`,
      tripId: trip.id,
      day: selectedDay,
      time: time || "12:00",
      name: name.trim(),
      category,
      location: location.trim() || trip.destination,
      lat,
      lng,
      notes: notes.trim(),
      done: false,
      order: activeDayEvents.length
    };

    saveEvent(newEvent);
    
    // Reset forms
    setName('');
    setCategory('activity');
    setTime('10:00');
    setLocation('');
    setNotes('');
    setShowAddSheet(false);

    setEvents(getEventsForTrip(trip.id));
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleArchiveAllForDay = () => {
    if (activeDayEvents.length === 0) return;
    if (confirm(`Archive all ${activeDayEvents.length} events for Day ${selectedDay}? This marks them as completed.`)) {
      const updatedEvents = activeDayEvents.map(e => ({ ...e, done: true }));
      saveEvents(updatedEvents);
      setEvents(getEventsForTrip(trip.id));
    }
  };

  const handleExtendTrip = () => {
    const currentEnd = new Date(trip.endDate);
    currentEnd.setDate(currentEnd.getDate() + daysToAdd);
    
    const updatedTrip = {
      ...trip,
      endDate: currentEnd.toISOString().split('T')[0]
    };
    
    saveTrip(updatedTrip);
    setShowAddDaysModal(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const getCategoryTheme = (cat: EventCategory) => {
    switch (cat) {
      case 'activity':
        return { icon: Compass, color: 'text-blue-600 bg-blue-50 border-blue-100', text: 'Activity' };
      case 'food':
        return { icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-100', text: 'Food' };
      case 'accommodation':
        return { icon: Bed, color: 'text-purple-600 bg-purple-50 border-purple-100', text: 'Hotel' };
      case 'transport':
        return { icon: Train, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', text: 'Transit' };
      default:
        return { icon: Sparkles, color: 'text-zinc-500 bg-zinc-50 border-zinc-150', text: 'Other' };
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      
      {/* AI Insights & Transport Plan */}
      <div className="space-y-4">
        {trip.transportInstructions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-premium p-5 space-y-3"
          >
            <div className="flex items-center gap-2 text-brand-primary">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-850 flex items-center justify-center">
                <Plane className="w-4 h-4 text-blue-650 dark:text-blue-400" />
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Travel Logistics</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
              {trip.transportInstructions}
            </p>
          </motion.div>
        )}

        {trip.budgetFeedback ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-premium p-5 space-y-3"
          >
            <div className="flex items-center gap-2 text-[#F59E0B]">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Budget Insights</h3>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] text-slate-550 dark:text-slate-350 leading-relaxed bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                {trip.budgetFeedback}
              </p>
              <div className="flex items-center gap-1.5 px-1">
                <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">AI Verified Plan</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Fallback if old trip without feedback */
          <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-premium p-5 flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <Sparkles className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Ready for Adventure</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Use the FAB to add more custom stops.</p>
             </div>
          </div>
        )}
      </div>
      
      {/* Day Selector Ribbon Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {Array.from({ length: dayCount }).map((_, i) => {
          const dNumber = i + 1;
          const currDate = new Date(start);
          currDate.setDate(currDate.getDate() + i);
          const dayName = currDate.toLocaleDateString(undefined, { weekday: 'short' });
          const dayDateNum = currDate.getDate();

          return (
            <button
              key={dNumber}
              onClick={() => setSelectedDay(dNumber)}
              className={`flex flex-col items-center justify-center p-3.5 px-4.5 rounded-[20px] min-w-16 border transition-all cursor-pointer ${
                selectedDay === dNumber
                  ? 'bg-[#2563EB] border-[#2563EB] text-[#FFFFFF] shadow-sm shadow-blue-500/10 dark:text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-202 dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-widest ${selectedDay === dNumber ? 'text-blue-100' : 'text-slate-400 dark:text-slate-550'}`}>
                {dayName}
              </span>
              <span className="text-sm font-extrabold font-display leading-none mt-1">
                Day {dNumber}
              </span>
              <span className="text-[10px] font-semibold mt-0.5 opacity-80">
                {dayDateNum}
              </span>
            </button>
          );
        })}

        {/* "+ Expand Days" card button inside Day Ribbon */}
        <button
          id="itinerary-add-day-ribbon-btn"
          type="button"
          onClick={() => {
            setDaysToAdd(1);
            setShowAddDaysModal(true);
          }}
          className="flex flex-col items-center justify-center p-3.5 px-4.5 rounded-[20px] min-w-16 border border-dashed border-[#2563EB]/40 bg-[#2563EB]/5 hover:bg-[#2563EB]/10 text-[#2563EB] transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] uppercase font-black tracking-widest text-[#2563EB]">
            + Add
          </span>
          <span className="text-[9px] font-bold mt-0.5 text-slate-400 uppercase">
            Days
          </span>
        </button>
      </div>

      {/* active timeline trail list */}
      <div className="space-y-4 relative before:absolute before:left-5.5 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200">
        
        {activeDayEvents.length > 0 && (
          <div className="flex justify-end mb-2">
            <button 
              onClick={handleArchiveAllForDay}
              className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-widest transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3 h-3" /> Archive Day {selectedDay} Stops
            </button>
          </div>
        )}

        {activeDayEvents.length > 0 ? (
          activeDayEvents.map((item, index) => {
            const config = getCategoryTheme(item.category);
            const CatIcon = config.icon;
            
            return (
              <div 
                key={item.id}
                className={`relative flex gap-3.5 group bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-premium transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                  item.done ? 'opacity-60' : ''
                }`}
              >
                
                {/* Visual Circle Checkbox checkbox on timeline dot */}
                <div className="relative z-10 flex flex-col items-center justify-start shrink-0 pt-1">
                  <button
                    onClick={() => handleToggleDone(item)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                      item.done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-brand-primary text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 fill-current stroke-[3.5px]" />
                  </button>
                </div>

                {/* Event details card panel */}
                <div className="grow space-y-2.5 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${config.color}`}>
                          {config.text}
                        </span>
                        {item.costEstimate && (
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-850 italic">
                            Est. {trip.id.includes('japan') ? '¥' : trip.id.includes('paris') ? '€' : '$'}{item.costEstimate}
                          </span>
                        )}
                      </div>
                      <h4 className={`font-bold font-display text-[15px] tracking-tight text-slate-900 dark:text-slate-100 mt-1.5 ${item.done ? 'line-through' : ''}`}>
                        {item.name}
                      </h4>
                    </div>

                    <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 shrink-0 flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-2.5 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-brand-accent scale-95" />
                      <span className="font-mono">{item.time}</span>
                    </div>
                  </div>

                  {item.location && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-405 flex items-center gap-1.5 font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-brand-danger" />
                      {item.location}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-black uppercase tracking-tighter text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/70 dark:bg-slate-955/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                      {item.notes}
                    </p>
                  )}
                  
                  {/* Controls Row */}
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-850 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        disabled={index === 0}
                        onClick={() => handleMoveUp(item, index)}
                        className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-20 transition-all"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={index === activeDayEvents.length - 1}
                        onClick={() => handleMoveDown(item, index)}
                        className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-20 transition-all"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[24px] border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm ml-4">
            <span className="text-xl block">🎒</span>
            <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm">Empty Day Trail plan</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              No planned stops for Day {selectedDay}. Create activity landmarks, transit reservations, or dining spots using the FAB below.
            </p>
          </div>
        )}

      </div>

      {/* Floating Action Button (FAB) to add item stops */}
      <button
        id="itinerary-add-event-fab"
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-22 right-5 z-40 w-12 h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 cursor-pointer transition-all border-4 border-white"
      >
        <Plus className="w-5.5 h-5.5 stroke-[3px]" />
      </button>

      {/* Add event sliding bottom sheet overlay in full screen */}
      {showAddSheet && (
        <div className="fixed inset-0 bg-white dark:bg-[#0F172A] z-50 flex flex-col h-full w-full overflow-y-auto p-6 md:p-8">
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-between py-4 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5.5 h-5.5 text-[#2563EB]" />
                Add Stop to Day {selectedDay}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSheet(false)}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
              >
                Cancel / Return
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-5 text-left flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Event name */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Stop Name</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Louvre Skip-the-line Tour"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700/65 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs focus:outline-none font-bold text-slate-800 dark:text-white transition-all shadow-sm"
                  />
                </div>

                {/* Category selection */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Stop Category</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {([
                      { id: 'activity', label: 'Activity' },
                      { id: 'food', label: 'Dining' },
                      { id: 'accommodation', label: 'Hotel' },
                      { id: 'transport', label: 'Transit' },
                      { id: 'other', label: 'Other' }
                    ] as const).map((catItem) => (
                      <button
                        key={catItem.id}
                        type="button"
                        onClick={() => setCategory(catItem.id)}
                        className={`py-2.5 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                          category === catItem.id
                            ? 'border-blue-650 bg-blue-105/10 text-blue-700 font-extrabold dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {catItem.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Time Schedule</span>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700/65 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs focus:outline-none font-bold text-slate-800 dark:text-white transition-all shadow-sm"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Google Local Location / Address</span>
                  <input
                    type="text"
                    placeholder="e.g. Rue de Rivoli, Paris, France"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700/65 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs focus:outline-none font-bold text-slate-800 dark:text-white transition-all shadow-sm"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Stop Notes / Memo (optional)</span>
                  <textarea
                    placeholder="e.g. Booking ref 4851, bring cameras & valid passports"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700/65 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 rounded-2xl px-4 py-3 text-xs focus:outline-none font-medium text-slate-700 dark:text-slate-300 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  id="submit-new-event-btn"
                  className="w-full bg-[#2563EB] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-blue-500/10 text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 text-white" /> Add Stop to Day's Timeline
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Add Days Modal Overlay (Full Screen) */}
      {showAddDaysModal && (
        <div className="fixed inset-0 bg-white dark:bg-[#0F172A] z-50 flex flex-col h-full w-full overflow-y-auto p-6 md:p-8">
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-between py-4 space-y-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5.5 h-5.5 text-[#2563EB]" />
                Extend Trip Duration
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDaysModal(false)}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
              >
                Cancel / Return
              </button>
            </div>

            <div className="space-y-6 text-left flex-1 flex flex-col justify-center">
              <div className="space-y-2 text-center max-w-sm mx-auto mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100/30 dark:bg-blue-900/30 mx-auto flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <h4 className="font-display font-black text-slate-900 dark:text-white text-base">Modify Itinerary Dates</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Configure additional days easily. Your checklists, timelines, and interactive maps will expand sequentially to sync your planned paths.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block text-center">Numbers of days to append</span>
                <div className="flex justify-center items-center gap-4">
                  <button
                    type="button"
                    disabled={daysToAdd <= 1}
                    onClick={() => setDaysToAdd(prev => prev - 1)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-755 font-bold text-slate-800 dark:text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-slate-100 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="text-4xl font-display font-black text-[#2563EB] w-16 text-center">
                    {daysToAdd}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDaysToAdd(prev => prev + 1)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-755 font-bold text-slate-800 dark:text-white flex items-center justify-center cursor-pointer transition-colors hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Preset selectors */}
              <div className="flex justify-center flex-wrap gap-2 pt-3">
                {[1, 2, 3, 5, 7].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDaysToAdd(num)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      daysToAdd === num
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/35 border-slate-150 dark:border-slate-800 text-slate-500 dark:text-slate-405 hover:bg-slate-100'
                    }`}
                  >
                    +{num} Day{num > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleExtendTrip}
                className="w-full bg-[#2563EB] hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-blue-500/10 text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Journey Extension
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
