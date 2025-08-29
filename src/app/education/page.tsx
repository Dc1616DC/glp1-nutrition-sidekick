'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import NutritionInsights from '../../components/NutritionInsights';
import EnhancedNutritionEducation from '../../components/EnhancedNutritionEducation';

// For a novice developer: This component is the "Education Hub".
// It's a client component because we use `useState` to create an interactive
// accordion, allowing users to expand and collapse articles.

// --- Data for our articles ---
// In a real application, this data would likely come from a database or a Content Management System (CMS).
// For now, we'll define it directly here.
const educationArticles = [
  {
    title: 'Why Protein Matters on GLP-1 Medications',
    description: 'Learn why protein is crucial for energy, muscle maintenance, and overall balance on GLP-1s.',
    content: (
      <div className="space-y-6 text-gray-700">
        <p className="text-lg leading-relaxed">
          As a Registered Dietitian and the creator of the GLP-1 Nutrition Sidekick app, I've seen how these medications—like Ozempic, Wegovy, or Mounjaro—can change the way you experience hunger and meals. They work by slowing digestion and suppressing appetite, which is helpful for many, but it can also make it easier to undereat without realizing it. That's where protein comes in as a key player. It's not about chasing a number on the scale; it's about supporting your body's needs for energy, muscle maintenance, and overall balance.
        </p>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Understanding GLP-1's Impact on Your Body</h3>
          <p>
            GLP-1 medications mimic a hormone that helps regulate blood sugar and appetite, leading to slower stomach emptying and reduced hunger signals. This can be empowering, but it also means you might not get the usual "eat now" prompts from your body. Without enough protein, you could feel fatigued, lose muscle over time, or struggle with steady energy levels.
          </p>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800">The Benefits of Protein for Energy and Symptom Relief</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <div>
              <strong className="text-gray-900">Preserves Muscle and Strength:</strong> GLP-1s can lead to muscle loss if nutrition isn't on point, but protein helps maintain muscle, which supports metabolism and daily energy.
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <div>
              <strong className="text-gray-900">Boosts Fullness Without Discomfort:</strong> With slowed digestion, protein-rich foods help you feel content longer, reducing the risk of overeating later.
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <div>
              <strong className="text-gray-900">Supports Metabolic Health:</strong> Protein aids in blood sugar stability, which complements GLP-1's effects and can ease symptoms like low energy or cravings.
            </div>
          </li>
        </ul>
        
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Research Support:</strong> Studies in the Journal of Clinical Endocrinology & Metabolism (2023) and American Journal of Clinical Nutrition (2024) show protein helps preserve lean muscle mass and aids in satiety for GLP-1 users.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'The Power of Protein + Fiber for Sustainable Habits',
    description: 'Discover why the protein-fiber combo is essential for managing appetite and supporting digestion on GLP-1s.',
    content: (
      <div className="space-y-6 text-gray-700">
        <p className="text-lg leading-relaxed">
          If you're on a GLP-1 like Ozempic or Mounjaro, you know the meds can quiet hunger signals and slow things down in your gut. That's where the dynamic duo of protein and fiber shines—not as a "hack" for quick fixes, but as a way to feel nourished, energized, and in tune with your body. This combo helps users manage appetite changes while supporting digestion and metabolic health.
        </p>
        
        <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Why Protein + Fiber Is a GLP-1 Game-Changer</h3>
          <p>
            Protein provides building blocks for muscle and satisfaction, while fiber promotes steady digestion and blood sugar balance. Together, they create meals that feel fulfilling without overwhelming your GLP-1-altered system.
          </p>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800">Benefits for Your Daily Experience</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">⚡ Steady Energy</h4>
            <p className="text-sm text-green-700">Protein sustains you, fiber stabilizes—perfect for avoiding mid-afternoon slumps.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🌱 Gentle Digestion</h4>
            <p className="text-sm text-blue-700">Fiber helps with regularity, protein adds satisfaction, minimizing bloating.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">🧠 Mental Balance</h4>
            <p className="text-sm text-purple-700">Reduces "food noise" by keeping you content with intuitive choices.</p>
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Research Support:</strong> Reviews in Nutrients (2024) and European Journal of Clinical Nutrition (2023) show fiber-protein combos enhance satiety and gut health for GLP-1 users.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Foods to Approach Carefully on GLP-1s',
    description: 'Learn which foods might be challenging on GLP-1 medications and discover gentler alternatives.',
    content: (
      <div className="space-y-6 text-gray-700">
        <p className="text-lg leading-relaxed">
          GLP-1 meds like Ozempic or Wegovy are game-changers for appetite and digestion, but they can make some foods feel less friendly. It's not about avoiding them entirely—it's about approaching with awareness to minimize discomfort and support your body's needs.
        </p>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How GLP-1 Changes Food Interactions</h3>
          <p>
            These meds slow gastric emptying, which can lead to fullness sooner and potential GI symptoms like nausea or bloating if meals are too heavy. Research shows that high-fat or ultra-processed foods can exacerbate this, while fiber-rich, low-fat options ease it.
          </p>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800">Foods to Approach with Care</h3>
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 p-3 rounded">
            <strong className="text-red-900">🍟 High-Fat Foods:</strong> <span className="text-gray-700">Fried items, rich sauces - they digest slowly, potentially worsening nausea.</span>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-3 rounded">
            <strong className="text-orange-900">🍿 Ultra-Processed Snacks:</strong> <span className="text-gray-700">Chips, candy - can spike blood sugar then crash, amplifying fatigue.</span>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <strong className="text-yellow-900">🥩 Large Protein Portions:</strong> <span className="text-gray-700">Heavy proteins might sit longer, causing discomfort.</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-3 rounded">
            <strong className="text-purple-900">🥤 Carbonated/Caffeinated Drinks:</strong> <span className="text-gray-700">Bubbles can bloat, caffeine might dehydrate.</span>
          </div>
          <div className="bg-pink-50 border border-pink-200 p-3 rounded">
            <strong className="text-pink-900">🌶️ Spicy/Acidic Foods:</strong> <span className="text-gray-700">May irritate if GI sensitivity is high.</span>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-3">💡 Smart Swaps to Try:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Fried chicken → Grilled turkey with herbs</li>
            <li>• Potato chips → Air-popped popcorn</li>
            <li>• Heavy cream sauce → Greek yogurt-based sauce</li>
            <li>• Soda → Sparkling water with lemon</li>
          </ul>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Research Support:</strong> Studies in Diabetes Care (2024) and American Journal of Gastroenterology (2023) guide these recommendations. Consult your provider for personalized advice.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Getting Started with GLP-1 Nutrition',
    description: 'New to GLP-1 medications? Start here for essential nutrition guidance.',
    content: (
      <div className="space-y-6 text-gray-700">
        <p className="text-lg leading-relaxed">
          Starting a GLP-1 medication is a significant step in your health journey. Whether you're taking Ozempic, Wegovy, Mounjaro, or another GLP-1 agonist, understanding how to optimize your nutrition can make all the difference in your experience and results.
        </p>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">First Week Essentials</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <div>
                <strong>Start Small:</strong> Your appetite will likely decrease. Focus on nutrient-dense foods in smaller portions rather than forcing large meals.
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <div>
                <strong>Hydrate Consistently:</strong> Aim for 64+ oz of water daily. Dehydration can worsen side effects.
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <div>
                <strong>Track Your Response:</strong> Monitor how different foods make you feel to identify patterns.
              </div>
            </li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Every Meal Should Include:</h4>
            <ul className="text-sm space-y-1">
              <li>• 20-30g protein</li>
              <li>• 1-2 cups vegetables</li>
              <li>• Healthy fat source</li>
              <li>• Complex carbs (optional)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Timing Suggestions:</h4>
            <ul className="text-sm space-y-1">
              <li>• Eat within 2 hours of waking</li>
              <li>• Space meals 3-4 hours apart</li>
              <li>• Stop eating 2-3 hours before bed</li>
              <li>• Listen to your body's cues</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-sm text-emerald-800">
            <strong>Ready to personalize your approach?</strong> Use the nutrition calculator to get your specific targets, then explore meal ideas designed for GLP-1 users. Visit <a href="https://chase-wellness.com" className="text-emerald-600 underline">chase-wellness.com</a> for more resources.
          </p>
        </div>
      </div>
    ),
  },
];

export default function EducationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // We use state to keep track of which article is currently expanded.
  // We initialize it with the title of the first article so it's open by default.
  const [expandedArticle, setExpandedArticle] = useState<string | null>(
    educationArticles[0].title
  );
  
  // Add tab state for switching between articles and insights
  const [activeTab, setActiveTab] = useState<'articles' | 'insights'>('insights');

  useEffect(() => {
    const checkPremiumAccess = async () => {
      if (authLoading) return;
      
      if (!user) {
        setHasPremiumAccess(false);
        setLoading(false);
        return;
      }

      try {
        const hasAccess = await subscriptionService.hasPremiumAccess(user.uid);
        setHasPremiumAccess(hasAccess);
      } catch (error) {
        console.error('Error checking premium access:', error);
        setHasPremiumAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumAccess();
  }, [user, authLoading]);

  // This function handles the click event on an article title.
  const handleToggle = (title: string) => {
    // If the clicked article is already open, close it. Otherwise, open it.
    setExpandedArticle(expandedArticle === title ? null : title);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading education resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Education Hub</h1>
        <p className="mt-2 text-lg text-gray-600">
          Simple, scannable, and evidence-based guides for your journey.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'insights'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💡 Nutrition Insights
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-6 py-3 rounded-md font-medium transition-colors relative ${
              activeTab === 'articles'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 In-Depth Articles
            {!hasPremiumAccess && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold">
                PRO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'insights' ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <NutritionInsights />
        </div>
      ) : hasPremiumAccess ? (
        <EnhancedNutritionEducation />
      ) : (
        <div className="bg-gradient-to-r from-blue-500 to-green-600 rounded-lg p-8 text-white text-center">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-2xl font-bold mb-4">Premium Education Content</h2>
          <p className="text-blue-100 mb-6">
            Access expert-designed, research-backed nutrition modules with scientific depth, 
            practical protocols, and interactive learning features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🧪 Scientific Foundation:</h3>
              <ul className="text-sm space-y-1">
                <li>• Research citations and evidence</li>
                <li>• Physiological mechanisms explained</li>
                <li>• Clinical study references</li>
                <li>• Expert-level content depth</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎯 Interactive Learning:</h3>
              <ul className="text-sm space-y-1">
                <li>• Bookmark important sections</li>
                <li>• Track module completion</li>
                <li>• Practical application guides</li>
                <li>• Progress monitoring</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/pricing')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Upgrade to Premium - $9.99/mo
          </button>
          <p className="text-xs text-blue-200 mt-2">7-day free trial • Cancel anytime</p>
        </div>
      )}
    </div>
  );
}
