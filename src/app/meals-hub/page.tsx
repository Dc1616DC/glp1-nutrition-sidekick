'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function MealsHub() {
  const { user } = useAuth();
  const router = useRouter();

  const mealFeatures = [
    {
      href: '/meals',
      icon: '📖',
      title: 'Recipe Library',
      description: 'Browse our curated collection of GLP-1 friendly recipes',
      free: true,
      action: 'Browse Recipes'
    },
    {
      href: '/meal-generator',
      icon: '🤖',
      title: 'AI Meal Generator',
      description: 'Get personalized meal suggestions optimized for GLP-1 users',
      primary: true,
      action: 'Generate Meal'
    },
    {
      href: '/cookbook',
      icon: '📚',
      title: 'My Cookbook',
      description: 'Your collection of saved and favorite meals',
      action: 'View Saved'
    },
    {
      href: '/shopping-list',
      icon: '🛒',
      title: 'Shopping Lists',
      description: 'Manage your grocery lists and meal ingredients',
      action: 'View Lists'
    },
    {
      href: '/pantry',
      icon: '🥫',
      title: 'Pantry',
      description: 'Track what ingredients you have at home',
      action: 'Manage Pantry'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍽️ Meals Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to plan, prepare, and enjoy GLP-1 optimized meals
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mealFeatures.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`group relative rounded-xl transition-all duration-200 ${
                feature.primary
                  ? 'md:col-span-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl'
                  : 'bg-white hover:shadow-lg border border-gray-200'
              }`}
            >
              <div className="p-8">
                {feature.free && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      FREE
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`text-5xl mb-4 ${feature.primary ? 'animate-pulse' : ''}`}>
                      {feature.icon}
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${
                      feature.primary ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h2>
                    <p className={`mb-4 ${
                      feature.primary ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                    <div className={`inline-flex items-center font-semibold ${
                      feature.primary 
                        ? 'text-white' 
                        : 'text-blue-600 group-hover:text-blue-700'
                    }`}>
                      {feature.action}
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Tips Section */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">
            💡 Pro Tips for GLP-1 Meal Planning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <p className="text-sm text-green-700">
                Aim for 20-30g protein per meal to maintain satiety
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <p className="text-sm text-green-700">
                Include fiber-rich vegetables to support digestion
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <p className="text-sm text-green-700">
                Keep portions moderate to prevent discomfort
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}