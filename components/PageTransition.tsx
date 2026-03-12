'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  duration?: number;
}

/**
 * PageTransition component converted from Flutter.
 * Provides a fade and slide-from-right entrance animation.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  duration = 0.3 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: duration,
        ease: [0.215, 0.610, 0.355, 1.000], // cubic-bezier matching easeOutCubic
      }}
      className="w-full flex-1"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
