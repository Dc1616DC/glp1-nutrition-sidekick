'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import SymptomTracker from '../../components/SymptomTracker';
import SymptomTrends from '../../components/SymptomTrends';
import SymptomMealSuggestions from '../../components/SymptomMealSuggestions';
import { useRouter } from 'next/navigation';

interface SymptomLog {
  id: string;
  symptom: string;
  severity: number;
  notes: string;
  mealRelated: boolean | null;
  timestamp: any;
}

const SYMPTOM_LABELS: { [key: string]: { label: string; emoji: string } } = {
  nausea: { label: 'Nausea', emoji: '🤢' },
  constipation: { label: 'Constipation', emoji: '🚽' },
  fatigue: { label: 'Fatigue', emoji: '😴' },
  fullness: { label: 'Early Fullness', emoji: '🍽️' },
  cravings: { label: 'Cravings', emoji: '🍩' },
  heartburn: { label: 'Heartburn', emoji: '🔥' },
  bloating: { label: 'Bloating', emoji: '🎈' },
  dizziness: { label: 'Dizziness', emoji: '💫' },
};

export default function SymptomsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recentLogs, setRecentLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTracker, setShowTracker] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'trends'>('logs');
  const [weeklyAverage, setWeeklyAverage] = useState<number | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin?redirect=symptoms');
      return;
    }

    checkPremiumAccess();
    fetchRecentLogs();
  }, [user, authLoading, router]);

  const checkPremiumAccess = async () => {
    if (!user) return;
    
    try {
      const hasAccess = await subscriptionService.hasPremiumAccess(user.uid);
      setHasPremiumAccess(hasAccess);
    } catch (error) {
      console.error('Error checking premium access:', error);
      setHasPremiumAccess(false);
    }
  };

  const fetchRecentLogs = async () => {
    if (!user) return;

    try {
      // Get recent symptom logs
      const logsRef = collection(db, `userSymptoms/${user.uid}/logs`);
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      
      const logs: SymptomLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as SymptomLog);
      });
      
      setRecentLogs(logs);

      // Calculate weekly average severity
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekQuery = query(
        logsRef, 
        where('timestamp', '>=', weekAgo),
        orderBy('timestamp', 'desc')
      );
      const weekSnapshot = await getDocs(weekQuery);
      
      if (!weekSnapshot.empty) {
        let totalSeverity = 0;
        let count = 0;
        weekSnapshot.forEach((doc) => {
          const data = doc.data();
          totalSeverity += data.severity || 0;
          count++;
        });
        setWeeklyAverage(Math.round(totalSeverity / count));
      }
    } catch (error) {
      console.error('Error fetching symptom logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-800';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Premium Access Gate
  if (hasPremiumAccess === false) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Symptom Tracking</h1>
          <p className="mt-2 text-lg text-gray-600">
            Advanced symptom tracking and analysis for premium subscribers
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-8 text-white text-center">
          <div className="text-4xl mb-4">🔬</div>
          <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
          <p className="text-purple-100 mb-6">
            Symptom tracking with AI-powered insights and pattern analysis is available for premium subscribers only.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">✨ What You Get:</h3>
              <ul className="text-sm space-y-1">
                <li>• Track 9 common GLP-1 symptoms</li>
                <li>• AI-powered symptom tips</li>
                <li>• Pattern recognition & trends</li>
                <li>• Meal correlation analysis</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">📊 Plus Analytics:</h3>
              <ul className="text-sm space-y-1">
                <li>• Advanced progress insights</li>
                <li>• Predictive symptom modeling</li>
                <li>• Healthcare provider reports</li>
                <li>• Personalized recommendations</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/analytics')}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Upgrade to Premium - $9.99/mo
          </button>
          <p className="text-xs text-purple-200 mt-2">7-day free trial • Cancel anytime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Symptom Tracking</h1>
        <p className="mt-2 text-lg text-gray-600">
          Track symptoms to identify patterns and get personalized tips
        </p>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>⚕️ Medical Disclaimer:</strong> This tool is for personal tracking only and does not provide medical advice. 
          Always consult your healthcare provider about symptoms, especially if they are severe or persistent.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Logs This Week</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {recentLogs.filter(log => {
              const date = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return date >= weekAgo;
            }).length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Avg Severity</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {weeklyAverage !== null ? `${weeklyAverage}/10` : 'N/A'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Most Common</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {recentLogs.length > 0 
              ? SYMPTOM_LABELS[recentLogs[0].symptom]?.emoji || '?'
              : 'None'}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Recent Logs
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Trends & Patterns
          </button>
        </div>
      </div>

      {/* Log Button / Tracker */}
      {showTracker ? (
        <SymptomTracker onClose={() => {
          setShowTracker(false);
          fetchRecentLogs(); // Refresh logs after adding new one
        }} />
      ) : (
        <div className="text-center">
          <button
            onClick={() => setShowTracker(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Log New Symptom
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'logs' ? (
        /* Recent Logs */
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Logs</h2>
          </div>
          
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No symptoms logged yet. Start tracking to identify patterns!</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {SYMPTOM_LABELS[log.symptom]?.emoji || '?'}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {SYMPTOM_LABELS[log.symptom]?.label || log.symptom}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                            Severity: {log.severity}/10
                          </span>
                          {log.mealRelated && (
                            <span className="text-xs text-gray-500">
                              🍽️ Meal related
                            </span>
                          )}
                        </div>
                        {log.notes && (
                          <p className="text-sm text-gray-600 mt-2">{log.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Trends Dashboard */
        <SymptomTrends />
      )}

      {/* Symptom-Based Meal Suggestions */}
      <SymptomMealSuggestions />

      {/* Pro Features Teaser */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          🔓 Coming Soon: Pro Features
        </h3>
        <p className="text-sm text-gray-600">
          Advanced trends, pattern analysis, meal correlations, and personalized insights
        </p>
      </div>
    </div>
  );
}