'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../firebase/auth';

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    // Close the mobile menu if it's open
    setIsOpen(false);
    // Redirect to home page after sign out
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/calculator', label: 'Calculator' },
    { href: '/meals', label: 'Meals' },
    { href: '/meal-generator', label: 'AI Meal Generator' },
    { href: '/symptoms', label: 'Symptoms' }, // New symptom tracker
    { href: '/education', label: 'Education' },
    { href: '/reminders', label: 'Meal Reminders' }, // Point to dashboard that works with medical system
    { href: '/settings', label: '🌙 Evening Toolkit' }, // Evening Toolkit access
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-[#4A90E2]">
              GLP-1 Companion
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:bg-gray-200 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="text-gray-700 hover:bg-gray-200 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="bg-[#4A90E2] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="bg-[#4A90E2] text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:bg-gray-200 hover:text-black block px-3 py-2 rounded-md text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:bg-gray-200 hover:text-black block px-3 py-2 rounded-md text-base font-medium"
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left bg-[#4A90E2] text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="bg-[#4A90E2] text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-600"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
