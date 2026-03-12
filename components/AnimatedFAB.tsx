'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedFABProps extends HTMLMotionProps<'button'> {
  onPressed?: () => void;
  children: React.ReactNode;
  backgroundColor?: string;
  tooltip?: string;
  scale?: number;
}

/**
 * AnimatedFAB component converted from Flutter.
 * Provides scale and rotation animations on interaction using framer-motion.
 */
export const AnimatedFAB: React.FC<AnimatedFABProps> = ({
  onPressed,
  children,
  backgroundColor,
  tooltip,
  scale = 1.1,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      title={tooltip}
      onClick={onPressed}
      whileTap={{
        scale: scale,
        rotate: 180,
      }}
      transition={{
        duration: 0.2,
        ease: 'easeInOut',
      }}
      style={{
        backgroundColor: backgroundColor || 'var(--primary, #3b82f6)',
        ...props.style,
      }}
      className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg text-white outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedFAB;
