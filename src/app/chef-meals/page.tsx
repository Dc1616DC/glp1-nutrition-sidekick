import ChefInspiredMealGenerator from '../../components/ChefInspiredMealGenerator';

export default function ChefMealGeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍽️ Chef-Inspired Meal Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience "doable decadence" with appealing meal ideas crafted specifically for GLP-1 users. 
            From quick assemblies to structured recipes, every meal is designed to be satisfying, practical, and delicious.
          </p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">✨ New Features Based on Grok's Guidance</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>🚫 Allergies Filter:</strong> Pre-generation safety check for common allergens
              </div>
              <div>
                <strong>👨‍🍳 Chef-Inspired Names:</strong> "Mediterranean Tuna Crunch Pack" vs plain "tuna and crackers"
              </div>
              <div>
                <strong>⚖️ Customizable Mix:</strong> Choose your ratio of quick assemblies to structured recipes
              </div>
              <div>
                <strong>✨ Flavorful Twists:</strong> Enhance any meal with creative variations
              </div>
            </div>
          </div>
        </div>
        
        <ChefInspiredMealGenerator />
      </div>
    </div>
  );
}
