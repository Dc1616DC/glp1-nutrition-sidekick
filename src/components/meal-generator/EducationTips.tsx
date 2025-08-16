'use client';

import { useState } from 'react';
import { nutritionEducationModules, educationCategories } from '../../data/enhancedNutritionEducation';

const educationalTips = [
  {
    tip: "Protein becomes your metabolic foundation - aim for 20-30g per meal to preserve muscle mass during weight loss.",
    category: "protein",
    insight: "Understanding why protein is crucial for maintaining your metabolism and strength on GLP-1 medications."
  },
  {
    tip: "Start fiber increases gradually (3-5g per week) to support digestion without worsening nausea.",
    category: "fiber", 
    insight: "Learn how fiber supports your changing digestive system and prevents common side effects."
  },
  {
    tip: "Your fullness signals may change dramatically - trust when food becomes unappetizing mid-bite.",
    category: "satiety",
    insight: "Discover the science behind your new hunger and fullness cues."
  },
  {
    tip: "Resistance exercise 2-3x per week preserves muscle mass that drives your metabolism long-term.",
    category: "muscle",
    insight: "Understand why maintaining muscle is crucial for lasting weight management success."
  },
  {
    tip: "Use your medication as a tool to hear your body's wisdom more clearly, not to override it.",
    category: "intuitive",
    insight: "Learn how to integrate medical support with intuitive eating principles."
  },
  {
    tip: "Set gentle eating reminders - your hunger cues may be much quieter now.",
    category: "satiety",
    insight: "Explore how GLP-1s change appetite signaling in your brain."
  },
  {
    tip: "Focus on nutrient-dense foods when eating less - every bite counts more for your health.",
    category: "protein",
    insight: "Discover strategies for maximizing nutrition when appetite is reduced."
  }
];

interface EducationTipsProps {
  onShowInsight: (insight: string) => void;
  onShowEnhancedEducation?: (category?: string) => void;
}

export default function EducationTips({ onShowInsight, onShowEnhancedEducation }: EducationTipsProps) {
  const [showQuickTips, setShowQuickTips] = useState(false);
  
  const getCurrentTip = () => {
    const tipIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 8)) % educationalTips.length; // Changes every 8 hours
    return educationalTips[tipIndex];
  };

  const currentTip = getCurrentTip();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-6">
      {/* Today's Featured Tip */}
      <div className="mb-4">
        <div className="flex items-start space-x-3 mb-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Expert Insight of the Day</h3>
            <p className="text-gray-700 leading-relaxed">{currentTip.tip}</p>
            <p className="text-sm text-gray-600 mt-1 italic">{currentTip.insight}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button 
            onClick={() => onShowEnhancedEducation?.(currentTip.category)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Explore This Topic →
          </button>
          <button 
            onClick={() => onShowEnhancedEducation?.()}
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            All Learning Modules
          </button>
        </div>
      </div>

      {/* Quick Access to Education Categories */}
      <div className="border-t border-blue-100 pt-4">
        <button
          onClick={() => setShowQuickTips(!showQuickTips)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-medium text-gray-700">Quick Learning Topics</span>
          <span className="text-gray-400 text-sm">
            {showQuickTips ? '−' : '+'}
          </span>
        </button>
        
        {showQuickTips && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
            {educationCategories.map(category => (
              <button
                key={category.id}
                onClick={() => onShowEnhancedEducation?.(category.id)}
                className="bg-white text-left p-3 rounded-lg hover:shadow-md transition-all border border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-600">{category.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}