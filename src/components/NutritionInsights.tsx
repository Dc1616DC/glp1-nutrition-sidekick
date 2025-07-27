'use client';

import { useState } from 'react';
import { nutritionInsights, NutritionInsight } from '../data/nutritionInsights';

interface NutritionInsightsProps {
  onClose?: () => void;
  showAsModal?: boolean;
  selectedCategory?: NutritionInsight['category'];
}

export default function NutritionInsights({ 
  onClose, 
  showAsModal = false,
  selectedCategory 
}: NutritionInsightsProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [savedInsights, setSavedInsights] = useState<string[]>([]);

  const filteredInsights = selectedCategory 
    ? nutritionInsights.filter(insight => insight.category === selectedCategory)
    : nutritionInsights;

  const toggleInsight = (id: string) => {
    setExpandedInsight(expandedInsight === id ? null : id);
  };

  const toggleSave = (id: string) => {
    setSavedInsights(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const InsightCard = ({ insight }: { insight: NutritionInsight }) => {
    const isExpanded = expandedInsight === insight.id;
    const isSaved = savedInsights.includes(insight.id);

    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-5 mb-4 transition-all duration-300 hover:shadow-md">
        <div 
          className="flex items-start space-x-4 cursor-pointer"
          onClick={() => toggleInsight(insight.id)}
        >
          <div className="text-3xl flex-shrink-0">{insight.icon}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-2 flex items-center justify-between">
              {insight.title}
              <span className="text-sm text-gray-500">
                {isExpanded ? '−' : '+'}
              </span>
            </h3>
            <p className={`text-gray-700 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
              {insight.content}
            </p>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 ml-12 space-y-4 animate-fadeIn">
            {insight.bulletPoints && (
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Common sources:</h4>
                <ul className="space-y-1">
                  {insight.bulletPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span className="text-sm text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insight.relatedTips && (
              <div className="bg-blue-50 bg-opacity-60 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips:</h4>
                {insight.relatedTips.map((tip, index) => (
                  <p key={index} className="text-sm text-blue-800 mb-1">{tip}</p>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave(insight.id);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSaved 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>{isSaved ? '✓' : '💾'}</span>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                <span>🔗</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div>
      <div className="mb-6">
        <p className="text-gray-600 leading-relaxed">
          <strong>📚 Quick Reference:</strong> These evidence-based tips help you maximize the effectiveness 
          of your GLP-1 medication through proper nutrition timing and food choices. Tap any card to explore more.
        </p>
      </div>

      <div className="space-y-4">
        {filteredInsights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {savedInsights.length > 0 && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            <strong>💚 You've saved {savedInsights.length} insights!</strong> Access them anytime 
            from your profile to support your journey.
          </p>
        </div>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">💡 Nutrition Insights</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-light"
              >
                ×
              </button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 Nutrition Insights</h2>
      {content}
    </div>
  );
}

// CSS for fadeIn animation (add to global styles or component)
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;