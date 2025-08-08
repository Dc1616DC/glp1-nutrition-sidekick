import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

interface SymptomLog {
  symptom: string;
  severity: number;
  notes: string;
  mealRelated: boolean | null;
  timestamp: any;
}

interface SymptomInsight {
  symptom: string;
  frequency: number;
  averageSeverity: number;
  timePattern?: string;
  triggers?: string[];
  strategies: string[];
}

export class SymptomInsightsService {
  async analyzeSymptomLogs(userId: string, days: number = 30): Promise<SymptomLog[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logsRef = collection(db, 'userSymptoms', userId, 'logs');
      const q = query(
        logsRef,
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const logs: SymptomLog[] = [];

      snapshot.forEach(doc => {
        logs.push({
          ...doc.data() as SymptomLog
        });
      });

      return logs;
    } catch (error) {
      console.error('Error analyzing symptom logs:', error);
      return [];
    }
  }

  generateInsights(logs: SymptomLog[]): SymptomInsight[] {
    const symptomMap = new Map<string, {
      count: number;
      totalSeverity: number;
      notes: string[];
      mealRelated: number;
      timestamps: Date[];
    }>();

    // Aggregate symptom data
    logs.forEach(log => {
      const existing = symptomMap.get(log.symptom) || {
        count: 0,
        totalSeverity: 0,
        notes: [],
        mealRelated: 0,
        timestamps: []
      };

      existing.count++;
      existing.totalSeverity += log.severity;
      if (log.notes) existing.notes.push(log.notes);
      if (log.mealRelated) existing.mealRelated++;
      if (log.timestamp) {
        existing.timestamps.push(log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp));
      }

      symptomMap.set(log.symptom, existing);
    });

    // Generate insights for each symptom
    const insights: SymptomInsight[] = [];

    symptomMap.forEach((data, symptom) => {
      const averageSeverity = data.totalSeverity / data.count;
      const mealRelatedPercentage = (data.mealRelated / data.count) * 100;

      // Analyze time patterns
      let timePattern = '';
      if (data.timestamps.length > 0) {
        const hours = data.timestamps.map(t => t.getHours());
        const morningCount = hours.filter(h => h >= 5 && h < 12).length;
        const afternoonCount = hours.filter(h => h >= 12 && h < 17).length;
        const eveningCount = hours.filter(h => h >= 17 && h < 22).length;
        
        const maxCount = Math.max(morningCount, afternoonCount, eveningCount);
        if (maxCount === morningCount) timePattern = 'morning';
        else if (maxCount === afternoonCount) timePattern = 'afternoon';
        else timePattern = 'evening';
      }

      // Extract potential triggers from notes
      const triggers: string[] = [];
      const triggerKeywords = ['after eating', 'stress', 'exercise', 'medication', 'sleep', 'work'];
      data.notes.forEach(note => {
        const lowerNote = note.toLowerCase();
        triggerKeywords.forEach(keyword => {
          if (lowerNote.includes(keyword) && !triggers.includes(keyword)) {
            triggers.push(keyword);
          }
        });
      });

      // Generate strategies based on symptom type and patterns
      const strategies = this.getStrategiesForSymptom(
        symptom, 
        averageSeverity, 
        mealRelatedPercentage,
        timePattern,
        triggers
      );

      insights.push({
        symptom,
        frequency: data.count,
        averageSeverity,
        timePattern,
        triggers: triggers.length > 0 ? triggers : undefined,
        strategies
      });
    });

    // Sort by frequency (most common first)
    return insights.sort((a, b) => b.frequency - a.frequency);
  }

  private getStrategiesForSymptom(
    symptom: string, 
    severity: number, 
    mealRelatedPercentage: number,
    timePattern: string,
    triggers: string[]
  ): string[] {
    const strategies: string[] = [];

    // Symptom-specific strategies
    switch (symptom) {
      case 'nausea':
        strategies.push('Try eating smaller, more frequent meals throughout the day');
        strategies.push('Keep bland snacks like crackers or toast nearby');
        strategies.push('Stay hydrated with small sips of ginger tea or clear liquids');
        if (mealRelatedPercentage > 50) {
          strategies.push('Consider eating protein first, then vegetables, then carbs');
          strategies.push('Avoid high-fat or greasy foods that may worsen nausea');
        }
        if (timePattern === 'morning') {
          strategies.push('Keep crackers by your bedside to eat before getting up');
        }
        break;

      case 'constipation':
        strategies.push('Increase fiber intake gradually (aim for 25-30g daily)');
        strategies.push('Stay well-hydrated - aim for 8+ glasses of water daily');
        strategies.push('Try gentle movement like walking after meals');
        strategies.push('Consider adding prunes, chia seeds, or ground flaxseed to meals');
        if (severity > 6) {
          strategies.push('Discuss stool softeners or fiber supplements with your healthcare provider');
        }
        break;

      case 'fatigue':
        strategies.push('Prioritize protein at each meal for sustained energy');
        strategies.push('Check vitamin B12 and iron levels with your doctor');
        strategies.push('Maintain consistent meal times to stabilize blood sugar');
        if (timePattern === 'afternoon') {
          strategies.push('Consider a protein-rich afternoon snack around 2-3 PM');
          strategies.push('Limit heavy carbohydrates at lunch');
        }
        strategies.push('Ensure adequate sleep (7-9 hours) and consistent sleep schedule');
        break;

      case 'fullness':
        strategies.push('Eat 5-6 small meals instead of 3 large ones');
        strategies.push('Stop eating when 80% full - use smaller plates');
        strategies.push('Chew food thoroughly and eat slowly (20-30 minutes per meal)');
        strategies.push('Avoid drinking large amounts of liquid with meals');
        if (mealRelatedPercentage > 70) {
          strategies.push('Consider meal timing - wait 3-4 hours between meals');
        }
        break;

      case 'heartburn':
        strategies.push('Avoid lying down for 2-3 hours after eating');
        strategies.push('Elevate the head of your bed by 6-8 inches');
        strategies.push('Limit trigger foods: citrus, tomatoes, spicy foods, chocolate, caffeine');
        strategies.push('Eat smaller portions and avoid overeating');
        if (timePattern === 'evening') {
          strategies.push('Have your last meal at least 3 hours before bedtime');
        }
        break;

      case 'bloating':
        strategies.push('Limit gas-producing foods (beans, cruciferous vegetables, carbonated drinks)');
        strategies.push('Try digestive enzymes or probiotics (consult your doctor first)');
        strategies.push('Eat and drink slowly to avoid swallowing air');
        strategies.push('Consider a low-FODMAP approach if bloating persists');
        if (mealRelatedPercentage > 60) {
          strategies.push('Keep a food diary to identify specific trigger foods');
        }
        break;

      case 'cravings':
        strategies.push('Ensure adequate protein (20-30g) at each meal');
        strategies.push('Include fiber-rich foods to maintain satiety');
        strategies.push('Stay hydrated - sometimes thirst masquerades as hunger');
        strategies.push('Plan healthy snacks in advance to avoid impulsive choices');
        if (timePattern === 'evening') {
          strategies.push('Try herbal tea or a small protein snack in the evening');
          strategies.push('Establish a relaxing evening routine that doesn\'t involve food');
        }
        break;

      case 'dizziness':
        strategies.push('Rise slowly from sitting or lying positions');
        strategies.push('Stay well-hydrated and monitor electrolyte intake');
        strategies.push('Eat regular meals to maintain stable blood sugar');
        strategies.push('Monitor blood pressure - GLP-1 medications can affect it');
        if (severity > 5) {
          strategies.push('Contact your healthcare provider to review medication dosage');
        }
        break;

      default:
        strategies.push('Track patterns in a symptom diary');
        strategies.push('Stay hydrated and maintain regular meal times');
        strategies.push('Discuss persistent symptoms with your healthcare provider');
    }

    // Add trigger-specific strategies
    if (triggers.includes('stress')) {
      strategies.push('Practice stress-reduction techniques like deep breathing or meditation');
    }
    if (triggers.includes('exercise')) {
      strategies.push('Time meals appropriately around exercise (2-3 hours before)');
    }
    if (triggers.includes('medication')) {
      strategies.push('Take medication with food if recommended by your provider');
    }

    return strategies.slice(0, 5); // Return top 5 most relevant strategies
  }

  generateMedicalDisclaimer(): string {
    return `⚠️ Important Medical Disclaimer: These insights are based on your logged symptoms and are for informational purposes only. They are not a substitute for professional medical advice, diagnosis, or treatment. Always consult with your healthcare provider about any symptoms you're experiencing, especially if they persist, worsen, or concern you. If you experience severe symptoms, seek immediate medical attention. Your GLP-1 medication provider should be informed of any persistent side effects.`;
  }
}

export const symptomInsightsService = new SymptomInsightsService();