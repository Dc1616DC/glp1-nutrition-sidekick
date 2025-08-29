import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Authentication provider for global user state
import { AuthProvider } from "../context/AuthContext";
// Application-wide navigation bar
import Navbar from "../components/Navbar";
// PWA install prompt
import PWAInstallPrompt from "../components/PWAInstallPrompt";
// PWA status indicator
import PWAStatus from "../components/PWAStatus";
// Service worker registration
import ServiceWorkerRegistration from "../components/ServiceWorkerRegistration";
// Error boundary for graceful error handling
import ErrorBoundary from "../components/ErrorBoundary";
// Enhanced onboarding experience
import EnhancedOnboardingWrapper from "../components/onboarding/EnhancedOnboardingWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GLP-1 Nutrition Sidekick",
  description: "Smart meal reminders for GLP-1 users with cross-browser notification support",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GLP-1 Sidekick",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GLP-1 Sidekick" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Provide authentication context to the entire app */}
        <AuthProvider>
          <ServiceWorkerRegistration />
          <PWAStatus />
          <EnhancedOnboardingWrapper>
            <Navbar />
            <main className="mx-auto max-w-7xl p-4">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            <PWAInstallPrompt />
          </EnhancedOnboardingWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

