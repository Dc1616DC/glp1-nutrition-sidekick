'use client';

import { useState } from 'react';
import { auth } from '@/firebase/config';

export default function FirebaseTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        setResult({ error: 'No user signed in. Please sign in first.' });
        setLoading(false);
        return;
      }

      // Get fresh token
      const token = await user.getIdToken(true); // Force refresh
      
      // Call diagnostic endpoint
      const response = await fetch('/api/debug-firebase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Authentication Diagnostic</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Current user: {auth.currentUser?.email || 'Not signed in'}
        </p>
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Diagnostic...' : 'Run Diagnostic Test'}
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Diagnostic Results:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">What this tests:</h3>
        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
          <li>Checks if you're signed in</li>
          <li>Gets a fresh Firebase ID token</li>
          <li>Sends token to backend diagnostic endpoint</li>
          <li>Backend checks environment variables</li>
          <li>Backend attempts to initialize Firebase Admin SDK</li>
          <li>Backend attempts to verify your token</li>
          <li>Shows detailed error information if anything fails</li>
        </ul>
      </div>
    </div>
  );
}