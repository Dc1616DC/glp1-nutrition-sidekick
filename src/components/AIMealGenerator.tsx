// This component has been refactored into smaller, more manageable components.
// The original 967-line component is now split into:
// - MealPreferences: Handles user preferences and settings
// - MealResults: Displays generated meals and handles meal selection
// - MealCard: Individual meal card with actions (save, shopping list, enhance)
// - EducationTips: Rotating educational tips
// - TabNavigation: Tab switching between generator and education

import AIMealGeneratorRefactored from './meal-generator/AIMealGeneratorRefactored';

interface AIMealGeneratorProps {
  suggestedMeal?: string | null;
  symptom?: string | null;
}

export default function AIMealGenerator({ suggestedMeal, symptom }: AIMealGeneratorProps) {
  return <AIMealGeneratorRefactored suggestedMeal={suggestedMeal} symptom={symptom} />;
}