'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Wallet, 
  Briefcase, 
  Landmark, 
  PiggyBank, 
  Bot, 
  Power 
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  index: number;
}

interface CustomBottomNavigationProps {
  currentIndex: number;
  onTap: (index: number) => void;
  className?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', index: 0 },
  { icon: Wallet, label: 'Expenses', index: 1 },
  { icon: Briefcase, label: 'Projects', index: 2 },
  { icon: Landmark, label: 'Salary', index: 3 },
  { icon: PiggyBank, label: 'Savings', index: 4 },
  { icon: Bot, label: 'AI', index: 5 },
  { icon: Power, label: 'Logout', index: 6 },
];

export const CustomBottomNavigation: React.FC<CustomBottomNavigationProps> = ({
  currentIndex,
  onTap,
  className = '',
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)] pb-safe ${className}`}>
      <div className="mx-auto flex h-20 items-center justify-around px-2 max-w-screen-md">
        {navItems.map((item) => {
          const isSelected = currentIndex === item.index;
          const Icon = item.icon;

          return (
            <button
              key={item.index}
              onClick={() => onTap(item.index)}
              className="group relative flex flex-1 flex-col items-center justify-center py-2 transition-all"
            >
              <div className="relative mb-1 flex items-center justify-center">
                {/* Active Indicator Background */}
                {isSelected && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute -inset-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                
                <Icon
                  size={24}
                  className={`relative z-10 transition-colors duration-200 ${
                    isSelected 
                      ? 'text-blue-500' 
                      : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200'
                  }`}
                />
              </div>
              
              <span
                className={`text-[10px] sm:text-xs font-semibold tracking-tight transition-colors duration-200 ${
                  isSelected 
                    ? 'text-blue-500' 
                    : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CustomBottomNavigation;
