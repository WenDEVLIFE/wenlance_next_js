'use client';

import React, { useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { CustomBottomNavigation } from './CustomBottomNavigation';
import { usePathname, useRouter } from 'next/navigation';
import { authRepository } from '@/lib/repositories/AuthRepository';
import { auth } from '@/lib/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { SessionUtils } from '@/lib/utils/SessionUtils';

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
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Derive active index from the current pathname
  const currentIndex = useMemo(() => getIndexFromPathname(pathname), [pathname]);

  // Auth Guard & Session Sync
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isLoginPage = pathname === '/login';
      const isRootPath = pathname === '/';

      if (user) {
        // User is signed in, sync session if needed
        if (!SessionUtils.isLoggedIn()) {
          await SessionUtils.saveSession(user);
        }
        
        // If on login page while authenticated, go to dashboard
        if (isLoginPage || isRootPath) {
          router.replace('/dashboard');
        }
      } else {
        // User is signed out
        SessionUtils.clearSession();
        
        // If on a protected route while unauthenticated, go to login
        if (!isLoginPage && !isRootPath) {
          router.replace('/login');
        }
      }
      
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Show nothing or a loader while determining auth state on first load
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#03045E]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
