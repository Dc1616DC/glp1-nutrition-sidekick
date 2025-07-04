// For a novice developer:
// This is a special script, not part of the main application that runs in the browser.
// Its only purpose is to take your Excel file of meals and upload them all to your
// Firebase database. You will only need to run this script once.

// --- --------------------------------- ---
// --- HOW TO USE THIS SCRIPT (3 STEPS)  ---
// --- --------------------------------- ---

// STEP 1: INSTALL DEPENDENCIES
// Open your terminal (the command line tool) and run these commands, one by one:
// npm install -g ts-node
// npm install xlsx

// STEP 2: GET YOUR FIREBASE SERVICE ACCOUNT KEY
// This is like a password that allows this script to access your database.
//  1. Go to the Firebase Console: https://console.firebase.google.com/
//  2. Select your project.
//  3. Click the gear icon next to "Project Overview" and go to "Project settings".
//  4. Go to the "Service accounts" tab.
//  5. Click the "Generate new private key" button. A JSON file will download.
//  6. RENAME the downloaded file to "serviceAccountKey.json".
//  7. MOVE this file into the "src/scripts" folder (the same folder this file is in).
//  IMPORTANT: This key is very sensitive. The .gitignore file should be updated to
//  prevent this file from ever being uploaded to a public repository.

// STEP 3: RUN THE SCRIPT
//  1. Make sure your Excel file is named "meals.xlsx" and is in this same "src/scripts" folder.
//  2. Open your terminal, make sure you are in the project's root directory, and run this command:
//     ts-node src/scripts/importMeals.ts
//
// You should see messages in the terminal as it uploads your meals.

import * as admin from 'firebase-admin';
import * as xlsx from 'xlsx';
import * as path from 'path';

// --- CONFIGURATION ---
// The path to your service account key JSON file.
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

// The path to your Excel file.
const excelFilePath = path.resolve(__dirname, './meals.xlsx');

// Initialize the Firebase Admin SDK.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get a reference to the Firestore database.
const db = admin.firestore();

// The main function that does all the work.
const importMeals = async () => {
  try {
    console.log('Starting meal import process...');

    // --- 1. Read the Excel file ---
    console.log(`Reading Excel file from: ${excelFilePath}`);
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0]; // We assume the data is on the first sheet.
    const worksheet = workbook.Sheets[sheetName];

    // --- 2. Convert sheet to JSON ---
    // This will create an array of objects, where each object represents a row.
    const mealsJson = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Found ${mealsJson.length} meals in the spreadsheet.`);

    // --- 3. Loop through each meal and upload it ---
    const mealsCollection = db.collection('meals');

    for (const meal of mealsJson as any[]) {
      // Basic check to skip empty rows
      if (!meal.Name || typeof meal.Name !== 'string' || meal.Name.trim() === '') {
        console.log('Skipping empty or invalid row.');
        continue;
      }

      console.log(`Processing meal: "${meal.Name}"`);

      // --- 4. Create a structured meal object ---
      // This ensures the data is clean and matches our database structure.
      const mealData = {
        name: meal.Name.trim(),
        category: meal.Category?.trim() || 'Snack',
        // Split comma-separated strings into an array of trimmed strings
        ingredients: (meal.Ingredients || '').split(',').map((item: string) => item.trim()),
        instructions: (meal.Instructions || '').split('.').map((item: string) => item.trim()).filter(Boolean),
        // Convert numbers, providing a default of 0 if they are missing or invalid
        proteinGrams: parseInt(meal['Protein (g)'], 10) || 0,
        fiberGrams: parseInt(meal['Fiber (g)'], 10) || 0,
        prepTimeMinutes: parseInt(meal['Prep Time (minutes)'], 10) || 0,
        // Split tags into an array
        tags: (meal.Tags || '').split(',').map((item: string) => item.trim()).filter(Boolean),
      };

      // --- 5. Add the meal to Firestore ---
      await mealsCollection.add(mealData);
      console.log(`  -> Successfully uploaded "${mealData.name}"`);
    }

    console.log('\n-----------------------------------');
    console.log('Meal import completed successfully!');
    console.log('-----------------------------------');
  } catch (error) {
    console.error('\n--- AN ERROR OCCURRED ---');
    console.error('Error importing meals:', error);
    console.error('Please check the file paths and make sure the Excel file is not open.');
  }
};

// Run the import function.
importMeals();
