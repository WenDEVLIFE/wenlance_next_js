'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUtils } from '@/lib/utils/SessionUtils';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we have a saved session in localStorage
    const isLoggedIn = SessionUtils.isLoggedIn();
    
    if (isLoggedIn) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-sky-600 border-t-transparent"></div>
    </div>
  );
}
