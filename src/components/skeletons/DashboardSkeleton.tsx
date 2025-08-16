'use client';

import Skeleton from './Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton height={36} width="40%" className="mb-2" />
          <Skeleton height={20} width="60%" />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Skeleton height={24} width={150} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="rounded" width={60} height={20} />
                </div>
                <Skeleton height={20} className="mb-1" />
                <Skeleton height={16} width="70%" />
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Tip */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-start">
              <Skeleton variant="circular" width={32} height={32} className="mr-4" />
              <div className="flex-1">
                <Skeleton height={20} width="30%" className="mb-2" />
                <div className="space-y-2">
                  <Skeleton height={16} />
                  <Skeleton height={16} />
                  <Skeleton height={16} width="80%" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hub Navigation */}
        <div className="mb-8">
          <Skeleton height={24} width={200} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
                <Skeleton variant="circular" width={48} height={48} className="mb-3" />
                <Skeleton height={18} className="mb-1" />
                <Skeleton height={14} width="80%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}