/**
 * Environment Variable Validation
 * Ensures required environment variables are properly configured
 */

// Required environment variables for the application
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

// Required environment variables for API functionality
const requiredApiEnvVars = [
  'OPENAI_API_KEY',
] as const;

// Optional but recommended environment variables
const recommendedEnvVars = [
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PROJECT_ID',
] as const;

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates that all required environment variables are set
 */
export function validateEnvironmentVariables(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required client-side variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check required API variables (server-side only)
  if (typeof window === 'undefined') {
    requiredApiEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });

    // Check recommended variables
    recommendedEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        warnings.push(`Recommended environment variable ${varName} is not set`);
      }
    });
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Throws an error if required environment variables are missing
 * Should be called at application startup
 */
export function ensureRequiredEnvironmentVariables(): void {
  const validation = validateEnvironmentVariables();
  
  if (!validation.isValid) {
    const missingVars = validation.missing.join(', ');
    throw new Error(
      `Missing required environment variables: ${missingVars}. ` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Log warnings in development
  if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
    console.warn('Environment Variable Warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
}

/**
 * Validates that sensitive environment variables are not exposed in client bundle
 */
export function validateClientSideSecurity(): void {
  if (typeof window !== 'undefined') {
    const sensitiveVars = [
      'OPENAI_API_KEY',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
    ];

    sensitiveVars.forEach(varName => {
      // @ts-expect-error - Intentionally checking for leaked env vars
      if (process.env[varName]) {
        console.error(`SECURITY WARNING: Sensitive environment variable ${varName} is exposed in client bundle!`);
      }
    });
  }
}

// Validate environment on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    ensureRequiredEnvironmentVariables();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Don't throw in production to avoid breaking the app
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }
}