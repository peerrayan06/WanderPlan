import { User, Trip, ItineraryEvent, Expense, PackingItem, PRESET_DESTINATIONS } from '../types';

// Helper to calculate relative dates
const getDateOffset = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const MOCK_USER: User = {
  id: "user-1",
  email: "traveller@wanderplan.io",
  name: "Alex Mercer",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  currency: "INR",
  password: "password",
  notificationsEnabled: true,
  createdAt: new Date().toISOString()
};

const MOCK_TRIPS: Trip[] = [
  {
    id: "trip-rome",
    userId: "user-1",
    title: "La Dolce Vita Explorer",
    destination: "Rome, Italy",
    coverUrl: PRESET_DESTINATIONS.find(d => d.name === "Rome")?.coverUrl || "",
    startDate: getDateOffset(12),  // starts in 12 days
    endDate: getDateOffset(17),
    partySize: 2,
    budget: 2500,
    createdAt: new Date().toISOString(),
    archived: false
  },
  {
    id: "trip-paris",
    userId: "user-1",
    title: "Parisienne Art Walk",
    destination: "Paris, France",
    coverUrl: PRESET_DESTINATIONS.find(d => d.name === "Paris")?.coverUrl || "",
    startDate: getDateOffset(-45), // past trip
    endDate: getDateOffset(-40),
    partySize: 1,
    budget: 1800,
    createdAt: new Date().toISOString(),
    archived: true
  }
];

const MOCK_EVENTS: ItineraryEvent[] = [
  // Rome Trip Events
  {
    id: "event-rome-1",
    tripId: "trip-rome",
    day: 1,
    time: "10:30",
    name: "Colosseum Guided Vaults Tour",
    category: "activity",
    location: "Colosseum, Piazza del Colosseo, Rome",
    lat: 41.8902,
    lng: 12.4922,
    notes: "Meeting at the arch of Constantine. Bring water and ID.",
    done: false,
    order: 0
  },
  {
    id: "event-rome-2",
    tripId: "trip-rome",
    day: 1,
    time: "13:30",
    name: "Lunch at Armando al Pantheon",
    category: "food",
    location: "Salita de' Crescenzi 31, Rome",
    lat: 41.8988,
    lng: 12.4764,
    notes: "Reservation confirmed. Try the Cacio e Pepe!",
    done: false,
    order: 1
  },
  {
    id: "event-rome-3",
    tripId: "trip-rome",
    day: 1,
    time: "16:00",
    name: "Check into Boutique Campo de' Fiori",
    category: "accommodation",
    location: "Piazza Campo de' Fiori, Rome",
    lat: 41.8957,
    lng: 12.4722,
    notes: "Booking ref: #ROM-8849-WP",
    done: false,
    order: 2
  },
  {
    id: "event-rome-4",
    tripId: "trip-rome",
    day: 2,
    time: "09:00",
    name: "Vatican Museums & Sistine Chapel",
    category: "activity",
    location: "Vatican Museums, Vatican City",
    lat: 41.9062,
    lng: 12.4536,
    notes: "Skip-the-line tickets. Direct entry. No shoulders/knees showing.",
    done: false,
    order: 0
  },
  {
    id: "event-rome-5",
    tripId: "trip-rome",
    day: 2,
    time: "15:00",
    name: "Gelato Walk near Trevi Fountain",
    category: "food",
    location: "Trevi Fountain, Rome",
    lat: 41.9009,
    lng: 12.4833,
    notes: "Throw a coin with the right hand over the left shoulder!",
    done: false,
    order: 1
  }
];

const MOCK_EXPENSES: Expense[] = [
  {
    id: "exp-rome-1",
    tripId: "trip-rome",
    amount: 650,
    currency: "USD",
    category: "Lodging",
    description: "Boutique Campo de' Fiori Deposit",
    date: getDateOffset(-5)
  },
  {
    id: "exp-rome-2",
    tripId: "trip-rome",
    amount: 140,
    currency: "USD",
    category: "Tours",
    description: "Colosseum Vaults Tickets & Vatican VIP Entry",
    date: getDateOffset(-2)
  },
  {
    id: "exp-rome-3",
    tripId: "trip-rome",
    amount: 450,
    currency: "USD",
    category: "Transport",
    description: "Roundtrip Flight to FCO Rome",
    date: getDateOffset(-10)
  },
  {
    id: "exp-rome-4",
    tripId: "trip-rome",
    amount: 80,
    currency: "USD",
    category: "Food",
    description: "First Dinner Reservations",
    date: getDateOffset(0)
  }
];

const MOCK_PACKING: PackingItem[] = [
  // Clothes
  { id: "pack-r-1", tripId: "trip-rome", name: "Summer dresses / Light linen shirts", category: "Clothing", packed: true },
  { id: "pack-r-2", tripId: "trip-rome", name: "Comfortable walking shoes (essential)", category: "Clothing", packed: true },
  { id: "pack-r-3", tripId: "trip-rome", name: "Sunglasses + sun hat", category: "Clothing", packed: false },
  { id: "pack-r-4", tripId: "trip-rome", name: "Modest clothes (Vatican-appropriate)", category: "Clothing", packed: false },
  
  // Documents
  { id: "pack-r-5", tripId: "trip-rome", name: "EU Digital Passport + Copy", category: "Documents", packed: true },
  { id: "pack-r-6", tripId: "trip-rome", name: "Travel insurance PDF copy", category: "Documents", packed: false },
  { id: "pack-r-7", tripId: "trip-rome", name: "Booking confirmations & Vatican Tickets", category: "Documents", packed: true },

  // Electronics
  { id: "pack-r-8", tripId: "trip-rome", name: "Universal power adapter plug", category: "Electronics", packed: false },
  { id: "pack-r-9", tripId: "trip-rome", name: "USB-C fast power bank", category: "Electronics", packed: true },

  // Toiletries
  { id: "pack-r-10", tripId: "trip-rome", name: "High SPF sunscreen (Italy is hot!)", category: "Toiletries", packed: false },
  { id: "pack-r-11", tripId: "trip-rome", name: "Mini tooth brush & travel paste", category: "Toiletries", packed: true }
];

export const initializeStorage = () => {
  if (!localStorage.getItem("WP_INITIALIZED")) {
    localStorage.setItem("WP_USERS", JSON.stringify([MOCK_USER]));
    localStorage.setItem("WP_TRIPS", JSON.stringify(MOCK_TRIPS));
    localStorage.setItem("WP_EVENTS", JSON.stringify(MOCK_EVENTS));
    localStorage.setItem("WP_EXPENSES", JSON.stringify(MOCK_EXPENSES));
    localStorage.setItem("WP_PACKING", JSON.stringify(MOCK_PACKING));
    localStorage.setItem("WP_CURRENT_USER", JSON.stringify(MOCK_USER));
    localStorage.setItem("WP_INITIALIZED", "true");
  }
};

export const wipeAllData = () => {
  localStorage.clear();
  // We can re-initialize if we want, but usually wipe means wipe.
  // initializeStorage(); 
};

// --- AUTH & USER ---
export const getStoredUsers = (): User[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("WP_USERS") || "[]");
};

export const getCurrentUser = (): User | null => {
  initializeStorage();
  const raw = localStorage.getItem("WP_CURRENT_USER");
  return raw ? JSON.parse(raw) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user === null) {
    localStorage.removeItem("WP_CURRENT_USER");
  } else {
    localStorage.setItem("WP_CURRENT_USER", JSON.stringify(user));
    // update in users list as well
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem("WP_USERS", JSON.stringify(users));
  }
};

export const signupUser = (name: string, email: string, avatar?: string, password?: string): User => {
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
    currency: "INR",
    password: password || "password",
    notificationsEnabled: true,
    createdAt: new Date().toISOString()
  };
  const users = getStoredUsers();
  users.push(newUser);
  localStorage.setItem("WP_USERS", JSON.stringify(users));
  setCurrentUser(newUser);
  return newUser;
};

// --- TRIPS ---
export const getTrips = (): Trip[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("WP_TRIPS") || "[]");
};

export const getTripById = (id: string): Trip | undefined => {
  return getTrips().find(t => t.id === id);
};

export const saveTrip = (trip: Trip) => {
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === trip.id);
  if (index !== -1) {
    trips[index] = trip;
  } else {
    trips.push(trip);
  }
  localStorage.setItem("WP_TRIPS", JSON.stringify(trips));
};

export const deleteTrip = (tripId: string) => {
  const trips = getTrips().filter(t => t.id !== tripId);
  localStorage.setItem("WP_TRIPS", JSON.stringify(trips));

  // Cascade delete Correct filter on global states
  const remainingEvents = getEvents().filter(e => e.tripId !== tripId);
  localStorage.setItem("WP_EVENTS", JSON.stringify(remainingEvents));

  const remainingExpenses = getExpenses().filter(ex => ex.tripId !== tripId);
  localStorage.setItem("WP_EXPENSES", JSON.stringify(remainingExpenses));

  const remainingPacking = getPackingItems().filter(p => p.tripId !== tripId);
  localStorage.setItem("WP_PACKING", JSON.stringify(remainingPacking));
};

// --- EVENTS ---
export const getEvents = (): ItineraryEvent[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("WP_EVENTS") || "[]");
};

export const getEventsForTrip = (tripId: string): ItineraryEvent[] => {
  return getEvents().filter(e => e.tripId === tripId).sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    if (a.time !== b.time) return a.time.localeCompare(b.time);
    return a.order - b.order;
  });
};

export const saveEvent = (event: ItineraryEvent) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === event.id);
  if (index !== -1) {
    events[index] = event;
  } else {
    events.push(event);
  }
  localStorage.setItem("WP_EVENTS", JSON.stringify(events));
};

export const saveEvents = (events: ItineraryEvent[]) => {
  const allEvents = getEvents();
  const updatedEvents = [...allEvents];
  
  events.forEach(event => {
    const index = updatedEvents.findIndex(e => e.id === event.id);
    if (index !== -1) {
      updatedEvents[index] = event;
    } else {
      updatedEvents.push(event);
    }
  });
  
  localStorage.setItem("WP_EVENTS", JSON.stringify(updatedEvents));
};

export const deleteEvent = (eventId: string) => {
  const events = getEvents().filter(e => e.id !== eventId);
  localStorage.setItem("WP_EVENTS", JSON.stringify(events));
};

// --- EXPENSES ---
export const getExpenses = (): Expense[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("WP_EXPENSES") || "[]");
};

export const getExpensesForTrip = (tripId: string): Expense[] => {
  return getExpenses().filter(e => e.tripId === tripId).sort((a, b) => b.date.localeCompare(a.date));
};

export const saveExpense = (expense: Expense) => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === expense.id);
  if (index !== -1) {
    expenses[index] = expense;
  } else {
    expenses.push(expense);
  }
  localStorage.setItem("WP_EXPENSES", JSON.stringify(expenses));
};

export const deleteExpense = (expenseId: string) => {
  const expenses = getExpenses().filter(e => e.id !== expenseId);
  localStorage.setItem("WP_EXPENSES", JSON.stringify(expenses));
};

// --- PACKING ---
export const getPackingItems = (): PackingItem[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem("WP_PACKING") || "[]");
};

export const getPackingForTrip = (tripId: string): PackingItem[] => {
  return getPackingItems().filter(e => e.tripId === tripId);
};

export const savePackingItem = (item: PackingItem) => {
  const items = getPackingItems();
  const index = items.findIndex(e => e.id === item.id);
  if (index !== -1) {
    items[index] = item;
  } else {
    items.push(item);
  }
  localStorage.setItem("WP_PACKING", JSON.stringify(items));
};

export const deletePackingItem = (itemId: string) => {
  const items = getPackingItems().filter(i => i.id !== itemId);
  localStorage.setItem("WP_PACKING", JSON.stringify(items));
};

export const seedPackingTemplate = (tripId: string, templateCategory: string) => {
  const templates: Record<string, string[]> = {
    "Clothing": ["T-shirts", "Linen Shirts", "Shorts / Skirts", "Underwear x5", "Light jacket", "Running sneakers", "Swimwear"],
    "Toiletries": ["Toothbrush & Toothpaste", "Shampoo & Bodywash", "Sunscreen (SPF 50)", "Deodorant", "Moisturizer", "Hairbrush"],
    "Electronics": ["Smartphone charger", "USB Powerbank", "Universal Outlet adapter", "Headphones", "Camera + spare memory"],
    "Documents": ["Passport", "Boarding passes", "Hotel reservations (PDF)", "Driver's license", "Credit cards"],
    "Medications": ["Painkillers / Advil", "Antihistamines", "Prescription pills", "Band-aids & Antiseptic cream", "Motion sickness pills"]
  };

  const itemsToCreate = templates[templateCategory] || [];
  const currentItems = getPackingForTrip(tripId);
  
  itemsToCreate.forEach(name => {
    // Avoid creating duplicate named items within same category
    if (!currentItems.some(item => item.name.toLowerCase() === name.toLowerCase())) {
      const newItem: PackingItem = {
        id: `pack-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        tripId,
        name,
        category: templateCategory,
        packed: false
      };
      savePackingItem(newItem);
    }
  });
};

export const getCurrencySymbol = (currencyCode?: string): string => {
  const activeCurrency = currencyCode || getCurrentUser()?.currency || "INR";
  switch (activeCurrency.toUpperCase()) {
    case "INR": return "₹";
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "JPY": return "¥";
    case "AUD": return "A$";
    case "CAD": return "C$";
    case "AED": return "DH";
    default: return "₹";
  }
};
