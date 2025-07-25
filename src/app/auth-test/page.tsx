'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function AuthTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const { user, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Signed in successfully!');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setMessage('Signed out successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-8">Loading Firebase...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Firebase Auth Test</h1>
      
      {user ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800">Signed In!</h2>
            <p className="text-green-700">Email: {user.email}</p>
            <p className="text-green-700">UID: {user.uid}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="signup"
              checked={isSignUp}
              onChange={(e) => setIsSignUp(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="signup" className="text-sm text-gray-700">
              Create new account
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      )}
      
      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
