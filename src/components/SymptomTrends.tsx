'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface SymptomLog {
  id: string;
  symptom: string;
  severity: number;
  notes: string;
  mealRelated: boolean | null;
  timestamp: any;
}

interface TrendData {
  date: string;
  symptom: string;
  severity: number;
  count: number;
}

interface WeeklyStats {
  week: string;
  totalLogs: number;
  avgSeverity: number;
  mostCommon: string;
  mealRelatedPercent: number;
}

const SYMPTOM_LABELS: { [key: string]: { label: string; emoji: string; color: string } } = {
  nausea: { label: 'Nausea', emoji: '🤢', color: 'bg-green-100 text-green-800' },
  constipation: { label: 'Constipation', emoji: '🚽', color: 'bg-yellow-100 text-yellow-800' },
  fatigue: { label: 'Fatigue', emoji: '😴', color: 'bg-purple-100 text-purple-800' },
  fullness: { label: 'Early Fullness', emoji: '🍽️', color: 'bg-blue-100 text-blue-800' },
  cravings: { label: 'Cravings', emoji: '🍩', color: 'bg-pink-100 text-pink-800' },
  heartburn: { label: 'Heartburn', emoji: '🔥', color: 'bg-red-100 text-red-800' },
  bloating: { label: 'Bloating', emoji: '🎈', color: 'bg-indigo-100 text-indigo-800' },
  dizziness: { label: 'Dizziness', emoji: '💫', color: 'bg-gray-100 text-gray-800' },
};

export default function SymptomTrends() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>('month');
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [symptomFrequency, setSymptomFrequency] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (!user) return;
    fetchTrendsData();
  }, [user, timeRange]);

  const fetchTrendsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const startDate = new Date();

      // Set date range based on selection
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
        case '3months':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      const logsRef = collection(db, `userSymptoms/${user.uid}/logs`);
      const q = query(
        logsRef,
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const fetchedLogs: SymptomLog[] = [];
      
      snapshot.forEach((doc) => {
        fetchedLogs.push({ id: doc.id, ...doc.data() } as SymptomLog);
      });

      setLogs(fetchedLogs);
      calculateWeeklyStats(fetchedLogs);
      calculateSymptomFrequency(fetchedLogs);

    } catch (error) {
      console.error('Error fetching trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyStats = (logs: SymptomLog[]) => {
    const weeklyData: { [key: string]: SymptomLog[] } = {};
    
    logs.forEach(log => {
      const date = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
      const weekStart = getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(log);
    });

    const stats: WeeklyStats[] = Object.entries(weeklyData).map(([week, weekLogs]) => {
      const totalSeverity = weekLogs.reduce((sum, log) => sum + log.severity, 0);
      const avgSeverity = totalSeverity / weekLogs.length;
      
      // Find most common symptom
      const symptomCounts: {[key: string]: number} = {};
      weekLogs.forEach(log => {
        symptomCounts[log.symptom] = (symptomCounts[log.symptom] || 0) + 1;
      });
      const mostCommon = Object.keys(symptomCounts).reduce((a, b) => 
        symptomCounts[a] > symptomCounts[b] ? a : b
      );

      // Calculate meal-related percentage
      const mealRelatedCount = weekLogs.filter(log => log.mealRelated === true).length;
      const mealRelatedPercent = Math.round((mealRelatedCount / weekLogs.length) * 100);

      return {
        week,
        totalLogs: weekLogs.length,
        avgSeverity: Math.round(avgSeverity * 10) / 10,
        mostCommon,
        mealRelatedPercent
      };
    }).sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime());

    setWeeklyStats(stats);
  };

  const calculateSymptomFrequency = (logs: SymptomLog[]) => {
    const frequency: {[key: string]: number} = {};
    logs.forEach(log => {
      frequency[log.symptom] = (frequency[log.symptom] || 0) + 1;
    });
    setSymptomFrequency(frequency);
  };

  const getWeekStart = (date: Date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getSeverityTrend = () => {
    if (logs.length < 2) return 'stable';
    
    const recentLogs = logs.slice(0, Math.min(5, logs.length));
    const olderLogs = logs.slice(Math.max(0, logs.length - 5));
    
    const recentAvg = recentLogs.reduce((sum, log) => sum + log.severity, 0) / recentLogs.length;
    const olderAvg = olderLogs.reduce((sum, log) => sum + log.severity, 0) / olderLogs.length;
    
    if (recentAvg > olderAvg + 0.5) return 'increasing';
    if (recentAvg < olderAvg - 0.5) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <span className="text-red-500">📈</span>;
      case 'decreasing':
        return <span className="text-green-500">📉</span>;
      default:
        return <span className="text-gray-500">➡️</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading trends...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
        <p className="text-gray-600">Start logging symptoms to see trends and patterns!</p>
      </div>
    );
  }

  const severityTrend = getSeverityTrend();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Symptom Trends</h2>
        <div className="flex gap-2">
          {[
            { key: 'week', label: '7 Days' },
            { key: 'month', label: '30 Days' },
            { key: '3months', label: '90 Days' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Logs</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{logs.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Avg Severity</h3>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-800">
              {logs.length > 0 ? Math.round((logs.reduce((sum, log) => sum + log.severity, 0) / logs.length) * 10) / 10 : 0}/10
            </p>
            {getTrendIcon(severityTrend)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Most Common</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl">
              {Object.keys(symptomFrequency).length > 0 
                ? SYMPTOM_LABELS[Object.keys(symptomFrequency).reduce((a, b) => symptomFrequency[a] > symptomFrequency[b] ? a : b)]?.emoji || '?'
                : '—'}
            </span>
            <p className="text-lg font-semibold text-gray-800">
              {Object.keys(symptomFrequency).length > 0 
                ? SYMPTOM_LABELS[Object.keys(symptomFrequency).reduce((a, b) => symptomFrequency[a] > symptomFrequency[b] ? a : b)]?.label || 'Unknown'
                : 'None'}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Meal Related</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {logs.length > 0 
              ? Math.round((logs.filter(log => log.mealRelated === true).length / logs.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Symptom Frequency Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Symptom Frequency</h3>
        <div className="space-y-3">
          {Object.entries(symptomFrequency)
            .sort(([,a], [,b]) => b - a)
            .map(([symptom, count]) => {
              const percentage = (count / logs.length) * 100;
              const symptomInfo = SYMPTOM_LABELS[symptom];
              
              return (
                <div key={symptom} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <span className="text-xl">{symptomInfo?.emoji || '?'}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {symptomInfo?.label || symptom}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-16 text-right">
                    {count} ({Math.round(percentage)}%)
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Breakdown</h3>
        {weeklyStats.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No weekly data available</p>
        ) : (
          <div className="space-y-4">
            {weeklyStats.slice(0, 4).map((week, index) => (
              <div key={week.week} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">
                    Week of {formatWeekRange(week.week)}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {index === 0 ? 'This week' : `${index + 1} weeks ago`}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Logs:</span>
                    <span className="font-semibold ml-1">{week.totalLogs}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Severity:</span>
                    <span className="font-semibold ml-1">{week.avgSeverity}/10</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">Most Common:</span>
                    <span className="text-lg">{SYMPTOM_LABELS[week.mostCommon]?.emoji}</span>
                    <span className="font-semibold text-xs">{SYMPTOM_LABELS[week.mostCommon]?.label}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Meal Related:</span>
                    <span className="font-semibold ml-1">{week.mealRelatedPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Insights</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {logs.length > 0 && (
            <>
              <p>
                • Your average symptom severity is{' '}
                <strong>{Math.round((logs.reduce((sum, log) => sum + log.severity, 0) / logs.length) * 10) / 10}/10</strong>
                {severityTrend === 'decreasing' && ' and trending downward 📉'}
                {severityTrend === 'increasing' && ' and trending upward 📈'}
                {severityTrend === 'stable' && ' and remaining stable'}
              </p>
              
              {Object.keys(symptomFrequency).length > 0 && (
                <p>
                  • Your most frequent symptom is{' '}
                  <strong>{SYMPTOM_LABELS[Object.keys(symptomFrequency).reduce((a, b) => symptomFrequency[a] > symptomFrequency[b] ? a : b)]?.label}</strong>
                  {' '}({symptomFrequency[Object.keys(symptomFrequency).reduce((a, b) => symptomFrequency[a] > symptomFrequency[b] ? a : b)]} times)
                </p>
              )}
              
              {logs.filter(log => log.mealRelated === true).length > 0 && (
                <p>
                  • {Math.round((logs.filter(log => log.mealRelated === true).length / logs.length) * 100)}% of your symptoms are meal-related
                  {Math.round((logs.filter(log => log.mealRelated === true).length / logs.length) * 100) > 50 && 
                    ' - consider discussing meal timing and composition with your healthcare provider'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}