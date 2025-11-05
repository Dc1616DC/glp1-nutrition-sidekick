import { collection, query, orderBy, limit, getDocs, where, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';
import { injectionService } from './injectionService';
import { Injection } from '@/types/injection';

interface WeightedSymptomLog {
  symptom: string;
  severity: number;
  timestamp: Date;
  weight: number; // 0.1 to 1.0 based on recency and relevance
  contextualRelevance: number; // Based on dose, medication changes, etc.
}

interface AdaptiveInsight {
  pattern: string;
  confidence: number;
  recencyScore: number;
  relevanceScore: number;
  actionability: 'high' | 'medium' | 'low';
  validUntil: Date; // When this insight should be re-evaluated
}

export class AdaptiveAnalyticsService {
  
  /**
   * Get contextually relevant symptoms with recency weighting
   */
  async getRelevantSymptomData(userId: string): Promise<WeightedSymptomLog[]> {
    try {
      // Get user's injection history
      const injections = injectionService.getInjections();
      
      // Handle case where user has no injection history
      if (!injections || injections.length === 0) {
        console.log('No injection history found - using default analysis window');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 14); // Default 14-day window
        return this.getSymptomDataWithWindow(userId, cutoffDate);
      }
      
      const currentDose = injections[0]?.dose || 0;
      const currentMedication = injections[0]?.medication || '';
      
      // Get symptoms with adaptive time window
      const analysisWindow = this.getAdaptiveAnalysisWindow(injections);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - analysisWindow);
      
      const symptomsRef = collection(db, `userSymptoms/${userId}/logs`);
      const q = query(
        symptomsRef,
        where('timestamp', '>=', cutoffDate),
        orderBy('timestamp', 'desc'),
        limit(150)
      );
      
      const snapshot = await getDocs(q);
      const rawSymptoms: any[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Add null checks to prevent errors
        if (data.timestamp && data.symptom && data.severity !== undefined) {
          rawSymptoms.push({
            symptom: data.symptom,
            severity: data.severity,
            timestamp: data.timestamp.toDate(),
            originalData: data
          });
        }
      });
      
      // Apply weighting based on recency and contextual relevance
      return rawSymptoms.map(symptom => this.calculateSymptomWeight(
        symptom, 
        injections, 
        currentDose, 
        currentMedication
      )).filter(symptom => symptom.weight > 0.1); // Filter out very low relevance
      
    } catch (error) {
      console.error('Error getting relevant symptom data:', error);
      return [];
    }
  }
  
  /**
   * Calculate adaptive analysis window based on user's injection patterns
   */
  private getAdaptiveAnalysisWindow(injections: Injection[]): number {
    if (injections.length === 0) return 60; // Default 60 days
    
    // Check medication frequency
    const lastInjection = injections[0];
    const isDaily = lastInjection.medication === 'saxenda' || lastInjection.medication === 'victoza';
    
    // Check for recent dose changes
    const recentDoseChange = this.hasRecentDoseChange(injections);
    
    // Adaptive windows:
    if (recentDoseChange) {
      // After dose change, focus on recent data (shorter window)
      return isDaily ? 21 : 35; // 3-5 weeks
    }
    
    if (injections.length < 4) {
      // New users - longer window to capture patterns
      return isDaily ? 45 : 75;
    }
    
    // Established users - balanced window
    return isDaily ? 35 : 60;
  }
  
  /**
   * Check if user had recent dose changes (affects data relevance)
   */
  private hasRecentDoseChange(injections: Injection[]): boolean {
    if (injections.length < 3) return false;
    
    const recent = injections.slice(0, 4); // Last 4 injections
    const currentDose = recent[0].dose;
    
    // Check if dose changed in recent injections
    return recent.some(inj => inj.dose !== currentDose);
  }
  
  /**
   * Calculate symptom weight based on recency and contextual relevance
   */
  private calculateSymptomWeight(
    symptom: any,
    injections: Injection[],
    currentDose: number,
    currentMedication: string
  ): WeightedSymptomLog {
    const now = new Date();
    const ageInDays = (now.getTime() - symptom.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    // Recency weight (exponential decay)
    let recencyWeight = Math.exp(-ageInDays / 21); // Half-life of 21 days
    
    // Find relevant injection for this symptom
    const relevantInjection = injections.find(inj => 
      inj.timestamp <= symptom.timestamp &&
      symptom.timestamp.getTime() - inj.timestamp.getTime() <= (7 * 24 * 60 * 60 * 1000)
    );
    
    // Contextual relevance weight
    let contextualWeight = 1.0;
    
    if (relevantInjection) {
      // Same medication = more relevant
      if (relevantInjection.medication === currentMedication) {
        contextualWeight *= 1.0;
      } else {
        contextualWeight *= 0.3; // Different medication = less relevant
      }
      
      // Dose similarity = more relevant
      const doseDifference = Math.abs(relevantInjection.dose - currentDose);
      const doseRelevance = Math.max(0.2, 1 - (doseDifference / currentDose));
      contextualWeight *= doseRelevance;
      
    } else {
      // No injection context = less relevant
      contextualWeight *= 0.5;
    }
    
    // Severity bonus (severe symptoms are more important to track)
    const severityBonus = symptom.severity >= 7 ? 1.2 : 
                         symptom.severity >= 5 ? 1.0 : 0.8;
    
    const finalWeight = Math.min(1.0, recencyWeight * contextualWeight * severityBonus);
    
    return {
      symptom: symptom.symptom,
      severity: symptom.severity,
      timestamp: symptom.timestamp,
      weight: finalWeight,
      contextualRelevance: contextualWeight
    };
  }
  
  /**
   * Generate adaptive insights that evolve with user's patterns
   */
  async generateAdaptiveInsights(userId: string): Promise<AdaptiveInsight[]> {
    const weightedSymptoms = await this.getRelevantSymptomData(userId);
    const injections = await injectionService.getInjections();
    
    if (weightedSymptoms.length < 3 || injections.length < 2) {
      return [{
        pattern: 'Continue logging to build personalized insights',
        confidence: 0,
        recencyScore: 0,
        relevanceScore: 0,
        actionability: 'low',
        validUntil: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 1 week
      }];
    }
    
    const insights: AdaptiveInsight[] = [];
    
    // Pattern analysis with weighted data
    const symptomPatterns = this.analyzeWeightedPatterns(weightedSymptoms, injections);
    
    symptomPatterns.forEach(pattern => {
      const insight: AdaptiveInsight = {
        pattern: pattern.description,
        confidence: pattern.confidence,
        recencyScore: pattern.recencyScore,
        relevanceScore: pattern.relevanceScore,
        actionability: pattern.confidence > 70 ? 'high' : 
                      pattern.confidence > 40 ? 'medium' : 'low',
        validUntil: this.calculateInsightExpiry(pattern)
      };
      
      insights.push(insight);
    });
    
    return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }
  
  /**
   * Analyze patterns with weighted symptom data
   */
  private analyzeWeightedPatterns(symptoms: WeightedSymptomLog[], injections: Injection[]) {
    const patterns: any[] = [];
    const symptomGroups: { [key: string]: WeightedSymptomLog[] } = {};
    
    // Group symptoms by type
    symptoms.forEach(symptom => {
      if (!symptomGroups[symptom.symptom]) {
        symptomGroups[symptom.symptom] = [];
      }
      symptomGroups[symptom.symptom].push(symptom);
    });
    
    // Analyze each symptom type
    Object.entries(symptomGroups).forEach(([symptomType, symptomLogs]) => {
      if (symptomLogs.length < 2) return;
      
      // Calculate weighted averages
      const totalWeight = symptomLogs.reduce((sum, log) => sum + log.weight, 0);
      const weightedSeverity = symptomLogs.reduce((sum, log) => 
        sum + (log.severity * log.weight), 0) / totalWeight;
      
      // Calculate timing patterns with weighting
      const timingPatterns = this.calculateWeightedTiming(symptomLogs, injections);
      
      // Calculate confidence based on data quality
      const recencyScore = Math.min(100, totalWeight * 25);
      const consistencyScore = this.calculateConsistencyScore(timingPatterns);
      const relevanceScore = Math.min(100, 
        symptomLogs.reduce((sum, log) => sum + log.contextualRelevance, 0) / symptomLogs.length * 100
      );
      
      const confidence = Math.round((recencyScore + consistencyScore + relevanceScore) / 3);
      
      if (confidence > 25) { // Only include meaningful patterns
        patterns.push({
          symptom: symptomType,
          description: this.generatePatternDescription(symptomType, timingPatterns, weightedSeverity),
          confidence,
          recencyScore,
          relevanceScore,
          timing: timingPatterns
        });
      }
    });
    
    return patterns;
  }
  
  /**
   * Calculate when an insight should expire and be re-evaluated
   */
  private calculateInsightExpiry(pattern: any): Date {
    const baseExpiry = 14; // 2 weeks base
    
    // High confidence patterns last longer
    const confidenceMultiplier = pattern.confidence > 70 ? 2 : 
                                 pattern.confidence > 40 ? 1.5 : 1;
    
    // Recent patterns need more frequent updates
    const recencyMultiplier = pattern.recencyScore > 80 ? 0.8 : 1;
    
    const daysValid = baseExpiry * confidenceMultiplier * recencyMultiplier;
    
    return new Date(Date.now() + (daysValid * 24 * 60 * 60 * 1000));
  }
  
  /**
   * Helper methods
   */
  private calculateWeightedTiming(symptoms: WeightedSymptomLog[], injections: Injection[]): number[] {
    const timings: number[] = [];
    
    symptoms.forEach(symptom => {
      const relevantInjection = injections.find(inj => 
        inj.timestamp <= symptom.timestamp &&
        symptom.timestamp.getTime() - inj.timestamp.getTime() <= (7 * 24 * 60 * 60 * 1000)
      );
      
      if (relevantInjection) {
        const daysAfter = Math.floor(
          (symptom.timestamp.getTime() - relevantInjection.timestamp.getTime()) / (24 * 60 * 60 * 1000)
        );
        
        // Add timing multiple times based on weight (higher weight = more influence)
        const repetitions = Math.ceil(symptom.weight * 5);
        for (let i = 0; i < repetitions; i++) {
          timings.push(daysAfter);
        }
      }
    });
    
    return timings;
  }
  
  private calculateConsistencyScore(timings: number[]): number {
    if (timings.length < 2) return 0;
    
    const avg = timings.reduce((sum, t) => sum + t, 0) / timings.length;
    const variance = timings.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / timings.length;
    
    // Lower variance = higher consistency score
    return Math.max(0, Math.min(100, 100 - (variance * 20)));
  }
  
  private generatePatternDescription(symptom: string, timings: number[], severity: number): string {
    if (timings.length === 0) return `${symptom} patterns detected`;
    
    const avgTiming = timings.reduce((sum, t) => sum + t, 0) / timings.length;
    const roundedTiming = Math.round(avgTiming);
    
    const severityDesc = severity >= 7 ? 'severe' : severity >= 5 ? 'moderate' : 'mild';
    
    if (roundedTiming === 0) {
      return `${symptom} typically occurs on injection day with ${severityDesc} intensity`;
    } else {
      return `${symptom} typically appears ${roundedTiming} day${roundedTiming > 1 ? 's' : ''} after injection with ${severityDesc} intensity`;
    }
  }
}

export const adaptiveAnalyticsService = new AdaptiveAnalyticsService();