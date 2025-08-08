'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function TrackHub() {
  const { user } = useAuth();
  const router = useRouter();

  const trackingFeatures = [
    {
      href: '/meal-log',
      icon: '📝',
      title: 'Meal Logger',
      description: 'Simple protein and vegetable tracking with commitment goals',
      primary: true,
      action: 'Log Today\'s Meals',
      badge: 'Track Progress'
    },
    {
      href: '/symptoms',
      icon: '🏥',
      title: 'Symptom Tracker',
      description: 'Monitor GLP-1 side effects and get AI insights',
      action: 'Track Symptoms'
    },
    {
      href: '/reminders',
      icon: '🔔',
      title: 'Meal Reminders',
      description: 'Set up notifications for your committed meals',
      action: 'Manage Reminders'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📝 Track Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor your nutrition progress and GLP-1 journey with simple, supportive tracking tools
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {trackingFeatures.map((feature, index) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`group relative rounded-xl transition-all duration-200 ${
                feature.primary
                  ? 'lg:col-span-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl'
                  : 'bg-white hover:shadow-lg border border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-4xl ${feature.primary ? 'animate-pulse' : ''}`}>
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  )}
                </div>
                
                <h2 className={`text-xl font-bold mb-2 ${
                  feature.primary ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h2>
                
                <p className={`mb-4 text-sm ${
                  feature.primary ? 'text-green-100' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
                
                <div className={`inline-flex items-center font-semibold text-sm ${
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
            </Link>
          ))}
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              Today
            </div>
            <div className="text-sm text-gray-600 mb-2">Tracking Focus</div>
            <p className="text-xs text-gray-500">
              Log meals with protein + vegetables
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              Consistent
            </div>
            <div className="text-sm text-gray-600 mb-2">Build Habits</div>
            <p className="text-xs text-gray-500">
              Small daily actions create big results
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              Supported
            </div>
            <div className="text-sm text-gray-600 mb-2">Not Judged</div>
            <p className="text-xs text-gray-500">
              Progress, not perfection
            </p>
          </div>
        </div>

        {/* Helpful Reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🎯 Remember: Progress Over Perfection
          </h3>
          <p className="text-blue-700 mb-3">
            GLP-1 medications work best when paired with consistent nutrition habits. Our tracking tools 
            focus on the most important metrics without overwhelming you with details.
          </p>
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">💡</span>
            <p className="text-sm text-blue-600">
              Start with just one committed meal per day and build from there.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}