import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "@/components/NavigationWrapper";
import PWARegistry from "@/components/PWARegistry";
import AlarmOverlay from "@/components/AlarmOverlay";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wenlance",
  description: "Advanced freelance management platform",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/WHITE-LOGO-PNG.png",
    apple: "/assets/WHITE-LOGO-PNG.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wenlance",
  },
};

export const viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <PWARegistry />
        <AlarmOverlay />
        <NavigationWrapper>
          {children}
        </NavigationWrapper>
      </body>
    </html>
  );
}
