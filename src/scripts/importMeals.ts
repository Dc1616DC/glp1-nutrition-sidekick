// For a novice developer:
// This is a special script, not part of the main application that runs in the browser.
// Its only purpose is to take your Excel file of meals and upload them all to your
// Firebase database. You will only need to run this script once.

// --- --------------------------------- ---
// --- HOW TO USE THIS SCRIPT (3 STEPS)  ---
// --- --------------------------------- ---

// STEP 1: INSTALL DEPENDENCIES
// Open your terminal (the command line tool) and run these commands, one by one:
// npm install ts-node xlsx --save-dev

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
//     npx ts-node src/scripts/importMeals.ts
//
// You should see messages in the terminal as it uploads your meals.

import * as admin from 'firebase-admin';
import * as xlsx from 'xlsx';
import * as path from 'path';

// --- CONFIGURATION ---
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);
const excelFilePath = path.resolve(__dirname, './meals.xlsx');

// Initialize the Firebase Admin SDK.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* ---------------------------------------------------------------------------
 *  🔐  IMPORTANT – MANUALLY UPDATE RULES BEFORE / AFTER RUNNING
 *
 *  1)  In the Firebase console open:  Firestore ‣ Rules
 *  2)  Temporarily paste these rules and **Publish**:
 *
 *        rules_version = '2';
 *        service cloud.firestore {
 *          match /databases/{database}/documents {
 *            match /{document=**} {
 *              allow read, write: if true;
 *            }
 *          }
 *        }
 *
 *  3)  Run this script (`npx ts-node src/scripts/importMeals.ts`)
 *  4)  When the import finishes, replace the rules with your secure
 *      production rules and **Publish** again.
 * ------------------------------------------------------------------------- */

// The main function that does all the work.
const importMeals = async () => {
  try {
    console.log('\nStarting meal import process...');

    // --- 1. Read the Excel file ---
    console.log(`Reading Excel file from: ${excelFilePath}`);
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // --- 2. Convert sheet to JSON ---
    const mealsJson = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Found ${mealsJson.length} meals in the spreadsheet.`);

    // --- 3. Loop through each meal and upload it ---
    const mealsCollection = db.collection('mealTemplates');
    for (const meal of mealsJson as any[]) {
      if (!meal['Recipe Name'] || typeof meal['Recipe Name'] !== 'string' || meal['Recipe Name'].trim() === '') {
        continue;
      }
      console.log(`Processing meal: "${meal['Recipe Name']}"`);

      const mealData = {
        name: meal['Recipe Name'].trim(),
        category: meal.Category?.trim() || 'Snack',
        ingredients: (meal.Ingredients || '').split(',').map((item: string) => item.trim()),
        instructions: (meal.Instructions || '').split('.').map((item: string) => item.trim()).filter(Boolean),
        proteinGrams: parseInt(meal['Protein (g)'], 10) || 0,
        fiberGrams: parseInt(meal['Fiber (g)'], 10) || 0,
        prepTimeMinutes: parseInt(meal['Prep Time (minutes)'], 10) || 0,
        tags: (meal.Tags || '').split(',').map((item: string) => item.trim()).filter(Boolean),
      };

      await mealsCollection.add(mealData);
      console.log(`  -> Successfully uploaded "${mealData.name}"`);
    }

    console.log('\n-----------------------------------');
    console.log('✅  Meal import completed successfully!');
    console.log('-----------------------------------');

  } catch (error) {
    console.error('\n--- AN ERROR OCCURRED DURING THE PROCESS ---');
    console.error('Error importing meals:', error);
    console.error('Please check your file paths and ensure the Excel file is not open.');
  }
};

// Run the import function.
importMeals();
