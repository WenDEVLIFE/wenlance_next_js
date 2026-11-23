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
  { icon: Widget2Icon, label: 'Dashboard', index: 0 },
  { icon: Wallet2Icon, label: 'Expenses', index: 1 },
  { icon: SuitcaseLinesIcon, label: 'Projects', index: 2 },
  { icon: BankIcon, label: 'Salary', index: 3 },
  { icon: PiggyBankIcon, label: 'Savings', index: 4 },
  { icon: CheckSquareIcon, label: 'Tasks', index: 5 },
  { icon: BotIcon, label: 'AI', index: 6 },
  { icon: PowerIcon, label: 'Logout', index: 7 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentIndex,
  onTap,
  className = '',
}) => {
  return (
    <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-background border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 transition-colors duration-300 ${className}`}>
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
        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Wenlance
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {navItems.map((item) => {
          const isSelected = currentIndex === item.index;
          const Icon = item.icon;

          return (
            <button
              key={item.index}
              onClick={() => onTap(item.index)}
              className={`w-full group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 overflow-hidden ${
                isSelected 
                  ? 'bg-zinc-100 dark:bg-zinc-800/80 text-sky-600 dark:text-sky-400' 
                  : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              
              <div className="relative z-10">
                <Icon size={24} />
              </div>

              <span className="relative z-10 text-sm font-semibold tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer / User Section */}
      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">John Doe</p>
            <p className="text-[10px] text-zinc-500 truncate lowercase">john@wenlance.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
