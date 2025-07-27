'use client';

import { useState } from 'react';
import NutritionInsights from '../../components/NutritionInsights';

// For a novice developer: This component is the "Education Hub".
// It's a client component because we use `useState` to create an interactive
// accordion, allowing users to expand and collapse articles.

// --- Data for our articles ---
// In a real application, this data would likely come from a database or a Content Management System (CMS).
// For now, we'll define it directly here.
const educationArticles = [
  {
    title: 'Why Protein Matters on GLP-1 Medications',
    description:
      'Learn how prioritizing protein can help you preserve muscle mass and feel fuller longer while on your weight loss journey.',
    content: (
      <div className="space-y-4 text-gray-700">
        <p>
          GLP-1 medications like Ozempic® or Wegovy® are incredibly effective for
          weight loss, primarily by reducing your appetite. However, when you
          eat less, it's crucial to make every calorie count. This is where
          protein becomes your most valuable player.
        </p>
        <h3 className="text-lg font-semibold text-gray-800">
          The Two Main Benefits of Prioritizing Protein:
        </h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Preserving Muscle Mass:</strong> When you lose weight, you
            don't just lose fat; you can lose muscle too. Losing muscle can slow
            down your metabolism, making it harder to keep the weight off long-term.
            Eating enough protein provides the building blocks your body needs to
            maintain lean muscle while primarily burning fat for energy.
          </li>
          <li>
            <strong>Increasing Satiety (Fullness):</strong> Protein is the most
            satiating macronutrient. This means it helps you feel fuller for
            longer compared to fats or carbohydrates. This is a powerful advantage
            when you're already experiencing reduced appetite from your medication,
            as it helps prevent cravings and ensures you feel satisfied with smaller
            portions.
          </li>
        </ul>
        <p>
          Our recommendation is to aim for <strong>25-35 grams of protein</strong> per meal.
          This simple strategy can significantly improve the quality of your weight
          loss, helping you achieve more sustainable and healthier results.
        </p>
      </div>
    ),
  },
  {
    title: 'The Power of Protein + Fiber for Sustainable Weight Loss',
    description:
      'Discover the dynamic duo of nutrition that helps manage appetite and support digestive health.',
    content: (
      <p className="text-gray-600">
        Content for this article is coming soon. It will discuss how combining
        protein and fiber can further enhance satiety, stabilize blood sugar, and
        promote a healthy gut, which is especially important for managing
        potential GI side effects of GLP-1s.
      </p>
    ),
  },
  {
    title: 'Foods to Approach Carefully on GLP-1s',
    description:
      'Navigate potential side effects by understanding which foods might be best to limit or avoid.',
    content: (
      <p className="text-gray-600">
        Content for this article is coming soon. It will provide practical advice
        on identifying and limiting high-fat, greasy, and very sugary foods that
        can sometimes worsen side effects like nausea or indigestion.
      </p>
    ),
  },
];

export default function EducationPage() {
  // We use state to keep track of which article is currently expanded.
  // We initialize it with the title of the first article so it's open by default.
  const [expandedArticle, setExpandedArticle] = useState<string | null>(
    educationArticles[0].title
  );
  
  // Add tab state for switching between articles and insights
  const [activeTab, setActiveTab] = useState<'articles' | 'insights'>('insights');

  // This function handles the click event on an article title.
  const handleToggle = (title: string) => {
    // If the clicked article is already open, close it. Otherwise, open it.
    setExpandedArticle(expandedArticle === title ? null : title);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Education Hub</h1>
        <p className="mt-2 text-lg text-gray-600">
          Simple, scannable, and evidence-based guides for your journey.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'insights'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💡 Nutrition Insights
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'articles'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 In-Depth Articles
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'insights' ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <NutritionInsights />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {educationArticles.map((article) => (
          <div
            key={article.title}
            className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <button
              onClick={() => handleToggle(article.title)}
              className="w-full text-left p-6 flex justify-between items-center bg-white hover:bg-gray-50 focus:outline-none"
            >
              <div>
                <h2 className="text-xl font-semibold text-[#4A90E2]">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {article.description}
                </p>
              </div>
              {/* This SVG icon rotates based on the expanded state */}
              <svg
                className={`w-6 h-6 text-gray-500 transform transition-transform duration-200 ${
                  expandedArticle === article.title ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </button>

            {/* The article content is only rendered if it's the expanded article */}
            {expandedArticle === article.title && (
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                {article.content}
              </div>
            )}
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
