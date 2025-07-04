'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase/config";

// For a novice developer:
// Think of a Context as a global storage space for your app.
// We're creating one here to hold information about the currently logged-in user.
// This way, any component in our app can easily check if a user is logged in
// without us having to pass this information down through many layers of components.

// --- 1. Define the shape of our context data ---
interface AuthContextType {
  user: User | null; // The user object from Firebase, or null if not logged in.
  loading: boolean; // A flag to know if we are still checking the user's auth status.
}

// --- 2. Create the actual context ---
// We initialize it as 'undefined' because it will only have a value inside the Provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. Create the Provider Component ---
// This component will wrap our entire application in `layout.tsx`.
// Its job is to manage the user's state and provide it to all components inside it.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is a Firebase function that listens for changes
    // in the user's login state. It's the perfect tool for this job.
    // It runs once when it's set up, and then again every time a user signs in or out.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in.
        setUser(user);
      } else {
        // User is signed out.
        setUser(null);
      }
      // Once we've checked the auth state, we are no longer loading.
      setLoading(false);
    });

    // This is a cleanup function. When the component is removed from the screen,
    // we "unsubscribe" from the listener to prevent memory leaks.
    return () => unsubscribe();
  }, []); // The empty array [] means this effect runs only once when the component mounts.

  const value = {
    user,
    loading,
  };

  // We render the AuthContext.Provider and pass the user and loading state to it.
  // The `children` prop represents all the components that this provider will wrap.
  // We show a loading message while Firebase is checking the auth status to prevent
  // the app from flickering between a "logged out" and "logged in" state.
  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

// --- 4. Create a custom hook for easy access ---
// This is a helper hook that allows any component to easily get the user data.
// Instead of writing `useContext(AuthContext)` everywhere, we can just write `useAuth()`.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error is helpful for debugging. It tells us if we forgot to wrap a
    // component in the AuthProvider.
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
