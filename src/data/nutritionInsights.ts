export interface NutritionInsight {
  id: string;
  title: string;
  icon: string;
  category: 'protein' | 'fiber' | 'hydration' | 'mindfulness' | 'nutrition' | 'lowGI' | 'sideEffects' | 'lowAppetite' | 'alcohol' | 'supplements';
  content: string;
  bulletPoints?: string[];
  relatedTips?: string[];
  priority: number; // For contextual suggestions
}

export const nutritionInsights: NutritionInsight[] = [
  {
    id: 'protein-essentials',
    title: 'Building Strength with Protein',
    icon: '💪',
    category: 'protein',
    content: "Protein becomes your priority on GLP-1 medications - it's essential for preserving lean muscle mass, which drives your metabolism and helps you maintain weight loss long-term. When appetite is reduced, getting protein first at each meal ensures you don't develop deficiency, which can lead to fatigue, weakness, and more serious health challenges. Aim for 15-30g per meal as a baseline - even 10-15g when you're struggling to eat is better than none. Protein helps maintain muscle during weight loss and keeps blood sugar stable. When whole foods feel challenging, protein supplements become valuable tools - powder in smoothies, ready-to-drink shakes, or protein bars can help bridge the gap.",
    priority: 1
  },
  {
    id: 'fiber-fullness',
    title: 'Fiber: Your Satiety Sidekick',
    icon: '🌾',
    category: 'fiber',
    content: "Fiber supports digestion and helps prevent constipation - a common GLP-1 side effect. But start slowly! If you're not used to fiber, adding too much too quickly can worsen nausea or bloating. Begin with 5-10g extra daily from gentle sources like oats or berries, then gradually increase as your gut adjusts alongside your medication. Fiber also supports heart health, helps manage cholesterol, and keeps blood sugar stable - all important benefits as your body changes.",
    bulletPoints: [
      'Avocado (1/2): ~7g',
      'Chia seeds (1oz): ~10g',
      'Broccoli (1 cup): ~5g',
      'Oats (1/2 cup cooked): ~4g',
      'Berries (1 cup): ~4-8g'
    ],
    priority: 2
  },
  {
    id: 'hydration-timing',
    title: 'Staying Hydrated and Basic Structure',
    icon: '💧',
    category: 'hydration',
    content: "Consistent hydration and helpful eating patterns become even more important on GLP-1s. Dehydration can worsen nausea and fatigue, so sip water throughout the day rather than chugging large amounts. Room temperature often feels better than ice cold. For eating structure, aim for 3 small meals plus 1-2 snacks daily - this prevents 'primal hunger' that can lead to rushed, impulsive food choices. Set gentle reminders; you're feeding your body's needs, not waiting for hunger that may not come.",
    priority: 3
  },
  {
    id: 'hunger-fullness',
    title: 'Tuning into Your Body\'s Signals',
    icon: '🎯',
    category: 'mindfulness',
    content: "GLP-1s can make hunger signals feel completely different - many patients describe the 'food noise' going quiet. This is normal! Learn your new fullness cues: mild stomach discomfort, feeling satisfied rather than stuffed, or losing interest in food mid-bite. Stop eating when you notice these signals, even if your plate isn't empty. Your hunger cues may be dramatically reduced, so don't rely solely on them to guide your eating schedule.",
    priority: 4
  },
  {
    id: 'nutritional-intake',
    title: 'Nourishing Yourself Fully',
    icon: '🌈',
    category: 'nutrition',
    content: "When you're eating less overall, every bite counts more. Focus on nutrient-dense foods that deliver maximum nutrition per calorie - think colorful vegetables, lean proteins, and whole grains. These foods support not just weight management, but heart health, blood pressure, and energy levels. Many patients find they naturally crave more nutritious foods on GLP-1s. If you're struggling with very low appetite, liquid nutrition like smoothies or soups can help bridge nutritional gaps when solid food feels overwhelming.",
    priority: 5
  },
  {
    id: 'low-gi-foods',
    title: 'Low GI Foods for Balance',
    icon: '⚖️',
    category: 'lowGI',
    content: "Low glycemic foods work beautifully with GLP-1 medications to keep blood sugar steady and support heart health. These foods - like quinoa, leafy greens, beans, and nuts - release energy slowly, helping prevent the blood sugar spikes that can affect mood and energy. They also support healthy cholesterol levels and blood pressure. When your appetite is reduced, these stable-energy foods help you feel satisfied longer and avoid the energy crashes that can trigger cravings for quick-fix foods.",
    bulletPoints: [
      'Whole grains like quinoa',
      'Vegetables like leafy greens',
      'Nuts and seeds',
      'Beans and legumes'
    ],
    priority: 6
  },
  {
    id: 'side-effects-management',
    title: 'Navigating Side Effects',
    icon: '🛡️',
    category: 'sideEffects',
    content: "Common GLP-1 side effects like nausea or bloating can often be managed with thoughtful food choices. High-fat, fried foods, alcohol, or large portions frequently trigger symptoms. Instead, try smaller, more frequent meals with easily digestible options like grilled proteins, steamed vegetables, or toast. Cold foods often feel better than hot when nausea strikes. Temperature and timing matter - stay well-hydrated before your injection and avoid eating large meals close to injection time.",
    priority: 7
  },
  {
    id: 'low-appetite-management',
    title: 'Managing Severely Low Appetite',
    icon: '🍽️',
    category: 'lowAppetite',
    content: "Some days, food might feel completely unappealing - this is common, especially in your first few weeks. When solid food feels impossible, focus on liquid nutrition: protein smoothies, bone broths, or nutritional drinks. Protein supplements mixed into beverages can help you meet basic nutritional needs when eating feels like a chore. Small, frequent sips work better than forcing full portions. If this persists, consider whether your dose needs adjusting with your healthcare provider. Remember, your appetite will likely return, but don't let your body run on empty.",
    priority: 8
  },
  {
    id: 'alcohol-glp1',
    title: 'Alcohol and GLP-1s',
    icon: '🥂',
    category: 'alcohol',
    content: "Alcohol affects you differently on GLP-1 medications due to slower gastric emptying - you may feel effects more quickly and intensely. Alcohol can also worsen nausea and cause unpredictable blood sugar changes. If you choose to drink, do so with food, stay well-hydrated, and monitor how you feel. Many patients find they naturally lose interest in alcohol as their relationship with food and beverages evolves. Start with less than your usual amount and see how your body responds.",
    priority: 9
  },
  {
    id: 'protein-supplements',
    title: 'Protein Supplements as Your Backup Plan',
    icon: '🥤',
    category: 'supplements',
    content: "When whole food protein feels impossible, supplements become essential tools, not luxuries. Look for options with 15-25g protein per serving and minimal additives. Powder blends into smoothies, yogurt, or even just water when nothing else appeals. Ready-to-drink shakes work for grab-and-go moments. Protein bars can feel more like food when that's what you're craving. The goal isn't perfection - it's keeping your body nourished when regular eating feels overwhelming.",
    priority: 10
  }
];

// Helper function to get insights by category
export function getInsightsByCategory(category: NutritionInsight['category']): NutritionInsight[] {
  return nutritionInsights.filter(insight => insight.category === category);
}

// Helper function to get priority insights for contextual suggestions
export function getPriorityInsights(count: number = 3): NutritionInsight[] {
  return nutritionInsights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, count);
}

// Helper function to get insight by ID
export function getInsightById(id: string): NutritionInsight | undefined {
  return nutritionInsights.find(insight => insight.id === id);
}