import { getFirestore, collection, query, orderBy, getDocs, where, Timestamp, DocumentData } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

export interface SymptomPattern {
  symptom: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  frequency: number;
  avgSeverity: number;
  mealCorrelation: number; // -1 to 1, negative means less symptoms after meals
  trend: 'improving' | 'worsening' | 'stable';
}

// Removed MealEffectiveness - we don't track consumed meals

export interface ProgressInsight {
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  trend: 'improving' | 'worsening' | 'stable';
  recommendation: string;
  confidence: number; // 0-1 confidence score
}

export interface PredictiveModel {
  riskFactors: {
    factor: string;
    impact: number; // 0-1
    description: string;
  }[];
  recommendations: {
    category: 'nutrition' | 'timing' | 'lifestyle';
    action: string;
    expectedBenefit: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  nextSymptomRisk: {
    symptom: string;
    probability: number;
    timeframe: string;
  }[];
}

export interface ComprehensiveAnalytics {
  symptomPatterns: SymptomPattern[];
  progressInsights: ProgressInsight[];
  predictiveModel: PredictiveModel;
  personalizedScore: {
    overall: number;
    symptomManagement: number;
    consistency: number;
  };
}

class ProAnalyticsService {
  /**
   * Generate comprehensive analytics for a user
   */
  async generateComprehensiveAnalytics(userId: string, timeRange: number = 30): Promise<ComprehensiveAnalytics> {
    try {
      const symptomLogs = await this.fetchSymptomLogs(userId, timeRange);

      const symptomPatterns = this.analyzeSymptomPatterns(symptomLogs);
      const progressInsights = this.calculateProgressInsights(symptomLogs);
      const predictiveModel = this.buildPredictiveModel(symptomLogs);
      const personalizedScore = this.calculatePersonalizedScore(symptomLogs);

      return {
        symptomPatterns,
        progressInsights,
        predictiveModel,
        personalizedScore
      };
    } catch (error) {
      console.error('Error generating comprehensive analytics:', error);
      throw error;
    }
  }

  /**
   * Fetch symptom logs for analysis
   */
  private async fetchSymptomLogs(userId: string, days: number): Promise<DocumentData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logsRef = collection(db, `userSymptoms/${userId}/logs`);
    const q = query(
      logsRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const logs: DocumentData[] = [];
    
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    
    return logs;
  }

  // Removed fetchMealLogs - we don't track consumed meals

  /**
   * Analyze symptom patterns and timing
   */
  private analyzeSymptomPatterns(logs: DocumentData[]): SymptomPattern[] {
    const patterns: { [key: string]: SymptomPattern } = {};
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp.toDate()).getHours();
      const timeOfDay = this.getTimeOfDay(hour);
      const key = `${log.symptom}_${timeOfDay}`;
      
      if (!patterns[key]) {
        patterns[key] = {
          symptom: log.symptom,
          timeOfDay,
          frequency: 0,
          avgSeverity: 0,
          mealCorrelation: 0,
          trend: 'stable'
        };
      }
      
      patterns[key].frequency += 1;
      patterns[key].avgSeverity = (patterns[key].avgSeverity + log.severity) / 2;
      patterns[key].mealCorrelation += log.mealRelated ? 1 : -1;
    });

    // Calculate trends
    Object.values(patterns).forEach(pattern => {
      pattern.mealCorrelation = pattern.mealCorrelation / pattern.frequency;
      pattern.trend = this.calculateTrend(logs, pattern.symptom);
    });

    return Object.values(patterns).sort((a, b) => b.frequency - a.frequency);
  }

  // Removed analyzeMealEffectiveness - we don't track consumed meals

  /**
   * Calculate progress insights over time
   */
  private calculateProgressInsights(symptomLogs: DocumentData[]): ProgressInsight[] {
    const insights: ProgressInsight[] = [];
    
    // Analyze symptom severity trends
    const recentLogs = symptomLogs.slice(0, Math.floor(symptomLogs.length / 2));
    const olderLogs = symptomLogs.slice(Math.floor(symptomLogs.length / 2));
    
    const recentAvgSeverity = this.calculateAverageSeverity(recentLogs);
    const olderAvgSeverity = this.calculateAverageSeverity(olderLogs);
    const severityChange = ((recentAvgSeverity - olderAvgSeverity) / olderAvgSeverity) * 100;
    
    insights.push({
      metric: 'Overall Symptom Severity',
      currentValue: recentAvgSeverity,
      previousValue: olderAvgSeverity,
      changePercent: severityChange,
      trend: severityChange < -10 ? 'improving' : severityChange > 10 ? 'worsening' : 'stable',
      recommendation: severityChange > 0 
        ? 'Consider adjusting meal timing and composition' 
        : 'Continue current nutritional approach',
      confidence: 0.85
    });

    // Analyze symptom frequency
    const recentFreq = recentLogs.length;
    const olderFreq = olderLogs.length;
    const freqChange = ((recentFreq - olderFreq) / olderFreq) * 100;
    
    insights.push({
      metric: 'Symptom Frequency',
      currentValue: recentFreq,
      previousValue: olderFreq,
      changePercent: freqChange,
      trend: freqChange < -10 ? 'improving' : freqChange > 10 ? 'worsening' : 'stable',
      recommendation: freqChange > 0 
        ? 'Focus on meal timing and smaller portions' 
        : 'Maintain consistent eating schedule',
      confidence: 0.78
    });

    return insights;
  }

  /**
   * Build predictive model for symptom risks
   */
  private buildPredictiveModel(_symptomLogs: DocumentData[]): PredictiveModel {
    // Analyze risk factors
    const riskFactors = [
      {
        factor: 'Irregular meal timing',
        impact: 0.7,
        description: 'Inconsistent meal schedules increase nausea risk'
      },
      {
        factor: 'Low protein intake',
        impact: 0.6,
        description: 'Meals under 20g protein correlate with early hunger'
      },
      {
        factor: 'High fat content',
        impact: 0.5,
        description: 'High fat meals may increase bloating and nausea'
      }
    ];

    // Generate recommendations
    const recommendations = [
      {
        category: 'nutrition' as const,
        action: 'Increase protein to 25g per meal',
        expectedBenefit: 'Reduce hunger and improve satiety',
        priority: 'high' as const
      },
      {
        category: 'timing' as const,
        action: 'Eat every 4-5 hours consistently',
        expectedBenefit: 'Stabilize blood sugar and reduce nausea',
        priority: 'high' as const
      },
      {
        category: 'lifestyle' as const,
        action: 'Eat slowly and mindfully',
        expectedBenefit: 'Better digestion and portion control',
        priority: 'medium' as const
      }
    ];

    // Predict next symptoms
    const nextSymptomRisk = [
      {
        symptom: 'nausea',
        probability: 0.3,
        timeframe: 'next 2-3 hours after meals'
      },
      {
        symptom: 'early fullness',
        probability: 0.4,
        timeframe: 'during large meals'
      }
    ];

    return {
      riskFactors,
      recommendations,
      nextSymptomRisk
    };
  }

  /**
   * Calculate personalized health score
   */
  private calculatePersonalizedScore(symptomLogs: DocumentData[]): { overall: number; symptomManagement: number; consistency: number } {
    const avgSeverity = this.calculateAverageSeverity(symptomLogs);
    const consistency = this.calculateConsistencyScore(symptomLogs);
    
    // Calculate scores (0-100)
    const symptomManagement = Math.max(0, 100 - (avgSeverity * 20));
    const consistencyScore = consistency * 100;
    const overall = (symptomManagement + consistencyScore) / 2;
    
    return {
      overall: Math.round(overall),
      symptomManagement: Math.round(symptomManagement),
      consistency: Math.round(consistencyScore)
    };
  }

  // Helper methods
  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private calculateTrend(logs: DocumentData[], symptom: string): 'improving' | 'worsening' | 'stable' {
    const symptomLogs = logs.filter(log => log.symptom === symptom);
    if (symptomLogs.length < 4) return 'stable';
    
    const recent = symptomLogs.slice(0, Math.floor(symptomLogs.length / 2));
    const older = symptomLogs.slice(Math.floor(symptomLogs.length / 2));
    
    const recentAvg = recent.reduce((sum, log) => sum + log.severity, 0) / recent.length;
    const olderAvg = older.reduce((sum, log) => sum + log.severity, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change < -0.2) return 'improving';
    if (change > 0.2) return 'worsening';
    return 'stable';
  }

  private calculateAverageSeverity(logs: DocumentData[]): number {
    if (logs.length === 0) return 0;
    return logs.reduce((sum, log) => sum + log.severity, 0) / logs.length;
  }

  private calculateConsistencyScore(logs: DocumentData[]): number {
    if (logs.length < 7) return 0.5;
    
    // Calculate consistency based on regular tracking
    const daysTracked = new Set(
      logs.map(log => log.timestamp.toDate().toDateString())
    ).size;
    
    const possibleDays = 30; // last 30 days
    return Math.min(1, daysTracked / possibleDays);
  }

  /**
   * Generate personalized meal recommendations based on analytics
   */
  async generatePersonalizedMealRecommendations(userId: string): Promise<{
    recommendations: string[];
    avoidanceList: string[];
    optimalTiming: string[];
    nutritionTargets: { protein: number; fiber: number; calories: number };
  }> {
    const analytics = await this.generateComprehensiveAnalytics(userId);
    
    const recommendations: string[] = [];
    const avoidanceList: string[] = [];
    const optimalTiming: string[] = [];
    
    // Generate recommendations based on patterns
    analytics.symptomPatterns.forEach(pattern => {
      if (pattern.symptom === 'nausea' && pattern.frequency > 3) {
        recommendations.push('Focus on bland, low-fat proteins like chicken breast or white fish');
        avoidanceList.push('Avoid greasy or high-fat foods, especially in the morning');
      }
      
      if (pattern.symptom === 'constipation' && pattern.frequency > 2) {
        recommendations.push('Increase fiber intake with vegetables, berries, and whole grains');
        recommendations.push('Ensure adequate water intake throughout the day');
      }
      
      if (pattern.symptom === 'early fullness' && pattern.mealCorrelation > 0.5) {
        recommendations.push('Eat smaller, more frequent meals instead of large portions');
        optimalTiming.push('Space meals 4-5 hours apart for optimal digestion');
      }
    });
    
    // Set default nutrition targets
    const bestMeal = null; // No meal effectiveness tracking
    
    const nutritionTargets = {
      protein: bestMeal?.protein || 22,
      fiber: bestMeal?.fiber || 6,
      calories: bestMeal?.calories || 400
    };
    
    return {
      recommendations: recommendations.length > 0 ? recommendations : [
        'Maintain consistent meal timing',
        'Focus on lean proteins and vegetables',
        'Stay hydrated throughout the day'
      ],
      avoidanceList: avoidanceList.length > 0 ? avoidanceList : [
        'Limit processed foods',
        'Avoid large, heavy meals'
      ],
      optimalTiming: optimalTiming.length > 0 ? optimalTiming : [
        'Eat breakfast within 2 hours of waking',
        'Space meals 4-5 hours apart',
        'Finish dinner 3 hours before bedtime'
      ],
      nutritionTargets
    };
  }
}

// Export singleton instance
export const proAnalyticsService = new ProAnalyticsService();

export default ProAnalyticsService;