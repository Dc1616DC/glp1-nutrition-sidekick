'use client';

import { useState } from 'react';
import { GeneratedMeal } from '../../types/meal';

interface MealCardProps {
  meal: GeneratedMeal;
  isSelected: boolean;
  onClick: () => void;
  onSave: (meal: GeneratedMeal) => Promise<void>;
  onAddToShoppingList: (meal: GeneratedMeal) => Promise<void>;
  onEnhance: (meal: GeneratedMeal) => Promise<void>;
  isSaved: boolean;
  isSaving: boolean;
  isEnhancing: boolean;
}

export default function MealCard({ 
  meal, 
  isSelected, 
  onClick, 
  onSave, 
  onAddToShoppingList, 
  onEnhance,
  isSaved, 
  isSaving,
  isEnhancing 
}: MealCardProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const mealName = meal.name || meal.title || 'Delicious Meal';
  const nutrition = meal.nutrition || meal.nutritionTotals;

  const handleAction = async (action: string, actionFn: () => Promise<void>) => {
    setActiveAction(action);
    try {
      await actionFn();
    } finally {
      setActiveAction(null);
    }
  };

  const formatIngredients = (ingredients: any[]): string[] => {
    return ingredients.map(ingredient => {
      if (typeof ingredient === 'string') {
        return ingredient;
      }
      if (ingredient.name && ingredient.amount && ingredient.unit) {
        return `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
      }
      return ingredient.name || ingredient;
    });
  };

  const getComplexityColor = (level?: string) => {
    switch (level) {
      case 'Simple': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div 
        className={`p-4 cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50 border-b border-blue-200' : 'hover:bg-gray-50 border-b border-gray-200'
        }`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {mealName}
          </h3>
          {meal.complexity && (
            <span className={`px-3 py-2 rounded text-sm font-medium ${getComplexityColor(meal.complexity.level)}`}>
              {meal.complexity.level}
            </span>
          )}
        </div>

        {meal.description && (
          <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
        )}

        {/* Nutrition Info */}
        {nutrition && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-semibold text-blue-900">{nutrition.protein}g</div>
                <div className="text-blue-600">Protein</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-semibold text-green-900">{nutrition.fiber}g</div>
                <div className="text-green-600">Fiber</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="font-semibold text-purple-900">{nutrition.calories}</div>
                <div className="text-purple-600">Calories</div>
              </div>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500 italic">
                *AI estimated nutrition facts
              </span>
            </div>
          </div>
        )}

        {/* Time and Servings */}
        <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {meal.cookingTime && (
              <span>⏱️ {meal.cookingTime}min</span>
            )}
            <span>🍽️ {meal.servings} serving{meal.servings > 1 ? 's' : ''}</span>
          </div>
          {meal.tags && meal.tags.length > 0 && (
            <div className="flex gap-1">
              {meal.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm">
                  {tag}
                </span>
              ))}
              {meal.tags.length > 2 && (
                <span className="text-gray-400 text-sm">+{meal.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isSelected && (
        <div className="p-4 bg-gray-50">
          {/* Warnings */}
          {meal.warnings && meal.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">⚠️ Notice</h4>
              <ul className="text-sm text-yellow-700 list-disc list-inside">
                {meal.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* GLP-1 Notes */}
          {meal.glp1Notes && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">💊 GLP-1 Benefits</h4>
              <p className="text-sm text-blue-700">{meal.glp1Notes}</p>
            </div>
          )}

          {/* Ingredients */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Ingredients</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {formatIngredients(meal.ingredients).map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Instructions</h4>
            <ol className="text-sm text-gray-600 space-y-2">
              {meal.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-gray-200 text-gray-700 text-sm rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {meal.tips && meal.tips.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">💡 Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {meal.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meal Prep Info */}
          {meal.mealPrep && meal.mealPrep.friendly && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">📦 Meal Prep Friendly</h4>
              <div className="text-sm text-green-700 space-y-1">
                {meal.mealPrep.shelfLife && <p><strong>Storage:</strong> {meal.mealPrep.shelfLife}</p>}
                {meal.mealPrep.reheatingTips && <p><strong>Reheating:</strong> {meal.mealPrep.reheatingTips}</p>}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleAction('save', () => onSave(meal))}
              disabled={isSaved || activeAction === 'save'}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {activeAction === 'save' ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  ✓ Saved
                </>
              ) : (
                <>
                  💾 Save Meal
                </>
              )}
            </button>

            <button
              onClick={() => handleAction('shopping', () => onAddToShoppingList(meal))}
              disabled={activeAction === 'shopping'}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {activeAction === 'shopping' ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  🛒 Add to Grocery List
                </>
              )}
            </button>

            <button
              onClick={() => handleAction('enhance', () => onEnhance(meal))}
              disabled={activeAction === 'enhance' || isEnhancing}
              className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {activeAction === 'enhance' || isEnhancing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enhancing...
                </>
              ) : (
                <>
                  ✨ Add Flavorful Twists
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}