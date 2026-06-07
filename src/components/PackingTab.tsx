import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Square, Plus, Trash2, ShieldCheck, Sparkles, Sliders, ShoppingBag, FolderHeart } from 'lucide-react';
import { Trip, PackingItem } from '../types';
import { getPackingForTrip, savePackingItem, deletePackingItem, seedPackingTemplate } from '../lib/storage';

interface PackingTabProps {
  trip: Trip;
}

export default function PackingTab({ trip }: PackingTabProps) {
  const [items, setItems] = useState<PackingItem[]>(() => getPackingForTrip(trip.id));
  
  // Custom rapid inline input states
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Clothing');

  const categories = ["Clothing", "Toiletries", "Electronics", "Documents", "Medications"];

  const packedCount = items.filter(i => i.packed).length;
  const totalCount = items.length;
  const packedPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const handleTogglePacked = (item: PackingItem) => {
    const updated = { ...item, packed: !item.packed };
    savePackingItem(updated);
    setItems(getPackingForTrip(trip.id));
  };

  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newItem: PackingItem = {
      id: `pack-${Date.now()}`,
      tripId: trip.id,
      name: itemName.trim(),
      category: itemCategory,
      packed: false
    };

    savePackingItem(newItem);
    setItemName('');
    setItems(getPackingForTrip(trip.id));
  };

  const handleDeleteItem = (itemId: string) => {
    deletePackingItem(itemId);
    setItems(getPackingForTrip(trip.id));
  };

  const handleApplyPresetTemplate = (cat: string) => {
    seedPackingTemplate(trip.id, cat);
    setItems(getPackingForTrip(trip.id));
  };

  const getCategoryEmoji = (cat: string) => {
    switch(cat) {
      case "Clothing": return "👕";
      case "Toiletries": return "🧴";
      case "Electronics": return "🔌";
      case "Documents": return "🛂";
      default: return "💊";
    }
  };

  return (
    <div className="space-y-6 text-left pb-28">
      
      {/* Complete packed summary header */}
      <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Packing Progress</span>
          <span className="text-sm font-extrabold font-display text-[#2563EB]">
            {packedCount} / {totalCount} items packed
          </span>
        </div>

        {/* Packing meter progress bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${packedPct}%` }}
          />
        </div>

        {totalCount > 0 && packedPct === 100 && (
          <div className="bg-green-50 border border-green-150 text-green-700 text-[11px] p-2 rounded-xl flex items-center gap-1.5 font-bold animate-[pulse_1s_infinite]">
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
            <span>Ready to set sail! You are 100% packed.</span>
          </div>
        )}
      </div>

      {/* Preset shortcut button strip */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm space-y-2">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Seed Curated Outfit Presets</span>
        
        <div className="flex flex-wrap gap-1.5">
          {categories.map((catKey) => (
            <button
              key={catKey}
              onClick={() => handleApplyPresetTemplate(catKey)}
              className="text-[10px] font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-700 rounded-xl cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-500 shrink-0" />
              <span>+ {catKey} Preset</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grouped categories list blocks */}
      <div className="space-y-4">
        {categories.map((catName) => {
          const categoryItems = items.filter(i => i.category.toLowerCase() === catName.toLowerCase());
          if (categoryItems.length === 0) return null;

          return (
            <motion.div 
              layout
              key={catName} 
              className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-premium space-y-4"
            >
              {/* Category sub-header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{getCategoryEmoji(catName)}</span>
                  <div>
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-900">{catName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Essential Items</p>
                  </div>
                </div>
                <div className="bg-slate-50 px-2 py-1 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {categoryItems.filter(i => i.packed).length} / {categoryItems.length}
                </div>
              </div>

              {/* Items checklist rows */}
              <div className="space-y-1">
                {categoryItems.map((elem) => (
                  <motion.div 
                    layout
                    key={elem.id}
                    onClick={() => handleTogglePacked(elem)}
                    className="flex items-center justify-between gap-4 py-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`transition-all duration-200 ${elem.packed ? 'scale-110' : ''}`}>
                        {elem.packed ? (
                          <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <CheckSquare className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-slate-200 bg-white" />
                        )}
                      </div>
                      
                      <span className={`text-sm select-none transition-colors ${
                        elem.packed ? 'line-through text-slate-300 font-medium italic' : 'text-slate-700 font-bold'
                      }`}>
                        {elem.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(elem.id);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {totalCount === 0 && (
          <div className="bg-white p-12 rounded-[32px] border border-slate-100 flex flex-col items-center text-center space-y-4 shadow-premium">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-display font-bold text-slate-900">Inventory Empty</h4>
              <p className="text-[10px] text-slate-400 font-medium max-w-[200px] mx-auto mt-1">
                Quickly populate your list using the curated presets or add your own below.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inline add item footer block */}
      <div className="bg-white dark:bg-slate-900 mx-auto p-6 rounded-[32px] shadow-premium relative overflow-hidden group border border-slate-100 dark:border-slate-800/80 mt-8">
        {/* Abstract background accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 dark:bg-brand-primary/20 blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <form onSubmit={handleCreateCustomItem} className="space-y-4 relative z-10">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[9px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.3em] block text-left">Rapid Addition</h3>
             <Sparkles className="w-3 h-3 text-brand-primary animate-pulse" />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                required
                placeholder="What are we bringing?"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/10 border border-slate-150 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:bg-slate-100 dark:focus:bg-white/15 focus:border-brand-primary transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
              />
              
              <div className="space-y-2">
                <span className="text-[8px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest ml-1">Classification</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setItemCategory(c)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                        itemCategory === c 
                          ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-blue-500/20 scale-105' 
                          : 'bg-slate-50 dark:bg-white/5 border-slate-150 dark:border-white/5 text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="mr-1.5">{getCategoryEmoji(c)}</span>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="inline-add-packing-btn"
              className="bg-brand-primary hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/10 dark:shadow-blue-900/50 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2"
            >
              <Plus className="w-4 h-4" /> 
              <span>Secure to Packing List</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
