'use client';

import { useState, useEffect } from 'react';

interface CheckInData {
  physicalHunger: number;
  emotions: string[];
  triggers: string[];
  selectedActivity?: {
    title: string;
    category: string;
  };
  reflectionNotes?: string;
  timestamp: string;
}

interface PatternInsight {
  type: 'hunger' | 'emotion' | 'trigger' | 'time' | 'activity';
  title: string;
  description: string;
  recommendation: string;
  icon: string;
}

export default function EveningToolkitInsights() {
  const [history, setHistory] = useState<CheckInData[]>([]);
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadHistory = () => {
      const historyData = JSON.parse(localStorage.getItem('eveningToolkitHistory') || '[]');
      setHistory(historyData);
      
      if (historyData.length >= 3) {
        generateInsights(historyData);
      }
    };

    loadHistory();
  }, []);

  const generateInsights = (data: CheckInData[]) => {
    const newInsights: PatternInsight[] = [];
    
    if (data.length < 3) return;

    // Analyze hunger patterns
    const hungerLevels = data.map(d => d.physicalHunger);
    const avgHunger = hungerLevels.reduce((a, b) => a + b, 0) / hungerLevels.length;
    const lowHungerSessions = hungerLevels.filter(h => h <= 3).length;
    
    if (lowHungerSessions / data.length > 0.7) {
      newInsights.push({
        type: 'hunger',
        title: 'Low Physical Hunger Pattern',
        description: `${Math.round((lowHungerSessions / data.length) * 100)}% of your check-ins show low physical hunger (3 or below).`,
        recommendation: 'This suggests your evening eating may be driven more by emotions or habits than physical hunger. Focus on the emotional and trigger awareness steps.',
        icon: '🤔'
      });
    }

    // Analyze emotional patterns
    const allEmotions = data.flatMap(d => d.emotions);
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topEmotion = Object.entries(emotionCounts).sort(([,a], [,b]) => b - a)[0];
    if (topEmotion && topEmotion[1] >= 2) {
      newInsights.push({
        type: 'emotion',
        title: `Common Emotional Trigger: ${topEmotion[0]}`,
        description: `"${topEmotion[0]}" appears in ${topEmotion[1]} of your recent check-ins.`,
        recommendation: `Consider developing specific coping strategies for when you feel ${topEmotion[0]}. The activities you've chosen during these times might be particularly helpful.`,
        icon: '💭'
      });
    }

    // Analyze trigger patterns
    const allTriggers = data.flatMap(d => d.triggers);
    const triggerCounts = allTriggers.reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topTrigger = Object.entries(triggerCounts).sort(([,a], [,b]) => b - a)[0];
    if (topTrigger && topTrigger[1] >= 2) {
      newInsights.push({
        type: 'trigger',
        title: `Recurring Trigger: ${topTrigger[0].replace('-', ' ')}`,
        description: `"${topTrigger[0].replace('-', ' ')}" appears in ${topTrigger[1]} of your recent check-ins.`,
        recommendation: topTrigger[0] === 'habit' 
          ? 'Since this is often habit-driven, consider changing your evening environment or routine to break the automatic pattern.'
          : 'Awareness of this trigger is the first step. Consider what you could do differently when this situation arises.',
        icon: '🎯'
      });
    }

    // Analyze time patterns
    const eveningHours = data.map(d => new Date(d.timestamp).getHours());
    const lateNightSessions = eveningHours.filter(h => h >= 21).length;
    
    if (lateNightSessions / data.length > 0.6) {
      newInsights.push({
        type: 'time',
        title: 'Late Night Pattern',
        description: `${Math.round((lateNightSessions / data.length) * 100)}% of your check-ins happen after 9 PM.`,
        recommendation: 'Consider establishing an earlier evening routine or having an earlier final meal to reduce late-night urges.',
        icon: '🌙'
      });
    }

    // Analyze activity effectiveness
    const activitiesChosen = data.filter(d => d.selectedActivity).map(d => d.selectedActivity!.category);
    if (activitiesChosen.length >= 2) {
      const activityCounts = activitiesChosen.reduce((acc, category) => {
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const preferredActivity = Object.entries(activityCounts).sort(([,a], [,b]) => b - a)[0];
      newInsights.push({
        type: 'activity',
        title: `Preferred Activity Type: ${preferredActivity[0]}`,
        description: `You tend to choose ${preferredActivity[0].toLowerCase()} activities most often.`,
        recommendation: 'This suggests these types of activities resonate with you. Consider incorporating similar activities into your daily routine.',
        icon: '✨'
      });
    }

    setInsights(newInsights);
  };

  const getStreakInfo = () => {
    if (history.length === 0) return null;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Check if used today
    const usedToday = sortedHistory.some(entry => {
      const entryDate = new Date(entry.timestamp);
      const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      return entryDay.getTime() === today.getTime();
    });
    
    // Calculate streaks
    const uniqueDays = new Set();
    sortedHistory.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      const dayKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`;
      uniqueDays.add(dayKey);
    });
    
    currentStreak = usedToday ? 1 : 0; // Simplified for demo
    longestStreak = Math.max(uniqueDays.size, longestStreak);
    
    return {
      currentStreak,
      longestStreak,
      totalCheckIns: history.length,
      usedToday
    };
  };

  const streakInfo = getStreakInfo();

  if (history.length < 3) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Pattern Insights</h3>
        <p className="text-blue-800 text-sm">
          Complete {3 - history.length} more check-in{3 - history.length > 1 ? 's' : ''} to see personalized insights about your evening eating patterns.
        </p>
        <div className="mt-3 bg-blue-100 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(history.length / 3) * 100}%` }}
          />
        </div>
        <p className="text-xs text-blue-700 mt-1">{history.length} of 3 check-ins completed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {streakInfo && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-3">📈 Your Progress</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-700">{streakInfo.totalCheckIns}</div>
              <div className="text-sm text-purple-600">Total Check-ins</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{streakInfo.longestStreak}</div>
              <div className="text-sm text-blue-600">Days Active</div>
            </div>
          </div>
          {streakInfo.usedToday && (
            <div className="mt-3 text-center">
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                ✅ Check-in completed today
              </span>
            </div>
          )}
        </div>
      )}

      {/* Pattern Insights */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">🔍 Pattern Insights</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showDetails ? 'Show Less' : 'Show Details'}
          </button>
        </div>
        
        {insights.length === 0 ? (
          <p className="text-gray-600 text-sm">
            Continue using the toolkit to discover patterns in your evening eating habits.
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{insight.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-gray-600 text-xs mt-1">{insight.description}</p>
                    {showDetails && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                        <strong>Suggestion:</strong> {insight.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Encouragement */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 text-sm">
          🌱 <strong>Remember:</strong> Building awareness is the first step to changing patterns. 
          Every check-in is progress, regardless of the outcome. Be patient and kind with yourself.
        </p>
      </div>
    </div>
  );
}