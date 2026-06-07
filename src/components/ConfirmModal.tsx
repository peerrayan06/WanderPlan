import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200"
          >
            <div className="p-6 text-center space-y-4">
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${isDanger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                {isDanger ? <Trash2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-lg text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {message}
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs text-white transition-all transform active:scale-95 ${
                    isDanger ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
