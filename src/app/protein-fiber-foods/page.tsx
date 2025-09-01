'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserProfile } from '../../hooks/useUserProfile';

interface FoodItem {
  name: string;
  protein: number; // grams per serving
  fiber: number; // grams per serving
  serving: string;
  category: string;
  notes?: string;
}

const HIGH_PROTEIN_FIBER_FOODS: FoodItem[] = [
  // Plant-Based Proteins
  { name: 'Lentils (cooked)', protein: 18, fiber: 15, serving: '1 cup', category: 'Legumes', notes: 'Complete protein when paired with grains' },
  { name: 'Chickpeas (cooked)', protein: 15, fiber: 12, serving: '1 cup', category: 'Legumes' },
  { name: 'Black Beans (cooked)', protein: 15, fiber: 15, serving: '1 cup', category: 'Legumes' },
  { name: 'Kidney Beans (cooked)', protein: 13, fiber: 11, serving: '1 cup', category: 'Legumes' },
  { name: 'Pinto Beans (cooked)', protein: 12, fiber: 12, serving: '1 cup', category: 'Legumes' },
  { name: 'Navy Beans (cooked)', protein: 15, fiber: 19, serving: '1 cup', category: 'Legumes' },
  { name: 'Split Peas (cooked)', protein: 16, fiber: 16, serving: '1 cup', category: 'Legumes' },
  { name: 'Edamame', protein: 17, fiber: 8, serving: '1 cup', category: 'Legumes' },
  { name: 'Tempeh', protein: 31, fiber: 9, serving: '1 cup', category: 'Soy Products' },
  { name: 'Tofu (firm)', protein: 20, fiber: 2, serving: '1 cup', category: 'Soy Products' },
  { name: 'Hemp Seeds', protein: 10, fiber: 1, serving: '3 tbsp', category: 'Seeds & Nuts' },
  { name: 'Chia Seeds', protein: 5, fiber: 10, serving: '2 tbsp', category: 'Seeds & Nuts' },
  { name: 'Pumpkin Seeds', protein: 12, fiber: 2, serving: '1 oz', category: 'Seeds & Nuts' },
  { name: 'Almonds', protein: 6, fiber: 4, serving: '1 oz (23 nuts)', category: 'Seeds & Nuts' },
  { name: 'Peanuts', protein: 7, fiber: 3, serving: '1 oz', category: 'Seeds & Nuts' },
  { name: 'Quinoa (cooked)', protein: 8, fiber: 5, serving: '1 cup', category: 'Whole Grains', notes: 'Complete protein' },

  // Animal Proteins
  { name: 'Chicken Breast (skinless)', protein: 31, fiber: 0, serving: '4 oz', category: 'Poultry' },
  { name: 'Turkey Breast', protein: 34, fiber: 0, serving: '4 oz', category: 'Poultry' },
  { name: 'Lean Ground Turkey (93/7)', protein: 26, fiber: 0, serving: '4 oz', category: 'Poultry' },
  { name: 'Salmon (wild)', protein: 25, fiber: 0, serving: '4 oz', category: 'Fish', notes: 'High in omega-3s' },
  { name: 'Tuna (yellowfin)', protein: 32, fiber: 0, serving: '4 oz', category: 'Fish' },
  { name: 'Cod', protein: 23, fiber: 0, serving: '4 oz', category: 'Fish' },
  { name: 'Shrimp', protein: 24, fiber: 0, serving: '4 oz', category: 'Seafood' },
  { name: 'Lean Beef (sirloin)', protein: 26, fiber: 0, serving: '4 oz', category: 'Meat' },
  { name: 'Pork Tenderloin', protein: 24, fiber: 0, serving: '4 oz', category: 'Meat' },
  { name: 'Eggs (large)', protein: 12, fiber: 0, serving: '2 eggs', category: 'Dairy & Eggs' },
  { name: 'Greek Yogurt (plain, nonfat)', protein: 23, fiber: 0, serving: '1 cup', category: 'Dairy & Eggs' },
  { name: 'Cottage Cheese (low-fat)', protein: 28, fiber: 0, serving: '1 cup', category: 'Dairy & Eggs' },

  // High-Fiber Vegetables
  { name: 'Broccoli (cooked)', protein: 4, fiber: 5, serving: '1 cup', category: 'Vegetables' },
  { name: 'Brussels Sprouts (cooked)', protein: 4, fiber: 4, serving: '1 cup', category: 'Vegetables' },
  { name: 'Spinach (cooked)', protein: 5, fiber: 4, serving: '1 cup', category: 'Vegetables' },
  { name: 'Artichoke (medium)', protein: 4, fiber: 10, serving: '1 medium', category: 'Vegetables' },
  { name: 'Green Peas (cooked)', protein: 8, fiber: 9, serving: '1 cup', category: 'Vegetables' },
  { name: 'Sweet Potato (with skin)', protein: 2, fiber: 4, serving: '1 medium', category: 'Vegetables' },
  { name: 'Avocado', protein: 3, fiber: 10, serving: '1 medium', category: 'Vegetables', notes: 'High in healthy fats' },
  { name: 'Collard Greens (cooked)', protein: 4, fiber: 5, serving: '1 cup', category: 'Vegetables' },
  { name: 'Kale (cooked)', protein: 3, fiber: 3, serving: '1 cup', category: 'Vegetables' },

  // High-Fiber Fruits
  { name: 'Raspberries', protein: 1, fiber: 8, serving: '1 cup', category: 'Fruits' },
  { name: 'Blackberries', protein: 2, fiber: 8, serving: '1 cup', category: 'Fruits' },
  { name: 'Pear (with skin)', protein: 1, fiber: 6, serving: '1 medium', category: 'Fruits' },
  { name: 'Apple (with skin)', protein: 0, fiber: 4, serving: '1 medium', category: 'Fruits' },
  { name: 'Banana', protein: 1, fiber: 3, serving: '1 medium', category: 'Fruits' },

  // Whole Grains & High-Fiber Carbs
  { name: 'Oats (dry)', protein: 5, fiber: 4, serving: '1/2 cup', category: 'Whole Grains' },
  { name: 'Brown Rice (cooked)', protein: 5, fiber: 4, serving: '1 cup', category: 'Whole Grains' },
  { name: 'Wild Rice (cooked)', protein: 7, fiber: 3, serving: '1 cup', category: 'Whole Grains' },
  { name: 'Barley (cooked)', protein: 4, fiber: 6, serving: '1 cup', category: 'Whole Grains' },
  { name: 'Bulgur (cooked)', protein: 6, fiber: 8, serving: '1 cup', category: 'Whole Grains' },
  { name: 'Whole Wheat Bread', protein: 4, fiber: 2, serving: '1 slice', category: 'Whole Grains' }
];

const CATEGORIES = ['All', 'Legumes', 'Soy Products', 'Seeds & Nuts', 'Poultry', 'Fish', 'Seafood', 'Meat', 'Dairy & Eggs', 'Vegetables', 'Fruits', 'Whole Grains'];

export default function ProteinFiberFoodsPage() {
  const router = useRouter();
  const { profile, updateOnboardingProgress } = useUserProfile();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'protein' | 'fiber'>('protein');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    // Check if user has viewed this guide from Firebase profile
    setHasViewed(!!profile?.proteinGuideViewed);
  }, [profile]);

  const markAsViewed = async () => {
    try {
      await updateOnboardingProgress({ proteinGuideViewed: true } as any);
      setHasViewed(true);
      router.push('/getting-started');
    } catch (error) {
      console.error('Error marking protein guide as viewed:', error);
    }
  };

  const filteredFoods = HIGH_PROTEIN_FIBER_FOODS
    .filter(food => {
      const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
      const matchesSearch = !searchTerm || food.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'name') {
        return multiplier * a.name.localeCompare(b.name);
      }
      return multiplier * (a[sortBy] - b[sortBy]);
    });

  const highProteinFoods = filteredFoods.filter(food => food.protein >= 15);
  const highFiberFoods = filteredFoods.filter(food => food.fiber >= 5);
  const bothHighFoods = filteredFoods.filter(food => food.protein >= 10 && food.fiber >= 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🥗 Protein & Fiber Rich Foods</h1>
        <p className="text-gray-600 mb-4">
          Complete reference guide for high-protein and high-fiber foods to optimize your GLP-1 medication effectiveness.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            💡 <strong>For GLP-1 users:</strong> Focus on foods with 20g+ protein and 4g+ fiber per meal to maximize satiety and medication effectiveness. 
            Combine plant and animal proteins for optimal nutrition.
          </p>
        </div>

        {/* Quick Link back to Meal Logger */}
        <div className="mb-6">
          <Link 
            href="/meal-log"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Meal Logger
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{highProteinFoods.length}</div>
          <div className="text-sm text-gray-600">High Protein (15g+)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{highFiberFoods.length}</div>
          <div className="text-sm text-gray-600">High Fiber (5g+)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{bothHighFoods.length}</div>
          <div className="text-sm text-gray-600">Both High</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{HIGH_PROTEIN_FIBER_FOODS.length}</div>
          <div className="text-sm text-gray-600">Total Foods</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'protein' | 'fiber')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="protein">Protein</option>
              <option value="fiber">Fiber</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredFoods.length} of {HIGH_PROTEIN_FIBER_FOODS.length} foods
        </div>
      </div>

      {/* Food List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Food
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serving Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Protein (g)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiber (g)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFoods.map((food, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{food.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {food.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {food.serving}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      food.protein >= 20 ? 'bg-green-100 text-green-800' :
                      food.protein >= 10 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {food.protein}g
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      food.fiber >= 8 ? 'bg-orange-100 text-orange-800' :
                      food.fiber >= 4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {food.fiber}g
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {food.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredFoods.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Matching Foods</h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your search terms or category filter to find foods.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-green-800 mb-4">💡 GLP-1 Meal Planning Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <h3 className="font-semibold mb-2">For Maximum Satiety:</h3>
            <ul className="space-y-1">
              <li>• Aim for 20-30g protein per meal</li>
              <li>• Include 5-10g fiber per meal</li>
              <li>• Eat protein first to enhance GLP-1 response</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Meal Combination Ideas:</h3>
            <ul className="space-y-1">
              <li>• Greek yogurt + berries + chia seeds</li>
              <li>• Lentil soup + side of chicken</li>
              <li>• Quinoa bowl with beans and vegetables</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Completion Button for Onboarding */}
      {!hasViewed && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reference Guide Reviewed</h3>
            <p className="text-gray-600 mb-6">
              You now have the protein and fiber food reference to support your GLP-1 journey!
            </p>
            <button
              onClick={markAsViewed}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              ✓ Continue Onboarding
            </button>
          </div>
        </div>
      )}
    </div>
  );
}