import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  zIndex?: number;
}

export function Dialog({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  maxWidth = "lg",
  zIndex = 100
}: DialogProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
          style={{ zIndex }}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative bg-white w-full ${maxWidthClass} rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
          >
            <div className="flex justify-between items-start p-6 sm:p-8 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">{title}</h3>
                {description && <p className="text-neutral-500 text-sm mt-1">{description}</p>}
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white rounded-full transition-colors shrink-0"
              >
                <X className="w-6 h-6 text-neutral-400" />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
