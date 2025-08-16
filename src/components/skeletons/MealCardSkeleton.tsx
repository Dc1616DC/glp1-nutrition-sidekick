'use client';

import Skeleton from './Skeleton';

export default function MealCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Title and type */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton height={24} className="mb-2" />
          <Skeleton width="60%" height={16} />
        </div>
        <Skeleton variant="rounded" width={60} height={24} />
      </div>

      {/* Nutrition Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton variant="rounded" height={32} className="mb-1" />
            <Skeleton height={14} width="60%" className="mx-auto" />
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="mb-4 space-y-2">
        <Skeleton height={14} />
        <Skeleton height={14} />
        <Skeleton height={14} width="80%" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4">
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="rounded" width={70} height={24} />
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Skeleton variant="rounded" width={100} height={36} />
        <div className="flex gap-2">
          <Skeleton variant="rounded" width={80} height={36} />
          <Skeleton variant="rounded" width={60} height={36} />
        </div>
      </div>
    </div>
  );
}