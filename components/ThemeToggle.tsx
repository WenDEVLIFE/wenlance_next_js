'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LucideIcon } from 'lucide-react';

interface ThemeToggleProps {
  lightIcon?: LucideIcon;
  darkIcon?: LucideIcon;
  iconSize?: number;
  iconColor?: string;
  className?: string;
  tooltip?: string;
}

/**
 * ThemeToggle component converted from Flutter.
 * Manages dark/light mode with animated transitions and persistence.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  lightIcon: LightIcon = Sun,
  darkIcon: DarkIcon = Moon,
  iconSize = 24,
  iconColor,
  className = "",
  tooltip,
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Prevent hydration mismatch
  if (!mounted) return <div style={{ width: iconSize, height: iconSize }} />;

  const isDark = theme === 'dark';
  const effectiveTooltip = tooltip ?? (isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${className}`}
      title={effectiveTooltip}
      aria-label={effectiveTooltip}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 10, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <LightIcon size={iconSize} color={iconColor} className="text-yellow-500" />
          ) : (
            <DarkIcon size={iconSize} color={iconColor} className="text-zinc-600" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
