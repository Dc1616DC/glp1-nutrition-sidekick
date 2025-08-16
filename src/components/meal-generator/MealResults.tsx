'use client';

import { useEffect, useRef, useState } from 'react';
import { GeneratedMeal } from '../../types/meal';
import MealCard from './MealCard';

interface MealResultsProps {
  meals: GeneratedMeal[];
  selectedMealIndex: number;
  onMealSelect: (index: number) => void;
  onSaveMeal: (meal: GeneratedMeal) => Promise<void>;
  onAddToShoppingList: (meal: GeneratedMeal) => Promise<void>;
  onEnhanceMeal: (meal: GeneratedMeal) => Promise<void>;
  savedMealIds: string[];
  isSaving: boolean;
  isEnhancing: boolean;
  symptomOptimized: boolean;
}

export default function MealResults({
  meals,
  selectedMealIndex,
  onMealSelect,
  onSaveMeal,
  onAddToShoppingList,
  onEnhanceMeal,
  savedMealIds,
  isSaving,
  isEnhancing,
  symptomOptimized
}: MealResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isNewlyGenerated, setIsNewlyGenerated] = useState(false);

  // Auto-scroll to results when meals are generated
  useEffect(() => {
    if (meals.length > 0 && resultsRef.current) {
      setIsNewlyGenerated(true);
      resultsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Remove the highlight after animation
      setTimeout(() => setIsNewlyGenerated(false), 3000);
    }
  }, [meals.length]);
  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No meals generated yet
        </h3>
        <p className="text-gray-600">
          Set your preferences above and click "Generate Meals" to get personalized GLP-1 friendly meal suggestions.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={resultsRef} 
      className={`bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow-xl border-2 border-blue-200 p-6 transition-all duration-1000 ${
        isNewlyGenerated ? 'animate-pulse border-green-400 shadow-2xl' : ''
      }`}
    >
      {/* Success Banner */}
      <div className={`bg-green-100 border border-green-300 rounded-lg p-4 mb-6 transition-all duration-700 ${
        isNewlyGenerated ? 'bg-green-200 border-green-400' : ''
      }`}>
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-white rounded-full p-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-900">🎉 Your Meals Are Ready!</h3>
            <p className="text-sm text-green-700">
              {meals.length} personalized GLP-1 friendly meal{meals.length > 1 ? 's' : ''} generated just for you
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🍽️ Your Generated Meals
        </h2>
        
        {symptomOptimized && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-purple-800">
                Personalized for your symptoms
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Meal Selection Tabs */}
      {meals.length > 1 && (
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">Choose a meal option:</div>
          <div className="flex gap-2 overflow-x-auto">
            {meals.map((meal, index) => (
              <button
                key={meal.id}
                onClick={() => onMealSelect(index)}
                className={`px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[60px] flex flex-col justify-center ${
                  selectedMealIndex === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-sm font-medium">{meal.name || meal.title || `Option ${index + 1}`}</div>
                <div className="text-sm opacity-75">
                  {meal.nutrition?.protein || meal.nutritionTotals?.protein}g protein • {meal.nutrition?.fiber || meal.nutritionTotals?.fiber}g fiber
                </div>
                <div className="text-sm opacity-50 italic">
                  *AI estimates
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Meal Card */}
      {meals[selectedMealIndex] && (
        <MealCard
          meal={meals[selectedMealIndex]}
          isSelected={true}
          onClick={() => {}} // Always selected in results view
          onSave={onSaveMeal}
          onAddToShoppingList={onAddToShoppingList}
          onEnhance={onEnhanceMeal}
          isSaved={savedMealIds.includes(meals[selectedMealIndex].id)}
          isSaving={isSaving}
          isEnhancing={isEnhancing}
        />
      )}

      {/* Additional Options */}
      {meals.length > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Other options ({meals.length - 1} remaining):
          </h3>
          <div className="grid gap-3">
            {meals.map((meal, index) => {
              if (index === selectedMealIndex) return null;
              
              return (
                <div 
                  key={meal.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onMealSelect(index)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {meal.name || meal.title || `Option ${index + 1}`}
                      </h4>
                      {meal.description && (
                        <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>{meal.nutrition?.protein || meal.nutritionTotals?.protein}g protein</div>
                      <div>{meal.nutrition?.fiber || meal.nutritionTotals?.fiber}g fiber</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}