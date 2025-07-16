/**
 * AI Meal Generator Service
 * 
 * This service provides functions to generate custom meals based on user preferences
 * and dietary requirements. It ensures meals are high in protein and fiber,
 * and provides options for different meal types and preparation methods.
 */

// Define the structure of a generated meal
export interface GeneratedMeal {
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  ingredients: string[];
  instructions: string[];
  proteinGrams: number;
  fiberGrams: number;
  prepTimeMinutes: number;
  tags: string[];
  nutritionInfo?: {
    calories?: number;
    carbs?: number;
    fat?: number;
  };
}

// Define meal generation options
export interface MealGenerationOptions {
  mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  quickMeal?: boolean;        // Under 30 minutes
  ultraQuickMeal?: boolean;   // Under 15 minutes
  quickSnack?: boolean;       // Under 5 minutes
  batchCooking?: boolean;     // Meal prep for multiple servings
  onePotMeal?: boolean;       // Single pot preparation
  sheetPanMeal?: boolean;     // Sheet pan preparation
  vegetarian?: boolean;       // No meat
  proteinType?: 'Chicken' | 'Turkey' | 'Fish' | 'Beef' | 'Pork' | 'Tofu' | 'Tempeh' | 'Beans' | 'Eggs' | 'Any';
  excludeIngredients?: string[];
}

// Store previously generated meals to avoid repetition
class MealHistoryTracker {
  private static recentMeals: Set<string> = new Set();
  private static MAX_HISTORY = 20;

  static addMeal(mealName: string): void {
    // If we've reached our history limit, remove the oldest meal
    if (this.recentMeals.size >= this.MAX_HISTORY) {
      const oldestMeal = this.recentMeals.values().next().value;
      this.recentMeals.delete(oldestMeal);
    }
    
    // Add the new meal to history
    this.recentMeals.add(mealName);
  }

  static hasMealBeenGenerated(mealName: string): boolean {
    return this.recentMeals.has(mealName);
  }

  static clearHistory(): void {
    this.recentMeals.clear();
  }
}

/**
 * Collection of meal templates that meet our protein (20g+) and fiber (4g+) requirements
 * These templates will be customized based on user preferences
 */
const HIGH_PROTEIN_MEAL_TEMPLATES: GeneratedMeal[] = [
  // Breakfast options
  {
    name: "Greek Yogurt Protein Bowl",
    category: "Breakfast",
    ingredients: [
      "2 cups Greek yogurt (plain, non-fat)",
      "1/4 cup mixed berries",
      "2 tbsp chia seeds",
      "1 tbsp honey",
      "1/4 cup granola (low-sugar)"
    ],
    instructions: [
      "Add Greek yogurt to a bowl",
      "Top with berries, chia seeds, and granola",
      "Drizzle with honey"
    ],
    proteinGrams: 24,
    fiberGrams: 8,
    prepTimeMinutes: 5,
    tags: ["Quick", "Vegetarian", "High-Protein"]
  },
  {
    name: "Savory Breakfast Scramble",
    category: "Breakfast",
    ingredients: [
      "4 egg whites",
      "1 whole egg",
      "1/2 cup spinach",
      "1/4 cup bell peppers, diced",
      "1/4 cup onions, diced",
      "1/4 cup black beans",
      "1/4 avocado, sliced",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Heat a non-stick pan over medium heat",
      "Sauté onions and peppers until soft",
      "Add spinach and black beans, cook until spinach wilts",
      "Pour in beaten eggs and scramble until cooked",
      "Season with salt and pepper",
      "Serve with sliced avocado"
    ],
    proteinGrams: 22,
    fiberGrams: 6,
    prepTimeMinutes: 15,
    tags: ["Quick", "Vegetarian", "High-Protein"]
  },
  
  // Lunch options
  {
    name: "Chicken and Quinoa Bowl",
    category: "Lunch",
    ingredients: [
      "4 oz grilled chicken breast",
      "1/2 cup cooked quinoa",
      "1 cup roasted vegetables (broccoli, carrots, zucchini)",
      "1/4 avocado",
      "1 tbsp olive oil",
      "Lemon juice, salt, and pepper to taste"
    ],
    instructions: [
      "Cook quinoa according to package instructions",
      "Season chicken with salt and pepper and grill until cooked through",
      "Toss vegetables in olive oil, salt, and pepper and roast at 400°F for 20 minutes",
      "Combine all ingredients in a bowl",
      "Dress with lemon juice and additional olive oil if desired"
    ],
    proteinGrams: 35,
    fiberGrams: 8,
    prepTimeMinutes: 25,
    tags: ["High-Protein", "Meal-Prep"]
  },
  {
    name: "Mediterranean Chickpea Salad",
    category: "Lunch",
    ingredients: [
      "1 cup chickpeas, drained and rinsed",
      "1 cucumber, diced",
      "1 cup cherry tomatoes, halved",
      "1/4 cup red onion, diced",
      "1/4 cup feta cheese, crumbled",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "1 tsp dried oregano",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Combine chickpeas, cucumber, tomatoes, and red onion in a bowl",
      "Whisk together olive oil, lemon juice, oregano, salt, and pepper",
      "Pour dressing over salad and toss to combine",
      "Top with crumbled feta cheese"
    ],
    proteinGrams: 22,
    fiberGrams: 12,
    prepTimeMinutes: 10,
    tags: ["Quick", "Vegetarian", "High-Fiber"]
  },
  
  // Dinner options
  {
    name: "Sheet Pan Salmon with Roasted Vegetables",
    category: "Dinner",
    ingredients: [
      "6 oz salmon fillet",
      "2 cups mixed vegetables (brussels sprouts, sweet potatoes, bell peppers)",
      "2 tbsp olive oil",
      "2 cloves garlic, minced",
      "1 lemon",
      "Fresh herbs (dill, parsley)",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Preheat oven to 425°F",
      "Toss vegetables with 1 tbsp olive oil, garlic, salt, and pepper",
      "Spread vegetables on a sheet pan and roast for 15 minutes",
      "Push vegetables to one side and add salmon",
      "Drizzle salmon with remaining olive oil, salt, pepper, and lemon juice",
      "Return to oven and bake for 12-15 minutes until salmon is cooked",
      "Garnish with fresh herbs and lemon slices"
    ],
    proteinGrams: 30,
    fiberGrams: 6,
    prepTimeMinutes: 35,
    tags: ["Sheet-Pan", "High-Protein"]
  },
  {
    name: "One-Pot Lentil and Vegetable Stew",
    category: "Dinner",
    ingredients: [
      "1 cup dry lentils, rinsed",
      "1 onion, diced",
      "2 carrots, diced",
      "2 celery stalks, diced",
      "3 cloves garlic, minced",
      "1 can (14 oz) diced tomatoes",
      "4 cups vegetable broth",
      "1 tsp cumin",
      "1 tsp paprika",
      "1/2 tsp turmeric",
      "2 cups spinach",
      "Salt and pepper to taste"
    ],
    instructions: [
      "Heat olive oil in a large pot over medium heat",
      "Add onion, carrots, and celery, cook until softened",
      "Add garlic and spices, cook for 1 minute until fragrant",
      "Add lentils, diced tomatoes, and vegetable broth",
      "Bring to a boil, then reduce heat and simmer for 25-30 minutes until lentils are tender",
      "Stir in spinach and cook until wilted",
      "Season with salt and pepper to taste"
    ],
    proteinGrams: 24,
    fiberGrams: 15,
    prepTimeMinutes: 40,
    tags: ["One-Pot", "Vegetarian", "High-Fiber", "Batch-Cooking"]
  },
  
  // Snack options
  {
    name: "Protein-Packed Greek Yogurt Parfait",
    category: "Snack",
    ingredients: [
      "1 cup Greek yogurt",
      "1/4 cup mixed berries",
      "1 tbsp chia seeds",
      "1 tbsp honey"
    ],
    instructions: [
      "Layer Greek yogurt in a glass or bowl",
      "Top with berries, chia seeds, and honey"
    ],
    proteinGrams: 20,
    fiberGrams: 4,
    prepTimeMinutes: 3,
    tags: ["Quick", "Vegetarian", "High-Protein"]
  },
  {
    name: "Edamame with Sea Salt",
    category: "Snack",
    ingredients: [
      "1 cup edamame pods",
      "1/2 tsp sea salt"
    ],
    instructions: [
      "Steam or microwave edamame according to package instructions",
      "Sprinkle with sea salt"
    ],
    proteinGrams: 22,
    fiberGrams: 5,
    prepTimeMinutes: 5,
    tags: ["Quick", "Vegetarian", "High-Protein"]
  }
];

/**
 * Additional meal templates for specific dietary preferences and cooking methods
 */
const SPECIALIZED_MEAL_TEMPLATES: Record<string, GeneratedMeal[]> = {
  "quick": [
    {
      name: "Quick Turkey and Vegetable Stir-Fry",
      category: "Dinner",
      ingredients: [
        "1 lb ground turkey",
        "2 cups mixed vegetables (bell peppers, broccoli, snap peas)",
        "2 cloves garlic, minced",
        "1 tbsp ginger, minced",
        "2 tbsp low-sodium soy sauce",
        "1 tbsp sesame oil",
        "1 tsp sriracha (optional)",
        "2 green onions, sliced"
      ],
      instructions: [
        "Heat sesame oil in a large skillet over medium-high heat",
        "Add ground turkey and cook until browned",
        "Add garlic and ginger, cook for 30 seconds until fragrant",
        "Add vegetables and stir-fry for 5-7 minutes until tender-crisp",
        "Add soy sauce and sriracha, toss to combine",
        "Garnish with green onions"
      ],
      proteinGrams: 28,
      fiberGrams: 4,
      prepTimeMinutes: 20,
      tags: ["Quick", "High-Protein"]
    }
  ],
  "ultraQuick": [
    {
      name: "15-Minute Tuna and White Bean Salad",
      category: "Lunch",
      ingredients: [
        "1 can (5 oz) tuna in water, drained",
        "1 can (15 oz) white beans, drained and rinsed",
        "1 cup arugula or mixed greens",
        "1/2 cucumber, diced",
        "10 cherry tomatoes, halved",
        "2 tbsp olive oil",
        "1 tbsp lemon juice",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Combine tuna, white beans, arugula, cucumber, and tomatoes in a bowl",
        "Whisk together olive oil, lemon juice, salt, and pepper",
        "Pour dressing over salad and toss gently to combine"
      ],
      proteinGrams: 30,
      fiberGrams: 8,
      prepTimeMinutes: 10,
      tags: ["Ultra-Quick", "High-Protein", "No-Cook"]
    }
  ],
  "batchCooking": [
    {
      name: "Batch Chicken and Sweet Potato Meal Prep",
      category: "Lunch",
      ingredients: [
        "2 lbs chicken breast",
        "3 large sweet potatoes, diced",
        "4 cups broccoli florets",
        "3 tbsp olive oil",
        "2 tsp paprika",
        "1 tsp garlic powder",
        "1 tsp dried thyme",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Preheat oven to 425°F",
        "Season chicken with 1 tbsp olive oil, paprika, garlic powder, thyme, salt, and pepper",
        "Toss sweet potatoes and broccoli with remaining olive oil, salt, and pepper",
        "Place chicken on one sheet pan and vegetables on another",
        "Bake chicken for 20-25 minutes until internal temperature reaches 165°F",
        "Bake vegetables for 25-30 minutes until tender",
        "Divide into 5 meal prep containers and refrigerate",
        "Reheat when ready to eat"
      ],
      proteinGrams: 35,
      fiberGrams: 6,
      prepTimeMinutes: 45,
      tags: ["Batch-Cooking", "Meal-Prep", "High-Protein"]
    }
  ],
  "onePot": [
    {
      name: "One-Pot Chicken and Quinoa",
      category: "Dinner",
      ingredients: [
        "1 lb boneless, skinless chicken thighs, diced",
        "1 cup quinoa, rinsed",
        "1 onion, diced",
        "2 bell peppers, diced",
        "2 cloves garlic, minced",
        "2 cups chicken broth",
        "1 tsp cumin",
        "1 tsp paprika",
        "1/2 tsp oregano",
        "Salt and pepper to taste",
        "Fresh cilantro for garnish"
      ],
      instructions: [
        "Heat olive oil in a large pot over medium heat",
        "Add chicken and cook until browned on all sides",
        "Add onion and bell peppers, cook until softened",
        "Add garlic and spices, cook for 30 seconds until fragrant",
        "Add quinoa and chicken broth, bring to a boil",
        "Reduce heat, cover, and simmer for 15-20 minutes until quinoa is cooked",
        "Fluff with a fork and garnish with fresh cilantro"
      ],
      proteinGrams: 32,
      fiberGrams: 5,
      prepTimeMinutes: 30,
      tags: ["One-Pot", "High-Protein"]
    }
  ],
  "sheetPan": [
    {
      name: "Sheet Pan Tofu and Vegetable Dinner",
      category: "Dinner",
      ingredients: [
        "1 block (14 oz) extra-firm tofu, pressed and cubed",
        "2 cups brussels sprouts, halved",
        "1 red onion, cut into wedges",
        "1 sweet potato, diced",
        "2 tbsp olive oil",
        "2 tbsp soy sauce",
        "1 tbsp maple syrup",
        "2 tsp garlic powder",
        "1 tsp smoked paprika",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Preheat oven to 425°F",
        "In a small bowl, whisk together olive oil, soy sauce, maple syrup, garlic powder, and smoked paprika",
        "Place tofu and vegetables on a large sheet pan",
        "Pour marinade over tofu and vegetables, toss to coat",
        "Spread in an even layer",
        "Bake for 25-30 minutes, stirring halfway through, until vegetables are tender and tofu is crispy"
      ],
      proteinGrams: 24,
      fiberGrams: 8,
      prepTimeMinutes: 35,
      tags: ["Sheet-Pan", "Vegetarian", "High-Protein"]
    }
  ],
  "vegetarian": [
    {
      name: "High-Protein Vegetarian Chili",
      category: "Dinner",
      ingredients: [
        "1 cup dry lentils, rinsed",
        "1 can (15 oz) black beans, drained and rinsed",
        "1 can (15 oz) kidney beans, drained and rinsed",
        "1 onion, diced",
        "1 bell pepper, diced",
        "3 cloves garlic, minced",
        "1 can (28 oz) crushed tomatoes",
        "2 cups vegetable broth",
        "2 tbsp chili powder",
        "1 tbsp cumin",
        "1 tsp oregano",
        "1/2 tsp cayenne pepper (optional)",
        "Salt and pepper to taste",
        "Optional toppings: avocado, Greek yogurt, cilantro"
      ],
      instructions: [
        "Heat olive oil in a large pot over medium heat",
        "Add onion and bell pepper, cook until softened",
        "Add garlic and spices, cook for 30 seconds until fragrant",
        "Add lentils, beans, crushed tomatoes, and vegetable broth",
        "Bring to a boil, then reduce heat and simmer for 30-35 minutes until lentils are tender",
        "Season with salt and pepper to taste",
        "Serve with optional toppings"
      ],
      proteinGrams: 22,
      fiberGrams: 18,
      prepTimeMinutes: 45,
      tags: ["Vegetarian", "High-Protein", "High-Fiber", "Batch-Cooking"]
    }
  ]
};

/**
 * Generate a meal based on user preferences and constraints
 * @param options User preferences for meal generation
 * @returns A generated meal that meets the criteria
 */
export const generateMeal = (options: MealGenerationOptions): GeneratedMeal => {
  // Start with all high-protein meals
  let eligibleMeals = [...HIGH_PROTEIN_MEAL_TEMPLATES];
  
  // Filter by meal type if specified
  if (options.mealType) {
    eligibleMeals = eligibleMeals.filter(meal => meal.category === options.mealType);
  }
  
  // Filter by preparation time constraints
  if (options.quickMeal) {
    eligibleMeals = eligibleMeals.filter(meal => meal.prepTimeMinutes <= 30);
    // Add specialized quick meals
    eligibleMeals = [...eligibleMeals, ...SPECIALIZED_MEAL_TEMPLATES.quick];
  }
  
  if (options.ultraQuickMeal) {
    eligibleMeals = eligibleMeals.filter(meal => meal.prepTimeMinutes <= 15);
    // Add specialized ultra-quick meals
    eligibleMeals = [...eligibleMeals, ...SPECIALIZED_MEAL_TEMPLATES.ultraQuick];
  }
  
  if (options.quickSnack) {
    eligibleMeals = eligibleMeals.filter(meal => 
      meal.category === 'Snack' && meal.prepTimeMinutes <= 5
    );
  }
  
  // Filter by cooking method
  if (options.batchCooking) {
    const batchMeals = eligibleMeals.filter(meal => meal.tags.includes('Batch-Cooking'));
    if (batchMeals.length > 0) {
      eligibleMeals = batchMeals;
    } else {
      // Add specialized batch cooking meals
      eligibleMeals = [...eligibleMeals, ...SPECIALIZED_MEAL_TEMPLATES.batchCooking];
    }
  }
  
  if (options.onePotMeal) {
    const onePotMeals = eligibleMeals.filter(meal => meal.tags.includes('One-Pot'));
    if (onePotMeals.length > 0) {
      eligibleMeals = onePotMeals;
    } else {
      // Add specialized one-pot meals
      eligibleMeals = [...eligibleMeals, ...SPECIALIZED_MEAL_TEMPLATES.onePot];
    }
  }
  
  if (options.sheetPanMeal) {
    const sheetPanMeals = eligibleMeals.filter(meal => meal.tags.includes('Sheet-Pan'));
    if (sheetPanMeals.length > 0) {
      eligibleMeals = sheetPanMeals;
    } else {
      // Add specialized sheet pan meals
      eligibleMeals = [...eligibleMeals, ...SPECIALIZED_MEAL_TEMPLATES.sheetPan];
    }
  }
  
  // Filter by dietary preference
  if (options.vegetarian) {
    const vegetarianMeals = eligibleMeals.filter(meal => meal.tags.includes('Vegetarian'));
    if (vegetarianMeals.length > 0) {
      eligibleMeals = vegetarianMeals;
    } else {
      // Add specialized vegetarian meals
      eligibleMeals = [...eligibleMeals, ...SPECIALIZED_MEAL_TEMPLATES.vegetarian];
    }
  }
  
  // Filter by protein type
  if (options.proteinType && options.proteinType !== 'Any') {
    // This is a simplified approach - in a real app, you would need more sophisticated
    // ingredient analysis to determine the protein type
    eligibleMeals = eligibleMeals.filter(meal => {
      const ingredients = meal.ingredients.join(' ').toLowerCase();
      const proteinType = options.proteinType?.toLowerCase() || '';
      
      return ingredients.includes(proteinType);
    });
    
    // If no meals match the protein type, we'll need to customize some meals
    if (eligibleMeals.length === 0) {
      // Find meals that could be adapted to use the specified protein
      const adaptableMeals = HIGH_PROTEIN_MEAL_TEMPLATES.filter(meal => 
        !meal.tags.includes('Vegetarian') || 
        (options.proteinType === 'Tofu' || options.proteinType === 'Tempeh' || options.proteinType === 'Beans')
      );
      
      if (adaptableMeals.length > 0) {
        // Create a copy of a random meal and adapt it
        const baseMeal = {...adaptableMeals[Math.floor(Math.random() * adaptableMeals.length)]};
        
        // Customize the meal with the specified protein
        return customizeMealWithProtein(baseMeal, options.proteinType);
      }
    }
  }
  
  // Filter out meals with excluded ingredients
  if (options.excludeIngredients && options.excludeIngredients.length > 0) {
    eligibleMeals = eligibleMeals.filter(meal => {
      const mealIngredients = meal.ingredients.join(' ').toLowerCase();
      return !options.excludeIngredients?.some(ingredient => 
        mealIngredients.includes(ingredient.toLowerCase())
      );
    });
  }
  
  // Ensure we have vegetables in non-snack meals
  if (options.mealType && options.mealType !== 'Snack') {
    eligibleMeals = eligibleMeals.filter(meal => {
      const ingredients = meal.ingredients.join(' ').toLowerCase();
      const commonVegetables = ['spinach', 'broccoli', 'kale', 'carrot', 'pepper', 'onion', 'tomato', 'vegetable'];
      
      return commonVegetables.some(veg => ingredients.includes(veg));
    });
  }
  
  // Filter out recently generated meals to avoid repetition
  eligibleMeals = eligibleMeals.filter(meal => !MealHistoryTracker.hasMealBeenGenerated(meal.name));
  
  // If we've filtered out all meals, reset and try with fewer constraints
  if (eligibleMeals.length === 0) {
    console.log("No meals match all criteria, relaxing constraints");
    
    // Start with base high-protein meals
    eligibleMeals = [...HIGH_PROTEIN_MEAL_TEMPLATES];
    
    // Only apply meal type filter as the minimum constraint
    if (options.mealType) {
      eligibleMeals = eligibleMeals.filter(meal => meal.category === options.mealType);
    }
    
    // If still no eligible meals, just return a random high-protein meal
    if (eligibleMeals.length === 0) {
      eligibleMeals = [...HIGH_PROTEIN_MEAL_TEMPLATES];
    }
  }
  
  // Select a random meal from eligible options
  const selectedMeal = eligibleMeals[Math.floor(Math.random() * eligibleMeals.length)];
  
  // Track this meal to avoid repetition
  MealHistoryTracker.addMeal(selectedMeal.name);
  
  return selectedMeal;
}

/**
 * Customize a meal by replacing its main protein source
 * @param meal Base meal to customize
 * @param proteinType Type of protein to use
 * @returns Customized meal with the specified protein
 */
const customizeMealWithProtein = (meal: GeneratedMeal, proteinType: string): GeneratedMeal => {
  const customizedMeal = {...meal};
  
  // Update the meal name
  customizedMeal.name = customizedMeal.name.replace(
    /(Chicken|Turkey|Fish|Beef|Pork|Tofu|Tempeh)/i, 
    proteinType
  );
  
  // Update ingredients by replacing the protein
  customizedMeal.ingredients = customizedMeal.ingredients.map(ingredient => {
    // Replace protein ingredients with the new protein type
    if (/chicken|turkey|fish|beef|pork|tofu|tempeh/i.test(ingredient)) {
      return ingredient.replace(
        /(chicken|turkey|fish|beef|pork|tofu|tempeh)/i, 
        proteinType.toLowerCase()
      );
    }
    return ingredient;
  });
  
  // Update instructions similarly
  customizedMeal.instructions = customizedMeal.instructions.map(step => {
    return step.replace(
      /(chicken|turkey|fish|beef|pork|tofu|tempeh)/i, 
      proteinType.toLowerCase()
    );
  });
  
  return customizedMeal;
}

/**
 * Generate multiple meal options based on user preferences
 * @param options User preferences for meal generation
 * @param count Number of meal options to generate
 * @returns Array of generated meals
 */
export const generateMealOptions = (options: MealGenerationOptions, count: number = 3): GeneratedMeal[] => {
  const meals: GeneratedMeal[] = [];
  
  // Generate the requested number of unique meals
  for (let i = 0; i < count; i++) {
    const meal = generateMeal(options);
    meals.push(meal);
    
    // If we can't generate enough unique meals, break to avoid infinite loop
    if (i > 0 && meals.length < i + 1) {
      break;
    }
  }
  
  return meals;
}

/**
 * Clear the meal history tracker
 * Useful when starting a new session or when user preferences change significantly
 */
export const clearMealHistory = (): void => {
  MealHistoryTracker.clearHistory();
}

/**
 * Get available protein options for meal generation
 * @returns Array of protein options
 */
export const getProteinOptions = (): string[] => {
  return ['Chicken', 'Turkey', 'Fish', 'Beef', 'Pork', 'Tofu', 'Tempeh', 'Beans', 'Eggs', 'Any'];
}

/**
 * Get available meal categories
 * @returns Array of meal categories
 */
export const getMealCategories = (): string[] => {
  return ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
}

/**
 * Get available meal preparation methods
 * @returns Object with preparation method options
 */
export const getMealPrepMethods = (): Record<string, string> => {
  return {
    quickMeal: 'Quick (under 30 minutes)',
    ultraQuickMeal: 'Ultra-Quick (under 15 minutes)',
    quickSnack: 'Quick Snack (under 5 minutes)',
    batchCooking: 'Batch Cooking (meal prep)',
    onePotMeal: 'One-Pot Meal',
    sheetPanMeal: 'Sheet Pan Meal'
  };
}
