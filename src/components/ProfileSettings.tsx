import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, ShieldAlert, ArrowLeft, Check, LogOut } from 'lucide-react';
import { User as UserType } from '../types';
import { getCurrentUser, setCurrentUser, wipeAllData } from '../lib/storage';
import { deleteUserAccount } from '../lib/firebase';
import ConfirmModal from './ConfirmModal';

interface ProfileSettingsProps {
  user: UserType;
  onRefreshUser: () => void;
  onLogout: () => void;
  onBack: () => void;
}

// No-op for AVATAR_PRESETS constant removal if it was there before.

export default function ProfileSettings({ user, onRefreshUser, onLogout, onBack }: ProfileSettingsProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(user.password || 'password');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserType = {
      ...user,
      name,
      email
    };
    setCurrentUser(updatedUser);
    onRefreshUser();
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePasswordDirect = (e: React.MouseEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    
    if (!oldPasswordInput || !newPasswordInput) {
      setPasswordFeedback({ type: 'error', message: 'All password fields are required.' });
      return;
    }
    
    const currentRealPassword = user.password || 'password';
    if (oldPasswordInput !== currentRealPassword) {
      setPasswordFeedback({ type: 'error', message: 'Verification failed: The old password you entered is incorrect.' });
      return;
    }
    
    if (newPasswordInput.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'The new password must be at least 6 characters long.' });
      return;
    }

    // Persist immediately to local browser storage
    const updatedUser: UserType = {
      ...user,
      password: newPasswordInput
    };
    
    setCurrentUser(updatedUser);
    setPassword(newPasswordInput);
    onRefreshUser();
    
    setPasswordFeedback({ type: 'success', message: 'Password verified and successfully updated in your local browser.' });
    setOldPasswordInput('');
    setNewPasswordInput('');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const executeDeleteAccount = async () => {
    try {
      await deleteUserAccount();
      wipeAllData();
      onLogout();
    } catch (err: any) {
      alert("Failed to delete account: " + (err.message || 'Unknown error. You might need to re-log in to perform this action.'));
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen pb-40 pt-8 px-5 selection:bg-brand-primary selection:text-white text-left antialiased">
      <ConfirmModal 
        isOpen={showDeleteConfirm}
        title="Destroy Account?"
        message="CRITICAL: Are you absolutely confident you wish to delete your account? All planned trips, checklists, and expenditure logs will be permanently erased."
        confirmText="Confirm Destruction"
        cancelText="Abort"
        isDanger={true}
        onConfirm={executeDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white shadow-premium rounded-2xl text-slate-600 hover:text-slate-900 transition-all active:scale-95 border border-slate-100"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
          </button>
          <div className="text-right">
            <h1 className="font-display font-bold text-2xl text-slate-900 leading-none">Settings</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-1">Preferences</p>
          </div>
        </div>

        {/* User Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-brand-primary rounded-[32px] translate-y-2 opacity-5 blur-xl group-hover:opacity-10 transition-opacity" />
          <div className="relative bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-premium">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800 shadow-premium bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-10 h-10 text-slate-300" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">{user.name}</h2>
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save success feedback */}
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs py-3 px-4 rounded-xl font-bold flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-500 stroke-[3px]" />
            <span>Identity updated successfully</span>
          </motion.div>
        )}

        {/* Settings Sections */}
        <div className="space-y-8">
          
          {/* Identity Section */}
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Personal Identity</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium p-6 space-y-6">
              {/* Name Input */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] px-1">Display Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-850 focus:border-brand-primary focus:ring-4 focus:ring-slate-900/5 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none transition-all font-bold text-slate-900 dark:text-white shadow-sm"
                    placeholder="Traveling Pro"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] px-1">Registered Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="email"
                    required
                    readOnly
                    value={email}
                    className="w-full bg-slate-50/30 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    title="Email cannot be modified directly"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2563EB] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 font-display text-[15px] border-0"
              >
                Apply Profile Changes
              </button>
            </div>
          </form>

          {/* Security Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Security</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Change your password</span>
                </div>

                <div className="space-y-3 bg-slate-50/30 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block ml-1 mb-1">Old Password</label>
                    <input
                      type="password"
                      placeholder="Enter Current Password"
                      value={oldPasswordInput}
                      onChange={(e) => setOldPasswordInput(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs focus:outline-none font-bold text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block ml-1 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Choose New Password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-150/60 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs focus:outline-none font-bold text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdatePasswordDirect}
                    className="w-full bg-slate-900 dark:bg-brand-primary hover:bg-slate-800 dark:hover:bg-brand-primary/90 text-white font-extrabold py-3.5 rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer border-0 mt-2"
                  >
                    Verify & Update Password
                  </button>

                  {passwordFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl text-[10px] font-semibold text-left mt-2 ${
                        passwordFeedback.type === 'success' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {passwordFeedback.message}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-4">
            <button
              type="button"
              onClick={onLogout}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 font-bold py-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Secure Log Out
            </button>
          </div>
        </div>

        {/* Destructive Section */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-red-50/50 dark:bg-red-950/15 rounded-[28px] border border-red-100 dark:border-red-900/30 p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="w-5 h-5 stroke-[2.5px]" />
              <h4 className="font-display font-bold text-base">Security Danger Zone</h4>
            </div>
            <p className="text-[11px] text-red-600/70 dark:text-red-400/80 font-medium leading-relaxed">
              Permanently erasing your account will delete every itinerary, trail log, and saved expense. This is immediate and cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] cursor-pointer text-xs border-0"
            >
              Destroy Account Permanently
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
