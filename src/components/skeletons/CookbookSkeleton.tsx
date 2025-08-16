'use client';

import Skeleton from './Skeleton';

export default function CookbookSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton height={36} width="30%" className="mb-2" />
        <Skeleton height={20} width="50%" />
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton variant="rounded" height={48} width={80} className="mx-auto mb-2" />
              <Skeleton height={16} width={100} className="mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <Skeleton variant="rounded" height={40} />
          </div>
          <Skeleton variant="rounded" height={40} />
          <Skeleton variant="rounded" height={40} />
          <Skeleton variant="rounded" height={40} />
        </div>
        <div className="flex justify-between items-center mt-4">
          <Skeleton height={16} width={150} />
          <div className="flex space-x-2">
            <Skeleton variant="rounded" width={60} height={32} />
            <Skeleton variant="rounded" width={60} height={32} />
          </div>
        </div>
      </div>

      {/* Meal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            {/* Title and badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Skeleton height={20} className="mb-1" />
                <Skeleton height={16} width="60%" className="mb-1" />
                <Skeleton height={14} width="40%" />
              </div>
              <Skeleton variant="rounded" width={60} height={24} />
            </div>

            {/* Nutrition */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="text-center">
                  <Skeleton height={20} className="mb-1" />
                  <Skeleton height={14} width="60%" className="mx-auto" />
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-4">
              <Skeleton variant="rounded" width={50} height={20} />
              <Skeleton variant="rounded" width={60} height={20} />
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Skeleton width={80} height={20} />
              <div className="flex space-x-2">
                <Skeleton width={40} height={20} />
                <Skeleton width={40} height={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}