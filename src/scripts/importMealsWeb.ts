// For a novice developer:
// This is a NEW script to import your meals. It uses a different method that
// is simpler and avoids the permission errors you were seeing.

// --- --------------------------------- ---
// --- HOW TO USE THIS SCRIPT (4 STEPS)  ---
// --- --------------------------------- ---

// STEP 1: CREATE A TEMPORARY USER FOR THE SCRIPT
// This script needs to "log in" to Firebase just like a regular user.
//  1. Go to the Firebase Console: https://console.firebase.google.com/
//  2. Select your project.
//  3. Go to "Authentication" -> "Users" tab.
//  4. Click "Add user".
//  5. Enter an email (e.g., "importer@example.com") and a password.
//  6. Click "Add user".

// STEP 2: FILL IN YOUR CREDENTIALS BELOW
// Replace the placeholder text with the email and password you just created.
const SCRIPT_USER_EMAIL = importer@example.com;
const SCRIPT_USER_PASSWORD = Test123!;

// STEP 3: MAKE SURE YOUR FILES ARE IN PLACE
//  - Your Excel file must be named "meals.xlsx" and be in this "src/scripts" folder.
//  - Your ".env.local" file must be in the project's root folder with your Firebase keys.

// STEP 4: RUN THE SCRIPT
//  1. Open your terminal.
//  2. Make sure you are in the project's root directory.
//  3. Run this command:
//     npx ts-node src/scripts/importMealsWeb.ts
//
// You should see messages in the terminal as it logs in and uploads your meals.

// -----------------------------------------------------------------------------
// --- SCRIPT CODE STARTS HERE ---
// -----------------------------------------------------------------------------

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as xlsx from 'xlsx';
import * as path from 'path';

// Load environment variables from .env.local file
// This is needed because this script runs outside of the Next.js environment.
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Firebase Client-Side Configuration ---
// Reads the configuration from your .env.local file.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if the configuration is loaded correctly.
if (!firebaseConfig.apiKey) {
  console.error("🔴 ERROR: Firebase configuration is missing. Make sure your .env.local file is set up correctly in the project root.");
  process.exit(1); // Exit the script if config is missing.
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Path to your Excel file.
const excelFilePath = path.resolve(__dirname, './meals.xlsx');

// The main function that does all the work.
const importMeals = async () => {
  try {
    // --- 1. Sign in as the script user ---
    console.log(`Attempting to sign in as ${SCRIPT_USER_EMAIL}...`);
    if (SCRIPT_USER_EMAIL.startsWith('YOUR_')) {
        throw new Error("Please update the SCRIPT_USER_EMAIL and SCRIPT_USER_PASSWORD in the script file.");
    }
    await signInWithEmailAndPassword(auth, SCRIPT_USER_EMAIL, SCRIPT_USER_PASSWORD);
    console.log("✅ Successfully signed in.");

    // --- 2. Read the Excel file ---
    console.log(`\nReading Excel file from: ${excelFilePath}`);
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // --- 3. Convert sheet to JSON ---
    const mealsJson = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Found ${mealsJson.length} meals in the spreadsheet.`);

    // --- 4. Loop through each meal and upload it ---
    console.log("\nStarting upload to Firestore...");
    const mealsCollection = collection(db, 'meals');

    for (const meal of mealsJson as any[]) {
      if (!meal.Name || typeof meal.Name !== 'string' || meal.Name.trim() === '') {
        continue;
      }
      console.log(`  -> Uploading: "${meal.Name.trim()}"`);

      const mealData = {
        name: meal.Name.trim(),
        category: meal.Category?.trim() || 'Snack',
        ingredients: (meal.Ingredients || '').split(',').map((item: string) => item.trim()),
        instructions: (meal.Instructions || '').split('.').map((item: string) => item.trim()).filter(Boolean),
        proteinGrams: parseInt(meal['Protein (g)'], 10) || 0,
        fiberGrams: parseInt(meal['Fiber (g)'], 10) || 0,
        prepTimeMinutes: parseInt(meal['Prep Time (minutes)'], 10) || 0,
        tags: (meal.Tags || '').split(',').map((item: string) => item.trim()).filter(Boolean),
      };

      await addDoc(mealsCollection, mealData);
    }

    console.log('\n-----------------------------------');
    console.log('✅ Meal import completed successfully!');
    console.log('-----------------------------------');

  } catch (error) {
    console.error('\n--- 🔴 AN ERROR OCCURRED ---');
    console.error(error);
  } finally {
    // Exit the script process once done.
    process.exit(0);
  }
};

// Run the import function.
importMeals();
