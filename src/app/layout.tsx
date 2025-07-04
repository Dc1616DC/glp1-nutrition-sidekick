import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Authentication provider for global user state
import { AuthProvider } from "../context/AuthContext";
// Application-wide navigation bar
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GLP-1 Nutrition Companion",
  description:
    "AI-powered meal planning, nutrition calculator, and educational support for GLP-1 medication users.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Provide authentication context to the entire app */}
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl p-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

