// User profile and preferences types
export interface UserProfile {
  id: string;
  preferences: {
    favoriteProteins: string[];
    dislikedIngredients: string[];
    allergies: string[];
    cuisinePreferences: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    kitchenEquipment: string[];
    typicalMealTimes: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
  };
  mealHistory: MealRating[];
  kitchenInventory: InventoryItem[];
}

export interface MealRating {
  mealId: string;
  mealName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  madeIt: boolean;
  actualCookTime?: number;
  substitutions?: { original: string; used: string }[];
  createdAt: Date;
}

export interface InventoryItem {
  ingredient: string;
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'pantry' | 'spice';
  quantity?: string;
  expiresAt?: Date;
  addedAt: Date;
}

export interface EnhancedMealPreferences {
  // Existing preferences
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cookingTime: '5min' | '15min' | '30min' | 'batch' | 'any';
  mealStyle: 'quick' | 'one-pot' | 'sheet-pan' | 'meal-prep' | 'any';
  dietaryRestriction: 'none' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';
  proteinSource: 'any' | 'chicken' | 'turkey' | 'fish' | 'tofu' | 'eggs' | 'beans' | 'greek-yogurt';
  preferredCuisine: 'any' | 'american' | 'mediterranean' | 'asian' | 'mexican' | 'italian';
  
  // New intelligent features
  useInventory: boolean;
  avoidPreviouslyRatedLow: boolean;
  preferHighRatedSimilar: boolean;
  adaptToSkillLevel: boolean;
  suggestSubstitutions: boolean;
}
