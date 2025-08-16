'use client';

interface TabNavigationProps {
  activeTab: 'generator' | 'education';
  setActiveTab: (tab: 'generator' | 'education') => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      <button
        onClick={() => setActiveTab('generator')}
        className={`px-6 py-3 rounded-md font-medium transition-colors ${
          activeTab === 'generator'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        🍽️ Meal Generator
      </button>
      <button
        onClick={() => setActiveTab('education')}
        className={`px-6 py-3 rounded-md font-medium transition-colors ${
          activeTab === 'education'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📚 Nutrition Education
      </button>
    </div>
  );
}