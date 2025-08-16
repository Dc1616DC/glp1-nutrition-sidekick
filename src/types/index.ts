// Central export file for all types
// This makes importing types easier and more consistent

// Common types
export * from './common';

// Meal-related types
export * from './meal';
export * from './savedMeals';
export * from './recipe';

// Re-export Firebase User type for convenience
export type { User } from 'firebase/auth';