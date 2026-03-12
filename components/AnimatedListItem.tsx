'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  delay?: number;
  className?: string;
}

/**
 * AnimatedListItem component converted from Flutter.
 * Provides staggered fade and slide-up animations for list entries using framer-motion.
 */
export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  index,
  delay = 0.1,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * delay,
        ease: [0.215, 0.61, 0.355, 1], // easeOutCubic approximation
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedListItem;
