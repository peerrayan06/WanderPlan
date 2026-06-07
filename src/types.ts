/**
 * WanderPlan TypeScript Interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  currency: string;
  password?: string;
  notificationsEnabled: boolean;
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  origin?: string;
  originCountry?: string;
  transportMode?: 'airplane' | 'road' | 'waterway';
  coverUrl: string;
  startDate: string;
  endDate: string;
  partySize: number;
  budget: number;
  budgetCurrency?: string;
  budgetFeedback?: string;
  transportInstructions?: string;
  createdAt: string;
  archived?: boolean;
}

export type EventCategory = 'food' | 'transport' | 'accommodation' | 'activity' | 'other';

export interface ItineraryEvent {
  id: string;
  tripId: string;
  day: number; // 1-indexed day of the trip
  time: string; // HH:MM
  name: string;
  category: EventCategory;
  location: string;
  lat: number;
  lng: number;
  notes?: string;
  done: boolean;
  order: number;
  costEstimate?: number;
  tags?: string[];
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  currency: string;
  category: string; // e.g. "Food", "Lodging", "Transport", "Shopping", "Entertainment", "Other"
  description: string;
  date: string;
}

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: string; // e.g. "Clothing", "Toiletries", "Electronics", "Documents", "Medications", "Other"
  packed: boolean;
}

export interface PresetDestination {
  name: string;
  country: string;
  flag: string;
  coverUrl: string;
  lat: number;
  lng: number;
}

export const PRESET_DESTINATIONS: PresetDestination[] = [
  {
    name: "Paris",
    country: "France",
    flag: "🇫🇷",
    coverUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    lat: 48.8566,
    lng: 2.3522
  },
  {
    name: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    coverUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    lat: 35.6762,
    lng: 139.6503
  },
  {
    name: "New York",
    country: "United States",
    flag: "🇺🇸",
    coverUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    lat: 40.7128,
    lng: -74.0060
  },
  {
    name: "Rome",
    country: "Italy",
    flag: "🇮🇹",
    coverUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    lat: 41.9028,
    lng: 12.4964
  },
  {
    name: "London",
    country: "United Kingdom",
    flag: "🇬🇧",
    coverUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    lat: 51.5074,
    lng: -0.1278
  },
  {
    name: "Sydney",
    country: "Australia",
    flag: "🇦🇺",
    coverUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
    lat: -33.8688,
    lng: 151.2093
  },
  {
    name: "Bali",
    country: "Indonesia",
    flag: "🇮🇩",
    coverUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    lat: -8.4095,
    lng: 115.1889
  },
  {
    name: "Barcelona",
    country: "Spain",
    flag: "🇪🇸",
    coverUrl: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
    lat: 41.3851,
    lng: 2.1734
  }
];

export const DEFAULT_COVER = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
