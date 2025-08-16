'use client';

import { useState } from 'react';
import { nutritionEducationModules, educationCategories, EducationModule } from '../data/enhancedNutritionEducation';

interface Props {
  onClose?: () => void;
  showAsModal?: boolean;
  selectedCategory?: string;
}

export default function EnhancedNutritionEducation({ 
  onClose, 
  showAsModal = false,
  selectedCategory 
}: Props) {
  const [activeModule, setActiveModule] = useState<EducationModule | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>([]);

  const filteredModules = selectedCategory 
    ? nutritionEducationModules.filter(module => module.category === selectedCategory)
    : nutritionEducationModules;

  const markModuleComplete = (moduleId: string) => {
    setCompletedModules(prev => 
      prev.includes(moduleId) ? prev : [...prev, moduleId]
    );
  };

  const toggleBookmark = (sectionId: string) => {
    setBookmarkedSections(prev =>
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const ModuleCard = ({ module }: { module: EducationModule }) => {
    const isCompleted = completedModules.includes(module.id);
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{module.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{module.title}</h3>
              <p className="text-sm text-gray-600 capitalize">{module.category} • Expert Content</p>
            </div>
          </div>
          {isCompleted && (
            <div className="bg-green-500 text-white rounded-full p-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 mb-4 leading-relaxed">{module.overview}</p>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveModule(module)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Explore Module
          </button>
          <div className="text-sm text-gray-500">
            {module.sections.length} sections • 5-7 min read
          </div>
        </div>
      </div>
    );
  };

  const ModuleDetail = ({ module }: { module: EducationModule }) => {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-6 mb-6">
          <button
            onClick={() => setActiveModule(null)}
            className="text-white/80 hover:text-white mb-4 flex items-center"
          >
            ← Back to Modules
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{module.icon}</div>
            <div>
              <h1 className="text-3xl font-bold">{module.title}</h1>
              <p className="text-blue-100 mt-2">{module.overview}</p>
            </div>
          </div>
        </div>

        {/* Scientific Rationale */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-6">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
            🧪 Scientific Foundation
          </h3>
          <p className="text-amber-800 leading-relaxed">{module.scientificRationale}</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 mb-8">
          {module.sections.map((section, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center">
                <button
                  onClick={() => setExpandedSection(expandedSection === `${module.id}-${index}` ? null : `${module.id}-${index}`)}
                  className="flex-1 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <span className="text-gray-400">
                      {expandedSection === `${module.id}-${index}` ? '−' : '+'}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => toggleBookmark(`${module.id}-${index}`)}
                  className={`p-3 m-2 rounded ${
                    bookmarkedSections.includes(`${module.id}-${index}`)
                      ? 'text-yellow-500'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Bookmark this section"
                >
                  ⭐
                </button>
              </div>
              
              {expandedSection === `${module.id}-${index}` && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed mb-4">{section.content}</p>
                  
                  {section.evidence && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">📊 Research Evidence</h4>
                      <p className="text-blue-800 text-sm">{section.evidence}</p>
                    </div>
                  )}
                  
                  {section.examples && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">💡 Practical Examples</h4>
                      <ul className="space-y-1">
                        {section.examples.map((example, idx) => (
                          <li key={idx} className="text-green-800 text-sm flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Key Takeaways */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center">
            🎯 Key Takeaways
          </h3>
          <ul className="space-y-2">
            {module.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="text-green-800 flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {takeaway}
              </li>
            ))}
          </ul>
        </div>

        {/* Practical Tips */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
            🛠️ Practical Application
          </h3>
          <ul className="space-y-2">
            {module.practicalTips.map((tip, index) => (
              <li key={index} className="text-purple-800 flex items-start">
                <span className="text-purple-500 mr-2">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Common Misconceptions */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
            ⚠️ Common Misconceptions
          </h3>
          <div className="space-y-3">
            {module.commonMisconceptions.map((misconception, index) => (
              <p key={index} className="text-orange-800 text-sm leading-relaxed">
                {misconception}
              </p>
            ))}
          </div>
        </div>

        {/* When to Seek Help */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-red-900 mb-3 flex items-center">
            🚨 When to Seek Professional Help
          </h3>
          <ul className="space-y-2">
            {module.whenToSeekHelp.map((indicator, index) => (
              <li key={index} className="text-red-800 flex items-start">
                <span className="text-red-500 mr-2">!</span>
                {indicator}
              </li>
            ))}
          </ul>
        </div>

        {/* Completion Button */}
        <div className="text-center">
          <button
            onClick={() => markModuleComplete(module.id)}
            disabled={completedModules.includes(module.id)}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              completedModules.includes(module.id)
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {completedModules.includes(module.id) ? '✓ Module Completed' : 'Mark as Complete'}
          </button>
        </div>
      </div>
    );
  };

  const content = activeModule ? (
    <ModuleDetail module={activeModule} />
  ) : (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📚 Evidence-Based Nutrition Education
        </h1>
        <p className="text-gray-600 leading-relaxed max-w-3xl">
          Expert-designed modules that explain the <em>why</em> behind our recommendations, 
          combining the latest research with intuitive eating principles for GLP-1 users.
        </p>
      </div>

      {/* Categories Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Modules</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {educationCategories.map(category => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{category.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Overview */}
      {completedModules.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Your Progress</h3>
              <p className="text-green-700 text-sm">
                Completed {completedModules.length} of {nutritionEducationModules.length} modules
              </p>
            </div>
            <div className="text-2xl text-green-600">
              {Math.round((completedModules.length / nutritionEducationModules.length) * 100)}%
            </div>
          </div>
          <div className="mt-3 bg-green-100 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedModules.length / nutritionEducationModules.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Module Grid */}
      <div className="grid gap-6">
        {filteredModules.map(module => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>

      {/* Bookmarked Sections */}
      {bookmarkedSections.length > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">⭐ Your Bookmarked Sections</h3>
          <p className="text-yellow-800 text-sm">
            You have {bookmarkedSections.length} bookmarked sections for quick reference.
          </p>
        </div>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-y-auto w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📚 Nutrition Education</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {content}
    </div>
  );
}