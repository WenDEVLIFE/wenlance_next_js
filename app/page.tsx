import Image from "next/image";
import { AnimatedCard } from "@/components/AnimatedCard";

export default function Home() {
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
            Converted Flutter Component
          </h1>
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
    </div>
  );
}
