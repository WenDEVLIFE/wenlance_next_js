'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

/**
 * AnimatedDialog component converted from Flutter.
 * Provides scale and fade animations on entry/exit using framer-motion.
 */
export const AnimatedDialog: React.FC<AnimatedDialogProps> = ({
  isOpen,
  onClose,
  children,
  duration = 0.3,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: duration,
              ease: [0.215, 0.61, 0.355, 1], // easeOutCubic approximation
            }}
            className={`relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-[#023E8A] transition-colors duration-300 shadow-2xl ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedDialog;
