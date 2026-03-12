'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { CustomBottomNavigation } from './CustomBottomNavigation';
import { usePathname } from 'next/navigation';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export const NavigationWrapper: React.FC<NavigationWrapperProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pathname = usePathname();

  // Hide navigation on login page if needed
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleNavTap = (index: number) => {
    setCurrentIndex(index);
    // In a real app, you would handle navigation here
    // router.push(navItems[index].path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <Sidebar 
        currentIndex={currentIndex} 
        onTap={handleNavTap} 
        className="hidden lg:flex" 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-72 pb-20 lg:pb-0 transition-all duration-500">
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <CustomBottomNavigation 
        currentIndex={currentIndex} 
        onTap={handleNavTap} 
        className="lg:hidden" 
      />
    </div>
  );
};

export default NavigationWrapper;
