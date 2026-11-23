'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Widget2Icon,
  Wallet2Icon,
  SuitcaseLinesIcon,
  BankIcon,
  PiggyBankIcon,
  CheckSquareIcon,
  BotIcon,
  PowerIcon,
} from '@solar-icons/react/linear';

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
  { icon: Widget2Icon, label: 'Dashboard', index: 0 },
  { icon: Wallet2Icon, label: 'Expenses', index: 1 },
  { icon: SuitcaseLinesIcon, label: 'Projects', index: 2 },
  { icon: BankIcon, label: 'Salary', index: 3 },
  { icon: PiggyBankIcon, label: 'Savings', index: 4 },
  { icon: CheckSquareIcon, label: 'Tasks', index: 5 },
  // Performance (index 6) has no mobile entry: the bar already fits 8 items and a
  // 9th would break the layout, so /performance shows nothing highlighted on mobile.
  { icon: BotIcon, label: 'AI', index: 7 },
  { icon: PowerIcon, label: 'Logout', index: 8 },
];

export const CustomBottomNavigation: React.FC<CustomBottomNavigationProps> = ({
  currentIndex,
  onTap,
  className = '',
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] pb-safe ${className}`}>
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
                {isSelected && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute -inset-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                
                <Icon
                  size={24}
                  className={`relative z-10 transition-colors duration-200 ${
                    isSelected 
                      ? 'text-sky-600 dark:text-sky-400' 
                      : 'text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200'
                  }`}
                />
              </div>
              
              <span
                className={`text-[11px] font-medium tracking-tight transition-colors duration-200 ${
                  isSelected 
                    ? 'text-sky-600 dark:text-sky-400 font-semibold' 
                    : 'text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200'
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
