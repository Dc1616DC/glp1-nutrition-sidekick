'use client';

import { useState, useEffect } from 'react';

interface FollowUpData {
  originalCheckIn: any;
  scheduledFor: number;
  completed: boolean;
}

interface EveningToolkitFollowUpProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function EveningToolkitFollowUp({ onComplete, onSkip }: EveningToolkitFollowUpProps) {
  const [followUpData, setFollowUpData] = useState<FollowUpData | null>(null);
  const [reflection, setReflection] = useState('');
  const [currentFeeling, setCurrentFeeling] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('eveningToolkitFollowUpData');
    if (data) {
      setFollowUpData(JSON.parse(data));
    }
  }, []);

  const handleSubmit = () => {
    if (followUpData) {
      // Save follow-up reflection
      const followUpReflection = {
        originalCheckInTime: followUpData.originalCheckIn.timestamp,
        followUpTime: new Date().toISOString(),
        currentFeeling,
        reflection,
        routeChosen: followUpData.originalCheckIn.routeChosen
      };

      const existingFollowUps = JSON.parse(localStorage.getItem('eveningToolkitFollowUps') || '[]');
      existingFollowUps.push(followUpReflection);
      localStorage.setItem('eveningToolkitFollowUps', JSON.stringify(existingFollowUps));

      // Mark as completed
      const updatedData = { ...followUpData, completed: true };
      localStorage.setItem('eveningToolkitFollowUpData', JSON.stringify(updatedData));
    }

    onComplete();
  };

  if (!followUpData) return null;

  const timeAgo = Math.round((Date.now() - new Date(followUpData.originalCheckIn.timestamp).getTime()) / (1000 * 60));

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-b from-white to-purple-50 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-purple-200">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-4xl mb-3">🌙✨</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Evening Check-in Follow-up</h2>
            <p className="text-sm text-gray-600">
              It's been about {timeAgo} minutes since your last check-in. How are you feeling now?
            </p>
          </div>

          {/* Original choice reminder */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Earlier you chose:</strong> {
                followUpData.originalCheckIn.routeChosen === 'eat' ? '🍽️ To eat mindfully' :
                followUpData.originalCheckIn.routeChosen === 'activity' ? '🌸 To explore what you needed' :
                '🧘‍♀️ To pause and reflect'
              }
            </p>
          </div>

          {/* Current feeling */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">How are you feeling right now?</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'satisfied', 'content', 'peaceful', 'grateful',
                'still-thinking-about-food', 'restless', 'neutral', 'tired'
              ].map(feeling => (
                <button
                  key={feeling}
                  onClick={() => setCurrentFeeling(feeling)}
                  className={`p-2 text-sm rounded-lg border-2 transition-all capitalize ${
                    currentFeeling === feeling
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {feeling.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Reflection questions */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              Reflect with curiosity: (Optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="• How do you feel now compared to earlier?&#10;• Did your choice meet your needs?&#10;• What surprised you?&#10;• Any insights for next time?"
              className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px] resize-none text-sm"
            />
          </div>

          {/* Encouraging message based on original route */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              {followUpData.originalCheckIn.routeChosen === 'eat' && (
                <>🌟 <strong>Mindful eating practice:</strong> Notice how your body feels after eating mindfully. This awareness builds over time.</>
              )}
              {followUpData.originalCheckIn.routeChosen === 'activity' && (
                <>🌟 <strong>Exploring your needs:</strong> Every time you pause to nurture emotional needs, you're building new patterns of self-care.</>
              )}
              {followUpData.originalCheckIn.routeChosen === 'pause' && (
                <>🌟 <strong>Power of pausing:</strong> Sometimes awareness is enough. You've practiced being present with your feelings.</>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium transition-all"
            >
              ✅ Complete Follow-up
            </button>
            <button
              onClick={onSkip}
              className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}