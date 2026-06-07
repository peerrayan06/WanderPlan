import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  ArrowLeft, 
  Trash, 
  Save, 
  Archive, 
  Settings, 
  MoreVertical, 
  Edit2,
  Plane,
  Car,
  Ship,
  Globe,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { Trip } from '../types';
import { saveTrip, deleteTrip, getCurrentUser, getCurrencySymbol, getTrips } from '../lib/storage';

// Direct child tab imports
import ItineraryTab from './ItineraryTab';
import MapTab from './MapTab';
import BudgetTab from './BudgetTab';
import PackingTab from './PackingTab';

import ConfirmModal from './ConfirmModal';

interface TripDetailProps {
  tripId: string;
  initialTab?: 'itinerary' | 'map' | 'budget' | 'packing';
  onBack: () => void;
  onRefresh: () => void;
}

export default function TripDetail({ tripId, initialTab = 'itinerary', onBack, onRefresh }: TripDetailProps) {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'budget' | 'packing'>(initialTab);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Storage loading
  const tripsList = getTrips();
  const trip = tripsList.find(t => t.id === tripId);

  // Edit fields modal toggling
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(trip?.title || '');
  const [editBudget, setEditBudget] = useState(trip?.budget || 1000);
  const [editParty, setEditParty] = useState(trip?.partySize || 2);
  const [editOrigin, setEditOrigin] = useState(trip?.origin || '');
  const [editOriginCountry, setEditOriginCountry] = useState(trip?.originCountry || '');
  const [editCurrency, setEditCurrency] = useState(() => trip?.budgetCurrency || getCurrentUser()?.currency || "INR");
  const [editTransportMode, setEditTransportMode] = useState<'airplane' | 'road' | 'waterway'>(trip?.transportMode || 'airplane');
  const [isValidating, setIsValidating] = useState(false);
  const [isUpdatingAI, setIsUpdatingAI] = useState(false);

  const currencies = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "AED"];

  if (!trip) {
    return (
      <div className="p-8 text-center bg-[#F8FAFC] min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-600">Travel plan could not be located.</p>
          <button onClick={onBack} className="bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(false);
    setIsUpdatingAI(false);

    const updated: Trip = {
      ...trip,
      title: editTitle,
      budget: editBudget,
      budgetCurrency: editCurrency,
      partySize: editParty,
      origin: editOrigin,
      originCountry: editOriginCountry,
      transportMode: editTransportMode
    };

    saveTrip(updated);
    setIsEditing(false);
    onRefresh();
  };

  const handleToggleArchive = () => {
    const updated: Trip = { ...trip, archived: !trip.archived };
    saveTrip(updated);
    setShowOptions(false);
    onRefresh();
    onBack(); // return to dashboard
  };

  const handleDeleteTrip = () => {
    setShowOptions(false);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    try {
      deleteTrip(trip.id);
      onRefresh();
      onBack();
    } catch (err) {
      console.error("Deletion error:", err);
      alert("Failed to delete the trip. Please try again.");
    }
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen pb-32 selection:bg-[#2563EB] selection:text-white text-left">
      <ConfirmModal 
        isOpen={showDeleteConfirm}
        title="Delete Trip Plan?"
        message="Are you completely confident you wish to delete this trip itinerary, expense logs, and checklists permanently? This cannot be undone."
        confirmText="Permanently Delete"
        cancelText="Keep Trip"
        isDanger={true}
        onConfirm={executeDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      
      {/* Top sticky detail control header */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-4 py-3 lg:py-5 md:max-w-7xl md:mx-auto md:left-0 md:right-0 md:rounded-t-3xl md:border-x md:border-x-slate-200 md:dark:border-x-slate-800">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onBack}
              className="p-1 px-[7px] py-[6px] shrink-0 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                {trip.title}
              </h1>
              <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-bold truncate flex items-center gap-0.5 uppercase tracking-wide">
                <MapPin className="w-3 h-3 text-[#F97316]" /> {trip.destination}
              </p>
            </div>
          </div>

          {/* Settings Menu trigger */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showOptions && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Update Trip details
                </button>
                <button
                  onClick={handleToggleArchive}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-slate-400" /> {trip.archived ? "Unarchive Trip" : "Archive/Complete"}
                </button>
                <button
                  onClick={handleDeleteTrip}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#DC2626] font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5 text-red-500" /> Delete trip perm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection Switches */}
        <div className="flex border-t border-slate-100 dark:border-slate-800 mt-2.5 pt-1 gap-1">
          {([
            { id: 'itinerary', label: 'Itinerary' },
            { id: 'map', label: 'Map stops' },
            { id: 'budget', label: 'Budget logs' },
            { id: 'packing', label: 'Packing list' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Tab content router container */}
      <div className="pt-28 lg:pt-36 px-4 max-w-7xl mx-auto relative z-10 w-full">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'itinerary' && (
            <ItineraryTab trip={trip} onRefresh={onRefresh} />
          )}
          {activeTab === 'map' && (
            <MapTab trip={trip} />
          )}
          {activeTab === 'budget' && (
            <BudgetTab trip={trip} onRefresh={onRefresh} />
          )}
          {activeTab === 'packing' && (
            <PackingTab trip={trip} />
          )}
        </div>
      </div>

      {/* Edit modal popup sheet screen overlay */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white dark:bg-[#0F172A] rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 space-y-4 w-full max-w-md shadow-2xl animate-[slideUp_0.25s_ease-out]">
            
            <div className="flex justify-between items-center">
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Update Trip settings</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdateTrip} className="space-y-4 text-left overflow-y-auto max-h-[70vh] pb-4 px-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Trip Memo Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-905 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-bold text-slate-900 dark:text-white transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Budget</label>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500">{getCurrencySymbol(editCurrency)}</div>
                    <input
                      type="number"
                      required
                      min="1"
                      value={editBudget}
                      onChange={(e) => setEditBudget(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-905 focus:border-blue-500 rounded-xl pl-7 pr-3 py-2.5 text-xs focus:outline-none font-bold text-slate-900 dark:text-white transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Currency</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <select
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-2 py-2.5 text-[10px] font-bold appearance-none outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                    >
                      {currencies.map(c => (
                        <option key={c} value={c} className="dark:bg-slate-900 text-slate-900 dark:text-white">{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-3 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Party Size</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={editParty}
                  onChange={(e) => setEditParty(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-905 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-bold text-slate-900 dark:text-white transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Origin City</label>
                  <input
                    type="text"
                    required
                    value={editOrigin}
                    onChange={(e) => setEditOrigin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-905 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-bold text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Country</label>
                  <input
                    type="text"
                    required
                    value={editOriginCountry}
                    onChange={(e) => setEditOriginCountry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-905 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-bold text-slate-900 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Travel Mode</label>
                <div className="flex gap-2">
                  {[
                    { id: 'airplane', label: 'Air', Icon: Plane },
                    { id: 'road', label: 'Road', Icon: Car },
                    { id: 'waterway', label: 'Water', Icon: Ship }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setEditTransportMode(mode.id as any)}
                      className={`flex-1 py-3.5 rounded-xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        editTransportMode === mode.id 
                          ? 'bg-blue-600 dark:bg-blue-600 border-blue-600 dark:border-blue-600 text-white font-extrabold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <mode.Icon className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold uppercase">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingAI || isValidating}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-black py-4 rounded-xl shadow-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing...
                  </>
                ) : isUpdatingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
