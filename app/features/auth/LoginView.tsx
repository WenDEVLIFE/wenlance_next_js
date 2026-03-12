'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { authRepository } from '@/lib/repositories/AuthRepository';

import { AppColors } from '@/lib/utils/colors';

import { ShootingStars } from '@/components/ShootingStars';
import { AnimatedListItem } from '@/components/AnimatedListItem';
import { CustomTextField } from '@/components/CustomTextField';
import { CustomText } from '@/components/CustomText';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CustomButton } from '@/components/CustomButton';

/**
 * LoginView component converted from Flutter.
 * Features staggered animations, shooting stars background, and Firebase integration.
 */
export const LoginView: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // Login using the repository
      await authRepository.login(email, password);

      toast.success('Login successful!', {
        icon: <CheckCircle2 className="text-green-500" />,
      });

      // Delay navigation slightly for toast visibility
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage, {
        icon: <AlertTriangle className="text-red-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-soft-gradient">
      <ShootingStars />
      <Toaster position="top-center" richColors theme="system" />

      {/* Theme toggle in corner */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle iconSize={28} className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        <div className="space-y-8">
          {/* Logo Section */}
          <AnimatedListItem index={0} className="flex justify-center">
            <div
              className="p-4 rounded-full shadow-2xl border-4 border-white/10 flex items-center justify-center"
              style={{
                backgroundColor: AppColors.primary,
                boxShadow: `0 20px 25px -5px ${AppColors.primary}4D`,
                width: '100px',
                height: '100px'
              }}
            >
              <Image
                src="/assets/WHITE-LOGO-PNG.png"
                alt="Wenlance Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
          </AnimatedListItem>

          {/* Welcome Text */}
          <AnimatedListItem index={1} className="text-center space-y-2">
            <CustomText
              label="Welcome Back"
              fontWeight={700}
              fontSize={32}
              className="text-zinc-900 dark:text-white drop-shadow-md"
            />
          </AnimatedListItem>

          <div className="flex justify-center">
            <CustomText
              label="Sign in to continue to Wenlance"
              fontWeight={400}
              fontSize={16}
              className="text-zinc-500 dark:text-zinc-400"
            />
          </div>

          {/* Form Section */}
          <div className="space-y-6 mt-12 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-2xl">
            <AnimatedListItem index={2}>
              <CustomTextField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefixIcon={<Mail size={20} className="text-zinc-500" />}
                className="bg-transparent border-zinc-200 dark:border-zinc-800 focus:border-blue-500"
              />
            </AnimatedListItem>

            <AnimatedListItem index={3}>
              <CustomTextField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isPassword
                prefixIcon={<Lock size={20} className="text-zinc-500" />}
                className="bg-transparent border-zinc-200 dark:border-zinc-800 focus:border-blue-500"
              />
            </AnimatedListItem>

            {error && (
              <AnimatedListItem index={4} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0" />
                <CustomText label={error} fontSize={12} className="text-red-400" />
              </AnimatedListItem>
            )}

            <AnimatedListItem index={5} className="pt-4">
              <button
                disabled={isLoading}
                onClick={() => handleLogin()}
                className="w-full h-14 rounded-2xl text-white font-bold text-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-xl"
                style={{
                  backgroundColor: AppColors.primary,
                  boxShadow: `0 10px 15px -3px ${AppColors.primary}33`
                }}
              >
                {isLoading ? (
                  <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
