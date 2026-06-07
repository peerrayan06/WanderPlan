import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Plus, Trash2, ArrowLeft, AlertTriangle, Sparkles, Receipt, DollarSign, Calendar, Sliders, RefreshCcw, ArrowRightLeft, Utensils, Hotel, Car, Compass, Tag } from 'lucide-react';
import { Trip, Expense } from '../types';
import { getExpensesForTrip, saveExpense, deleteExpense, getCurrencySymbol, getCurrentUser } from '../lib/storage';

interface BudgetTabProps {
  trip: Trip;
  onRefresh: () => void;
}

const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "CHF", "CNY", "AED", "SGD", "NZD"];

export default function BudgetTab({ trip, onRefresh }: BudgetTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>(() => getExpensesForTrip(trip.id));

  // Sync state when trip.id changes
  React.useEffect(() => {
    setExpenses(getExpensesForTrip(trip.id));
  }, [trip.id]);
  
  // Sheet bottom pop-up state
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Currency Converter State
  const [convAmount, setConvAmount] = useState('100');
  const [sourceCurr, setSourceCurr] = useState(getCurrentUser()?.currency || 'USD');
  const [targetCurr, setTargetCurr] = useState('EUR');
  const [convertedValue, setConvertedValue] = useState<number | null>(null);
  const [convLoading, setConvLoading] = useState(false);

  const categories = ["Lodging", "Food", "Transport", "Tours", "Other"];

  // Helper calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = trip.budget - totalSpent;
  const spentPercent = Math.min(100, Math.round((totalSpent / trip.budget) * 100));
  const isWarningState = (totalSpent / trip.budget) >= 0.8;
  const isOverBudget = totalSpent > trip.budget;

  const handleConvert = async () => {
    if (!convAmount || isNaN(Number(convAmount))) return;
    setConvLoading(true);
    try {
      const response = await fetch(`/api/exchange-rates?base=${sourceCurr}`);
      if (!response.ok) throw new Error('Conversion failed');
      const data = await response.json();
      const rate = data.rates[targetCurr];
      if (rate) {
        setConvertedValue(Number(convAmount) * rate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConvLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    const temp = sourceCurr;
    setSourceCurr(targetCurr);
    setTargetCurr(temp);
    setConvertedValue(null);
  };

  // Breakdown across categories
  const categorySummary = categories.reduce((acc, cat) => {
    const sum = expenses
      .filter(e => e.category.toLowerCase() === cat.toLowerCase())
      .reduce((s, e) => s + e.amount, 0);
    acc[cat] = sum;
    return acc;
  }, {} as Record<string, number>);

  const handleDeleteExpense = (expId: string) => {
    deleteExpense(expId);
    const updated = getExpensesForTrip(trip.id);
    setExpenses(updated);
    onRefresh(); // refresh parent cards tracking
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsSubmitting(true);

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      tripId: trip.id,
      amount: Number(amount),
      currency: trip.budgetCurrency || getCurrentUser()?.currency || "INR",
      category,
      description: description.trim() || `${category} Expenditure`,
      date: date || new Date().toISOString().split('T')[0]
    };

    // Simulate short processing for interface stability
    await new Promise(r => setTimeout(r, 600));

    saveExpense(newExp);
    setExpenses(getExpensesForTrip(trip.id));
    onRefresh();
    
    // Smooth reset
    setIsSubmitting(false);
    setShowAddSheet(false);
    setAmount('');
    setCategory('Food');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Lodging": return <Hotel className="w-5 h-5" />;
      case "Food": return <Utensils className="w-5 h-5" />;
      case "Transport": return <Car className="w-5 h-5" />;
      case "Tours": return <Compass className="w-5 h-5" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Lodging": return "bg-purple-600";
      case "Food": return "bg-brand-accent";
      case "Transport": return "bg-brand-success";
      case "Tours": return "bg-blue-600";
      default: return "bg-slate-400";
    }
  };

  const getCategoryTextColor = (cat: string) => {
    switch (cat) {
      case "Lodging": return "text-purple-600";
      case "Food": return "text-brand-accent";
      case "Transport": return "text-brand-success";
      case "Tours": return "text-blue-600";
      default: return "text-slate-600";
    }
  };

  // SVG Donut Circle Dimensions
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (spentPercent / 100) * circumference;

  return (
    <div className="space-y-6 text-left pb-16 antialiased">
      
      {/* 80% Spent Warning Notification Banner */}
      {isWarningState && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-[24px] border flex items-start gap-3 shadow-premium ${
          isOverBudget 
            ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400' 
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-400'
        }`}>
          <div className={`p-2 rounded-xl ${isOverBudget ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'}`}>
            <AlertTriangle className="w-5 h-5 shrink-0" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider">
              {isOverBudget ? "Budget Overlimit" : "Approaching Limit"}
            </h4>
            <p className="text-[11px] font-medium leading-relaxed opacity-85">
              You've utilized <strong>{spentPercent}%</strong> of your <strong>{getCurrencySymbol(trip.budgetCurrency)}{trip.budget}</strong> threshold. Consider reviewing non-essential expenses.
            </p>
          </div>
        </motion.div>
      )}

      {/* Primary Status Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium flex items-center gap-6">
        
        {/* Ring Chart */}
        <div className="relative shrink-0">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
              stroke="#F8FAFC"
              className="stroke-slate-100 dark:stroke-slate-800"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              stroke={isOverBudget ? "var(--color-brand-danger)" : isWarningState ? "var(--color-brand-warning)" : "var(--color-brand-primary)"}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-display font-bold leading-none text-slate-900 dark:text-white">{spentPercent}%</span>
            <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Used</span>
          </div>
        </div>

        {/* Financials */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Expenditure</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">{getCurrencySymbol(trip.budgetCurrency)}{totalSpent.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">/ {getCurrencySymbol(trip.budgetCurrency)}{trip.budget.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Remaining</p>
            <span className={`text-sm font-bold font-display ${remaining < 0 ? 'text-brand-danger dark:text-red-400' : 'text-brand-success dark:text-emerald-400'}`}>
              {remaining < 0 ? `-${getCurrencySymbol(trip.budgetCurrency)}${Math.abs(remaining).toLocaleString()} Deficit` : `${getCurrencySymbol(trip.budgetCurrency)}${remaining.toLocaleString()} Available`}
            </span>
          </div>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Allocation Matrix</h3>
          <Sliders className="w-3.5 h-3.5 text-slate-350" />
        </div>
        
        <div className="space-y-4">
          {categories.map((catKey) => {
            const catSum = categorySummary[catKey] || 0;
            const catPct = totalSpent > 0 ? (catSum / totalSpent) * 100 : 0;
            
            return (
              <div key={catKey} className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${getCategoryColor(catKey)}`} />
                    <span>{catKey}</span>
                  </div>
                  <span className="text-slate-900 dark:text-white font-display">
                    {getCurrencySymbol(trip.budgetCurrency)}{catSum.toLocaleString()} <span className="text-slate-400 dark:text-slate-500 font-sans text-[9px] ml-1">({Math.round(catPct)}%)</span>
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${catPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${getCategoryColor(catKey)}`} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Converter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-premium space-y-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 dark:bg-brand-primary/20 blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
              <RefreshCcw className="w-4 h-4 text-slate-700 dark:text-white" />
            </div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-white/60 uppercase tracking-widest">Currency Matrix</h3>
          </div>
          <span className="text-[8px] font-bold text-slate-400 dark:text-white/40 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-full border border-slate-150 dark:border-white/10 uppercase tracking-widest">Live Rates</span>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <select
                value={sourceCurr}
                onChange={(e) => { setSourceCurr(e.target.value); setConvertedValue(null); }}
                className="w-full bg-slate-50 dark:bg-white/10 border border-slate-150 dark:border-white/25 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-brand-accent transition-all cursor-pointer appearance-none"
              >
                {POPULAR_CURRENCIES.map(c => <option key={c} value={c} className="text-slate-900 bg-white dark:bg-slate-800">{c}</option>)}
              </select>
            </div>

            <button 
              onClick={handleSwapCurrencies}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-90 flex items-center justify-center shrink-0"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <select
                value={targetCurr}
                onChange={(e) => { setTargetCurr(e.target.value); setConvertedValue(null); }}
                className="w-full bg-slate-50 dark:bg-white/10 border border-slate-150 dark:border-white/25 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-brand-accent transition-all cursor-pointer appearance-none"
              >
                {POPULAR_CURRENCIES.map(c => <option key={c} value={c} className="text-slate-900 bg-white dark:bg-slate-800">{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                value={convAmount}
                onChange={(e) => setConvAmount(e.target.value)}
                placeholder="Amount"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-accent/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
            <button
              onClick={handleConvert}
              disabled={convLoading}
              className="bg-brand-accent hover:bg-orange-600 disabled:bg-orange-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
            >
              {convLoading ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
            </button>
          </div>

          <AnimatePresence>
            {convertedValue !== null && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2"
              >
                <div className="bg-slate-50 dark:bg-white/10 border border-slate-150 dark:border-white/10 p-4 rounded-2xl">
                  <div className="text-[8px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.2em] mb-1">Exchange Summary</div>
                  <div className="text-base font-display font-bold text-brand-accent truncate">
                    {convertedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurr}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expenditure Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Ledger History</h3>
        </div>

        {expenses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
            {expenses.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={item.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 group hover:border-[#2563EB]/45 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${getCategoryColor(item.category)} bg-opacity-10 dark:bg-opacity-20 ${getCategoryTextColor(item.category)} dark:text-white`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-slate-900 dark:text-white text-[13px] font-bold truncate block leading-tight">
                      {item.description}
                    </h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider mt-1">
                      {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {item.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="text-right px-2 py-1.5 bg-slate-50 dark:bg-slate-805 rounded-xl min-w-[60px]">
                    <span className="block text-[13px] font-display font-black text-slate-900 dark:text-teal-400">
                      {getCurrencySymbol(item.currency)}{item.amount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                    aria-label="Delete expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-3 shadow-premium">
            <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-display">No receipts logged</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium max-w-[170px] mx-auto mt-1">Ready to track? Use the orange button to log your first expenditure.</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        id="budget-add-expense-fab"
        onClick={() => setShowAddSheet(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-brand-accent hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 cursor-pointer transition-all border-4 border-white dark:border-slate-900"
      >
        <Plus className="w-7 h-7 stroke-[3px]" />
      </button>

      {/* Full Screen Add Expense Modal */}
      <AnimatePresence>
        {showAddSheet && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-[#0F172A] flex flex-col"
          >
            {/* Modal Header - Redesigned as a floating Command Header */}
            <div className="sticky top-0 z-[110] px-4 py-4 md:px-8 bg-white dark:bg-[#0F172A] flex items-center justify-between gap-4 shrink-0 border-b border-slate-100 dark:border-slate-800/50">
              <div className="text-left">
                <h3 className="font-display font-black text-lg text-slate-900 dark:text-white leading-tight">Add Record</h3>
                <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em] mt-0.5 hidden sm:block">Journal for {trip.destination}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSheet(false);
                    setAmount('');
                    setCategory('Food');
                    setDescription('');
                  }}
                  className="px-3 py-2 rounded-xl text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-[0.1em] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-expense-form"
                  disabled={isSubmitting}
                  className="bg-brand-primary text-white font-black px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <span>Save</span>}
                </button>
              </div>
            </div>

            {/* Form wrapping the outer area so inputs are scrollable */}
            <form id="add-expense-form" onSubmit={handleAddExpenseSubmit} className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-[#0F172A]">
              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 bg-slate-50/10 dark:bg-transparent">
                <div className="max-w-xl mx-auto space-y-10 pb-20">
                  
                  {/* Big Amount Input */}
                  <div className="space-y-4 text-center">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">How much did we spend?</label>
                    <div className="relative inline-block w-full">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-display font-bold text-slate-300">
                        {getCurrencySymbol(trip.budgetCurrency)}
                      </div>
                      <input
                        id="expense-amount-input"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        required
                        min="0.01"
                        placeholder="0"
                        autoFocus
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-brand-primary py-4 text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 text-center"
                      />
                    </div>
                  </div>

                  {/* Classification Grid */}
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center">Category</label>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                      {categories.map((catName) => (
                        <button
                          key={catName}
                          type="button"
                          onClick={() => setCategory(catName)}
                          className={`py-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                            category === catName
                              ? 'border-brand-primary bg-slate-900 dark:bg-brand-primary text-white shadow-xl scale-[1.02]'
                              : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-brand-surface text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <div className={category === catName ? 'text-white' : getCategoryTextColor(catName)}>
                            {getCategoryIcon(catName)}
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-tight">{catName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                         <Calendar className="w-3.5 h-3.5" />
                         Date
                      </label>
                      <input
                        id="expense-date"
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-800 focus:border-brand-primary rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                         <Receipt className="w-3.5 h-3.5" />
                         Memo
                      </label>
                      <input
                        id="expense-desc"
                        type="text"
                        placeholder="e.g. Sushi Dinner"
                        maxLength={50}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-800 focus:border-brand-primary rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-200 dark:placeholder:text-slate-700 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Final Action Button (For Mobile Accessibility) */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 dark:bg-brand-primary text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest"
                    >
                      {isSubmitting ? (
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-brand-primary" />
                          <span>Finalize Entry</span>
                        </>
                      )}
                    </button>
                    <button
                       type="button"
                       onClick={() => setShowAddSheet(false)}
                       className="w-full mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest py-2"
                    >
                      Dismiss View
                    </button>
                  </div>


                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
