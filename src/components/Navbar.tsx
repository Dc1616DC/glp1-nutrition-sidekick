'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { signOutUser } from '../firebase/auth';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { isOnline, connectionType } = useOnlineStatus();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has completed onboarding (has set calculator goals)
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    setHasCompletedOnboarding(!!onboardingComplete);
  }, [pathname]); // Re-check when navigating

  const handleSignOut = async () => {
    await signOutUser();
    setIsOpen(false);
    router.push('/');
  };

  // Hub-based navigation structure
  const navHubs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/',
      icon: '🏠',
      alwaysShow: true
    },
    {
      id: 'getting-started',
      label: hasCompletedOnboarding ? 'Learn & Settings' : 'Getting Started',
      icon: hasCompletedOnboarding ? '📚' : '🎯',
      href: hasCompletedOnboarding ? '/settings-education' : '/getting-started',
      subItems: hasCompletedOnboarding ? [
        { href: '/education', label: 'Education Resources' },
        { href: '/protein-fiber-foods', label: 'Protein & Fiber Guide' },
        { href: '/calculator', label: 'Recalculate Goals' },
        { href: '/account', label: 'Account Settings' }
      ] : [
        { href: '/calculator', label: 'Set Your Goals' },
        { href: '/education', label: 'Learn GLP-1 Nutrition' },
        { href: '/protein-fiber-foods', label: 'Protein & Fiber Guide' }
      ]
    },
    {
      id: 'meals',
      label: 'Meals',
      icon: '🍽️',
      href: '/meals-hub',
      subItems: [
        { href: '/meals', label: 'Recipe Library' },
        { href: '/meal-generator', label: 'AI Meal Generator' },
        { href: '/cookbook', label: 'My Cookbook' },
        { href: '/shopping-list', label: 'Shopping Lists' }
      ]
    },
    {
      id: 'track',
      label: 'Track',
      icon: '📝',
      href: '/track-hub',
      subItems: [
        { href: '/meal-log', label: 'Meal Logger' },
        { href: '/symptoms', label: 'Symptom Tracker' },
        { href: '/reminders', label: 'Meal Reminders' }
      ]
    }
  ];

  const isActiveHub = (hub: any) => {
    if (hub.href === '/' && pathname === '/') return true;
    if (hub.href !== '/' && pathname.startsWith(hub.href)) return true;
    return hub.subItems?.some((item: any) => pathname === item.href);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-[#4A90E2]">
              GLP-1 Companion
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navHubs.map((hub) => (
              <div key={hub.id} className="relative group">
                <Link
                  href={hub.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActiveHub(hub)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  } ${hub.premium ? 'relative' : ''}`}
                >
                  <span>{hub.icon}</span>
                  <span>{hub.label}</span>
                  {hub.premium && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold">
                      PRO
                    </span>
                  )}
                </Link>
                
                {/* Dropdown for sub-items on hover */}
                {hub.subItems && hub.subItems.length > 0 && (
                  <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                    <div className="py-1">
                      {hub.subItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Offline Status Indicator */}
            <div className="mr-2 flex items-center">
              <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <span className="hidden sm:inline">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                {connectionType && connectionType !== 'unknown' && isOnline && (
                  <span className="text-xs opacity-75">({connectionType})</span>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="ml-4 flex items-center space-x-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    {user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-[#4A90E2] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="bg-[#4A90E2] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navHubs.map((hub) => (
              <div key={hub.id}>
                <Link
                  href={hub.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveHub(hub)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{hub.icon}</span>
                  {hub.label}
                  {hub.premium && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold">
                      PRO
                    </span>
                  )}
                </Link>
                
                {/* Mobile sub-items */}
                {hub.subItems && hub.subItems.length > 0 && isActiveHub(hub) && (
                  <div className="pl-8 space-y-1 mt-1">
                    {hub.subItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-1 text-sm text-gray-600 hover:text-black"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile Offline Status */}
            <div className="px-3 py-2">
              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-orange-500'
                }`}></div>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
                {connectionType && connectionType !== 'unknown' && isOnline && (
                  <span className="text-xs opacity-75">({connectionType})</span>
                )}
              </div>
            </div>

            {/* Mobile User Section */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600">
                    Signed in as {user.email?.split('@')[0]}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium bg-[#4A90E2] text-white rounded-md hover:bg-blue-600"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}