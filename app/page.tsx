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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#03045E]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}
