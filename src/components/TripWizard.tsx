import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign, 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Image as ImageIcon,
  Plane,
  Car,
  Ship,
  ChevronDown,
  Globe,
  Wallet,
  Sparkles
} from 'lucide-react';
import { PRESET_DESTINATIONS, DEFAULT_COVER, Trip } from '../types';
import { saveTrip, saveEvent, saveEvents, seedPackingTemplate, getCurrentUser, getCurrencySymbol, setCurrentUser } from '../lib/storage';

interface TripWizardProps {
  onBack: () => void;
  onTripCreated: (tripId: string) => void;
}

export default function TripWizard({ onBack, onTripCreated }: TripWizardProps) {
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [transportMode, setTransportMode] = useState<'airplane' | 'road' | 'waterway'>('airplane');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 12);
    return today.toISOString().split('T')[0];
  });
  const [partySize, setPartySize] = useState(2);
  const [budget, setBudget] = useState(1500);
  const [currency, setCurrency] = useState(() => getCurrentUser()?.currency || "INR");
  const [coverUrl, setCoverUrl] = useState(DEFAULT_COVER);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);

  const currencies = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "AED"];

  // Handle selected preset
  const handlePresetSelect = (name: string) => {
    setDestination(name);
    if (!title) {
      setTitle(`${name} Exploration`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;
    setError('');

    const trimmedDest = destination.trim();
    if (!trimmedDest) {
      setError('Please search or type a destination');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please pick valid departure and return dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Return date must occur after the departure date');
      return;
    }

    if (budget <= 0) {
      setError('Trip budget must be a positive number');
      return;
    }

    setValidating(false);
    setError('');

    try {
      const activeUser = getCurrentUser();
      
      // Update user's preferred currency if it changed
      if (activeUser && activeUser.currency !== currency) {
        setCurrentUser({ ...activeUser, currency });
      }

      const matchedPreset = PRESET_DESTINATIONS.find(
        p => p.name.toLowerCase() === trimmedDest.toLowerCase()
      );
      const tripTitle = title.trim() || `${trimmedDest} Getaway`;

      const newTripId = `trip-${Date.now()}`;
      const newTrip: Trip = {
        id: newTripId,
        userId: activeUser?.id || "user-1",
        title: tripTitle,
        destination: trimmedDest,
        origin,
        originCountry,
        transportMode,
        coverUrl: matchedPreset?.coverUrl || DEFAULT_COVER,
        startDate,
        endDate,
        partySize,
        budget,
        budgetCurrency: currency,
        createdAt: new Date().toISOString(),
        transportInstructions: `Enjoy your trip from ${origin} to ${trimmedDest}!`,
        budgetFeedback: "High-level budget tracking is active. Add expenses to see analysis."
      };

      saveTrip(newTrip);

      // Create initial arrival event
      saveEvent({
        id: `ev-new-${Date.now()}`,
        tripId: newTrip.id,
        day: 1,
        time: "14:00",
        name: `Arrive in ${trimmedDest}`,
        category: "accommodation",
        location: `${trimmedDest} Central`,
        lat: matchedPreset?.lat || 40.7128 + (Math.random() * 0.05 - 0.025),
        lng: matchedPreset?.lng || -74.0060 + (Math.random() * 0.05 - 0.025),
        notes: "Arrival and check-in. Start your adventure here!",
        done: false,
        order: 0
      });

      // Seed packing checklists
      seedPackingTemplate(newTrip.id, "Clothing");
      seedPackingTemplate(newTrip.id, "Toiletries");
      seedPackingTemplate(newTrip.id, "Documents");

      onTripCreated(newTrip.id);
    } catch (err: any) {
      console.error(err);
      setError('Failed to create trip record. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32 pt-6 px-4 selection:bg-[#2563EB] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 cursor-pointer bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 hover:border-slate-350 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-left">
            <h1 className="font-display font-bold text-xl text-slate-900">Plan a New Voyage</h1>
            <p className="text-xs text-slate-500">Configure your upcoming trip coordinates.</p>
          </div>
        </div>

        {/* Validation Alert */}
        {error && (
          <div className="bg-red-50 border border-red-150 text-red-600 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-[24px] border border-slate-200 shadow-sm space-y-8 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Origin Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">1. Origin Coordinates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-9 pr-2 py-2.5 text-xs focus:outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Country</label>
                  <div className="relative">
                    <Compass className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="India"
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-9 pr-2 py-2.5 text-xs focus:outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Transport Mode */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Primary Transport</label>
                <div className="flex gap-2">
                  {[
                    { id: 'airplane', label: 'Air', Icon: Plane },
                    { id: 'road', label: 'Road', Icon: Car },
                    { id: 'waterway', label: 'Water', Icon: Ship }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTransportMode(mode.id as any)}
                      className={`flex-1 py-3 px-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2 relative overflow-hidden ${
                        transportMode === mode.id
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${transportMode === mode.id ? 'bg-white/10' : 'bg-slate-50'}`}>
                        <mode.Icon className={`w-4 h-4 ${transportMode === mode.id ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <span className={`text-[9px] font-black uppercase ${transportMode === mode.id ? 'text-white' : 'text-slate-500'}`}>
                        {mode.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Destination Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">2. Destination & Title</h3>
              {/* Destination & Autocomplete */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Where to?</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rome, Tokyo"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      if (!title) setTitle(`${e.target.value} Exploration`);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Trip Custom Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Give it a Name</label>
                <div className="relative">
                  <Compass className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Summer Break 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Dates and Crew */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">3. Timing & Crew</h3>
              {/* Date Picker Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-9 pr-2 py-2.5 text-xs focus:outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-9 pr-2 py-2.5 text-xs focus:outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Party Size Counter Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Traveller Count</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPartySize(num)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        partySize === num
                          ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {num === 1 ? 'Solo' : `${num}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Economy Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">4. Financials</h3>
              {/* Set Budget Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Trip Economy</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3.5 top-[13.5px] text-xs font-extrabold text-slate-400 pointer-events-none select-none font-sans">
                      {getCurrencySymbol(currency)}
                    </div>
                    <input
                      type="number"
                      required
                      min="100"
                      step="50"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:border-brand-primary rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all font-black text-slate-800 shadow-sm"
                      placeholder="Set Budget"
                    />
                  </div>
                  
                  <div className="relative w-28 shrink-0">
                    <Globe className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-2 py-3 text-[10px] font-black appearance-none outline-none focus:border-brand-primary transition-all text-slate-700 shadow-sm"
                    >
                      {currencies.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-4 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="bg-blue-50/50 p-4 rounded-2xl flex items-center gap-3 border border-blue-100 text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-tight">AI will track your spend against this cap</span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={generating || validating}
            className={`w-full ${(generating || validating) ? 'bg-slate-200' : 'bg-slate-900 hover:bg-black'} text-white font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.2em] mt-2 cursor-pointer disabled:cursor-not-allowed`}
          >
            {validating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparing Voyage...
              </>
            ) : generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                Building Timeline...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-brand-primary" />
                Create Voyage Plan
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
