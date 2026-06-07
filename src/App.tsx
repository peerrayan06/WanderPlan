import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, WifiOff, Wifi } from 'lucide-react';

// Storage & types
import { User, Trip } from './types';
import { getCurrentUser, getTrips, initializeStorage, setCurrentUser, signupUser, getStoredUsers } from './lib/storage';
import { logout as firebaseLogout, subscribeToAuthChanges } from './lib/firebase';

// Screens imports 
import LandingPage from './components/LandingPage';
import AuthScreens from './components/AuthScreens';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import TripWizard from './components/TripWizard';
import TripDetail from './components/TripDetail';
import PastTrips from './components/PastTrips';
import Explore from './components/Explore';
import ProfileSettings from './components/ProfileSettings';
import BottomNavBar from './components/BottomNavBar';

type ViewType = 'landing' | 'login' | 'signup' | 'onboarding' | 'dashboard' | 'trip-wizard' | 'trip-detail' | 'explore' | 'past-trips' | 'profile';

export default function App() {
  // Navigation states
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [currentUser, setLocalUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripTab, setSelectedTripTab] = useState<'itinerary' | 'map' | 'budget' | 'packing'>('itinerary');
  const [appReady, setAppReady] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [resetParams, setResetParams] = useState<{ email: string; token: string } | null>(null);

  // Connection tracking states
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [showConnectionToast, setShowConnectionToast] = useState(false);

  // Monitor connection state shifts
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleOnline = () => {
      setIsOffline(false);
      setShowConnectionToast(true);
      timer = setTimeout(() => setShowConnectionToast(false), 4000);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowConnectionToast(true);
      timer = setTimeout(() => setShowConnectionToast(false), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Parse URL search params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetEmail = params.get('resetEmail');
    const resetToken = params.get('resetToken');
    if (resetEmail && resetToken) {
      setResetParams({ email: resetEmail, token: resetToken });
    }
  }, []);

  // Initialize storage seeds and load active configs on mount
  useEffect(() => {
    initializeStorage();
    refreshStorageData();
    
    // Subscribe to Firebase Auth for real-time session tracking
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        const existingUsers = getStoredUsers();
        let appUser = existingUsers.find(u => u.email.toLowerCase() === (firebaseUser.email || '').toLowerCase());
        
        if (!appUser && firebaseUser.email) {
          // If no local user exists, create one with Firebase info
          appUser = signupUser(
            firebaseUser.displayName || firebaseUser.email.split('@')[0],
            firebaseUser.email,
            firebaseUser.photoURL || undefined
          );
        }
        
        if (appUser) {
          // Mandatory image check
          if (!appUser.avatar) {
            setCurrentUser(appUser);
            setLocalUser(appUser);
            setCurrentView('signup');
            setValidationError('A profile image is required to access your dashboard. Please complete your profile.');
            return;
          }

          setCurrentUser(appUser);
          setLocalUser(appUser);
          setTrips(getTrips());
          
          // Auto-route to dashboard if on landing/auth pages
          setCurrentView(prev => (['landing', 'login', 'signup'].includes(prev) ? 'dashboard' : prev));
        }
      } else {
        // Only force logout view if we were authenticated before in this session
        const active = getCurrentUser();
        if (!active) {
          setLocalUser(null);
        }
      }
      setAppReady(true);
    });

    return () => unsubscribe();
  }, []);

  const refreshStorageData = () => {
    const list = getTrips();
    const u = getCurrentUser();
    setTrips(list);
    setLocalUser(u);
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
    } catch (err) {
      console.error("Firebase logout error:", err);
    }
    setCurrentUser(null);
    setLocalUser(null);
    setSelectedTripId(null);
    setCurrentView('landing');
  };

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setSelectedTripTab('itinerary'); // Reset tab view on select
    setCurrentView('trip-detail');
  };

  const handleOnboardingComplete = () => {
    refreshStorageData();
    setCurrentView('dashboard');
  };

  const handleTripCreated = (newTripId: string) => {
    refreshStorageData();
    handleSelectTrip(newTripId);
  };

  const handleStartPlanningFromExplore = (destinationName: string) => {
    // Navigate to wizard and preselected destination can be populated if set
    setCurrentView('trip-wizard');
  };

  // Safe check loader
  if (!appReady) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col justify-center items-center p-4">
        <div className="space-y-4 text-center">
          <Compass className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Configuring WanderPlan Assets...
          </p>
        </div>
      </div>
    );
  }

  // Determine if we should show the persistent bottom nav bar
  const authenticatedViews: ViewType[] = ['dashboard', 'explore', 'past-trips', 'profile', 'trip-detail', 'trip-wizard'];
  const showNavbar = currentUser !== null && authenticatedViews.includes(currentView);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-[#0F172A] selection:text-white antialiased transition-colors duration-200">
      <div className="grow w-full flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* Landing view */}
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grow"
            >
              <LandingPage 
                onNavigate={(view) => {
                  if (view === 'dashboard' && currentUser) {
                    setCurrentView('dashboard');
                  } else if (view === 'dashboard') {
                    setCurrentView('login');
                  } else {
                    setCurrentView(view);
                  }
                }} 
              />
            </motion.div>
          )}

          {/* Auth Screen views (Login or Signup) */}
          {(currentView === 'login' || currentView === 'signup') && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="grow"
            >
              <AuthScreens 
                initialMode={currentView}
                externalError={validationError}
                onNavigate={(view) => {
                  setValidationError(''); // Clear error on successful navigation
                  if (view === 'dashboard') {
                    refreshStorageData();
                    setCurrentView('dashboard');
                  } else {
                    setCurrentView(view);
                  }
                }}
              />
            </motion.div>
          )}

          {/* Onboarding Wizard view */}
          {currentView === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="grow"
            >
              <Onboarding onComplete={handleOnboardingComplete} />
            </motion.div>
          )}

          {/* Main App Desktop Wrapper Layout constraints */}
          {currentUser && authenticatedViews.includes(currentView) && (
            <motion.div 
              key="app-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-6xl mx-auto md:bg-white md:min-h-[80vh] md:my-10 md:rounded-[40px] md:shadow-premium md:border md:border-slate-100 relative flex flex-col grow overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {/* Internal Route components switcher slots */}
                <motion.div
                  key={currentView + (selectedTripId || '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="grow flex flex-col"
                >
                  {currentView === 'dashboard' && (
                    <Dashboard 
                      user={currentUser}
                      trips={trips}
                      onSelectTrip={handleSelectTrip}
                      onRefresh={refreshStorageData}
                      onNavigate={(v) => {
                        if (v === 'trip-wizard') setCurrentView('trip-wizard');
                        if (v === 'explore') setCurrentView('explore');
                        if (v === 'past-trips') setCurrentView('past-trips');
                        if (v === 'profile') setCurrentView('profile');
                      }}
                    />
                  )}

                  {currentView === 'trip-wizard' && (
                    <TripWizard 
                      onBack={() => setCurrentView('dashboard')}
                      onTripCreated={handleTripCreated}
                    />
                  )}

                  {currentView === 'trip-detail' && selectedTripId && (
                    <TripDetail 
                      tripId={selectedTripId}
                      initialTab={selectedTripTab}
                      onBack={() => setCurrentView('dashboard')}
                      onRefresh={refreshStorageData}
                    />
                  )}

                  {currentView === 'past-trips' && (
                    <PastTrips 
                      trips={trips}
                      onSelectTrip={handleSelectTrip}
                      onRefresh={refreshStorageData}
                      onBack={() => setCurrentView('dashboard')}
                    />
                  )}

                  {currentView === 'explore' && (
                    <Explore 
                      onStartPlanning={handleStartPlanningFromExplore}
                    />
                  )}

                  {currentView === 'profile' && (
                    <ProfileSettings 
                      user={currentUser}
                      onRefreshUser={refreshStorageData}
                      onLogout={handleLogout}
                      onBack={() => setCurrentView('dashboard')}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Interactive Mobile Sticky Bottom Navigation wrapper bar */}
      {showNavbar && (
        <BottomNavBar 
          activeView={currentView}
          onNavigate={(targetView) => {
            setSelectedTripId(null);
            setCurrentView(targetView);
            refreshStorageData();
          }}
        />
      )}

      {/* Reset Password Modal Overlay */}
      {resetParams && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
          <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-6 text-left relative animate-[scaleUp_0.15s_ease-out]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2563EB] rounded-t-[32px]" />
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-blue-100/10 dark:bg-blue-900/20 text-[#2563EB] mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Choose New Password</h2>
                <p className="text-xs text-slate-400 dark:text-slate-405 mt-1">Set secure credentials for {resetParams.email}</p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const target = e.currentTarget;
              const newPassword = (target.elements.namedItem('new_password') as HTMLInputElement).value;
              if (newPassword.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
              }
              const users = getStoredUsers();
              const foundIndex = users.findIndex(u => u.email.toLowerCase() === resetParams.email.toLowerCase());
              if (foundIndex !== -1) {
                users[foundIndex].password = newPassword;
                localStorage.setItem("WP_USERS", JSON.stringify(users));
                
                const currentU = getCurrentUser();
                if (currentU && currentU.email.toLowerCase() === resetParams.email.toLowerCase()) {
                  currentU.password = newPassword;
                  setCurrentUser(currentU);
                  setLocalUser(currentU);
                }
              } else {
                const newUser = signupUser(resetParams.email.split('@')[0], resetParams.email, undefined, newPassword);
                setLocalUser(newUser);
              }

              window.history.replaceState({}, document.title, window.location.pathname);
              setResetParams(null);
              alert("Success! Your password is updated correctly. You can now login securely.");
              setCurrentView('login');
            }} className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">New Security Password</span>
                <input
                  name="new_password"
                  type="password"
                  required
                  minLength={6}
                  autoFocus
                  placeholder="Min 6 characters"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-xs focus:outline-none font-bold text-slate-800 dark:text-white transition-all shadow-sm"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.history.replaceState({}, document.title, window.location.pathname);
                    setResetParams(null);
                  }}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-2xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-extrabold py-3 rounded-2xl shadow-xl hover:shadow-blue-500/10 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Verify & Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Network Connection Toast feedback */}
      <AnimatePresence>
        {showConnectionToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] w-auto max-w-[90%]"
          >
            {isOffline ? (
              <div className="bg-slate-900 border border-slate-800 text-white shadow-2xl rounded-full px-5 py-3.5 flex items-center gap-3 font-display text-xs font-bold leading-none">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <WifiOff className="w-4 h-4 text-amber-450 shrink-0" />
                <span>Offline Mode • Viewing Cached Itineraries & Maps</span>
              </div>
            ) : (
              <div className="bg-emerald-600 border border-emerald-500 text-white shadow-2xl rounded-full px-5 py-3.5 flex items-center gap-3 font-display text-xs font-bold leading-none">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
                </span>
                <Wifi className="w-4 h-4 text-emerald-100 shrink-0" />
                <span>Back Online! Your plans are safely locked in.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed top connection state indicator for persistent awareness */}
      {isOffline && !showConnectionToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[400] pointer-events-none select-none">
          <div className="bg-amber-600/90 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-amber-500/30">
            <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-100" />
            <span>Cached Travel Mode</span>
          </div>
        </div>
      )}
    </div>
  );
}
