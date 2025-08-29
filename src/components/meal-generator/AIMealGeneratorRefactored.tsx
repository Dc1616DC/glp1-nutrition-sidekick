'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

// Components
import MealPreferences from './MealPreferences';
import MealResults from './MealResults';
import EducationTips from './EducationTips';
import TabNavigation from './TabNavigation';
import InsightNudge from '../InsightNudge';
import NutritionInsights from '../NutritionInsights';
import EnhancedNutritionEducation from '../EnhancedNutritionEducation';
import MealCardSkeleton from '../skeletons/MealCardSkeleton';

// Types and Services
import { MealPreferences as MealPreferencesType, GeneratedMeal } from '../../types/meal';
import { clientNutritionService } from '../../services/clientNutritionService';
import { savedMealsService } from '../../services/savedMealsService';
import { shoppingListService } from '../../services/shoppingListService';

// Constants for symptom labels
const SYMPTOM_LABELS: { [key: string]: { label: string } } = {
  nausea: { label: 'Nausea' },
  constipation: { label: 'Constipation' },
  fatigue: { label: 'Fatigue' },
  fullness: { label: 'Early Fullness' },
  cravings: { label: 'Cravings' },
  heartburn: { label: 'Heartburn' },
  bloating: { label: 'Bloating' },
  dizziness: { label: 'Dizziness' },
};

interface AIMealGeneratorRefactoredProps {
  suggestedMeal?: string | null;
  symptom?: string | null;
}

export default function AIMealGeneratorRefactored({ suggestedMeal, symptom }: AIMealGeneratorRefactoredProps) {
  const { user } = useAuth();
  const { isOnline } = useOnlineStatus();
  const router = useRouter();

  // Main state
  const [preferences, setPreferences] = useState<MealPreferencesType>({
    mealType: 'lunch',
    cookingMethod: 'any',
    maxCookingTime: 30,
    dietaryRestrictions: [],
    allergies: [],
    creativityLevel: 'simple',
    assemblyToRecipeRatio: 60
  });

  const [generatedMeals, setGeneratedMeals] = useState<GeneratedMeal[]>([]);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'generator' | 'education'>('generator');

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // UI states  
  const [previousMeals, setPreviousMeals] = useState<string[]>([]);
  const [savedMealIds, setSavedMealIds] = useState<string[]>([]);
  const [symptomOptimized, setSymptomOptimized] = useState(false);
  const [showNudge, setShowNudge] = useState<{
    type: 'lowProtein' | 'lowFiber' | null;
    mealData?: { protein: number; fiber: number; calories: number };
  }>({ type: null });
  const [showInsightModal, setShowInsightModal] = useState<string | null>(null);
  const [showEnhancedEducation, setShowEnhancedEducation] = useState<{ show: boolean; category?: string }>({ show: false });
  const [hasGeneratedSymptomMeal, setHasGeneratedSymptomMeal] = useState(false);

  // Handle suggested meal from symptom recommendations
  useEffect(() => {
    if (suggestedMeal && user && isOnline && !hasGeneratedSymptomMeal) {
      // Auto-generate the suggested meal (only once)
      generateSymptomBasedMeal();
      setHasGeneratedSymptomMeal(true);
    }
  }, [suggestedMeal, user, isOnline, hasGeneratedSymptomMeal]);

  // Generate symptom-based meal
  const generateSymptomBasedMeal = async () => {
    if (!suggestedMeal) return;
    
    setIsGenerating(true);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (user) {
        try {
          const token = await user.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenError) {
          console.warn('Failed to get ID token, using UID as fallback:', tokenError);
          headers['Authorization'] = `Bearer ${user.uid}`;
        }
      }
      
      // Create preferences optimized for the symptom
      const symptomOptimizedPrefs = {
        ...preferences,
        specificMealRequest: suggestedMeal,
        symptomOptimization: symptom || undefined,
        creativityLevel: 'simple' as const
      };
      
      const response = await fetch('/api/generate-meal-options-new', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          preferences: symptomOptimizedPrefs,
          previousMeals: [],
          symptomOptimized: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal');
      }

      const data = await response.json();
      
      if (data.meals && data.meals.length > 0) {
        setGeneratedMeals(data.meals);
        setSelectedMealIndex(0);
        setSymptomOptimized(true);
        
        // Access nutrition data from the correct property
        const firstMeal = data.meals[0];
        if (firstMeal.nutritionTotals) {
          setShowNudge({
            type: null,
            mealData: {
              protein: firstMeal.nutritionTotals.protein || 0,
              fiber: firstMeal.nutritionTotals.fiber || 0,
              calories: firstMeal.nutritionTotals.calories || 0
            }
          });
        }
        
      } else {
        console.warn('No meals returned from API:', data);
      }
    } catch (error) {
      console.error('Error generating symptom-based meal:', error);
      alert('Failed to generate the suggested meal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear meal history
  const clearHistory = () => {
    setPreviousMeals([]);
    setGeneratedMeals([]);
    setSelectedMealIndex(0);
  };

  // Generate meals
  const generateMeal = async () => {
    // Check if user is online before attempting to generate
    if (!isOnline) {
      alert('Please connect to the internet to generate meals. You can browse the Recipe Library offline.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get auth token for symptom-based meal optimization
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (user) {
        try {
          // Get Firebase ID token for proper authentication
          const token = await user.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (tokenError) {
          // Fallback to UID for development if getIdToken fails
          console.warn('Failed to get ID token, using UID as fallback:', tokenError);
          headers['Authorization'] = `Bearer ${user.uid}`;
        }
      } else {
        console.error('❌ No authenticated user found');
        throw new Error('Please sign in to generate meals.');
      }
      
      const response = await fetch('/api/generate-meal-options-new', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mealType: preferences.mealType,
          dietaryRestrictions: preferences.dietaryRestrictions,
          allergies: preferences.allergies,
          numOptions: 2,
          maxCookingTime: preferences.maxCookingTime,
          proteinTarget: preferences.minProtein || 20,
          fiberTarget: preferences.minFiber || 4,
          calorieRange: { 
            min: 400, 
            max: preferences.maxCalories || 600 
          },
          creativityLevel: preferences.creativityLevel,
          assemblyToRecipeRatio: preferences.assemblyToRecipeRatio,
        }),
      });

      if (!response.ok) {
        // Try to get error details from response
        try {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('API returned error:', data);
        throw new Error(data.message || data.error || 'Failed to generate meals');
      }
      
      // Handle multiple meals response from new hybrid system
      const meals = data.meals || [];
      
      // Add source indicator and disclaimer
      meals.forEach((meal: GeneratedMeal) => {
        meal.nutritionSource = data.source === 'grok-estimates' ? 'Grok AI Estimates*' : 
                              data.source === 'curated' ? 'Curated Recipes' : 'AI Generated';
      });

      setGeneratedMeals(meals);
      setSelectedMealIndex(0);
      setSymptomOptimized(data.symptomOptimized || false);

      // Check nutrition and trigger nudges
      if (meals.length > 0) {
        const meal = meals[0];
        const nutrition = meal.nutrition || meal.nutritionTotals;
        
        if (nutrition) {
          if (nutrition.protein < 15) {
            setShowNudge({
              type: 'lowProtein',
              mealData: {
                protein: nutrition.protein,
                fiber: nutrition.fiber,
                calories: nutrition.calories
              }
            });
          } else if (nutrition.fiber < 3) {
            setShowNudge({
              type: 'lowFiber', 
              mealData: {
                protein: nutrition.protein,
                fiber: nutrition.fiber,
                calories: nutrition.calories
              }
            });
          }
        }

        // Add meal names to previous meals to avoid repetition
        const mealNames = meals.map(m => m.name || m.title || '').filter(Boolean);
        setPreviousMeals(prev => [...prev, ...mealNames]);
      }
      
    } catch (error) {
      console.error('Error generating meals:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate meals. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save meal
  // Helper function to remove undefined values from objects (Firebase doesn't allow them)
  const cleanUndefinedValues = <T,>(obj: T): T => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(cleanUndefinedValues) as T;
    if (typeof obj === 'object') {
      const cleaned: Record<string, unknown> = {};
      Object.keys(obj as Record<string, unknown>).forEach(key => {
        const value = (obj as Record<string, unknown>)[key];
        if (value !== undefined) {
          cleaned[key] = cleanUndefinedValues(value);
        }
      });
      return cleaned as T;
    }
    return obj;
  };

  const saveMeal = async (meal: GeneratedMeal) => {
    if (!user) {
      alert('Please sign in to save meals');
      return;
    }

    if (savedMealIds.includes(meal.id)) {
      return; // Already saved
    }

    setIsSaving(true);
    
    const saveRequest = {
      meal: {
        title: meal.name || meal.title || 'Untitled Meal',
        description: meal.description || '', // Firebase doesn't allow undefined
        ingredients: Array.isArray(meal.ingredients) 
          ? meal.ingredients.map(ing => typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`.trim())
          : [],
        instructions: meal.instructions || [],
        nutritionTotals: meal.nutrition || meal.nutritionTotals || {
          protein: 0, fiber: 0, calories: 0, carbs: 0, fat: 0
        },
        servingSize: `${meal.servings || 1} serving${(meal.servings || 1) > 1 ? 's' : ''}`,
        cookingTime: meal.cookingTime || 0,
        mealType: preferences.mealType || 'lunch'
      },
      tags: meal.tags || [],
      notes: meal.glp1Notes || '', // Firebase doesn't allow undefined
      source: 'ai_generated' as const,
      originalData: meal || {}, // Ensure not undefined
      generationPreferences: preferences || {} // Ensure not undefined
    };
    
    try {
      // Clean the save request to remove any undefined values
      const cleanedSaveRequest = cleanUndefinedValues(saveRequest);

      const savedMeal = await savedMealsService.saveMeal(user.uid, cleanedSaveRequest);
      setSavedMealIds(prev => [...prev, savedMeal.id]);
      
      // Show success message
      alert(`✅ "${savedMeal.title}" saved to your cookbook!`);
      
    } catch (error) {
      console.error('Error saving meal:', error);
      console.error('Original save request was:', saveRequest);
      console.error('Cleaned save request was:', cleanUndefinedValues(saveRequest));
      
      // More specific error message
      let errorMessage = 'Failed to save meal. Please try again.';
      if (error instanceof Error) {
        errorMessage += ` (${error.message})`;
      }
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Add to shopping list
  const createShoppingList = async (meal: GeneratedMeal) => {
    if (!user) {
      alert('Please sign in to create shopping lists');
      return;
    }

    try {
      // Extract ingredients from the meal
      const ingredients = Array.isArray(meal.ingredients) 
        ? meal.ingredients.map(ing => {
            if (typeof ing === 'string') {
              return ing;
            } else if (ing && typeof ing === 'object') {
              return `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`.trim();
            }
            return '';
          }).filter(Boolean)
        : [];

      if (ingredients.length === 0) {
        alert('No ingredients found in this meal');
        return;
      }

      // Create the shopping list
      const shoppingList = await shoppingListService.createListFromMeal(
        user.uid,
        meal.id || 'generated-meal',
        meal.name || meal.title || 'AI Generated Meal',
        ingredients
      );

      // Also save the meal to cookbook automatically
      if (!savedMealIds.includes(meal.id)) {
        try {
          const saveRequest = {
            meal: {
              title: meal.name || meal.title || 'Untitled Meal',
              description: meal.description || '',
              ingredients: Array.isArray(meal.ingredients) 
                ? meal.ingredients.map(ing => typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`.trim())
                : [],
              instructions: meal.instructions || [],
              nutritionTotals: meal.nutrition || meal.nutritionTotals || {
                protein: 0,
                fiber: 0,
                calories: 0,
                carbs: 0,
                fat: 0,
                sodium: 0
              },
              cookingTime: meal.cookingTime || 0,
              servings: meal.servings || 1,
              difficulty: meal.difficulty || 'easy',
              mealType: meal.mealType || 'lunch',
              tags: meal.tags || [],
              glp1Notes: meal.glp1Notes || '',
              createdAt: new Date()
            }
          };
          
          const cleanedSaveRequest = cleanUndefinedValues(saveRequest);
          const savedMeal = await savedMealsService.saveMeal(user.uid, cleanedSaveRequest);
          setSavedMealIds(prev => [...prev, savedMeal.id]);
          console.log(`✅ Auto-saved "${savedMeal.title}" to cookbook when creating shopping list`);
        } catch (saveError) {
          console.error('Error auto-saving meal to cookbook:', saveError);
          // Don't block the shopping list creation if cookbook save fails
        }
      }

      // Redirect to the shopping list page
      router.push('/shopping-list');
      
    } catch (error) {
      console.error('Error creating shopping list:', error);
      alert('Failed to create shopping list. Please try again.');
    }
  };

  // Enhance with flavorful twists
  const enhanceWithFlavorfulTwists = async (meal: GeneratedMeal) => {
    setIsEnhancing(true);
    
    try {
      const response = await fetch('/api/enhance-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe: meal,
          allergies: preferences.allergies
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance meal');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to enhance meal');
      }
      
      // Replace the current meal with the enhanced version
      const updatedMeals = [...generatedMeals];
      const mealIndex = generatedMeals.findIndex(m => m.id === meal.id);
      if (mealIndex >= 0) {
        updatedMeals[mealIndex] = {
          ...meal,
          ...data.enhancedRecipe,
          name: data.enhancedRecipe.title,
          nutritionSource: 'Enhanced with Flavorful Twists'
        };
        setGeneratedMeals(updatedMeals);
      }
      
    } catch (error) {
      console.error('Error enhancing meal:', error);
      alert('Sorry, we couldn\'t enhance this meal right now. Please try again!');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🍽️ AI Meal Generator
        </h1>
        <p className="text-gray-600">
          Generate personalized, GLP-1 friendly meals with AI
        </p>
      </div>

      {/* Symptom-based suggestion banner */}
      {suggestedMeal && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Generating symptom-friendly meal
                </h3>
                <p className="text-sm text-blue-700">
                  Creating "<strong>{suggestedMeal}</strong>" optimized for {symptom ? SYMPTOM_LABELS[symptom]?.label || symptom : 'your symptoms'}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Back to suggestions
            </button>
          </div>
        </div>
      )}

      {/* Offline Warning */}
      {!isOnline && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div>
              <h3 className="font-semibold text-orange-900">You're offline</h3>
              <p className="text-sm text-orange-700">
                AI meal generation requires an internet connection. You can still browse the{' '}
                <a href="/meals" className="underline hover:no-underline">Recipe Library</a> while offline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Education Tips */}
      <EducationTips 
        onShowInsight={setShowInsightModal} 
        onShowEnhancedEducation={(category) => setShowEnhancedEducation({ show: true, category })}
      />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'generator' ? (
        <div className="space-y-8">
          {/* Meal Preferences */}
          <MealPreferences
            preferences={preferences}
            setPreferences={setPreferences}
            onGenerate={generateMeal}
            onClearHistory={clearHistory}
            isGenerating={isGenerating}
          />

          {/* Show skeleton while generating */}
          {isGenerating && (
            <div className="border-t-4 border-blue-200 pt-8 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Generating your personalized meals...</h3>
                    <p className="text-sm text-blue-700">Optimizing for GLP-1 medication compatibility</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-6">
                <MealCardSkeleton />
                <MealCardSkeleton />
              </div>
            </div>
          )}

          {/* Meal Results - Only show if we have meals and not generating */}
          {!isGenerating && generatedMeals.length > 0 && (
            <div className="border-t-4 border-blue-200 pt-8">
              <MealResults
                meals={generatedMeals}
                selectedMealIndex={selectedMealIndex}
                onMealSelect={setSelectedMealIndex}
                onSaveMeal={saveMeal}
                onAddToShoppingList={createShoppingList}
                onEnhanceMeal={enhanceWithFlavorfulTwists}
                savedMealIds={savedMealIds}
                isSaving={isSaving}
                isEnhancing={isEnhancing}
                symptomOptimized={symptomOptimized}
              />
            </div>
          )}
        </div>
      ) : (
        /* Education Tab */
        <div className="bg-white rounded-lg shadow-lg p-6">
          <NutritionInsights />
        </div>
      )}

      {/* Insight Nudge Modal */}
      {showNudge.type && (
        <InsightNudge
          type={showNudge.type}
          mealData={showNudge.mealData}
          onDismiss={() => setShowNudge({ type: null })}
          onShowInsight={setShowInsightModal}
        />
      )}

      {/* Enhanced Nutrition Education Modal */}
      {showEnhancedEducation.show && (
        <EnhancedNutritionEducation
          showAsModal={true}
          selectedCategory={showEnhancedEducation.category}
          onClose={() => setShowEnhancedEducation({ show: false })}
        />
      )}

      {/* Nutrition Insights Modal */}
      {showInsightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Nutrition Insights</h2>
                <button
                  onClick={() => setShowInsightModal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <NutritionInsights />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}