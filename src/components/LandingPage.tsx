import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Compass, Calendar, Wallet, MapPin, CheckSquare, Sparkles, Star, MessageSquare } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'login' | 'signup' | 'dashboard') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A] selection:bg-[#2563EB] selection:text-white">
      {/* Dynamic Floating Global Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing' as any)}>
            <div className="w-9 h-9 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-white active-spin" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#0F172A]">
              Wander<span className="text-[#2563EB]">Plan</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              id="landing-login-btn"
              onClick={() => onNavigate('login')} 
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors"
            >
              Log in
            </button>
            <button 
              id="landing-signup-btn"
              onClick={() => onNavigate('signup')} 
              className="bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pb-24 px-4 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_50%)]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Travel Planner App of 2026</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#0F172A] leading-tight tracking-tight font-extrabold">
                Plan your trips <br />
                <span className="text-[#2563EB] relative">
                  without spreadsheets.
                  <span className="absolute left-0 bottom-1 w-full h-1 bg-orange-400/40 rounded-full" />
                </span>
              </h1>
              <p className="text-[#64748B] sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                The beautiful, mobile-first travel planner that gathers your day-by-day itineraries, budget tracking, checklist widgets, and mapping stops in one convenient place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button 
                  id="hero-cta-btn"
                  onClick={() => onNavigate('signup')} 
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Plan your trip free
                </button>
                <a 
                  href="#features" 
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-base px-6 py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  See elements
                </a>
              </div>

              {/* Multi-tier mini rating info */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Avatar" referrerPolicy="no-referrer" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Avatar" referrerPolicy="no-referrer" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Avatar" referrerPolicy="no-referrer" />
                </div>
                <div className="text-xs text-slate-500 font-semibold text-left">
                  <div className="flex items-center gap-0.5 text-orange-400">
                    {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <div>Loved by <strong>1,200+ wanderers</strong></div>
                </div>
              </div>
            </div>

            {/* Right Interactive Card Preview Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-4 bg-orange-400/10 rounded-3xl blur-2xl z-0" />
              <div className="relative z-10 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 max-w-sm mx-auto">
                {/* Simulated mobile UI */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-400">WANDERPLAN APP</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                
                <div className="pt-4 space-y-4">
                  {/* Destination card */}
                  <div className="relative h-44 rounded-2xl overflow-hidden shadow-md">
                    <img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" alt="Rome" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-bold">ROME, ITALY</span>
                          <h3 className="font-display text-base font-bold mt-1">Dolce Vita Summer</h3>
                        </div>
                        <span className="text-orange-400 font-bold text-sm">🇮🇹</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro list metrics */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Expenses</span>
                      <span className="text-xs font-bold text-slate-800">$1,320 / $2,500</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '52.8%' }} />
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Packing list</span>
                      <span className="text-xs font-bold text-slate-800">11 / 18 packed</span>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '61.1%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Micro Itinerary Item */}
                  <div className="border border-slate-100 p-3 rounded-2xl flex items-start gap-2.5 text-left bg-slate-50/50">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Colosseum Underworld Access</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" /> Day 1 • 10:30 AM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 px-4 max-w-6xl mx-auto text-center">
        <div className="max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Built with Intention</span>
          <h2 className="font-display text-3xl sm:text-4xl text-slate-900 font-bold">Say goodbye to planning chaos</h2>
          <p className="text-slate-600">Everything you need to craft your memorable journeys, synchronized in a gorgeous interface styled for mobile screens.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-shadow text-left">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">Timeline Itineraries</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Organize events with absolute convenience. Set custom categories, times, notes, and rearrange things with natural swiping and movement.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-shadow text-left">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">Smart Budget Logger</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Log expenditures across Food, Transport, and Lodging. Visualize budget consumption ratios and trigger automated banners before exceeding thresholds.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-shadow text-left">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900">Interactive Map Pins</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Visualize chronological pins of all itinerary stops dynamically over live street layers. Open external maps instantly with a single tap.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof/Testimonial Section */}
      <section className="bg-slate-100 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-left">
              <h2 className="font-display text-3xl font-bold text-slate-900">Crafted by travellers, for travellers</h2>
              <p className="text-slate-600 font-medium">
                We designed WanderPlan because we got tired of hunting through messy group chats and endless spreadsheet tabs while navigating train platforms in Rome.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div>
                  <div className="text-3xl font-display font-bold text-blue-600">12,500+</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Trips Scheduled</div>
                </div>
                <div>
                  <div className="text-3xl font-display font-bold text-orange-500">4.9 / 5</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">App Store Rating</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 flex gap-4 text-left">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" className="w-12 h-12 rounded-full object-cover shrink-0" alt="Sarah" referrerPolicy="no-referrer" />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-orange-400">
                    {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-3 fill-current" />)}
                  </div>
                  <p className="text-slate-600 text-xs italic">
                    "Using WanderPlan on my Japan itinerary saved us absolute hours. Being able to visualize the hotels, rail lines, and dining spots on the mobile map with simple item checkoffs is amazing."
                  </p>
                  <div className="text-slate-800 font-bold text-[11px]">- Sarah K., Tokyo Adventurer</div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150 flex gap-4 text-left">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" className="w-12 h-12 rounded-full object-cover shrink-0" alt="Marcus" referrerPolicy="no-referrer" />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-orange-400">
                    {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-3 fill-current" />)}
                  </div>
                  <p className="text-slate-600 text-xs italic">
                    "The budget warnings saved me from overspending on my Eurotrip path. Simple, modern, extremely responsive interface that works flawlessly."
                  </p>
                  <div className="text-slate-800 font-bold text-[11px]">- Marcus L., Solo Backpacker</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tier Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <div className="mb-12 space-y-2">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Simple Transparent Plans</span>
          <h2 className="font-display text-3xl font-bold">Unleash the Explorer Inside You</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-left flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-xl font-bold">Wanderer Free</h3>
                <p className="text-xs text-slate-500 mt-1">For single weekend trips and casual strolls</p>
              </div>
              <div className="text-4xl font-display font-bold pb-2">$0</div>
              <ul className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  Create up to <strong>3 active trips</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  Full day-by-day itineraries
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  Budget logger & categories
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  Packing list & presets
                </li>
              </ul>
            </div>
            
            <button 
              id="signup-free-btn"
              onClick={() => onNavigate('signup')} 
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-2xl w-full text-center mt-8 transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-blue-500 text-left relative flex flex-col justify-between shadow-xl">
            <div className="absolute -top-3.5 right-6 bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              Highly Recommended
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-xl font-bold">WanderPlan Pro</h3>
                <p className="text-xs text-slate-400 mt-1">For regular adventures, groups, and power planners</p>
              </div>
              <div className="flex items-baseline gap-1 pb-2">
                <span className="text-4xl font-display font-bold">$8</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-800 text-sm text-slate-350">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  <strong>Unlimited trips</strong>
                </li>
                <li className="flex items-center gap-4 text-blue-300 font-bold">
                  <Sparkles className="w-4 h-4 text-orange-450 shrink-0 animate-pulse" />
                  Smart Destination Insights
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  Up to 10 active collaborators
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-500 shrink-0" />
                  Export to beautiful offline PDF
                </li>
              </ul>
            </div>
            
            <button 
              id="signup-pro-btn"
              onClick={() => onNavigate('signup')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl w-full text-center mt-8 shadow-lg shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* Footer / Newsletter Section */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 border-t border-slate-850">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">WanderPlan</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Helping modern travellers design organized journeys, keep budgets transparent, and build beautiful itineraries on any device.
            </p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} WanderPlan. Created with excellence.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3 text-left">
            <h4 className="text-white text-xs font-bold tracking-widest uppercase">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('login')} className="hover:text-white transition-colors">Explorer Access</button></li>
              <li><button onClick={() => onNavigate('signup')} className="hover:text-white transition-colors">Create Account</button></li>
              <li><a href="#features" className="hover:text-white transition-colors">SaaS Features</a></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4 text-left">
            <h4 className="text-white text-xs font-bold tracking-widest uppercase">Join the Newsletter</h4>
            <p className="text-xs text-slate-400">Get curated destination guides, checklist templates, and product updates.</p>
            
            {subscribed ? (
              <div className="bg-blue-900/40 border border-blue-850 text-blue-200 text-xs p-3 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-blue-500 grow"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0">
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
