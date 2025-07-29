'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ImportMealsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  // Only allow specific admin email
  const ADMIN_EMAIL = 'daniel@betterish.co';

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>This page is restricted to administrators.</p>
      </div>
    );
  }

  const handleImport = async () => {
    setImporting(true);
    setError('');
    setProgress('Starting import...\n');

    try {
      // Fetch the meals data
      const response = await fetch('/api/get-meals-data');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      const meals = Array.isArray(data) ? data : [];

      setProgress(prev => prev + `Found ${meals.length} meals to import.\n`);

      const mealsCollection = collection(db, 'mealTemplates');
      let successCount = 0;

      for (const meal of meals) {
        try {
          await addDoc(mealsCollection, meal);
          successCount++;
          setProgress(prev => prev + `✓ Imported: ${meal.name}\n`);
        } catch (err) {
          console.error(`Failed to import ${meal.name}:`, err);
          setProgress(prev => prev + `✗ Failed: ${meal.name}\n`);
        }
      }

      setProgress(prev => prev + `\n✅ Import complete! Successfully imported ${successCount} out of ${meals.length} meals.\n`);
    } catch (err) {
      setError('Import failed: ' + (err as Error).message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Import Meals from Excel</h1>
      
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
        <p className="text-yellow-800">
          <strong>Note:</strong> This will update the meal database with:
          <br />• Fixed categories (wraps moved from Snack to Lunch)
          <br />• Added healthy snacks with fiber focus
          <br />• Protein recommendations for low-protein snacks (&lt;10g)
          <br />Make sure you have updated Firestore rules to allow writes to mealTemplates.
        </p>
      </div>

      <button
        onClick={handleImport}
        disabled={importing}
        className={`px-6 py-3 rounded-lg font-semibold text-white ${
          importing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {importing ? 'Importing...' : 'Start Import'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {progress && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Progress:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
            {progress}
          </pre>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => router.push('/meals')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Meals
        </button>
      </div>
    </div>
  );
}