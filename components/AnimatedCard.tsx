'use strict';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  scaleOnTap?: number;
  borderRadius?: string;
  color?: string;
}

/**
 * AnimatedCard component converted from Flutter.
 * Provides scale and shadow animations on tap using framer-motion.
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onClick,
  scaleOnTap = 0.98,
  borderRadius = '12px',
  color,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileTap={{
        scale: scaleOnTap,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
      initial={{
        scale: 1,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
      }}
      transition={{
        duration: 0.15,
        ease: 'easeInOut',
      }}
      onClick={onClick}
      style={{
        borderRadius,
        ...(color ? { backgroundColor: color } : {}),
        ...props.style,
      }}
      className={`cursor-pointer overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
