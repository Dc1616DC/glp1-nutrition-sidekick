// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

/**
 * ---------------------------------------------------------------------------
 * 🔰  BEGINNER-FRIENDLY SET-UP GUIDE
 * ---------------------------------------------------------------------------
 *  1)  Go to https://console.firebase.google.com/ and click “Add project”.
 *  2)  Follow the wizard (you can skip Google Analytics for now).
 *  3)  Inside your new project, click the “</>” (Web) icon to create a web app.
 *      ‑ Give it any nickname, tick “Also set up Firebase Hosting” **OFF**.
 *  4)  Firebase will show you a JS snippet that looks like:
 *
 *          const firebaseConfig = {
 *            apiKey: "ABCD...",
 *            authDomain: "my-app.firebaseapp.com",
 *            projectId: "my-app",
 *            storageBucket: "my-app.appspot.com",
 *            messagingSenderId: "123...",
 *            appId: "1:123:web:456..."
 *          };
 *
 *  5)  Copy each value and paste it into a new file called `.env.local`
 *      in the project root (**never commit this file**).  Example:
 *
 *          NEXT_PUBLIC_FIREBASE_API_KEY="ABCD..."
 *          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="my-app.firebaseapp.com"
 *          NEXT_PUBLIC_FIREBASE_PROJECT_ID="my-app"
 *          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="my-app.appspot.com"
 *          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
 *          NEXT_PUBLIC_FIREBASE_APP_ID="1:123:web:456..."
 *
 *  6)  Save the file and (re)start `npm run dev`.  The config below will
 *      read those environment variables automatically.
 *
 *  ❗  If you see “undefined” errors, double-check spelling & restart dev server.
 * ---------------------------------------------------------------------------
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// We add a check to see if the app is already initialized to prevent errors in Next.js's hot-reloading environment.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication, Firestore, and Functions
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Connect to Firebase Functions emulator in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('🔧 Connected to Firebase Functions emulator');
  } catch (error) {
    // Emulator already connected or not available
    console.log('Firebase Functions emulator connection status:', error);
  }
}

export { app, auth, db, functions };
