'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showText = false 
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const getRatingText = (rating: number) => {
    if (rating === 0) return 'Not rated';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent';
    return 'Not rated';
  };

  const handleStarClick = (starRating: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(starRating);
  };

  const handleStarHover = (starRating: number) => {
    if (readonly) return;
    setHoveredRating(starRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex items-center gap-1"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${sizeClasses[size]} ${
              readonly 
                ? 'cursor-default' 
                : 'cursor-pointer hover:scale-110 transition-transform'
            }`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={readonly}
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-full h-full ${
                star <= displayRating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 fill-current'
              }`}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      
      {showText && (
        <span className={`text-gray-600 ${textSizeClasses[size]} font-medium`}>
          {getRatingText(displayRating)}
        </span>
      )}
      
      {!readonly && hoveredRating > 0 && (
        <span className={`text-gray-500 ${textSizeClasses[size]} ml-1`}>
          {getRatingText(hoveredRating)}
        </span>
      )}
    </div>
  );
}