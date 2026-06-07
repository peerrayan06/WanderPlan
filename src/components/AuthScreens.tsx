import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';
import { signupUser, getStoredUsers, setCurrentUser } from '../lib/storage';
import { signInWithGoogle } from '../lib/firebase';
import ImagePicker from './ImagePicker';

interface AuthScreensProps {
  initialMode: 'login' | 'signup';
  onNavigate: (view: 'dashboard' | 'onboarding' | 'landing') => void;
}

export default function AuthScreens({ initialMode, onNavigate }: AuthScreensProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [avatar, setAvatar] = useState('');

  // Dynamically load existing avatar if the user types an email that already exists
  React.useEffect(() => {
    if (mode === 'login' && email) {
      const users = getStoredUsers();
      const matched = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (matched && matched.avatar) {
        setAvatar(matched.avatar);
      }
    }
  }, [email, mode]);
  
  // States for UX simulation
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleOAuthLogin = async () => {
    setLoading(true);
    setValidationError('');
    try {
      const firebaseUser = await signInWithGoogle();
      
      // Map Firebase user to app User type
      const existingUsers = getStoredUsers();
      let appUser = existingUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
      
      if (!appUser) {
        // Create new user in local storage if doesn't exist
        appUser = signupUser(
          firebaseUser.displayName || 'Alex Mercer',
          firebaseUser.email || 'traveller@wanderplan.io',
          firebaseUser.photoURL || avatar
        );
      }
      
      setCurrentUser(appUser);
      setLoading(false);
      onNavigate('dashboard');
    } catch (err: any) {
      setLoading(false);
      setValidationError(err.message || 'Error authenticating with Google. Please try again.');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (mode === 'signup') {
      if (!name || !email || !password) {
        setValidationError('All fields are strictly required');
        return;
      }
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        try {
          const users = getStoredUsers();
          const alreadyExists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
          if (alreadyExists) {
            setLoading(false);
            setValidationError('An account with this email address already exists.');
            return;
          }
          const user = signupUser(name, email, avatar, password);
          setLoading(false);
          // New onboarding is clean
          onNavigate('onboarding');
        } catch (err) {
          setLoading(false);
          setValidationError('Authentication error occurred. Please try again.');
        }
      }, 900);

    } else if (mode === 'login') {
      if (!email || !password) {
        setValidationError('Please supply both email and password');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const users = getStoredUsers();
        const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        
        if (found) {
          // Validate password securely (accommodate legacy mock data defaults fallback)
          const expectedPassword = found.password || 'password';
          if (expectedPassword !== password) {
            setLoading(false);
            setValidationError('Invalid password. Please double check your details.');
            return;
          }
          found.avatar = avatar; // Save taken screenshot if provided
          setCurrentUser(found);
          setLoading(false);
          onNavigate('dashboard');
        } else {
          setLoading(false);
          setValidationError('No registered account found with this email. Please sign up first.');
        }
      }, 800);

    } else if (mode === 'forgot') {
      if (!email) {
        setValidationError('Email is required');
        return;
      }
      setLoading(true);
      fetch('/api/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setResetSuccess(true);
          setGeneratedLink(data.resetLink);
        } else {
          setValidationError(data.error || 'Failed to dispatch password restoration email.');
        }
      })
      .catch(err => {
        setLoading(false);
        setValidationError('Failed to connect to SMTP transmission agent. Double check server connectivity.');
      });
    }
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col justify-center items-center px-4 py-8 selection:bg-[#2563EB] selection:text-white transition-colors duration-300">
      {/* Brand logo at top */}
      <div className="mb-6 flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
        <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-sm">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
          Wander<span className="text-[#2563EB]">Plan</span>
        </span>
      </div>

      <div className="bg-white dark:bg-[#1E293B] p-6 sm:p-8 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm w-full max-w-md relative overflow-hidden transition-colors duration-300">
        
        {/* Decorative ambient gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#2563EB]" />
        
        {loading && (
          <div className="absolute top-1.5 left-0 right-0 h-1 bg-blue-100 overflow-hidden">
            <div className="h-full bg-blue-600 animate-[pulse_1s_infinite] w-1/3 rounded-full" />
          </div>
        )}

        <div className="space-y-6">
          
          {/* Form Header */}
          <div className="text-center">
            {mode === 'signup' && (
              <>
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Join in under 60 seconds. Start mapping free.</p>
              </>
            )}
            {mode === 'login' && (
              <>
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Welcome back adventurer</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your planned itineraries are waiting.</p>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Reset your password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We'll email you a secure link immediately.</p>
              </>
            )}
          </div>

          {/* Social login option (not for forgot password) */}
          {mode !== 'forgot' && !resetSuccess && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleOAuthLogin}
                disabled={loading}
                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white hover:border-slate-300 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
              >
                <img 
                  src="https://www.svgrepo.com/show/475656/google-color.svg" 
                  className="w-4 h-4" 
                  alt="Google code" 
                  referrerPolicy="no-referrer"
                />
                Continue with Google
              </button>
              
              <div className="flex items-center gap-3">
                <div className="h-[1px] bg-slate-100 grow" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or email access</span>
                <div className="h-[1px] bg-slate-100 grow" />
              </div>
            </div>
          )}

          {/* Error display */}
          {validationError && (
            <div className="bg-red-50 border border-red-150 text-red-600 text-xs p-3 rounded-xl font-medium animate-[shake_0.5s_ease-in-out]">
              {validationError}
            </div>
          )}

          {resetSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-green-50 text-green-650 rounded-full flex items-center justify-center mx-auto border border-green-155">
                <Sparkles className="w-6 h-6 text-green-600 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Verification Sent</h3>
                <p className="text-xs text-slate-550 max-w-xs mx-auto leading-relaxed">
                  A verification link was dispatched to <strong>{email}</strong> in real-time. Since you are in a sandboxed developer instance, click below to open your simulated inbox and choose a new password:
                </p>
                {generatedLink && (
                  <div className="pt-3">
                    <a
                      href={generatedLink}
                      id="simulated-restoration-link"
                      className="inline-block bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-black px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/10 uppercase tracking-wider transition-all"
                    >
                      📧 Choose New Password Now
                    </a>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetSuccess(false);
                  setMode('login');
                }}
                className="text-xs font-extrabold text-slate-400 hover:text-slate-700 transition"
              >
                Return to Login Area
              </button>
            </div>
          ) : (
            /* Forms Input Container */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Full Name (Sign Up Only) */}
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-left">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Mercer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-left">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Password (Not for forgot mode) */}
              {mode !== 'forgot' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-left">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 hover:underline bg-transparent border-0 outline-none"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 px-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 bg-transparent border-0 outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me Toggle */}
              {mode === 'login' && (
                <div className="flex items-center gap-2 pt-1 text-left">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded text-[#2563EB] border-slate-200 focus:ring-[#2563EB]"
                    checked={rememberMe}
                     onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember" className="text-xs font-semibold text-slate-500 dark:text-slate-450 select-none cursor-pointer">
                    Keep me logged in
                  </label>
                </div>
              )}

              {/* Dynamic Webcam Photo Take / Upload block */}
              {mode !== 'forgot' && (
                <ImagePicker 
                  currentImage={avatar} 
                  onChange={setAvatar} 
                  label={mode === 'signup' ? "Take/Upload Your Sign Up Face Card" : "Take/Verify Your Active Session Face Card"}
                />
              )}

              {/* Submit Main Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-450 text-white font-bold py-3.5 rounded-xl shadow-md focus:outline-none transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
              >
                {loading ? 'Processing...' : mode === 'signup' ? 'Create Free Account' : mode === 'login' ? 'Enter My Dashboard' : 'Send Instructions'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* Auth Toggles */}
          <div className="pt-4 border-t border-slate-100 text-center">
            {mode === 'signup' && (
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  id="auth-toggle-login"
                  onClick={() => {
                    setMode('login');
                    setValidationError('');
                  }}
                  className="font-bold text-[#2563EB] hover:underline"
                >
                  Log in instead
                </button>
              </p>
            )}
            {mode === 'login' && (
              <p className="text-xs text-slate-500">
                New to WanderPlan?{' '}
                <button
                  id="auth-toggle-signup"
                  onClick={() => {
                    setMode('signup');
                    setValidationError('');
                  }}
                  className="font-bold text-[#2563EB] hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => {
                  setMode('login');
                  setValidationError('');
                }}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                Back to Sign in
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
