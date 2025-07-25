// Common ingredient nutrition data per 100g (USDA-based estimates)
export const COMMON_NUTRITION_DATA: Record<string, {
  protein: number;
  fiber: number;
  calories: number;
  carbs: number;
  fat: number;
}> = {
  // Proteins
  'chicken breast': { protein: 31, fiber: 0, calories: 165, carbs: 0, fat: 3.6 },
  'chicken thigh': { protein: 26, fiber: 0, calories: 209, carbs: 0, fat: 10.9 },
  'salmon': { protein: 25, fiber: 0, calories: 208, carbs: 0, fat: 12.4 },
  'tuna': { protein: 29.9, fiber: 0, calories: 144, carbs: 0, fat: 4.9 },
  'shrimp': { protein: 18, fiber: 0, calories: 85, carbs: 0.9, fat: 0.5 },
  'cooked shrimp': { protein: 24, fiber: 0, calories: 99, carbs: 0.2, fat: 0.3 },
  'egg': { protein: 13, fiber: 0, calories: 155, carbs: 1.1, fat: 11 },
  'ground turkey': { protein: 27, fiber: 0, calories: 189, carbs: 0, fat: 8.3 },
  'tofu': { protein: 17.3, fiber: 2.3, calories: 144, carbs: 3.5, fat: 9 },
  
  // Grains & Starches
  'quinoa': { protein: 14.1, fiber: 7, calories: 368, carbs: 64.2, fat: 6.1 },
  'cooked quinoa': { protein: 4.4, fiber: 2.8, calories: 120, carbs: 22, fat: 1.9 },
  'brown rice': { protein: 7.9, fiber: 3.5, calories: 370, carbs: 77, fat: 2.9 }, // DRY - use cooked brown rice instead
  'cooked brown rice': { protein: 2.6, fiber: 1.8, calories: 123, carbs: 25, fat: 1 },
  'oats': { protein: 16.9, fiber: 10.1, calories: 389, carbs: 66.3, fat: 6.9 }, // DRY - use cooked oatmeal instead
  'cooked oatmeal': { protein: 2.5, fiber: 1.7, calories: 68, carbs: 12, fat: 1.4 },
  'sweet potato': { protein: 2, fiber: 3, calories: 86, carbs: 20.1, fat: 0.1 },
  
  // Legumes (cooked values)
  'black beans': { protein: 8.9, fiber: 8.3, calories: 132, carbs: 23, fat: 0.5 },
  'chickpeas': { protein: 8.9, fiber: 8, calories: 164, carbs: 27.4, fat: 2.6 },
  'lentils': { protein: 9, fiber: 7.9, calories: 116, carbs: 20.1, fat: 0.4 }, // COOKED
  'cooked lentils': { protein: 9, fiber: 7.9, calories: 116, carbs: 20.1, fat: 0.4 },
  'kidney beans': { protein: 8.7, fiber: 6.4, calories: 127, carbs: 22.8, fat: 0.5 }, // COOKED
  
  // Vegetables
  'spinach': { protein: 2.9, fiber: 2.2, calories: 23, carbs: 3.6, fat: 0.4 },
  'cooked spinach': { protein: 3.0, fiber: 2.4, calories: 23, carbs: 3.8, fat: 0.3 },
  'kale': { protein: 4.3, fiber: 3.6, calories: 49, carbs: 8.8, fat: 0.9 },
  'steamed kale': { protein: 2.9, fiber: 2.6, calories: 36, carbs: 7.3, fat: 0.5 },
  'broccoli': { protein: 2.8, fiber: 2.6, calories: 34, carbs: 6.6, fat: 0.4 },
  'steamed broccoli': { protein: 3.7, fiber: 3.3, calories: 35, carbs: 7.2, fat: 0.4 },
  'bell pepper': { protein: 1, fiber: 2.5, calories: 31, carbs: 7.3, fat: 0.3 },
  'red bell pepper': { protein: 1, fiber: 2.5, calories: 31, carbs: 7.3, fat: 0.3 },
  'cucumber': { protein: 0.7, fiber: 0.5, calories: 16, carbs: 4, fat: 0.1 },
  'tomato': { protein: 0.9, fiber: 1.2, calories: 18, carbs: 3.9, fat: 0.2 },
  'cherry tomatoes': { protein: 0.9, fiber: 1.2, calories: 18, carbs: 3.9, fat: 0.2 },
  'mixed greens': { protein: 2.2, fiber: 2.9, calories: 20, carbs: 3.6, fat: 0.3 },
  'arugula': { protein: 2.6, fiber: 1.6, calories: 25, carbs: 3.7, fat: 0.7 },
  'corn': { protein: 3.3, fiber: 2.4, calories: 96, carbs: 21, fat: 1.5 },
  'corn kernels': { protein: 3.3, fiber: 2.4, calories: 96, carbs: 21, fat: 1.5 },
  'red onion': { protein: 1.1, fiber: 1.7, calories: 40, carbs: 9.3, fat: 0.1 },
  'onion': { protein: 1.1, fiber: 1.7, calories: 40, carbs: 9.3, fat: 0.1 },
  
  // Fruits & Fats
  'avocado': { protein: 2, fiber: 6.7, calories: 160, carbs: 8.5, fat: 14.7 },
  'olive oil': { protein: 0, fiber: 0, calories: 884, carbs: 0, fat: 100 },
  'coconut oil': { protein: 0, fiber: 0, calories: 862, carbs: 0, fat: 99.1 },
  'balsamic vinaigrette': { protein: 0.1, fiber: 0, calories: 88, carbs: 8.8, fat: 6.7 },
  'vinaigrette': { protein: 0.1, fiber: 0, calories: 449, carbs: 3.9, fat: 49.8 },
  'ranch dressing': { protein: 0.7, fiber: 0, calories: 431, carbs: 4.3, fat: 45.3 },
  'dill': { protein: 3.5, fiber: 2.1, calories: 43, carbs: 7, fat: 1.1 },
  'fresh dill': { protein: 3.5, fiber: 2.1, calories: 43, carbs: 7, fat: 1.1 },
  'nuts': { protein: 15, fiber: 8, calories: 550, carbs: 16, fat: 49 },
  'almonds': { protein: 21.2, fiber: 12.5, calories: 579, carbs: 21.6, fat: 49.9 },
  'walnuts': { protein: 15.2, fiber: 6.7, calories: 654, carbs: 13.7, fat: 65.2 },
  
  // Dairy & Alternatives
  'greek yogurt': { protein: 10, fiber: 0, calories: 59, carbs: 3.6, fat: 0.4 },
  'cottage cheese': { protein: 11, fiber: 0, calories: 98, carbs: 3.4, fat: 4.3 },
  'cheddar cheese': { protein: 25, fiber: 0, calories: 403, carbs: 3.1, fat: 33.3 },
  'mozzarella': { protein: 22.2, fiber: 0, calories: 300, carbs: 2.2, fat: 22.4 },
  
  // Herbs & Seasonings  
  'cilantro': { protein: 2.1, fiber: 2.8, calories: 23, carbs: 3.7, fat: 0.5 },
  'fresh cilantro': { protein: 2.1, fiber: 2.8, calories: 23, carbs: 3.7, fat: 0.5 },
  'parsley': { protein: 3, fiber: 3.3, calories: 36, carbs: 6.3, fat: 0.8 },
  'basil': { protein: 3.2, fiber: 1.6, calories: 22, carbs: 2.6, fat: 0.6 },
  'fresh basil': { protein: 3.2, fiber: 1.6, calories: 22, carbs: 2.6, fat: 0.6 },
  'oregano': { protein: 9, fiber: 42.5, calories: 265, carbs: 68.9, fat: 4.3 },
  'thyme': { protein: 5.6, fiber: 14, calories: 101, carbs: 24.5, fat: 1.7 },
  'rosemary': { protein: 3.3, fiber: 14.1, calories: 131, carbs: 20.7, fat: 5.9 },
  'dill': { protein: 3.5, fiber: 2.1, calories: 43, carbs: 7, fat: 1.1 },
  'mint': { protein: 3.8, fiber: 8, calories: 70, carbs: 14.9, fat: 0.9 },
  'lime juice': { protein: 0.4, fiber: 0.4, calories: 25, carbs: 8.4, fat: 0.2 },
  'lemon juice': { protein: 0.4, fiber: 0.3, calories: 22, carbs: 6.9, fat: 0.2 },
  'lime': { protein: 0.7, fiber: 2.8, calories: 30, carbs: 10.5, fat: 0.2 },
  'lemon': { protein: 1.1, fiber: 4.7, calories: 29, carbs: 9.3, fat: 0.3 },
  
  // More Vegetables (raw unless specified)
  'asparagus': { protein: 2.2, fiber: 2.1, calories: 20, carbs: 3.9, fat: 0.1 },
  'cooked asparagus': { protein: 2.4, fiber: 2.1, calories: 22, carbs: 4.1, fat: 0.2 },
  'green beans': { protein: 1.8, fiber: 2.7, calories: 31, carbs: 7, fat: 0.2 },
  'cooked green beans': { protein: 1.8, fiber: 2.7, calories: 31, carbs: 7, fat: 0.2 },
  'carrots': { protein: 0.9, fiber: 2.8, calories: 41, carbs: 9.6, fat: 0.2 },
  'baby carrots': { protein: 0.9, fiber: 2.8, calories: 41, carbs: 9.6, fat: 0.2 },
  'celery': { protein: 0.7, fiber: 1.6, calories: 14, carbs: 3, fat: 0.2 },
  'zucchini': { protein: 1.2, fiber: 1, calories: 17, carbs: 3.1, fat: 0.3 },
  'yellow squash': { protein: 1.2, fiber: 1.2, calories: 20, carbs: 4.3, fat: 0.2 },
  'eggplant': { protein: 1, fiber: 3, calories: 25, carbs: 6, fat: 0.2 },
  'mushrooms': { protein: 3.1, fiber: 1, calories: 22, carbs: 3.3, fat: 0.3 },
  'white mushrooms': { protein: 3.1, fiber: 1, calories: 22, carbs: 3.3, fat: 0.3 },
  'sauteed mushrooms': { protein: 3.9, fiber: 1.7, calories: 35, carbs: 5.3, fat: 0.6 },
  'portobello mushrooms': { protein: 2.1, fiber: 1.3, calories: 22, carbs: 3.9, fat: 0.4 },
  'shiitake mushrooms': { protein: 2.2, fiber: 2.5, calories: 34, carbs: 6.8, fat: 0.5 },
  'cauliflower': { protein: 1.9, fiber: 2, calories: 25, carbs: 5, fat: 0.3 },
  'steamed cauliflower': { protein: 2.3, fiber: 2.3, calories: 23, carbs: 4.1, fat: 0.5 },
  'brussels sprouts': { protein: 3.4, fiber: 3.8, calories: 43, carbs: 8.9, fat: 0.3 },
  'cabbage': { protein: 1.3, fiber: 2.5, calories: 25, carbs: 5.8, fat: 0.1 },
  'red cabbage': { protein: 1.4, fiber: 2.1, calories: 31, carbs: 7.4, fat: 0.2 },
  'radishes': { protein: 0.7, fiber: 1.6, calories: 16, carbs: 3.4, fat: 0.1 },
  'beets': { protein: 1.6, fiber: 2.8, calories: 43, carbs: 9.6, fat: 0.2 },
  'turnips': { protein: 0.9, fiber: 1.8, calories: 28, carbs: 6.4, fat: 0.1 },
  
  // More Leafy Greens
  'romaine lettuce': { protein: 1.2, fiber: 2.1, calories: 17, carbs: 3.3, fat: 0.3 },
  'iceberg lettuce': { protein: 0.9, fiber: 1.2, calories: 14, carbs: 3, fat: 0.1 },
  'butter lettuce': { protein: 1.4, fiber: 1.1, calories: 13, carbs: 2.2, fat: 0.2 },
  'swiss chard': { protein: 1.8, fiber: 1.6, calories: 19, carbs: 3.7, fat: 0.2 },
  'collard greens': { protein: 3, fiber: 4, calories: 32, carbs: 5.4, fat: 0.6 },
  'bok choy': { protein: 1.5, fiber: 1, calories: 13, carbs: 2.2, fat: 0.2 },
  'watercress': { protein: 2.3, fiber: 0.5, calories: 11, carbs: 1.3, fat: 0.1 },
  
  // More Proteins
  'cod': { protein: 18, fiber: 0, calories: 82, carbs: 0, fat: 0.7 },
  'halibut': { protein: 18.6, fiber: 0, calories: 91, carbs: 0, fat: 1.3 },
  'mahi mahi': { protein: 20.2, fiber: 0, calories: 85, carbs: 0, fat: 0.7 },
  'tilapia': { protein: 20.1, fiber: 0, calories: 96, carbs: 0, fat: 1.7 },
  'canned tuna': { protein: 29.1, fiber: 0, calories: 116, carbs: 0, fat: 0.8 },
  'lean beef': { protein: 22, fiber: 0, calories: 142, carbs: 0, fat: 4.9 },
  'ground beef 90/10': { protein: 22.3, fiber: 0, calories: 176, carbs: 0, fat: 8 },
  'pork tenderloin': { protein: 22.8, fiber: 0, calories: 143, carbs: 0, fat: 4.1 },
  'lamb': { protein: 20.3, fiber: 0, calories: 165, carbs: 0, fat: 7.4 },
  'duck breast': { protein: 18.3, fiber: 0, calories: 123, carbs: 0, fat: 4.2 },
  
  // More Seafood
  'crab': { protein: 18.1, fiber: 0, calories: 87, carbs: 0, fat: 1.1 },
  'lobster': { protein: 19, fiber: 0, calories: 89, carbs: 0.5, fat: 0.9 },
  'scallops': { protein: 17.9, fiber: 0, calories: 88, carbs: 4.7, fat: 0.8 },
  'mussels': { protein: 18, fiber: 0, calories: 86, carbs: 7.4, fat: 2.2 },
  'oysters': { protein: 9, fiber: 0, calories: 68, carbs: 4.9, fat: 2.5 },
  'clams': { protein: 15.5, fiber: 0, calories: 74, carbs: 2.6, fat: 1 },
  
  // More Grains & Starches
  'wild rice': { protein: 4, fiber: 1.8, calories: 101, carbs: 21.3, fat: 0.3 },
  'cooked wild rice': { protein: 4, fiber: 1.8, calories: 101, carbs: 21.3, fat: 0.3 },
  'white rice': { protein: 2.7, fiber: 0.4, calories: 130, carbs: 28, fat: 0.3 },
  'cooked white rice': { protein: 2.7, fiber: 0.4, calories: 130, carbs: 28, fat: 0.3 },
  'jasmine rice': { protein: 2.9, fiber: 0.4, calories: 129, carbs: 28.2, fat: 0.2 },
  'basmati rice': { protein: 2.7, fiber: 0.4, calories: 121, carbs: 25, fat: 0.4 },
  'barley': { protein: 12.5, fiber: 17.3, calories: 354, carbs: 73.5, fat: 2.3 }, // DRY
  'cooked barley': { protein: 2.3, fiber: 3.8, calories: 123, carbs: 28.2, fat: 0.4 },
  'bulgur': { protein: 12.3, fiber: 18.3, calories: 342, carbs: 75.9, fat: 1.3 }, // DRY
  'cooked bulgur': { protein: 3.1, fiber: 4.5, calories: 83, carbs: 18.6, fat: 0.2 },
  'farro': { protein: 15, fiber: 10.7, calories: 340, carbs: 67.1, fat: 2.5 }, // DRY
  'cooked farro': { protein: 5, fiber: 3.2, calories: 170, carbs: 34, fat: 1 },
  'millet': { protein: 11, fiber: 8.5, calories: 378, carbs: 73, fat: 4.2 }, // DRY
  'cooked millet': { protein: 3.5, fiber: 1.3, calories: 119, carbs: 23, fat: 1 },
  
  // Pasta & Noodles
  'whole wheat pasta': { protein: 13.4, fiber: 6.8, calories: 348, carbs: 71.2, fat: 2.5 }, // DRY
  'cooked whole wheat pasta': { protein: 5, fiber: 3.2, calories: 124, carbs: 25.1, fat: 0.5 },
  'regular pasta': { protein: 13, fiber: 2.5, calories: 371, carbs: 74.7, fat: 1.5 }, // DRY
  'cooked pasta': { protein: 5, fiber: 1.8, calories: 131, carbs: 25, fat: 1.1 },
  'soba noodles': { protein: 5.1, fiber: 1.2, calories: 99, carbs: 21.4, fat: 0.1 },
  'rice noodles': { protein: 0.9, fiber: 0.4, calories: 109, carbs: 25.2, fat: 0.2 },
  
  // More Legumes & Beans
  'pinto beans': { protein: 9.0, fiber: 9.0, calories: 143, carbs: 26.2, fat: 0.7 }, // COOKED
  'navy beans': { protein: 8.2, fiber: 6.3, calories: 140, carbs: 26.1, fat: 0.6 }, // COOKED
  'great northern beans': { protein: 8.3, fiber: 6.2, calories: 118, carbs: 21.1, fat: 0.5 }, // COOKED
  'cannellini beans': { protein: 8.9, fiber: 6.3, calories: 124, carbs: 22.7, fat: 0.5 }, // COOKED
  'lima beans': { protein: 7.8, fiber: 7.0, calories: 115, carbs: 20.9, fat: 0.4 }, // COOKED
  'garbanzo beans': { protein: 8.9, fiber: 8, calories: 164, carbs: 27.4, fat: 2.6 }, // COOKED (same as chickpeas)
  'edamame': { protein: 11.9, fiber: 5.2, calories: 121, carbs: 8.9, fat: 5.2 },
  'green peas': { protein: 5.4, fiber: 5.7, calories: 84, carbs: 14.5, fat: 0.4 },
  'split peas': { protein: 25.4, fiber: 8.3, calories: 341, carbs: 60.4, fat: 1.2 }, // DRY - usually cooked
  'cooked split peas': { protein: 8.3, fiber: 8.2, calories: 118, carbs: 21.1, fat: 0.8 },
  
  // More Nuts & Seeds
  'cashews': { protein: 18.2, fiber: 3.3, calories: 553, carbs: 30.2, fat: 43.9 },
  'pistachios': { protein: 20.2, fiber: 10.6, calories: 560, carbs: 27.2, fat: 45.3 },
  'pecans': { protein: 9.2, fiber: 9.6, calories: 691, carbs: 13.9, fat: 72 },
  'brazil nuts': { protein: 14.3, fiber: 7.5, calories: 659, carbs: 12.3, fat: 67.1 },
  'macadamia nuts': { protein: 7.9, fiber: 8.6, calories: 718, carbs: 13.8, fat: 75.8 },
  'pine nuts': { protein: 13.7, fiber: 3.7, calories: 673, carbs: 13.1, fat: 68.4 },
  'sunflower seeds': { protein: 20.8, fiber: 8.6, calories: 584, carbs: 20, fat: 51.5 },
  'pumpkin seeds': { protein: 19, fiber: 1.7, calories: 446, carbs: 54, fat: 19 },
  'chia seeds': { protein: 17, fiber: 34.4, calories: 486, carbs: 42.1, fat: 30.7 },
  'flax seeds': { protein: 18.3, fiber: 27.3, calories: 534, carbs: 28.9, fat: 42.2 },
  'hemp seeds': { protein: 31, fiber: 4, calories: 553, carbs: 8.7, fat: 48.8 },
  'sesame seeds': { protein: 17.7, fiber: 11.8, calories: 573, carbs: 23.4, fat: 49.7 },
  
  // More Fruits
  'berries': { protein: 0.7, fiber: 2.4, calories: 43, carbs: 11.9, fat: 0.3 },
  'strawberries': { protein: 0.7, fiber: 2, calories: 32, carbs: 7.7, fat: 0.3 },
  'blueberries': { protein: 0.7, fiber: 2.4, calories: 57, carbs: 14.5, fat: 0.3 },
  'raspberries': { protein: 1.2, fiber: 6.5, calories: 52, carbs: 11.9, fat: 0.7 },
  'blackberries': { protein: 1.4, fiber: 5.3, calories: 43, carbs: 9.6, fat: 0.5 },
  'banana': { protein: 1.1, fiber: 2.6, calories: 89, carbs: 22.8, fat: 0.3 },
  'apple': { protein: 0.3, fiber: 2.4, calories: 52, carbs: 13.8, fat: 0.2 },
  'orange': { protein: 0.9, fiber: 2.4, calories: 47, carbs: 11.8, fat: 0.1 },
  'grapefruit': { protein: 0.8, fiber: 1.6, calories: 42, carbs: 10.7, fat: 0.1 },
  'pear': { protein: 0.4, fiber: 3.1, calories: 57, carbs: 15.2, fat: 0.1 },
  'peach': { protein: 0.9, fiber: 1.5, calories: 39, carbs: 9.5, fat: 0.3 },
  'plum': { protein: 0.7, fiber: 1.4, calories: 46, carbs: 11.4, fat: 0.3 },
  'grapes': { protein: 0.6, fiber: 0.9, calories: 62, carbs: 16.3, fat: 0.2 },
  'pineapple': { protein: 0.5, fiber: 1.4, calories: 50, carbs: 13.1, fat: 0.1 },
  'mango': { protein: 0.8, fiber: 1.6, calories: 60, carbs: 15, fat: 0.4 },
  'kiwi': { protein: 1.1, fiber: 3, calories: 61, carbs: 14.7, fat: 0.5 },
  
  // Common cooking ingredients
  'garlic': { protein: 6.4, fiber: 2.1, calories: 149, carbs: 33, fat: 0.5 },
  'ginger': { protein: 1.8, fiber: 2, calories: 80, carbs: 17.8, fat: 0.8 },
  'onion powder': { protein: 10.4, fiber: 15.2, calories: 341, carbs: 79.1, fat: 1 },
  'garlic powder': { protein: 16.6, fiber: 9, calories: 331, carbs: 72.7, fat: 0.7 },
  'black pepper': { protein: 10.4, fiber: 25.3, calories: 251, carbs: 63.9, fat: 3.3 },
  'cayenne pepper': { protein: 12, fiber: 27.2, calories: 318, carbs: 56.6, fat: 17.3 },
  'turmeric': { protein: 7.8, fiber: 21, calories: 354, carbs: 64.9, fat: 9.9 },
  'cinnamon': { protein: 4, fiber: 53.1, calories: 247, carbs: 80.6, fat: 1.2 },
  'cumin': { protein: 17.8, fiber: 10.5, calories: 375, carbs: 44.2, fat: 22.3 },
  'chili powder': { protein: 13.5, fiber: 34.8, calories: 282, carbs: 49.7, fat: 14.3 },
  'paprika': { protein: 14.1, fiber: 37.4, calories: 282, carbs: 53.9, fat: 12.9 },
  'salt': { protein: 0, fiber: 0, calories: 0, carbs: 0, fat: 0 },
  'sea salt': { protein: 0, fiber: 0, calories: 0, carbs: 0, fat: 0 },
  
  // Additional Whole Grains & Ancient Grains
  'steel cut oats': { protein: 10.8, fiber: 8.2, calories: 379, carbs: 67.7, fat: 6.5 },
  'rolled oats': { protein: 13.2, fiber: 10.1, calories: 379, carbs: 67.7, fat: 6.5 },
  'quick oats': { protein: 13.2, fiber: 10.1, calories: 379, carbs: 67.7, fat: 6.5 },
  'instant oats': { protein: 11.7, fiber: 9.4, calories: 379, carbs: 70.1, fat: 6.2 },
  'amaranth': { protein: 13.6, fiber: 6.7, calories: 371, carbs: 65.3, fat: 7 },
  'buckwheat': { protein: 13.3, fiber: 10, calories: 343, carbs: 71.5, fat: 3.4 },
  'cooked buckwheat': { protein: 3.4, fiber: 2.7, calories: 92, carbs: 19.9, fat: 0.6 },
  'spelt': { protein: 14.6, fiber: 10.7, calories: 338, carbs: 70.2, fat: 2.4 },
  'cooked spelt': { protein: 5.5, fiber: 3.9, calories: 127, carbs: 26.4, fat: 0.9 },
  'wheat berries': { protein: 15.4, fiber: 12.2, calories: 329, carbs: 71.2, fat: 2.5 },
  'freekeh': { protein: 14.7, fiber: 13.3, calories: 325, carbs: 72.1, fat: 2.3 },
  'kamut': { protein: 11.1, fiber: 11.3, calories: 337, carbs: 70.4, fat: 2.1 },
  
  // More Rice Varieties
  'black rice': { protein: 8.9, fiber: 4.9, calories: 356, carbs: 75.6, fat: 3.2 },
  'cooked black rice': { protein: 3.5, fiber: 1.8, calories: 160, carbs: 34.2, fat: 1.6 },
  'red rice': { protein: 7.9, fiber: 2.3, calories: 405, carbs: 86.2, fat: 2.3 },
  'cooked red rice': { protein: 2.3, fiber: 0.8, calories: 123, carbs: 25.8, fat: 0.7 },
  'forbidden rice': { protein: 8.9, fiber: 4.9, calories: 356, carbs: 75.6, fat: 3.2 },
  
  // Additional Proteins - Plant Based
  'tempeh': { protein: 19, fiber: 9, calories: 192, carbs: 9.4, fat: 11 },
  'seitan': { protein: 75, fiber: 5.8, calories: 370, carbs: 14, fat: 1.9 },
  'hemp protein powder': { protein: 50, fiber: 18, calories: 390, carbs: 8, fat: 11 },
  'pea protein powder': { protein: 80, fiber: 7, calories: 380, carbs: 7, fat: 3 },
  'nutritional yeast': { protein: 45, fiber: 27, calories: 325, carbs: 36, fat: 5 },
  
  // More Animal Proteins
  'chicken wings': { protein: 23.6, fiber: 0, calories: 203, carbs: 0, fat: 12.8 },
  'chicken drumsticks': { protein: 23.6, fiber: 0, calories: 172, carbs: 0, fat: 8.4 },
  'turkey breast': { protein: 29.9, fiber: 0, calories: 135, carbs: 0, fat: 1 },
  'ground chicken': { protein: 20.9, fiber: 0, calories: 143, carbs: 0, fat: 5.6 },
  'ground pork': { protein: 25.7, fiber: 0, calories: 263, carbs: 0, fat: 18.3 },
  'pork chops': { protein: 25.4, fiber: 0, calories: 231, carbs: 0, fat: 14.8 },
  'bacon': { protein: 37, fiber: 0, calories: 541, carbs: 1.4, fat: 42 },
  'canadian bacon': { protein: 20.2, fiber: 0, calories: 147, carbs: 1.3, fat: 6.2 },
  'ham': { protein: 22.9, fiber: 0, calories: 145, carbs: 0.6, fat: 5.5 },
  'prosciutto': { protein: 25.8, fiber: 0, calories: 217, carbs: 0, fat: 12.1 },
  'venison': { protein: 22.5, fiber: 0, calories: 120, carbs: 0, fat: 2.4 },
  'bison': { protein: 28.4, fiber: 0, calories: 146, carbs: 0, fat: 2.4 },
  
  // More Fish & Seafood
  'sardines': { protein: 24.6, fiber: 0, calories: 208, carbs: 0, fat: 11.5 },
  'anchovies': { protein: 20.4, fiber: 0, calories: 131, carbs: 0, fat: 4.8 },
  'mackerel': { protein: 18.6, fiber: 0, calories: 205, carbs: 0, fat: 13.9 },
  'sea bass': { protein: 18.4, fiber: 0, calories: 97, carbs: 0, fat: 2 },
  'sole': { protein: 16.8, fiber: 0, calories: 70, carbs: 0, fat: 0.9 },
  'flounder': { protein: 18.8, fiber: 0, calories: 86, carbs: 0, fat: 1.2 },
  'snapper': { protein: 22.4, fiber: 0, calories: 100, carbs: 0, fat: 1.3 },
  'trout': { protein: 20.8, fiber: 0, calories: 148, carbs: 0, fat: 6.6 },
  'catfish': { protein: 16.4, fiber: 0, calories: 105, carbs: 0, fat: 2.9 },
  'pollock': { protein: 19.4, fiber: 0, calories: 92, carbs: 0, fat: 1 },
  
  // More Dairy & Alternatives
  'whole milk': { protein: 3.2, fiber: 0, calories: 61, carbs: 4.8, fat: 3.3 },
  '2% milk': { protein: 3.3, fiber: 0, calories: 50, carbs: 4.9, fat: 2 },
  '1% milk': { protein: 3.4, fiber: 0, calories: 42, carbs: 5, fat: 1 },
  'skim milk': { protein: 3.4, fiber: 0, calories: 34, carbs: 5, fat: 0.2 },
  'buttermilk': { protein: 3.3, fiber: 0, calories: 40, carbs: 4.8, fat: 0.9 },
  'heavy cream': { protein: 2.1, fiber: 0, calories: 345, carbs: 2.8, fat: 37 },
  'half and half': { protein: 3.2, fiber: 0, calories: 131, carbs: 4.3, fat: 11.5 },
  'sour cream': { protein: 2.4, fiber: 0, calories: 193, carbs: 4.6, fat: 19.4 },
  'cream cheese': { protein: 5.9, fiber: 0, calories: 342, carbs: 4.1, fat: 34.2 },
  'ricotta cheese': { protein: 11.4, fiber: 0, calories: 174, carbs: 3.2, fat: 13 },
  'feta cheese': { protein: 14.2, fiber: 0, calories: 264, carbs: 4.1, fat: 21.3 },
  'goat cheese': { protein: 18.5, fiber: 0, calories: 364, carbs: 2.5, fat: 29.8 },
  'parmesan cheese': { protein: 35.8, fiber: 0, calories: 431, carbs: 4.1, fat: 28.6 },
  'swiss cheese': { protein: 26.9, fiber: 0, calories: 380, carbs: 5.4, fat: 27.8 },
  'provolone cheese': { protein: 25.6, fiber: 0, calories: 351, carbs: 2.1, fat: 26.6 },
  'brie cheese': { protein: 20.8, fiber: 0, calories: 334, carbs: 0.5, fat: 27.7 },
  'camembert cheese': { protein: 19.8, fiber: 0, calories: 300, carbs: 0.5, fat: 24.3 },
  
  // Dairy Alternatives
  'almond milk': { protein: 0.6, fiber: 0.7, calories: 17, carbs: 1.5, fat: 1.2 },
  'oat milk': { protein: 1, fiber: 1.4, calories: 47, carbs: 7.6, fat: 1.5 },
  'soy milk': { protein: 2.9, fiber: 0.4, calories: 33, carbs: 1.8, fat: 1.6 },
  'coconut milk': { protein: 2.3, fiber: 2.2, calories: 230, carbs: 5.5, fat: 23.8 },
  'cashew milk': { protein: 0.5, fiber: 0.1, calories: 25, carbs: 1, fat: 2 },
  'rice milk': { protein: 0.3, fiber: 0.3, calories: 47, carbs: 9.2, fat: 1 },
  
  // More Vegetables - Cruciferous
  'kohlrabi': { protein: 1.7, fiber: 3.6, calories: 27, carbs: 6.2, fat: 0.1 },
  'rutabaga': { protein: 1.2, fiber: 2.3, calories: 38, carbs: 8.7, fat: 0.2 },
  'daikon radish': { protein: 0.6, fiber: 1.6, calories: 18, carbs: 4.1, fat: 0.1 },
  'fennel': { protein: 1.2, fiber: 3.1, calories: 31, carbs: 7.3, fat: 0.2 },
  'leeks': { protein: 1.5, fiber: 1.8, calories: 61, carbs: 14.2, fat: 0.3 },
  'artichokes': { protein: 3.3, fiber: 8.6, calories: 47, carbs: 10.5, fat: 0.2 },
  'artichoke hearts': { protein: 2.9, fiber: 5.4, calories: 22, carbs: 5.1, fat: 0.1 },
  
  // Root Vegetables
  'parsnips': { protein: 1.2, fiber: 4.9, calories: 75, carbs: 18, fat: 0.3 },
  'jicama': { protein: 0.7, fiber: 4.9, calories: 38, carbs: 8.8, fat: 0.1 },
  'water chestnuts': { protein: 1, fiber: 3, calories: 97, carbs: 23.9, fat: 0.1 },
  'lotus root': { protein: 2.6, fiber: 4.9, calories: 74, carbs: 17.2, fat: 0.1 },
  
  // Squash Varieties
  'butternut squash': { protein: 1, fiber: 2, calories: 45, carbs: 11.7, fat: 0.1 },
  'acorn squash': { protein: 0.9, fiber: 1.5, calories: 40, carbs: 10.4, fat: 0.1 },
  'delicata squash': { protein: 1.8, fiber: 2, calories: 40, carbs: 11, fat: 0.1 },
  'kabocha squash': { protein: 1.6, fiber: 1.2, calories: 34, carbs: 8.4, fat: 0.1 },
  'spaghetti squash': { protein: 0.6, fiber: 1.5, calories: 31, carbs: 7, fat: 0.6 },
  'pumpkin': { protein: 1.8, fiber: 0.5, calories: 26, carbs: 6.5, fat: 0.1 },
  
  // More Fruits - Tropical & Others
  'papaya': { protein: 0.5, fiber: 1.7, calories: 43, carbs: 10.8, fat: 0.3 },
  'passion fruit': { protein: 2.2, fiber: 10.4, calories: 97, carbs: 23, fat: 0.7 },
  'guava': { protein: 2.6, fiber: 5.4, calories: 68, carbs: 14.3, fat: 1 },
  'dragon fruit': { protein: 1.2, fiber: 3, calories: 60, carbs: 13, fat: 0.4 },
  'star fruit': { protein: 1, fiber: 2.8, calories: 31, carbs: 6.7, fat: 0.3 },
  'lychee': { protein: 0.8, fiber: 1.3, calories: 66, carbs: 16.5, fat: 0.4 },
  'pomegranate': { protein: 1.7, fiber: 4, calories: 83, carbs: 18.7, fat: 1.2 },
  'cranberries': { protein: 0.4, fiber: 4.6, calories: 46, carbs: 12.2, fat: 0.1 },
  'dried cranberries': { protein: 0.1, fiber: 1.4, calories: 308, carbs: 82.4, fat: 1.1 },
  'cherries': { protein: 1.1, fiber: 2.1, calories: 63, carbs: 16, fat: 0.2 },
  'apricots': { protein: 1.4, fiber: 2, calories: 48, carbs: 11.1, fat: 0.4 },
  'figs': { protein: 0.8, fiber: 2.9, calories: 74, carbs: 19.2, fat: 0.3 },
  'dates': { protein: 1.8, fiber: 6.7, calories: 277, carbs: 75, fat: 0.2 },
  'raisins': { protein: 3.1, fiber: 3.7, calories: 299, carbs: 79.2, fat: 0.5 },
  
  // Melons
  'cantaloupe': { protein: 0.8, fiber: 0.9, calories: 34, carbs: 8.2, fat: 0.2 },
  'honeydew': { protein: 0.5, fiber: 0.8, calories: 36, carbs: 9.1, fat: 0.1 },
  'watermelon': { protein: 0.6, fiber: 0.4, calories: 30, carbs: 7.6, fat: 0.2 },
  
  // Stone Fruits
  'nectarines': { protein: 1.1, fiber: 1.7, calories: 44, carbs: 10.6, fat: 0.3 },
  'persimmons': { protein: 0.6, fiber: 3.6, calories: 70, carbs: 18.6, fat: 0.2 },
  
  // More Legumes
  'adzuki beans': { protein: 7.5, fiber: 7.3, calories: 128, carbs: 25, fat: 0.2 }, // COOKED
  'mung beans': { protein: 8.2, fiber: 8.5, calories: 105, carbs: 19.2, fat: 0.4 }, // COOKED
  'fava beans': { protein: 7.6, fiber: 5.4, calories: 110, carbs: 19.7, fat: 0.4 }, // COOKED
  'black eyed peas': { protein: 8.0, fiber: 6.0, calories: 116, carbs: 20.8, fat: 0.5 }, // COOKED
  'red beans': { protein: 8.2, fiber: 6.9, calories: 127, carbs: 22.8, fat: 0.5 }, // COOKED
  'white beans': { protein: 8.9, fiber: 6.3, calories: 124, carbs: 22.7, fat: 0.5 }, // COOKED
  
  // Specialty Items
  'spirulina': { protein: 57.5, fiber: 3.6, calories: 290, carbs: 23.9, fat: 7.7 },
  'chlorella': { protein: 58.4, fiber: 0.3, calories: 336, carbs: 14.8, fat: 11.4 },
  'wheat grass powder': { protein: 15, fiber: 40, calories: 198, carbs: 42, fat: 1.5 }
};

// Food-specific volume conversions (in grams)
export const FOOD_SPECIFIC_CONVERSIONS: Record<string, Record<string, number>> = {
  // Leafy greens (very light)
  'mixed greens': { 'cup': 47, 'cups': 47 },
  'spinach': { 'cup': 30, 'cups': 30 },
  'kale': { 'cup': 20, 'cups': 20 },
  'arugula': { 'cup': 25, 'cups': 25 },
  'romaine lettuce': { 'cup': 40, 'cups': 40 },
  'iceberg lettuce': { 'cup': 35, 'cups': 35 },
  'butter lettuce': { 'cup': 25, 'cups': 25 },
  
  // Cooked grains (dense)
  'cooked oatmeal': { 'cup': 234, 'cups': 234 },
  'cooked quinoa': { 'cup': 185, 'cups': 185 },
  'cooked brown rice': { 'cup': 195, 'cups': 195 },
  'cooked white rice': { 'cup': 185, 'cups': 185 },
  'cooked wild rice': { 'cup': 165, 'cups': 165 },
  'cooked barley': { 'cup': 157, 'cups': 157 },
  'cooked bulgur': { 'cup': 182, 'cups': 182 },
  'cooked farro': { 'cup': 194, 'cups': 194 },
  'cooked millet': { 'cup': 174, 'cups': 174 },
  
  // Cooked beans (medium density)
  'black beans': { 'cup': 180, 'cups': 180 },
  'chickpeas': { 'cup': 165, 'cups': 165 },
  'kidney beans': { 'cup': 175, 'cups': 175 },
  'lentils': { 'cup': 200, 'cups': 200 },
  'cooked lentils': { 'cup': 200, 'cups': 200 },
  'pinto beans': { 'cup': 180, 'cups': 180 },
  'navy beans': { 'cup': 175, 'cups': 175 },
  'lima beans': { 'cup': 170, 'cups': 170 },
  'white beans': { 'cup': 175, 'cups': 175 },
  'cannellini beans': { 'cup': 175, 'cups': 175 },
  'garbanzo beans': { 'cup': 165, 'cups': 165 },
  'cooked split peas': { 'cup': 196, 'cups': 196 },
  
  // Nuts and seeds (variable)
  'almonds': { 'cup': 140, 'cups': 140 },
  'walnuts': { 'cup': 120, 'cups': 120 },
  'cashews': { 'cup': 135, 'cups': 135 },
  
  // Chopped vegetables (raw)
  'bell pepper': { 'cup': 150, 'cups': 150 },
  'red bell pepper': { 'cup': 150, 'cups': 150 },
  'onion': { 'cup': 160, 'cups': 160 },
  'red onion': { 'cup': 160, 'cups': 160 },
  'tomato': { 'cup': 180, 'cups': 180 },
  'cherry tomatoes': { 'cup': 150, 'cups': 150 },
  'cucumber': { 'cup': 120, 'cups': 120 },
  'carrots': { 'cup': 130, 'cups': 130 },
  'baby carrots': { 'cup': 130, 'cups': 130 },
  'celery': { 'cup': 110, 'cups': 110 },
  
  // Cooked vegetables (much denser when cooked)
  'cooked spinach': { 'cup': 180, 'cups': 180 },
  'steamed broccoli': { 'cup': 156, 'cups': 156 },
  'steamed kale': { 'cup': 130, 'cups': 130 },
  'cooked asparagus': { 'cup': 180, 'cups': 180 },
  'steamed cauliflower': { 'cup': 125, 'cups': 125 },
  'cooked green beans': { 'cup': 135, 'cups': 135 },
  'sauteed mushrooms': { 'cup': 70, 'cups': 70 },
  
  // Herbs and spices (tiny portions)
  'oregano': { 'tsp': 1, 'teaspoon': 1, 'tbsp': 3, 'tablespoon': 3 },
  'thyme': { 'tsp': 1, 'teaspoon': 1, 'tbsp': 3, 'tablespoon': 3 },
  'rosemary': { 'tsp': 1, 'teaspoon': 1, 'tbsp': 3, 'tablespoon': 3 },
  'basil': { 'tsp': 0.5, 'teaspoon': 0.5, 'tbsp': 1.5, 'tablespoon': 1.5 },
  'fresh basil': { 'tsp': 0.5, 'teaspoon': 0.5, 'tbsp': 1.5, 'tablespoon': 1.5 },
  'cilantro': { 'tsp': 0.5, 'teaspoon': 0.5, 'tbsp': 1.5, 'tablespoon': 1.5 },
  'fresh cilantro': { 'tsp': 0.5, 'teaspoon': 0.5, 'tbsp': 1.5, 'tablespoon': 1.5 },
  'parsley': { 'tsp': 0.5, 'teaspoon': 0.5, 'tbsp': 1.5, 'tablespoon': 1.5 },
  'dill': { 'tsp': 0.5, 'teaspoon': 0.5, 'tbsp': 1.5, 'tablespoon': 1.5 },
  'mint': { 'tsp': 0.5, 'teaspoon': 0.5, 'tbsp': 1.5, 'tablespoon': 1.5 },
  'cinnamon': { 'tsp': 2, 'teaspoon': 2, 'tbsp': 6, 'tablespoon': 6 },
  'cumin': { 'tsp': 2, 'teaspoon': 2, 'tbsp': 6, 'tablespoon': 6 },
  'paprika': { 'tsp': 2, 'teaspoon': 2, 'tbsp': 6, 'tablespoon': 6 },
  'chili powder': { 'tsp': 3, 'teaspoon': 3, 'tbsp': 9, 'tablespoon': 9 },
  'turmeric': { 'tsp': 3, 'teaspoon': 3, 'tbsp': 9, 'tablespoon': 9 },
  'black pepper': { 'tsp': 2, 'teaspoon': 2, 'tbsp': 6, 'tablespoon': 6 },
  'cayenne pepper': { 'tsp': 2, 'teaspoon': 2, 'tbsp': 6, 'tablespoon': 6 },
  'garlic powder': { 'tsp': 3, 'teaspoon': 3, 'tbsp': 9, 'tablespoon': 9 },
  'onion powder': { 'tsp': 3, 'teaspoon': 3, 'tbsp': 9, 'tablespoon': 9 },
  
  // Diced proteins (with oz conversions)
  'chicken breast': { 'cup': 140, 'cups': 140, 'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35 },
  'cooked chicken': { 'cup': 140, 'cups': 140, 'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35 },
  'cooked shrimp': { 'cup': 110, 'cups': 110, 'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35 },
  'salmon': { 'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35, 'cup': 145, 'cups': 145 },
  'cooked salmon': { 'cup': 145, 'cups': 145, 'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35 },
  'cooked tuna': { 'cup': 145, 'cups': 145, 'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35 },
  'tuna': { 'oz': 28.35, 'ounce': 28.35, 'ounces': 28.35, 'cup': 145, 'cups': 145 },
  'diced tofu': { 'cup': 120, 'cups': 120 },
  'crumbled tofu': { 'cup': 90, 'cups': 90 },
  
  // Pasta (very different dry vs cooked)
  'cooked pasta': { 'cup': 125, 'cups': 125 },
  'cooked whole wheat pasta': { 'cup': 125, 'cups': 125 },
  'cooked soba noodles': { 'cup': 95, 'cups': 95 },
  'cooked rice noodles': { 'cup': 85, 'cups': 85 },
  
  // Seeds (tiny portions)
  'chia seeds': { 'tbsp': 12, 'tablespoon': 12, 'tsp': 4, 'teaspoon': 4 },
  'flax seeds': { 'tbsp': 10, 'tablespoon': 10, 'tsp': 3.3, 'teaspoon': 3.3 },
  'hemp seeds': { 'tbsp': 10, 'tablespoon': 10, 'tsp': 3.3, 'teaspoon': 3.3 },
  'sesame seeds': { 'tbsp': 9, 'tablespoon': 9, 'tsp': 3, 'teaspoon': 3 },
  
  // Different nut preparations
  'chopped almonds': { 'cup': 95, 'cups': 95 },
  'sliced almonds': { 'cup': 70, 'cups': 70 },
  'chopped walnuts': { 'cup': 100, 'cups': 100 },
  'pine nuts': { 'cup': 135, 'cups': 135 },
  'sunflower seeds': { 'cup': 140, 'cups': 140 },
  'pumpkin seeds': { 'cup': 130, 'cups': 130 }
};

// Default unit conversions (fallback)
export const UNIT_CONVERSIONS: Record<string, number> = {
  // Weight conversions to grams
  'g': 1,
  'gram': 1,
  'grams': 1,
  'kg': 1000,
  'oz': 28.35,
  'ounce': 28.35,
  'ounces': 28.35,
  'lb': 453.59,
  'pound': 453.59,
  'pounds': 453.59,
  
  // Volume conversions (generic - use FOOD_SPECIFIC_CONVERSIONS when possible)
  'cup': 180,  // Reduced from 240 for better average
  'cups': 180,
  'tbsp': 15,
  'tablespoon': 15,
  'tablespoons': 15,
  'tsp': 5,
  'teaspoon': 5,
  'teaspoons': 5,
  'ml': 1,
  'milliliter': 1,
  'milliliters': 1,
  'l': 1000,
  'liter': 1000,
  'liters': 1000,
  
  // Count-based (rough estimates)
  'medium': 150,  // medium fruit/vegetable
  'large': 200,
  'small': 100,
  'serving': 100,
  'servings': 100,
  'piece': 100,
  'pieces': 100
};

export function findClosestMatch(ingredientName: string): string | null {
  const name = ingredientName.toLowerCase().trim();
  
  // Direct match
  if (COMMON_NUTRITION_DATA[name]) {
    return name;
  }
  
  // Split the ingredient name into words for better matching
  const nameWords = name.split(/\s+/);
  const knownFoods = Object.keys(COMMON_NUTRITION_DATA);
  
  // First, try to find exact food item matches within the ingredient name
  for (const food of knownFoods) {
    const foodWords = food.split(/\s+/);
    // Check if all words in the known food are present in the ingredient name
    if (foodWords.every(word => nameWords.some(nameWord => nameWord.includes(word)))) {
      return food;
    }
  }
  
  // Second pass: check if ingredient name contains the known food as substring
  for (const food of knownFoods) {
    if (name.includes(food)) {
      return food;
    }
  }
  
  // Third pass: check individual key words
  const keyIngredients = ['salmon', 'chicken', 'turkey', 'beef', 'pork', 'shrimp', 'tuna', 'egg', 'tofu', 
                          'quinoa', 'rice', 'beans', 'lentils', 'spinach', 'kale', 'broccoli'];
  
  for (const key of keyIngredients) {
    if (nameWords.some(word => word.includes(key))) {
      // Find the best match for this key ingredient
      for (const food of knownFoods) {
        if (food.includes(key)) {
          // Prefer cooked versions when applicable
          if (name.includes('cooked') && food.includes('cooked')) {
            return food;
          } else if (!name.includes('cooked') && !food.includes('cooked')) {
            return food;
          }
        }
      }
      // If no perfect match, return any match with the key
      for (const food of knownFoods) {
        if (food.includes(key)) {
          return food;
        }
      }
    }
  }
  
  // Check for common variations (prioritize cooked over dry)
  const variations: Record<string, string> = {
    'chicken': 'chicken breast',
    'turkey': 'ground turkey', 
    'fish': 'tuna',
    'beans': 'black beans', // Already points to cooked
    'lettuce': 'mixed greens',
    'tomatoes': 'tomato',
    'peppers': 'bell pepper',
    'oil': 'olive oil',
    'cheese': 'cheddar cheese',
    'yogurt': 'greek yogurt',
    
    // Critical: Default to cooked versions
    'oats': 'cooked oatmeal',
    'oatmeal': 'cooked oatmeal',
    'rice': 'cooked brown rice',
    'brown rice': 'cooked brown rice', 
    'white rice': 'cooked white rice',
    'barley': 'cooked barley',
    'bulgur': 'cooked bulgur',
    'farro': 'cooked farro',
    'millet': 'cooked millet',
    'pasta': 'cooked pasta',
    'whole wheat pasta': 'cooked whole wheat pasta',
    'quinoa': 'cooked quinoa',
    'lentils': 'cooked lentils',
    'split peas': 'cooked split peas',
    'garbanzo beans': 'garbanzo beans' // Already points to cooked
  };
  
  for (const [variant, canonical] of Object.entries(variations)) {
    if (name.includes(variant)) {
      return canonical;
    }
  }
  
  return null;
}

export function convertToGrams(amount: number, unit: string, foodName?: string): number {
  const unitLower = unit.toLowerCase().trim();
  
  // Check for food-specific conversions first
  if (foodName) {
    const foodKey = findClosestMatch(foodName.toLowerCase());
    if (foodKey && FOOD_SPECIFIC_CONVERSIONS[foodKey]?.[unitLower]) {
      return amount * FOOD_SPECIFIC_CONVERSIONS[foodKey][unitLower];
    }
  }
  
  // Fall back to generic conversions
  return amount * (UNIT_CONVERSIONS[unitLower] || 100); // Default 100g if unknown unit
}