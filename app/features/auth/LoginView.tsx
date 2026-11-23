'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  LockIcon, 
  LetterIcon, 
  DangerTriangleIcon, 
  CheckCircleIcon 
} from '@solar-icons/react/linear';
import { toast, Toaster } from 'sonner';
import { authRepository } from '@/lib/repositories/AuthRepository';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { CustomTextField } from '@/components/CustomTextField';
import { ThemeToggle } from '@/components/ThemeToggle';

export const LoginView: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    if (!val) return 'Please enter your email';
    if (!val.includes('@') || !val.includes('.')) return 'Please enter a valid email';
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Please enter your password';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      toast.error(emailError || passwordError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authRepository.login(email, password, rememberMe);

      toast.success('Login successful!', {
        icon: <CheckCircleIcon className="text-emerald-500" size={18} />,
      });

      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: <DangerTriangleIcon className="text-red-500" size={18} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-background transition-colors duration-300">
      <Toaster position="top-center" richColors theme="system" />

      {/* Theme toggle in corner */}
      <div className="absolute top-6 right-6 z-20">
        <div className="p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80">
          <ThemeToggle iconSize={20} />
        </div>
      </div>

      <main className="relative z-10 w-full max-w-md">
        <div className="space-y-6">
          {/* Logo Section */}
          <AnimatedListItem index={0} className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center p-3 shadow-xs">
              <Image
                src="/assets/WHITE-LOGO-PNG.png"
                alt="Wenlance Logo"
                width={40}
                height={40}
                className="object-contain dark:invert-0 invert"
              />
            </div>
          </AnimatedListItem>

          {/* Welcome Text */}
          <AnimatedListItem index={1} className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Welcome Back
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to manage your freelance operations
            </p>
          </AnimatedListItem>

          {/* Form Card */}
          <div className="space-y-5 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <AnimatedListItem index={2}>
              <CustomTextField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefixIcon={<LetterIcon size={18} className="text-zinc-400" />}
                className="bg-transparent border-zinc-200 dark:border-zinc-800 focus:border-sky-500"
              />
            </AnimatedListItem>

            <AnimatedListItem index={3}>
              <CustomTextField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isPassword
                prefixIcon={<LockIcon size={18} className="text-zinc-400" />}
                className="bg-transparent border-zinc-200 dark:border-zinc-800 focus:border-sky-500"
              />
            </AnimatedListItem>

            <AnimatedListItem index={4} className="flex items-center justify-between px-0.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                  Remember Me
                </span>
              </label>

              <button 
                type="button"
                className="text-xs font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400 transition-colors"
                onClick={() => toast.info('Password recovery coming soon')}
              >
                Forgot Password?
              </button>
            </AnimatedListItem>

            {error && (
              <AnimatedListItem index={5} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5">
                <DangerTriangleIcon size={16} className="text-red-500 shrink-0" />
                <span className="text-xs text-red-500 font-medium">{error}</span>
              </AnimatedListItem>
            )}

            <AnimatedListItem index={6} className="pt-2">
              <button
                disabled={isLoading}
                onClick={() => handleLogin()}
                className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </AnimatedListItem>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginView;
