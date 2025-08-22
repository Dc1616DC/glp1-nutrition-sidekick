import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

/**
 * Initialize Firebase Admin SDK
 * This handles both local development (using service account JSON) 
 * and production deployment (using environment variables)
 */
function initializeFirebaseAdmin() {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    // Option 1: Use service account JSON (for local development)
    if (process.env.FIREBASE_ADMIN_SDK) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK) as ServiceAccount;
      return initializeApp({
        credential: cert(serviceAccount)
      });
    }
    
    // Option 2: Use individual environment variables (for production/Vercel)
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_CLIENT_EMAIL && 
        process.env.FIREBASE_PRIVATE_KEY) {
      
      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID.trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
        // Handle escaped newlines in private key and trim whitespace
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').trim()
      };
      
      return initializeApp({
        credential: cert(serviceAccount)
      });
    }
    
    // Option 3: Use Google Application Default Credentials (for Google Cloud deployment)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return initializeApp();
    }
    
    throw new Error(
      'Firebase Admin SDK not configured. Please set either:\n' +
      '1. FIREBASE_ADMIN_SDK (full service account JSON)\n' +
      '2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY\n' +
      '3. GOOGLE_APPLICATION_CREDENTIALS (for Google Cloud)'
    );
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    console.error('Environment check:', {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectIdLength: process.env.FIREBASE_PROJECT_ID?.length,
      clientEmailLength: process.env.FIREBASE_CLIENT_EMAIL?.length,
    });
    throw error;
  }
}

// Initialize once and export
let adminApp: ReturnType<typeof initializeApp> | null = null;

try {
  adminApp = initializeFirebaseAdmin();
} catch (error) {
  // Log error but don't crash the app immediately
  // This allows the app to start even if admin SDK isn't configured
  console.warn('Firebase Admin SDK initialization failed:', error);
}

/**
 * Verify a Firebase ID token and return the decoded token
 * @param idToken The Firebase ID token to verify
 * @returns The decoded token containing user information
 */
export async function verifyIdToken(idToken: string) {
  if (!adminApp) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

/**
 * Check if Firebase Admin is properly initialized
 */
export function isAdminInitialized(): boolean {
  return adminApp !== null;
}

export { adminApp };