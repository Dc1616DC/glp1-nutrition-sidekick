'use client';

import NotificationSettings from '../../components/NotificationSettings';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-2">
            Customize your reminders and notifications to support your GLP-1 journey.
          </p>
        </div>
        
        <NotificationSettings />
      </div>
    </div>
  );
}