import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Compass, Calendar, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { Trip, ItineraryEvent } from '../types';
import { getEventsForTrip } from '../lib/storage';
import L from 'leaflet';

interface MapTabProps {
  trip: Trip;
}

export default function MapTab({ trip }: MapTabProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [events] = useState<ItineraryEvent[]>(() => getEventsForTrip(trip.id));
  const [filterDay, setFilterDay] = useState<'all' | number>('all');
  const [activeEvent, setActiveEvent] = useState<ItineraryEvent | null>(null);

  // Maximum days list for dropdown
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Filter events by selected day
  const displayedEvents = events
    .filter(e => filterDay === 'all' || e.day === filterDay)
    .sort((a,b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.time.localeCompare(b.time);
    });

  // Handle building map instance
  useEffect(() => {
    if (!mapContainer.current) return;

    // Default coordinates (Paris, Rome, or generic depending on destination)
    let initialLat = 41.9028;
    let initialLng = 12.4964;

    if (events.length > 0) {
      initialLat = events[0].lat;
      initialLng = events[0].lng;
    } else {
      // Look up preset if matches
      if (trip.destination.toLowerCase().includes('tokyo')) { initialLat = 35.6762; initialLng = 139.6503; }
      else if (trip.destination.toLowerCase().includes('paris')) { initialLat = 48.8566; initialLng = 2.3522; }
      else if (trip.destination.toLowerCase().includes('york')) { initialLat = 40.7128; initialLng = -74.0060; }
    }

    // Initialize Leaflet Map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainer.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false // custom position underneath
      });

      // Add elegant CartoDB Positron maps tiles (high contrast and elegant light theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      // Add zoom control manually
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
    }

    return () => {
      // Destruction
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Sync Markers and bounds on filters changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear old markers from map layers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (displayedEvents.length === 0) return;

    const coordinatesList: L.LatLngTuple[] = [];

    displayedEvents.forEach((ev, i) => {
      const pointCoords: L.LatLngTuple = [ev.lat, ev.lng];
      coordinatesList.push(pointCoords);

      // Elegant custom numbered target pin marker
      const pinHtml = `
        <div class="relative w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-xl text-white flex items-center justify-center font-display font-black text-xs map-pulsing-dot cursor-pointer transition-transform hover:scale-110 active:scale-95">
          ${i + 1}
        </div>
      `;

      const numberedIcon = L.divIcon({
        html: pinHtml,
        className: '', // remove standard style
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -14]
      });

      // Create popup content
      const popupHtml = `
        <div class="p-2 space-y-1.5 text-slate-800 text-left text-xs max-w-sm font-sans">
          <div class="flex justify-between items-start gap-3">
            <span class="text-[9px] bg-orange-50 border border-orange-200 text-orange-655 font-bold px-1.5 py-0.5 rounded uppercase">Stop ${i + 1}</span>
            <strong class="text-[10px] text-slate-450">${ev.time}</strong>
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-tight">${ev.name}</h4>
          ${ev.location ? `<p class="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5"><strong class="font-bold">Loc:</strong> ${ev.location}</p>` : ''}
          ${ev.notes ? `<p class="text-[10px] text-slate-400 italic mt-1 font-medium bg-slate-50 p-1 rounded">"${ev.notes}"</p>` : ''}
        </div>
      `;

      const m = L.marker(pointCoords, { icon: numberedIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      // Handle marker events
      m.on('click', () => {
        setActiveEvent(ev);
        map.panTo(pointCoords);
      });

      markersRef.current.push(m);
    });

    // Draw route polyline line to trace path trails!
    if (coordinatesList.length > 1) {
      polylineRef.current = L.polyline(coordinatesList, {
        color: '#2563EB',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '6, 6'
      }).addTo(map);
    }

    // Auto-fit bounds of markers
    const group = L.featureGroup(markersRef.current);
    if (markersRef.current.length > 0) {
      map.fitBounds(group.getBounds().pad(0.15));
    }
  }, [displayedEvents]);

  const handleDirections = (ev: ItineraryEvent) => {
    // Open google maps directions query in new tab
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location || ev.name)}`;
    window.open(url, '_blank', 'referrerPolicy=no-referrer');
  };

  return (
    <div className="space-y-4 text-left pb-16">
      
      {/* Search Header Toggles */}
      <div className="bg-white p-3.5 rounded-[24px] border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block shrink-0">Map timeline track</label>
        
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="bg-slate-50 border border-slate-200 text-slate-705 font-bold text-xs p-2.5 rounded-xl outline-none focus:border-[#2563EB] max-w-44 grow cursor-pointer font-sans"
        >
          <option value="all">Show All Days Combined</option>
          {Array.from({ length: dayCount }).map((_, i) => (
            <option key={i + 1} value={i + 1}>Day {i + 1} Stops Only</option>
          ))}
        </select>
      </div>

      {/* Main Map Canvas Window */}
      <div className="relative rounded-[24px] overflow-hidden border border-slate-200 shadow-inner">
        <div 
          ref={mapContainer} 
          className="w-full h-80 sm:h-96 bg-slate-100 z-10" 
        />
        
        {/* Float map overlay instruction key */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 z-20 shadow-md text-[10px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full inline-block" />
            <span>Orange Pins = Sequential Stops</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-5 h-[2px] bg-blue-500 border-t border-dashed inline-block" />
            <span>Blue Line = Planned Trail Grid</span>
          </div>
        </div>
      </div>

      {/* Details interactive bottom panel of highlighted node stop */}
      {displayedEvents.length > 0 ? (
        <div className="bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[9px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded uppercase tracking-wide">
                Day {activeEvent ? activeEvent.day : displayedEvents[0].day} stops info
              </span>
              <h3 className="font-display font-bold text-sm text-slate-900 mt-1.5 truncate max-w-[240px]">
                {activeEvent ? activeEvent.name : displayedEvents[0].name}
              </h3>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold truncate max-w-[240px] mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {activeEvent ? activeEvent.location : displayedEvents[0].location}
              </p>
            </div>

            <button
              id="map-directions-btn"
              onClick={() => handleDirections(activeEvent || displayedEvents[0])}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs p-3.5 rounded-xl shadow transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" /> Directions
            </button>
          </div>

          {(activeEvent?.notes || displayedEvents[0].notes) && (
            <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg italic">
              "{activeEvent ? activeEvent.notes : displayedEvents[0].notes}"
            </p>
          )}

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center pt-1 animate-pulse">
            👆 Tap any map pin marker node above to load its detailed card coordinates.
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
          No planned map pins found for Day {filterDay}. Map stop markers will populate here as soon as you record events inside the <strong>Itinerary tab</strong> tab.
        </div>
      )}

    </div>
  );
}
