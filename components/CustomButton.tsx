import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { CustomText } from './CustomText';

interface CustomButtonProps extends HTMLMotionProps<'button'> {
  label: string;
}

/**
 * CustomButton component converted from Flutter.
 * Provides a primary action button with a Cupertino-style tap animation using framer-motion.
 */
export const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ opacity: 0.7, scale: 0.98 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      className={`
        w-full rounded-xl bg-blue-600 px-6 py-4 transition-colors 
        hover:bg-blue-700 active:bg-blue-800
        dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <CustomText 
        label={label} 
        fontWeight={600} 
        fontSize={20} 
        color="white" 
      />
    </motion.button>
  );
};

export default CustomButton;
