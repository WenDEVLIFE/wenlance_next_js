'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedDialogWrapperProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

/**
 * AnimatedDialogWrapper component converted from Flutter.
 * Provides scale and fade animations for dialog content using framer-motion.
 */
export const AnimatedDialogWrapper: React.FC<AnimatedDialogWrapperProps> = ({
  children,
  duration = 0.3,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        duration: duration,
        ease: [0.215, 0.61, 0.355, 1], // easeOutCubic approximation
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedDialogWrapper;
