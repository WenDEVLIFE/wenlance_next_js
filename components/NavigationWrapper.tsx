'use client';

import React, { useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { CustomBottomNavigation } from './CustomBottomNavigation';
import { usePathname, useRouter } from 'next/navigation';
import { authRepository } from '@/lib/repositories/AuthRepository';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

const routes: Record<number, string> = {
  0: '/dashboard',
  1: '/expenses',
  2: '/projects',
  3: '/salary',
  4: '/savings',
  5: '/ai',
};

function getIndexFromPathname(pathname: string): number {
  for (const [index, route] of Object.entries(routes)) {
    if (pathname.startsWith(route)) return Number(index);
  }
  return 0;
}

export const NavigationWrapper: React.FC<NavigationWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Derive active index from the current pathname (must be before any early returns)
  const currentIndex = useMemo(() => getIndexFromPathname(pathname), [pathname]);

  // Hide navigation on login page
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
    if (index === 6) {
      handleLogout();
      return;
    }

    const route = routes[index];
    if (route && pathname !== route) {
      router.push(route);
    }
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
