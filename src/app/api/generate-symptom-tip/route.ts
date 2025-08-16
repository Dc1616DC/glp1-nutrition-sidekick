import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimiters } from '../../../lib/rateLimiter';

// Enhanced tips with specific ingredient guidance
const FALLBACK_TIPS: { [key: string]: string } = {
  nausea: 'Try ginger (fresh, tea, or crystallized), plain crackers, and room-temperature foods. AVOID: spicy foods, high-fat meals, strong-smelling foods. HELPFUL: bananas, rice, toast, peppermint tea.',
  constipation: 'PRIORITIZE: prunes, berries, beans, leafy greens, warm water with lemon in the morning. AVOID: processed foods, excessive dairy, refined grains. AIM for 25-35g fiber daily.',
  fatigue: 'BOOST energy with: iron-rich spinach, lean red meat, quinoa, nuts, and B-vitamin foods like eggs. AVOID: sugar crashes from candy, excessive caffeine after 2pm.',
  fullness: 'Focus on nutrient-dense foods in small portions. HELPFUL: protein smoothies, Greek yogurt, nut butters. TIP: Eat very slowly and stop at 80% full.',
  heartburn: 'AVOID: tomatoes, citrus, spicy foods, chocolate, coffee, alcohol. SOOTHING: oatmeal, bananas, melons, lean proteins, non-citrus fruits.',
  bloating: 'REDUCE: carbonated drinks, beans (unless soaked well), raw vegetables. HELPFUL: cooked vegetables, ginger, fennel tea, easily digestible proteins like fish.',
  dizziness: 'STABILIZE blood sugar with: regular meals, complex carbs, adequate salt (if not restricted). HELPFUL: electrolyte-rich foods, coconut water.',
  cravings: 'SATISFY with: protein + healthy fat combos (apple with almond butter), high-fiber foods, chromium-rich foods like broccoli. AVOID: refined sugars that trigger more cravings.'
};

async function handlePOST(request: NextRequest) {
  try {
    const { symptom, severity } = await request.json();

    if (!symptom || severity === undefined) {
      return NextResponse.json(
        { error: 'Symptom and severity are required' },
        { status: 400 }
      );
    }

    // Check if Grok API key is available
    if (process.env.GROK_API_KEY) {
      try {
        // Import grokService only if API key is available
        const { grokService } = await import('../../../services/grokService');
        const tip = await grokService.generateSymptomTip({ symptom, severity });
        return NextResponse.json({ tip });
      } catch (grokError) {
        console.error('Grok API error:', grokError);
        // Fall through to fallback tips
      }
    }

    // Use fallback tips
    const fallbackTip = FALLBACK_TIPS[symptom] || 
      'Focus on gentle, nourishing foods and stay well-hydrated. Contact your healthcare provider if symptoms persist.';
    
    return NextResponse.json({ tip: fallbackTip });

  } catch (error) {
    console.error('Error generating symptom tip:', error);
    
    const fallbackTip = 'Focus on gentle, nourishing foods and stay well-hydrated. Contact your healthcare provider if symptoms persist.';
    return NextResponse.json({ tip: fallbackTip });
  }
}

// Export with rate limiting for symptom-based generation
export const POST = withRateLimit(handlePOST, rateLimiters.symptomGeneration);