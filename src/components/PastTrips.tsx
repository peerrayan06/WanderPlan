import React from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, Compass, ArrowLeft, History, RotateCcw, Trash, MapPin } from 'lucide-react';
import { Trip } from '../types';
import { saveTrip, deleteTrip } from '../lib/storage';
import ConfirmModal from './ConfirmModal';

interface PastTripsProps {
  trips: Trip[];
  onSelectTrip: (tripId: string) => void;
  onRefresh: () => void;
  onBack: () => void;
}

export default function PastTrips({ trips, onSelectTrip, onRefresh, onBack }: PastTripsProps) {
  const [deleteTripId, setDeleteTripId] = React.useState<string | null>(null);
  const archived = trips.filter(t => t.archived || new Date(t.endDate) < new Date());

  const handleUnarchive = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    const updated = { ...trip, archived: false };
    // If it was auto-archived due to date, we can't really "unarchive" it without changing dates, 
    // but the user might want to keep it in active. So we'll force the archived flag to false.
    saveTrip(updated);
    onRefresh();
  };

  const handleDeleteClick = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    setDeleteTripId(tripId);
  };

  const executeDelete = () => {
    if (deleteTripId) {
      deleteTrip(deleteTripId);
      setDeleteTripId(null);
      // Let it refresh
      onRefresh();
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-32 pt-6 px-4 selection:bg-[#2563EB] selection:text-white text-left">
      <ConfirmModal 
        isOpen={deleteTripId !== null}
        title="Remove Saved Journey?"
        message="Permanently remove this journey? This will erase all logged trails, events and budgets. This action cannot be reversed."
        confirmText="Erase Permanently"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={executeDelete}
        onCancel={() => setDeleteTripId(null)}
      />
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Top bar back row */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 cursor-pointer bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 hover:border-slate-350 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-slate-900 flex items-center gap-1.5">
              <History className="w-5 h-5 text-purple-600" />
              Past Adventures
            </h1>
            <p className="text-xs text-slate-500">Your historical travel journals.</p>
          </div>
        </div>

        {archived.length > 0 ? (
          <div className="space-y-4">
            {archived.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip.id)}
                className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all flex h-28"
              >
                {/* Visual Cover on Left side */}
                <div className="w-24 relative overflow-hidden shrink-0 bg-slate-100">
                  {trip.coverUrl ? (
                    <img 
                      src={trip.coverUrl} 
                      className="w-full h-full object-cover" 
                      alt={trip.destination} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Compass className="w-6 h-6 opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Info Text on Right side */}
                <div className="p-3 flex flex-col justify-between grow min-w-0">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{trip.title}</h3>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" /> {trip.destination}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-550 pt-1.5 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-450" />
                      <span>{new Date(trip.startDate).toLocaleDateString(undefined, {month: 'short', year: '2-digit'})}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        title="Unarchive & Move to Active"
                        onClick={(e) => handleUnarchive(e, trip)}
                        className="p-1 px-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] font-bold hover:bg-blue-100 text-[#2563EB] flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                      <button
                        title="Delete permanently"
                        onClick={(e) => handleDeleteClick(e, trip.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[24px] text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-slate-800 text-sm">No History Recorded</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Once an active trip has passed date bounds or you select Archive, they'll gather inside here.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
