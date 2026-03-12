"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { AnimatedCard } from "@/components/AnimatedCard";
import { AnimatedDialog } from "@/components/AnimatedDialog";
import { AnimatedDialogWrapper } from "@/components/AnimatedDialogWrapper";
import { AnimatedFAB } from "@/components/AnimatedFAB";
import { AnimatedListItem } from "@/components/AnimatedListItem";

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showWrapper, setShowWrapper] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Converted Flutter Components
          </h1>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setIsDialogOpen(true)}
              className="rounded-full bg-black px-6 py-2 text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-medium"
            >
              Open Animated Dialog
            </button>
            <button 
              onClick={() => setShowWrapper(!showWrapper)}
              className="rounded-full border border-black/10 px-6 py-2 hover:bg-black/5 transition-colors dark:border-white/10 dark:hover:bg-white/5 font-medium"
            >
              Toggle Wrapper Animation
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showWrapper && (
              <AnimatedDialogWrapper className="my-8 rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-2">Animated Wrapper</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  This content is wrapped in `AnimatedDialogWrapper`. It uses the same scale and fade logic from the Flutter implementation.
                </p>
              </AnimatedDialogWrapper>
            )}
          </AnimatePresence>

          <AnimatedDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Hello from Flutter! 🚀</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                This dialog was converted from a Flutter `AnimatedDialog`. It uses a scale and fade animation for a smooth entry.
              </p>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="w-full rounded-xl bg-zinc-100 py-3 text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 font-semibold"
              >
                Close Dialog
              </button>
            </div>
          </AnimatedDialog>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <AnimatedCard className="p-6 border border-zinc-200 dark:border-zinc-800">
              <h2 className="font-bold mb-2">Default Animated Card</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Tap me to see the scale and shadow animation.
              </p>
            </AnimatedCard>

            <AnimatedCard 
              className="p-6 text-white" 
              color="#3b82f6" 
              scaleOnTap={0.9}
              onClick={() => alert('Card clicked!')}
            >
              <h2 className="font-bold mb-2">Custom Blue Card</h2>
              <p className="text-sm opacity-90">
                Greater scale effect (0.9) and click handler.
              </p>
            </AnimatedCard>
          </div>

          <div className="w-full space-y-3 mt-8">
            <h2 className="text-xl font-bold mb-4 text-black dark:text-zinc-50">Staggered List Items</h2>
            {[1, 2, 3, 4].map((item, i) => (
              <AnimatedListItem 
                key={item} 
                index={i} 
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                    {item}
                  </div>
                  <div>
                    <div className="font-semibold">Item Title {item}</div>
                    <div className="text-sm text-zinc-500">Staggered entrance animation</div>
                  </div>
                </div>
              </AnimatedListItem>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <AnimatedFAB 
          onPressed={() => setIsDialogOpen(true)}
          tooltip="Open Dialog"
          backgroundColor="#000"
          className="dark:bg-white dark:text-black"
        >
          <Plus size={24} />
        </AnimatedFAB>
      </div>
    </div>
  );
}
