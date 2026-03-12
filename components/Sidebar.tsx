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
import Image from 'next/image';

interface NavItem {
  icon: React.ElementType;
  label: string;
  index: number;
}

interface SidebarProps {
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

export const Sidebar: React.FC<SidebarProps> = ({
  currentIndex,
  onTap,
  className = '',
}) => {
  return (
    <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-background border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 transition-colors duration-500 ${className}`}>
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="relative w-10 h-10">
          <Image 
            src="/assets/WHITE-LOGO-PNG.png" 
            alt="Wenlance Logo" 
            fill 
            className="object-contain dark:invert-0 invert"
          />
        </div>
        <span className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Wenlance
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isSelected = currentIndex === item.index;
          const Icon = item.icon;

          return (
            <button
              key={item.index}
              onClick={() => onTap(item.index)}
              className="w-full group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Active Background */}
              {isSelected && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className={`relative z-10 transition-colors duration-300 ${
                isSelected 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100'
              }`}>
                <Icon size={item.index === 5 ? 26 : 24} />
              </div>

              <span className={`relative z-10 text-sm font-semibold tracking-tight transition-colors duration-300 ${
                isSelected 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100'
              }`}>
                {item.label}
              </span>

              {/* Hover Indicator */}
              {!isSelected && (
                <div className="absolute left-0 w-1 h-0 bg-blue-500 group-hover:h-6 transition-all duration-300 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Section */}
      <div className="p-6 border-t border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">John Doe</p>
            <p className="text-[10px] text-zinc-500 truncate lowercase">john@wenlance.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
