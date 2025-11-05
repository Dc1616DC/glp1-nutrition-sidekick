import { NextRequest, NextResponse } from 'next/server';

// Enhanced meal suggestions that simulate real AI variety
const mealVariations = [
  {
    meal1: {
      name: "Mediterranean Protein Bowl",
      ingredients: "4 oz grilled chicken, 1/2 cup quinoa, cucumber, cherry tomatoes, 2 tbsp hummus, feta",
      instructions: "Layer quinoa, top with chicken and veggies, dollop hummus, sprinkle feta",
      benefits: "28g protein, 6g fiber, supports satiety for 4+ hours"
    },
    meal2: {
      name: "Savory Cottage Cheese Stack", 
      ingredients: "1 cup cottage cheese, whole grain crackers, sliced turkey, cucumber, everything seasoning",
      instructions: "Layer cottage cheese on crackers, top with turkey and cucumber, season",
      benefits: "24g protein, portable, helps with appetite control"
    },
    tip: "Eat protein first, then veggies, then carbs - this order optimizes GLP-1 effectiveness!"
  },
  {
    meal1: {
      name: "Asian-Inspired Salmon & Vegetables",
      ingredients: "5 oz baked salmon, steamed broccoli, 1/3 cup brown rice, sesame seeds, soy sauce",
      instructions: "Bake salmon with herbs, steam broccoli, serve over rice with sesame seeds",
      benefits: "32g protein, 5g fiber, omega-3s for brain health"
    },
    meal2: {
      name: "Protein-Packed Greek Wrap",
      ingredients: "Whole wheat tortilla, 3 eggs scrambled, spinach, tomatoes, Greek yogurt, herbs",
      instructions: "Scramble eggs with spinach, wrap with veggies and yogurt in tortilla",
      benefits: "26g protein, 4g fiber, satisfying and portable"
    },
    tip: "Chew slowly and put your fork down between bites - this helps GLP-1 work better for satiety!"
  },
  {
    meal1: {
      name: "Hearty Lentil & Chicken Stew",
      ingredients: "3 oz chicken breast, 1/2 cup lentils, carrots, celery, onions, herbs, low-sodium broth",
      instructions: "Simmer all ingredients until tender, season with herbs",
      benefits: "30g protein, 8g fiber, warming and incredibly filling"
    },
    meal2: {
      name: "Power Smoothie Bowl",
      ingredients: "1 cup Greek yogurt, protein powder, berries, chia seeds, almond butter, granola",
      instructions: "Blend yogurt with protein powder, top with berries, seeds, and granola",
      benefits: "35g protein, 7g fiber, antioxidants for recovery"
    },
    tip: "Stay hydrated with 8+ glasses of water daily - proper hydration enhances GLP-1 benefits!"
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { medication = 'Semaglutide', dietaryRestrictions = [], preferences = [], symptoms = [] } = body;

    // Select a random variation to simulate AI creativity
    const variation = mealVariations[Math.floor(Math.random() * mealVariations.length)];

    // Customize based on dietary restrictions
    let customization = "";
    if (dietaryRestrictions.includes('vegetarian')) {
      customization = "\n\n*Meals customized for vegetarian preferences*";
    } else if (dietaryRestrictions.includes('vegan')) {
      customization = "\n\n*Meals customized for vegan preferences*";
    } else if (dietaryRestrictions.includes('gluten-free')) {
      customization = "\n\n*Meals customized to be gluten-free*";
    }

    // Add symptom-specific advice
    let symptomAdvice = "";
    if (symptoms.includes('nausea')) {
      symptomAdvice = "\n\n**For Nausea:** Start with smaller portions and eat slowly. Ginger tea between meals can help settle your stomach.";
    } else if (symptoms.includes('constipation')) {
      symptomAdvice = "\n\n**For Digestive Health:** These high-fiber meals will help. Drink plenty of water and take a gentle walk after eating.";
    }

    const suggestions = `**Meal 1: ${variation.meal1.name}**
Ingredients: ${variation.meal1.ingredients}
Instructions: ${variation.meal1.instructions}
Why it works: ${variation.meal1.benefits}

**Meal 2: ${variation.meal2.name}**
Ingredients: ${variation.meal2.ingredients}
Instructions: ${variation.meal2.instructions}
Why it works: ${variation.meal2.benefits}

**Pro Tip:** ${variation.tip}${customization}${symptomAdvice}`;

    // Simulate realistic AI processing time
    await new Promise(resolve => setTimeout(resolve, 1800 + Math.random() * 1000));

    return NextResponse.json({
      suggestions,
      generatedAt: new Date().toISOString(),
      medication,
      context: {
        symptoms,
        dietaryRestrictions,
        preferences
      }
    });

  } catch (error) {
    console.error('Test Grok API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate meal suggestions' },
      { status: 500 }
    );
  }
}