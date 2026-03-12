'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { CustomBottomNavigation } from './CustomBottomNavigation';
import { usePathname, useRouter } from 'next/navigation';
import { authRepository } from '@/lib/repositories/AuthRepository';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export const NavigationWrapper: React.FC<NavigationWrapperProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Hide navigation on login page if needed
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await authRepository.logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavTap = (index: number) => {
    if (index === 6) { // Logout index
      handleLogout();
      return;
    }
    
    setCurrentIndex(index);
    // Navigation logic for other items could go here
    // e.g., if (index === 2) router.push('/projects');
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
