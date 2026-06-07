import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Calendar, Users, MapPin, ArrowRight, ArrowLeft, Check, Sparkles, Loader2 } from 'lucide-react';
import { PRESET_DESTINATIONS, DEFAULT_COVER, Trip } from '../types';
import { saveTrip, saveEvent, saveEvents, savePackingItem, seedPackingTemplate, getCurrentUser } from '../lib/storage';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState(PRESET_DESTINATIONS[0].name);
  const [customDestination, setCustomDestination] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 14); // Next 14 days
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 20); // 6 nights default
    return today.toISOString().split('T')[0];
  });
  const [partySize, setPartySize] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePreset = PRESET_DESTINATIONS.find(
    d => d.name.toLowerCase() === (customDestination || destination).toLowerCase()
  );

  const handleFinish = async () => {
    if (generating) return;
    setGenerating(true);

    const selectedDest = customDestination || destination;
    const coverUrl = activePreset?.coverUrl || DEFAULT_COVER;
    const activeUser = getCurrentUser();
    
    try {
      // Create first trip
      const newTripId = `trip-${Date.now()}`;
      const newTrip: Trip = {
        id: newTripId,
        userId: activeUser?.id || "user-1",
        title: `${selectedDest} Adventure`,
        destination: selectedDest,
        coverUrl,
        startDate,
        endDate,
        partySize,
        budget: 2000, // default MVP budget
        createdAt: new Date().toISOString()
      };

      // Call Gemini API to generate itinerary
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: selectedDest, startDate, endDate, partySize }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate AI itinerary');
      }

      const { itinerary } = await response.json();

      saveTrip(newTrip);

      if (itinerary && Array.isArray(itinerary) && itinerary.length > 0) {
        const events = itinerary.map((item: any, idx: number) => ({
          id: `ev-${newTripId}-${idx}`,
          tripId: newTripId,
          day: item.day,
          time: item.time,
          name: item.name,
          category: item.category,
          location: item.location,
          lat: item.lat || activePreset?.lat || 45 + (Math.random() * 0.02 - 0.01),
          lng: item.lng || activePreset?.lng || 12 + (Math.random() * 0.02 - 0.01),
          notes: item.notes,
          done: false,
          order: idx,
          costEstimate: item.costEstimate,
          tags: item.tags
        }));
        saveEvents(events);
      } else {
        // Fallback mock events
        saveEvent({
          id: `event-${Date.now()}-1`,
          tripId: newTrip.id,
          day: 1,
          time: "11:00",
          name: `Explore Central ${selectedDest}`,
          category: "activity",
          location: `${selectedDest} Square`,
          lat: activePreset?.lat || 45,
          lng: activePreset?.lng || 12,
          notes: "First walk and grab coffee at a local bistro.",
          done: false,
          order: 0
        });

        saveEvent({
          id: `event-${Date.now()}-2`,
          tripId: newTrip.id,
          day: 1,
          time: "19:00",
          name: "Welcome Dinner",
          category: "food",
          location: "Traditional Restaurant",
          lat: (activePreset?.lat || 45) + 0.005,
          lng: (activePreset?.lng || 12) + 0.005,
          notes: "Taste local specialties and plan tomorrow's trail.",
          done: false,
          order: 1
        });
      }

      // Seed preset packing items
      seedPackingTemplate(newTrip.id, "Clothing");
      seedPackingTemplate(newTrip.id, "Electronics");
      seedPackingTemplate(newTrip.id, "Documents");

      onComplete();
    } catch (err) {
      console.error(err);
      // Fallback on error to manual finish (minimal state)
      const newTrip: Trip = {
        id: `trip-${Date.now()}`,
        userId: activeUser?.id || "user-1",
        title: `${selectedDest} Adventure`,
        destination: selectedDest,
        coverUrl,
        startDate,
        endDate,
        partySize,
        budget: 2000,
        createdAt: new Date().toISOString()
      };
      saveTrip(newTrip);
      seedPackingTemplate(newTrip.id, "Clothing");
      onComplete();
    } finally {
      setGenerating(false);
    }
  };

  const handleSkip = () => {
    // Just skip without creating a trip
    onComplete();
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col justify-between p-4 selection:bg-[#2563EB] selection:text-white">
      {/* Header */}
      <div className="flex justify-between items-center max-w-xl mx-auto w-full py-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <Compass className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-800">WanderPlan</span>
        </div>
        
        <button 
          onClick={handleSkip} 
          className="text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
        >
          Skip Wizard
        </button>
      </div>

      {/* Steps Content Area */}
      <div className="grow flex items-center justify-center max-w-3xl lg:max-w-5xl mx-auto w-full py-6">
        <div className="bg-white p-6 sm:p-10 lg:p-16 rounded-[40px] border border-slate-200 shadow-sm w-full relative">
          
          {/* Progress indicators */}
          <div className="flex justify-between items-center mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center grow last:grow-0">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                    step === num 
                      ? 'bg-[#2563EB] text-white border-[#2563EB]' 
                      : step > num 
                        ? 'bg-green-500 text-white border-green-500' 
                        : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 3 && (
                  <div className={`h-[2px] grow mx-2 ${step > num ? 'bg-green-500' : 'bg-slate-100'}`} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold animate-pulse">
              {error}
            </div>
          )}

          <div>
            {step === 1 && (
              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase">Step 1 of 3</span>
                  <h2 className="font-display text-2xl font-bold text-slate-900">Where do you want to go?</h2>
                  <p className="text-xs text-slate-500">Pick one of our popular curated destinations or type your own.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {PRESET_DESTINATIONS.slice(0, 4).map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => {
                        setDestination(dest.name);
                        setCustomDestination('');
                      }}
                      className={`relative h-20 rounded-xl overflow-hidden text-left border transition-all cursor-pointer ${
                        destination === dest.name && !customDestination
                          ? 'border-[#2563EB] ring-2 ring-blue-50'
                          : 'border-slate-150 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={dest.coverUrl || undefined} className="w-full h-full object-cover" alt={dest.name} referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white flex justify-between items-end">
                        <span className="font-bold text-xs">{dest.name}</span>
                        <span className="text-xs text-orange-400">{dest.flag}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Or type another custom city:</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Kyoto, Vancouver, Cape Town"
                      value={customDestination}
                      onChange={(e) => setCustomDestination(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase">Step 2 of 3</span>
                  <h2 className="font-display text-2xl font-bold text-slate-900">When are you going?</h2>
                  <p className="text-xs text-slate-500">Pick tentative travel dates. You can adjust this later.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Departure Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Return Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="bg-[#EFF6FF] p-4 rounded-2xl flex items-center gap-3 border border-[#BFDBFE] text-blue-900 mt-2">
                  <Calendar className="w-5 h-5 text-[#2563EB] shrink-0" />
                  <span className="text-xs font-semibold">
                    That is a beautiful <strong>{
                      Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
                    }-day</strong> voyage!
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#2563EB] tracking-wider uppercase">Step 3 of 3</span>
                  <h2 className="font-display text-2xl font-bold text-slate-900">Who is coming with?</h2>
                  <p className="text-xs text-slate-500">Select the size of your exploration crew.</p>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4">
                  {[1, 2, 3, 4, 5, 6].map((num) => {
                    const labels = ["Solo", "Duo", "Trio", "Small Group", "Mid Group", "Large Crew"];
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPartySize(num)}
                        className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          partySize === num
                            ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] shadow-sm'
                            : 'border-slate-150 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Users className={`w-5 h-5 ${partySize === num ? 'text-[#2563EB]' : 'text-slate-400'}`} />
                        <span className="font-bold text-sm mt-1">{num} {num === 1 ? 'Person' : 'People'}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{labels[num - 1]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-orange-50 p-4 rounded-2xl flex items-center gap-3 border border-orange-100 text-orange-855 mt-2">
                  <Sparkles className="w-5 h-5 text-orange-500 shrink-0" />
                  <span className="text-xs font-semibold">
                    We'll provision customized checklists matching your {partySize === 1 ? 'Solo' : `${partySize}-people`} packing needs.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation footer buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold text-xs px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              id="onboarding-next-btn"
              disabled={generating}
              onClick={step === 3 ? handleFinish : () => setStep(step + 1)}
              className={`bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-md text-nowrap cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Curating Journey...
                </>
              ) : (
                <>
                  {step === 3 ? 'Generate First Trip' : 'Continue'}
                  {step < 3 ? <ArrowRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Footer step counters */}
      <div className="text-center font-bold text-xs text-slate-450 uppercase tracking-widest shrink-0 py-2">
        Step {step} of 3
      </div>
    </div>
  );
}
