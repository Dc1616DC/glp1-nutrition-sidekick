# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development server**: `npm run dev` (with turbo: `npm run dev:turbo`)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Linting**: `npm run lint`
- **Data import**: `ts-node src/scripts/importMeals.ts` (requires meals.xlsx and serviceAccountKey.json in src/scripts/)

## Architecture Overview

This is a **Next.js 15** application for GLP-1 medication users, featuring AI-powered meal generation, Firebase authentication, and progressive web app capabilities.

### Core Architecture

- **Framework**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **Authentication**: Firebase Auth with React Context (`src/context/AuthContext.tsx`)
- **Database**: Firestore for user data and meal storage
- **AI Integration**: Dual approach - Spoonacular API for recipe data + OpenAI for custom generation
- **PWA**: Progressive Web App with service workers and notification system

### Key Services

- **Spoonacular Service** (`src/services/spoonacularService.ts`): Primary meal generation using Spoonacular API with GLP-1 optimization (high protein/fiber filtering, nutrition validation)
- **Firebase Config** (`src/firebase/config.ts`): Centralized Firebase setup with environment-based configuration
- **Notification Services** (`src/services/`): Cross-browser notification system for meal reminders

### API Routes Architecture

Located in `src/app/api/`:
- `generate-meal-options/route.ts`: Main endpoint for AI meal generation (returns 2 meal options)
- `generate-meal-spoonacular/route.ts`: Spoonacular-specific meal generation
- `test-openai/route.ts`: OpenAI API testing endpoint
- `test-spoonacular/route.ts`: Spoonacular API testing endpoint

### Component Structure

- **AIMealGenerator** (`src/components/AIMealGenerator.tsx`): Main meal generation interface with preferences and meal display
- **AuthContext** (`src/context/AuthContext.tsx`): Global authentication state management
- **Navbar** (`src/components/Navbar.tsx`): Application navigation with auth state
- **PWA Components**: Install prompt, status indicator, service worker registration

### Environment Variables Required

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# API Keys
OPENAI_API_KEY=
SPOONACULAR_API_KEY=
```

### Key Features

1. **AI Meal Generation**: Generates high-protein, high-fiber meals optimized for GLP-1 users with cooking method preferences, dietary restrictions, and nutrition targets
2. **Nutrition Tracking**: Focus on protein (20g+ target) and fiber (4g+ target) for GLP-1 medication effectiveness
3. **Meal Variety**: Prevents recipe repetition by tracking previous meals and excluding them from new generations
4. **PWA Capabilities**: Installable app with offline support and push notifications for meal reminders
5. **User Authentication**: Firebase-based user accounts for saving preferences and meal history

### GLP-1 Specific Optimizations

- Nutrition validation ensuring meals meet minimum protein/fiber requirements
- Meal timing and preparation considerations for medication users
- Portion control and satiety-focused meal design
- Educational content integration for GLP-1 medication best practices

### Development Notes

- Uses React 19 features and Next.js 15 app router
- Firebase v9 SDK with modular imports
- TypeScript strict mode enabled
- Tailwind CSS for styling with custom components
- PWA manifest and service worker configuration in public/
- Meal data can be imported from Excel files using the import script

### Testing

- No automated test framework currently configured
- Manual testing endpoints available at `/api/test-*` routes
- Use test pages at `/auth-test`, `/pwa-test`, `/pwa-diagnostic` for feature validation