import { collection, query, orderBy, limit, getDocs, where, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';

interface SymptomLog {
  id: string;
  symptom: string;
  severity: number;
  notes: string;
  mealRelated: boolean | null;
  timestamp: DocumentData;
}

interface SymptomProfile {
  mostCommonSymptoms: string[];
  averageSeverity: number;
  mealRelatedPercentage: number;
  recentTrends: {
    increasing: string[];
    stable: string[];
    decreasing: string[];
  };
}

interface MealPreferences {
  symptomOptimizations: {
    avoidIngredients: string[];
    recommendIngredients: string[];
    cookingMethods: string[];
    portionGuidance: string;
    timingTips: string[];
  };
}

export class SymptomMealService {
  /**
   * Analyze user's symptom patterns to create meal preferences
   */
  async analyzeSymptomProfile(userId: string): Promise<SymptomProfile | null> {
    try {
      // Get last 30 days of symptom data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const logsRef = collection(db, `userSymptoms/${userId}/logs`);
      const q = query(
        logsRef,
        where('timestamp', '>=', thirtyDaysAgo),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const logs: SymptomLog[] = [];
      snapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as SymptomLog);
      });

      return this.calculateSymptomProfile(logs);

    } catch (error) {
      console.error('Error analyzing symptom profile:', error);
      return null;
    }
  }

  /**
   * Calculate symptom profile from logs
   */
  private calculateSymptomProfile(logs: SymptomLog[]): SymptomProfile {
    // Count symptom frequency
    const symptomCounts: {[key: string]: number} = {};
    let totalSeverity = 0;
    let mealRelatedCount = 0;

    logs.forEach(log => {
      symptomCounts[log.symptom] = (symptomCounts[log.symptom] || 0) + 1;
      totalSeverity += log.severity;
      if (log.mealRelated === true) {
        mealRelatedCount++;
      }
    });

    // Get most common symptoms (top 3)
    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([symptom]) => symptom);

    // Calculate trends (simplified - comparing recent vs older logs)
    const recentLogs = logs.slice(0, Math.min(10, logs.length));
    const olderLogs = logs.slice(Math.max(0, logs.length - 10));

    const recentSymptoms = this.getSymptomSeverities(recentLogs);
    const olderSymptoms = this.getSymptomSeverities(olderLogs);

    const trends = {
      increasing: [] as string[],
      stable: [] as string[],
      decreasing: [] as string[]
    };

    Object.keys(recentSymptoms).forEach(symptom => {
      if (!olderSymptoms[symptom]) {
        trends.stable.push(symptom);
        return;
      }

      const recentAvg = recentSymptoms[symptom];
      const olderAvg = olderSymptoms[symptom];

      if (recentAvg > olderAvg + 0.5) {
        trends.increasing.push(symptom);
      } else if (recentAvg < olderAvg - 0.5) {
        trends.decreasing.push(symptom);
      } else {
        trends.stable.push(symptom);
      }
    });

    return {
      mostCommonSymptoms,
      averageSeverity: totalSeverity / logs.length,
      mealRelatedPercentage: Math.round((mealRelatedCount / logs.length) * 100),
      recentTrends: trends
    };
  }

  /**
   * Get average severities by symptom
   */
  private getSymptomSeverities(logs: SymptomLog[]): {[key: string]: number} {
    const symptomSeverities: {[key: string]: {total: number, count: number}} = {};

    logs.forEach(log => {
      if (!symptomSeverities[log.symptom]) {
        symptomSeverities[log.symptom] = { total: 0, count: 0 };
      }
      symptomSeverities[log.symptom].total += log.severity;
      symptomSeverities[log.symptom].count += 1;
    });

    const averages: {[key: string]: number} = {};
    Object.entries(symptomSeverities).forEach(([symptom, data]) => {
      averages[symptom] = data.total / data.count;
    });

    return averages;
  }

  /**
   * Generate meal preferences based on symptom profile
   */
  generateMealPreferences(symptomProfile: SymptomProfile): MealPreferences {
    const preferences: MealPreferences = {
      symptomOptimizations: {
        avoidIngredients: [],
        recommendIngredients: [],
        cookingMethods: [],
        portionGuidance: '',
        timingTips: []
      }
    };

    // Base recommendations for all GLP-1 users
    preferences.symptomOptimizations.recommendIngredients.push(
      'lean proteins (chicken, fish, tofu)',
      'high-fiber vegetables',
      'complex carbohydrates in moderation'
    );

    preferences.symptomOptimizations.timingTips.push(
      'Eat slowly and mindfully',
      'Stop when you feel satisfied, not full'
    );

    // Symptom-specific optimizations
    symptomProfile.mostCommonSymptoms.forEach(symptom => {
      switch (symptom) {
        case 'nausea':
          preferences.symptomOptimizations.avoidIngredients.push(
            'high-fat foods',
            'very spicy foods',
            'strong-smelling foods'
          );
          preferences.symptomOptimizations.recommendIngredients.push(
            'ginger',
            'bland carbohydrates (rice, toast)',
            'room temperature foods'
          );
          preferences.symptomOptimizations.cookingMethods.push(
            'steaming',
            'boiling',
            'light grilling'
          );
          preferences.symptomOptimizations.timingTips.push(
            'Eat smaller, more frequent meals',
            'Avoid lying down immediately after eating'
          );
          break;

        case 'constipation':
          preferences.symptomOptimizations.recommendIngredients.push(
            'high-fiber foods (beans, berries, vegetables)',
            'prunes and prune juice',
            'plenty of water'
          );
          preferences.symptomOptimizations.avoidIngredients.push(
            'processed foods',
            'low-fiber refined grains'
          );
          preferences.symptomOptimizations.timingTips.push(
            'Drink warm liquids in the morning',
            'Stay well-hydrated throughout the day'
          );
          break;

        case 'fatigue':
          preferences.symptomOptimizations.recommendIngredients.push(
            'iron-rich foods (spinach, lean red meat)',
            'complex carbohydrates for steady energy',
            'B-vitamin rich foods'
          );
          preferences.symptomOptimizations.avoidIngredients.push(
            'simple sugars that cause energy crashes',
            'excessive caffeine'
          );
          preferences.symptomOptimizations.timingTips.push(
            'Eat regular meals to maintain energy',
            'Include protein with each meal'
          );
          break;

        case 'fullness':
          preferences.symptomOptimizations.portionGuidance = 'Focus on smaller portions with nutrient-dense foods';
          preferences.symptomOptimizations.cookingMethods.push(
            'nutrient-dense preparations',
            'protein-forward cooking'
          );
          preferences.symptomOptimizations.timingTips.push(
            'Eat very slowly',
            'Chew thoroughly',
            'Take breaks during meals'
          );
          break;

        case 'heartburn':
          preferences.symptomOptimizations.avoidIngredients.push(
            'acidic foods (tomatoes, citrus)',
            'spicy foods',
            'high-fat meals',
            'carbonated beverages'
          );
          preferences.symptomOptimizations.cookingMethods.push(
            'baking',
            'steaming',
            'grilling without charring'
          );
          preferences.symptomOptimizations.timingTips.push(
            'Avoid eating 2-3 hours before lying down',
            'Eat smaller, more frequent meals'
          );
          break;

        case 'bloating':
          preferences.symptomOptimizations.avoidIngredients.push(
            'carbonated beverages',
            'high-sodium foods',
            'artificial sweeteners'
          );
          preferences.symptomOptimizations.recommendIngredients.push(
            'easily digestible proteins',
            'cooked vegetables over raw',
            'anti-inflammatory herbs (turmeric, ginger)'
          );
          preferences.symptomOptimizations.cookingMethods.push(
            'steaming vegetables',
            'slow cooking for easier digestion'
          );
          break;

        case 'dizziness':
          preferences.symptomOptimizations.recommendIngredients.push(
            'foods rich in electrolytes',
            'adequate salt (unless restricted)',
            'steady carbohydrate sources'
          );
          preferences.symptomOptimizations.timingTips.push(
            'Eat regular meals to maintain blood sugar',
            'Stay well-hydrated',
            'Rise slowly after meals'
          );
          break;
      }
    });

    // Adjust for high meal-related symptoms
    if (symptomProfile.mealRelatedPercentage > 60) {
      preferences.symptomOptimizations.portionGuidance = 'Focus on very small portions and eat more frequently';
      preferences.symptomOptimizations.timingTips.push(
        'Consider keeping a food diary to identify triggers',
        'Eat meals at consistent times'
      );
    }

    // Adjust for high average severity
    if (symptomProfile.averageSeverity > 6) {
      preferences.symptomOptimizations.cookingMethods.push(
        'gentle cooking methods only',
        'avoid complex preparations'
      );
      preferences.symptomOptimizations.timingTips.push(
        'Consider discussing meal timing with your healthcare provider'
      );
    }

    return preferences;
  }

  /**
   * Create a prompt enhancement for meal generation based on symptoms
   */
  createSymptomPromptEnhancement(userId: string): Promise<string> {
    return this.analyzeSymptomProfile(userId).then(profile => {
      if (!profile) {
        return '';
      }

      const preferences = this.generateMealPreferences(profile);
      const { symptomOptimizations } = preferences;

      let enhancement = '\n--- SYMPTOM-OPTIMIZED MEAL PREFERENCES ---\n';
      
      if (profile.mostCommonSymptoms.length > 0) {
        enhancement += `User commonly experiences: ${profile.mostCommonSymptoms.join(', ')}\n`;
      }

      if (symptomOptimizations.avoidIngredients.length > 0) {
        enhancement += `AVOID: ${symptomOptimizations.avoidIngredients.join(', ')}\n`;
      }

      if (symptomOptimizations.recommendIngredients.length > 0) {
        enhancement += `PRIORITIZE: ${symptomOptimizations.recommendIngredients.join(', ')}\n`;
      }

      if (symptomOptimizations.cookingMethods.length > 0) {
        enhancement += `COOKING METHODS: ${symptomOptimizations.cookingMethods.join(', ')}\n`;
      }

      if (symptomOptimizations.portionGuidance) {
        enhancement += `PORTION GUIDANCE: ${symptomOptimizations.portionGuidance}\n`;
      }

      if (symptomOptimizations.timingTips.length > 0) {
        enhancement += `EATING TIPS: ${symptomOptimizations.timingTips.join('; ')}\n`;
      }

      enhancement += '--- END SYMPTOM OPTIMIZATIONS ---\n';

      return enhancement;
    }).catch(error => {
      console.error('Error creating symptom enhancement:', error);
      return '';
    });
  }

  /**
   * Get quick symptom-based meal suggestions
   */
  getSymptomBasedSuggestions(symptoms: string[]): {[key: string]: string[]} {
    const suggestions: {[key: string]: string[]} = {};

    symptoms.forEach(symptom => {
      switch (symptom) {
        case 'nausea':
          suggestions[symptom] = [
            'Ginger tea with plain crackers',
            'Plain rice with steamed chicken',
            'Banana and toast',
            'Clear broth with noodles'
          ];
          break;
        case 'constipation':
          suggestions[symptom] = [
            'High-fiber smoothie with berries',
            'Lentil soup with vegetables',
            'Prune and yogurt parfait',
            'Quinoa salad with beans'
          ];
          break;
        case 'fatigue':
          suggestions[symptom] = [
            'Iron-rich spinach and egg scramble',
            'Quinoa bowl with lean beef',
            'Salmon with sweet potato',
            'Bean and vegetable curry'
          ];
          break;
        case 'fullness':
          suggestions[symptom] = [
            'Protein smoothie (small portion)',
            'Greek yogurt with nuts',
            'Mini chicken and vegetable skewer',
            'Small portion of fish with steamed broccoli'
          ];
          break;
      }
    });

    return suggestions;
  }
}

export const symptomMealService = new SymptomMealService();