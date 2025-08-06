'use client';

import { useState, useEffect } from 'react';
import EveningToolkit from '../components/EveningToolkit';
import EveningToolkitFollowUp from '../components/EveningToolkitFollowUp';

export default function Home() {
  const [showEveningToolkit, setShowEveningToolkit] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  useEffect(() => {
    // Check for pending follow-up (highest priority)
    const followUpData = localStorage.getItem('eveningToolkitFollowUpData');
    if (followUpData) {
      try {
        const data = JSON.parse(followUpData);
        const followUpTime = data.scheduledFor;
        const now = Date.now();
        
        // If follow-up time has passed and not completed, show follow-up
        if (now >= followUpTime && !data.completed) {
          setShowFollowUp(true);
          return;
        }
      } catch (error) {
        console.error('Error parsing follow-up data:', error);
        localStorage.removeItem('eveningToolkitFollowUpData');
      }
    }

    // Otherwise, check if toolkit should be shown
    // For standalone app, we can show it immediately or add time-based logic
    const currentHour = new Date().getHours();
    const isEveningTime = currentHour >= 18 && currentHour <= 23;
    
    // Check if user has already used toolkit today
    const lastShown = localStorage.getItem('eveningToolkitLastShown');
    const today = new Date().toDateString();
    
    if (isEveningTime && lastShown !== today) {
      setTimeout(() => setShowEveningToolkit(true), 1000);
    }
  }, []);

  const clearAllData = () => {
    localStorage.removeItem('eveningToolkitHistory');
    localStorage.removeItem('eveningToolkitLastShown');
    localStorage.removeItem('eveningToolkitFollowUps');
    localStorage.removeItem('eveningToolkitFollowUpData');
    localStorage.removeItem('eveningToolkitFollowUpScheduled');
    alert('All Evening Toolkit data cleared!');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="text-8xl">🌙</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Evening Toolkit
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              A gentle companion for navigating evening emotions and eating with curiosity and self-compassion.
            </p>
          </div>

          {/* Main Actions */}
          <div className="space-y-6 max-w-md mx-auto">
            <button
              onClick={() => setShowEveningToolkit(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🌟 Start Evening Check-in
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  const history = JSON.parse(localStorage.getItem('eveningToolkitHistory') || '[]');
                  if (history.length > 0) {
                    alert(`You have ${history.length} check-ins in your history.`);
                  } else {
                    alert('No check-ins yet. Start your first one!');
                  }
                }}
                className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 font-medium transition-all"
              >
                📊 View History
              </button>

              <button
                onClick={clearAllData}
                className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium transition-all"
              >
                🗑️ Clear Data
              </button>
            </div>
          </div>

          {/* About Section */}
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How it works</h2>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="space-y-3">
                  <div className="text-3xl">🤔</div>
                  <h3 className="font-semibold text-gray-900">Check In</h3>
                  <p className="text-gray-700 text-sm">
                    Explore your current feelings, hunger levels, and what might be driving your evening urges.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl">🌸</div>
                  <h3 className="font-semibold text-gray-900">Explore Options</h3>
                  <p className="text-gray-700 text-sm">
                    Choose from mindful eating, nurturing activities, or gentle reflection based on what you need.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl">📈</div>
                  <h3 className="font-semibold text-gray-900">Build Awareness</h3>
                  <p className="text-gray-700 text-sm">
                    Track patterns over time to understand your evening habits with compassion and insight.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-600">
            <p className="text-sm">
              Rooted in intuitive eating principles • Built with self-compassion in mind
            </p>
          </div>
        </div>
      </div>

      {/* Evening Toolkit Modal */}
      {showEveningToolkit && (
        <EveningToolkit
          onComplete={() => {
            setShowEveningToolkit(false);
            localStorage.setItem('eveningToolkitLastShown', new Date().toDateString());
          }}
          onSkip={() => {
            setShowEveningToolkit(false);
            localStorage.setItem('eveningToolkitLastShown', new Date().toDateString());
          }}
        />
      )}

      {/* Evening Toolkit Follow-up Modal */}
      {showFollowUp && (
        <EveningToolkitFollowUp
          onComplete={() => {
            setShowFollowUp(false);
            localStorage.removeItem('eveningToolkitFollowUpScheduled');
          }}
          onSkip={() => {
            setShowFollowUp(false);
            const followUpData = localStorage.getItem('eveningToolkitFollowUpData');
            if (followUpData) {
              try {
                const data = JSON.parse(followUpData);
                localStorage.setItem('eveningToolkitFollowUpData', JSON.stringify({
                  ...data,
                  completed: true
                }));
              } catch (error) {
                console.error('Error updating follow-up data:', error);
              }
            }
          }}
        />
      )}
    </main>
  );
}