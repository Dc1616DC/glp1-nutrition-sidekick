// src/firebase/db.ts

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";

// --- Interfaces ---
// For a novice developer: Interfaces are like blueprints for our data.
// They tell TypeScript what kind of properties an object should have.

export interface UserProfile {
  uid: string;
  email: string;
  // Calculator results
  tdee?: number;
  targetCalories?: number;
  proteinGoal?: { low: number; high: number };
  // User preferences
  dietaryRestrictions?: string[];
  mealPreferences?: string[]; // e.g., "quick", "high-protein"
  // Notification settings
  notificationSettings?: {
    breakfast: string; // e.g., "07:00"
    morningSnack: string;
    lunch: string;
    afternoonSnack: string;
    dinner: string;
  };
  /**
   * Firebase Cloud Messaging tokens linked to the user’s devices.
   * These are used to send push notifications for meal reminders.
   */
  fcmTokens?: string[]; // Array of FCM registration tokens
}

export interface Meal {
  id?: string; // Firestore document ID
  name: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  ingredients: string[];
  instructions: string[];
  proteinGrams: number;
  fiberGrams: number;
  prepTimeMinutes: number;
  tags: string[]; // e.g., "vegetarian", "gluten-free"
}

// --- User Profile Functions ---

/**
 * Creates a new user profile document in Firestore.
 * For a novice developer: When a new user signs up, we need a place to store their
 * specific information. This function creates a "file" (a document) for them in our
 * "users" folder (collection) in the database.
 *
 * @param {string} userId - The unique ID from Firebase Authentication.
 * @param {object} data - The initial data for the user profile (like email).
 * @returns {Promise<void>}
 */
export const createUserProfile = async (userId: string, data: { email: string }): Promise<void> => {
  const userProfileData: UserProfile = {
    uid: userId,
    email: data.email,
  };
  // `doc(db, 'users', userId)` creates a reference to a document.
  // `setDoc` then writes the data to that document.
  await setDoc(doc(db, "users", userId), userProfileData);
};

/**
 * Retrieves a user's profile from Firestore.
 * For a novice developer: This function goes to the database and fetches the
 * "file" (document) for a specific user so the app can use their saved info.
 *
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<UserProfile | null>} The user's profile data or null if not found.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  // `doc(db, 'users', userId)` points to the specific user's document.
  const docRef = doc(db, "users", userId);
  // `getDoc` fetches the document.
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // If the document exists, return its data.
    return docSnap.data() as UserProfile;
  } else {
    // If not, return null.
    console.log("No such document!");
    return null;
  }
};

/**
 * Updates a user's profile in Firestore.
 * For a novice developer: When a user changes their settings (like dietary restrictions
 * or notification times), this function updates their "file" (document) in the database.
 *
 * @param {string} userId - The user's unique ID.
 * @param {Partial<UserProfile>} data - An object with the fields to update.
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  const userDocRef = doc(db, "users", userId);
  // `updateDoc` merges the new data with the existing document data.
  // It only changes the fields you provide.
  await updateDoc(userDocRef, data);
};


// --- Meal Functions ---

/**
 * Fetches all the pre-built meals from the 'meals' collection.
 * For a novice developer: This function gets our entire list of pre-made meals
 * from the database so we can show them to the user.
 *
 * @returns {Promise<Meal[]>} An array of meal objects.
 */
export const getMeals = async (): Promise<Meal[]> => {
  // `collection(db, 'meals')` points to the entire 'meals' collection.
  const querySnapshot = await getDocs(collection(db, "meals"));
  const meals: Meal[] = [];
  // We loop through each document snapshot in the result.
  querySnapshot.forEach((doc: DocumentData) => {
    // For each document, we get its data and add its ID.
    meals.push({ id: doc.id, ...doc.data() } as Meal);
  });
  return meals;
};

// Note for later: We will need a function to add meals to the database in bulk
// when we import them from your Excel file. We can build that when we get to
// the data import step.

/**
 * Fetches **one** meal document from Firestore by its ID.
 *
 * For a novice developer:
 * Think of each meal in Firestore as a “file” in a folder called **meals**.
 * Every file has a unique filename (its **document ID**).  
 * This function goes to the **meals** folder, opens the file whose name matches
 * the `mealId` you pass in, and returns its contents.
 *
 * @param {string} mealId – The Firestore document ID of the meal you want.
 * @returns {Promise<Meal | null>} The meal data (including its ID) or `null`
 *          if no meal with that ID exists.
 */
export const getMealById = async (mealId: string): Promise<Meal | null> => {
  // Create a reference to the specific meal document
  const mealDocRef = doc(db, "meals", mealId);

  // Fetch the document snapshot
  const mealSnap = await getDoc(mealDocRef);

  if (mealSnap.exists()) {
    // If it exists, merge its data with the ID field and return it
    return { id: mealSnap.id, ...mealSnap.data() } as Meal;
  }

  // If not found, return null so the calling code can handle it
  return null;
};
