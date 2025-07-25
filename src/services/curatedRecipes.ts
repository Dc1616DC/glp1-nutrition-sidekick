// Curated high-protein, no-cook recipes optimized for GLP-1 users

interface CuratedMeal {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  servings: number;
  category: 'quick-snack' | 'breakfast' | 'lunch';
  proteinSource: string[];
  nutrition: {
    protein: number;
    fiber: number;
    calories: number;
    carbs: number;
    fat: number;
  };
  ingredients: string[];
  instructions: string[];
  tips: string[];
  mealStyle: string[];
  glp1Friendly: {
    eatingTips: string;
  };
  complexity: {
    level: 'Simple';
    score: number;
    factors: string[];
  };
}

const CURATED_RECIPES: CuratedMeal[] = [
  // QUICK SNACKS
  {
    id: 'snack_greek_yogurt_parfait',
    name: 'Protein-Packed Greek Yogurt Parfait',
    description: 'High-protein parfait with Greek yogurt, nuts, and berries',
    prepTime: 3,
    servings: 1,
    category: 'quick-snack',
    proteinSource: ['greek-yogurt'],
    nutrition: {
      protein: 20,
      fiber: 6,
      calories: 280,
      carbs: 22,
      fat: 12
    },
    ingredients: [
      '1 cup plain Greek yogurt (non-fat)',
      '1 tbsp chopped almonds',
      '1 tbsp chia seeds',
      '1/3 cup fresh berries',
      '1 tsp honey (optional)'
    ],
    instructions: [
      '1. Add Greek yogurt to a bowl or glass.',
      '2. Sprinkle half the chia seeds over yogurt.',
      '3. Add berries on top.',
      '4. Sprinkle with almonds and remaining chia seeds.',
      '5. Drizzle with honey if desired.'
    ],
    tips: [
      'Prepare up to 4 hours ahead',
      'Use frozen berries for a thicker consistency',
      'Add protein powder for extra 10g protein'
    ],
    mealStyle: ['GLP-1 Friendly', 'High Protein', 'High Fiber', 'No-Cook'],
    glp1Friendly: {
      eatingTips: 'Eat slowly to enjoy different textures. The protein and fiber will help you feel satisfied between meals.'
    },
    complexity: {
      level: 'Simple',
      score: 10,
      factors: ['Few ingredients', 'No cooking required']
    }
  },

  {
    id: 'snack_cottage_cheese_bowl',
    name: 'Savory Cottage Cheese Power Bowl',
    description: 'High-protein cottage cheese with vegetables and seeds',
    prepTime: 5,
    servings: 1,
    category: 'quick-snack',
    proteinSource: ['high-protein'],
    nutrition: {
      protein: 25,
      fiber: 5,
      calories: 250,
      carbs: 12,
      fat: 8
    },
    ingredients: [
      '1 cup low-fat cottage cheese',
      '1/4 cucumber, diced',
      '1/4 bell pepper, diced',
      '1 tbsp sunflower seeds',
      '1 tsp everything bagel seasoning',
      'Black pepper to taste'
    ],
    instructions: [
      '1. Add cottage cheese to a bowl.',
      '2. Top with diced cucumber and bell pepper.',
      '3. Sprinkle with sunflower seeds.',
      '4. Season with everything bagel seasoning and black pepper.',
      '5. Mix gently and enjoy.'
    ],
    tips: [
      'Use full-fat cottage cheese for more satiety',
      'Add avocado for healthy fats',
      'Try with cherry tomatoes for variety'
    ],
    mealStyle: ['GLP-1 Friendly', 'High Protein', 'High Fiber', 'No-Cook', 'Savory'],
    glp1Friendly: {
      eatingTips: 'The combination of protein and fiber will help control appetite. Eat mindfully and stop when satisfied.'
    },
    complexity: {
      level: 'Simple',
      score: 15,
      factors: ['Simple chopping', 'No cooking required']
    }
  },

  // QUICK BREAKFAST
  {
    id: 'breakfast_overnight_oats',
    name: 'High-Protein Overnight Oats',
    description: 'Make-ahead oats with protein powder and chia seeds',
    prepTime: 5,
    servings: 1,
    category: 'breakfast',
    proteinSource: ['high-protein'],
    nutrition: {
      protein: 28,
      fiber: 8,
      calories: 380,
      carbs: 45,
      fat: 12
    },
    ingredients: [
      '1/2 cup old-fashioned oats',
      '1 scoop vanilla protein powder',
      '1 tbsp chia seeds',
      '3/4 cup unsweetened almond milk',
      '1 tbsp almond butter',
      '1/2 sliced banana',
      '1 tsp maple syrup (optional)'
    ],
    instructions: [
      '1. Mix oats, protein powder, and chia seeds in a jar.',
      '2. Add almond milk and stir well.',
      '3. Add almond butter and mix.',
      '4. Top with sliced banana.',
      '5. Refrigerate overnight. Eat cold or let sit 10 minutes at room temperature.'
    ],
    tips: [
      'Prepare 2-3 jars at once for meal prep',
      'Use any protein powder flavor you prefer',
      'Add berries instead of banana for lower carbs'
    ],
    mealStyle: ['GLP-1 Friendly', 'High Protein', 'High Fiber', 'No-Cook', 'Meal Prep'],
    glp1Friendly: {
      eatingTips: 'This provides sustained energy and will keep you full until lunch. The fiber helps slow digestion.'
    },
    complexity: {
      level: 'Simple',
      score: 12,
      factors: ['Simple mixing', 'Make-ahead prep']
    }
  },

  {
    id: 'breakfast_egg_salad_wrap',
    name: 'Quick Egg Salad Protein Wrap',
    description: 'High-protein wrap using pre-boiled eggs',
    prepTime: 7,
    servings: 1,
    category: 'breakfast',
    proteinSource: ['eggs'],
    nutrition: {
      protein: 22,
      fiber: 6,
      calories: 320,
      carbs: 25,
      fat: 15
    },
    ingredients: [
      '2 hard-boiled eggs (pre-cooked)',
      '1 large high-fiber tortilla',
      '2 tbsp Greek yogurt',
      '1 tsp Dijon mustard',
      '1 cup baby spinach',
      '1/4 avocado, sliced',
      'Salt and pepper to taste'
    ],
    instructions: [
      '1. Mash hard-boiled eggs in a bowl.',
      '2. Mix in Greek yogurt and Dijon mustard.',
      '3. Season with salt and pepper.',
      '4. Lay tortilla flat and add spinach.',
      '5. Spread egg mixture over spinach.',
      '6. Add avocado slices and roll tightly.'
    ],
    tips: [
      'Boil eggs in batches on Sunday for the week',
      'Use pre-washed spinach to save time',
      'Wrap in foil for on-the-go eating'
    ],
    mealStyle: ['GLP-1 Friendly', 'High Protein', 'High Fiber', 'No-Cook', 'Portable'],
    glp1Friendly: {
      eatingTips: 'The protein and healthy fats will provide steady energy. Eat slowly and chew well for best digestion.'
    },
    complexity: {
      level: 'Simple',
      score: 18,
      factors: ['Simple assembly', 'Requires pre-cooked eggs']
    }
  },

  // SIMPLE LUNCH
  {
    id: 'lunch_chickpea_salad',
    name: 'Mediterranean Chickpea Power Salad',
    description: 'Protein-rich chickpea salad with vegetables and feta',
    prepTime: 8,
    servings: 1,
    category: 'lunch',
    proteinSource: ['beans'],
    nutrition: {
      protein: 22,
      fiber: 12,
      calories: 420,
      carbs: 45,
      fat: 16
    },
    ingredients: [
      '3/4 cup canned chickpeas, drained and rinsed',
      '1/4 cup diced cucumber',
      '1/4 cup cherry tomatoes, halved',
      '2 tbsp crumbled feta cheese',
      '1 tbsp olive oil',
      '1 tbsp lemon juice',
      '1 tsp dried oregano',
      '2 cups mixed greens'
    ],
    instructions: [
      '1. Add chickpeas to a large bowl.',
      '2. Add cucumber, tomatoes, and feta.',
      '3. Whisk olive oil, lemon juice, and oregano.',
      '4. Pour dressing over chickpea mixture.',
      '5. Serve over mixed greens.'
    ],
    tips: [
      'Make double batch for tomorrow\'s lunch',
      'Add olives for extra Mediterranean flavor',
      'Use canned chickpeas for convenience'
    ],
    mealStyle: ['GLP-1 Friendly', 'High Protein', 'High Fiber', 'No-Cook', 'Mediterranean'],
    glp1Friendly: {
      eatingTips: 'This meal is very filling due to high fiber content. Start with smaller portions and eat slowly.'
    },
    complexity: {
      level: 'Simple',
      score: 20,
      factors: ['Simple chopping', 'Basic dressing']
    }
  },

  {
    id: 'lunch_tuna_avocado_bowl',
    name: 'High-Protein Tuna Avocado Bowl',
    description: 'Quick tuna salad with avocado and vegetables',
    prepTime: 6,
    servings: 1,
    category: 'lunch',
    proteinSource: ['fish'],
    nutrition: {
      protein: 30,
      fiber: 8,
      calories: 380,
      carbs: 15,
      fat: 20
    },
    ingredients: [
      '1 can (5oz) tuna in water, drained',
      '1/2 avocado, cubed',
      '1/4 cup diced celery',
      '1 tbsp Greek yogurt',
      '1 tsp lemon juice',
      '1 cup baby spinach',
      '1/4 cup shredded carrots',
      'Salt and pepper to taste'
    ],
    instructions: [
      '1. Mix tuna, Greek yogurt, and lemon juice in a bowl.',
      '2. Add diced celery and season with salt and pepper.',
      '3. Add spinach and shredded carrots to serving bowl.',
      '4. Top with tuna mixture.',
      '5. Add cubed avocado on top.'
    ],
    tips: [
      'Use tuna in water for lower calories',
      'Add cherry tomatoes for extra flavor',
      'Meal prep by keeping ingredients separate'
    ],
    mealStyle: ['GLP-1 Friendly', 'High Protein', 'High Fiber', 'No-Cook', 'Quick'],
    glp1Friendly: {
      eatingTips: 'Rich in protein and healthy fats for sustained satiety. The omega-3s support overall health.'
    },
    complexity: {
      level: 'Simple',
      score: 16,
      factors: ['Simple mixing', 'Basic assembly']
    }
  }
];

export class CuratedRecipeService {
  /**
   * Get recipes based on preferences
   */
  getRecipes(preferences: {
    mealType: string;
    proteinSource?: string;
    count?: number;
  }): CuratedMeal[] {
    let filteredRecipes = CURATED_RECIPES.filter(recipe => {
      // Filter by meal type
      if (preferences.mealType === 'snack' || preferences.mealType === 'quick-snack') {
        return recipe.category === 'quick-snack';
      }
      return recipe.category === preferences.mealType;
    });

    // Filter by protein source if specified
    if (preferences.proteinSource && preferences.proteinSource !== 'any') {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.proteinSource.includes(preferences.proteinSource!)
      );
    }

    // Shuffle for variety
    const shuffled = [...filteredRecipes].sort(() => Math.random() - 0.5);
    
    // Return requested count (default 2)
    return shuffled.slice(0, preferences.count || 2);
  }

  /**
   * Convert curated meal to GeneratedMeal format
   */
  convertToGeneratedMeal(curatedMeal: CuratedMeal) {
    return {
      id: curatedMeal.id,
      name: curatedMeal.name,
      description: curatedMeal.description,
      cookingTime: curatedMeal.prepTime,
      prepTime: curatedMeal.prepTime,
      servings: curatedMeal.servings,
      nutrition: curatedMeal.nutrition,
      ingredients: curatedMeal.ingredients,
      instructions: curatedMeal.instructions,
      tips: curatedMeal.tips,
      mealStyle: curatedMeal.mealStyle,
      glp1Friendly: curatedMeal.glp1Friendly,
      complexity: curatedMeal.complexity,
      nutritionSource: 'Curated for GLP-1 Users'
    };
  }
}

export const curatedRecipeService = new CuratedRecipeService();