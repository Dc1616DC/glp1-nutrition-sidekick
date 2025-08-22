import { collection, query, orderBy, limit, getDocs, where, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';
import { injectionService } from './injectionService';
import { Injection } from '@/types/injection';

interface SymptomLog {
  id: string;
  symptom: string;
  severity: number;
  notes: string;
  mealRelated: boolean | null;
  timestamp: Date;
  userId: string;
}

interface InjectionSymptomPattern {
  symptom: string;
  avgSeverity: number;
  frequency: number;
  daysAfterInjection: number[];
  confidence: 'high' | 'medium' | 'low';
  description: string;
}

interface InjectionCorrelationInsights {
  patterns: InjectionSymptomPattern[];
  peakSymptomWindow: {
    days: number[];
    description: string;
  } | null;
  siteCorrelations: {
    site: string;
    symptoms: { symptom: string; frequency: number }[];
  }[];
  doseCorrelations: {
    dose: number;
    avgSymptomSeverity: number;
    commonSymptoms: string[];
  }[];
  recommendations: string[];
  confidenceScore: number;
}

export class InjectionSymptomCorrelationService {
  
  /**
   * Analyze correlation between injections and symptoms
   */
  async analyzeInjectionSymptomCorrelations(userId: string): Promise<InjectionSymptomCorrelationInsights> {
    try {
      // Get injection data from local storage
      const injections = injectionService.getInjections();
      
      // Get symptom data from Firestore
      const symptoms = await this.getUserSymptoms(userId);
      
      if (injections.length < 2 || symptoms.length < 3) {
        return this.getInsufficientDataInsights();
      }
      
      // Analyze patterns
      const patterns = this.findInjectionSymptomPatterns(injections, symptoms);
      const peakSymptomWindow = this.findPeakSymptomWindow(injections, symptoms);
      const siteCorrelations = this.analyzeSiteCorrelations(injections, symptoms);
      const doseCorrelations = this.analyzeDoseCorrelations(injections, symptoms);
      const recommendations = this.generateRecommendations(patterns, peakSymptomWindow, siteCorrelations);
      const confidenceScore = this.calculateConfidenceScore(injections, symptoms, patterns);
      
      return {
        patterns,
        peakSymptomWindow,
        siteCorrelations,
        doseCorrelations,
        recommendations,
        confidenceScore
      };
      
    } catch (error) {
      console.error('Error analyzing injection-symptom correlations:', error);
      return this.getErrorInsights();
    }
  }
  
  /**
   * Get user's symptom logs from Firestore
   */
  private async getUserSymptoms(userId: string): Promise<SymptomLog[]> {
    try {
      // Get last 60 days of symptom data for better pattern analysis
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const logsRef = collection(db, `userSymptoms/${userId}/logs`);
      const q = query(
        logsRef,
        where('timestamp', '>=', sixtyDaysAgo),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const symptoms: SymptomLog[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        symptoms.push({
          id: doc.id,
          symptom: data.symptom,
          severity: data.severity,
          notes: data.notes || '',
          mealRelated: data.mealRelated,
          timestamp: data.timestamp.toDate(),
          userId: data.userId
        });
      });

      return symptoms;
    } catch (error) {
      console.error('Error fetching symptoms:', error);
      return [];
    }
  }
  
  /**
   * Find patterns between injection timing and symptoms
   */
  private findInjectionSymptomPatterns(injections: Injection[], symptoms: SymptomLog[]): InjectionSymptomPattern[] {
    const patterns: { [key: string]: { severities: number[]; daysAfter: number[]; count: number } } = {};
    
    symptoms.forEach(symptom => {
      // Find the most recent injection before this symptom
      const relevantInjection = injections.find(inj => 
        inj.timestamp <= symptom.timestamp &&
        symptom.timestamp.getTime() - inj.timestamp.getTime() <= (7 * 24 * 60 * 60 * 1000) // Within 7 days
      );
      
      if (relevantInjection) {
        const daysAfter = Math.floor(
          (symptom.timestamp.getTime() - relevantInjection.timestamp.getTime()) / (24 * 60 * 60 * 1000)
        );
        
        if (!patterns[symptom.symptom]) {
          patterns[symptom.symptom] = { severities: [], daysAfter: [], count: 0 };
        }
        
        patterns[symptom.symptom].severities.push(symptom.severity);
        patterns[symptom.symptom].daysAfter.push(daysAfter);
        patterns[symptom.symptom].count++;
      }
    });
    
    return Object.entries(patterns)
      .filter(([_, data]) => data.count >= 2) // At least 2 occurrences
      .map(([symptom, data]) => {
        const avgSeverity = data.severities.reduce((sum, s) => sum + s, 0) / data.severities.length;
        const frequency = data.count / injections.length;
        const confidence = data.count >= 4 ? 'high' : data.count >= 3 ? 'medium' : 'low';
        
        const mostCommonDay = this.getMostCommonValue(data.daysAfter);
        const description = this.generatePatternDescription(symptom, mostCommonDay, avgSeverity, frequency);
        
        return {
          symptom,
          avgSeverity: Math.round(avgSeverity * 10) / 10,
          frequency: Math.round(frequency * 100) / 100,
          daysAfterInjection: data.daysAfter,
          confidence,
          description
        };
      })
      .sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Find the peak symptom window after injections
   */
  private findPeakSymptomWindow(injections: Injection[], symptoms: SymptomLog[]): { days: number[]; description: string } | null {
    const dayFrequency: { [key: number]: number } = {};
    
    symptoms.forEach(symptom => {
      const relevantInjection = injections.find(inj => 
        inj.timestamp <= symptom.timestamp &&
        symptom.timestamp.getTime() - inj.timestamp.getTime() <= (7 * 24 * 60 * 60 * 1000)
      );
      
      if (relevantInjection) {
        const daysAfter = Math.floor(
          (symptom.timestamp.getTime() - relevantInjection.timestamp.getTime()) / (24 * 60 * 60 * 1000)
        );
        
        dayFrequency[daysAfter] = (dayFrequency[daysAfter] || 0) + 1;
      }
    });
    
    if (Object.keys(dayFrequency).length === 0) return null;
    
    const peakDays = Object.entries(dayFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([day]) => parseInt(day));
    
    let description = '';
    if (peakDays.length > 0) {
      if (peakDays[0] === 0) {
        description = 'Symptoms most commonly occur on injection day';
      } else if (peakDays[0] <= 2) {
        description = `Peak symptom window is ${peakDays[0]}-${Math.max(...peakDays)} days after injection`;
      } else {
        description = `Symptoms typically appear ${peakDays[0]} days post-injection`;
      }
    }
    
    return { days: peakDays, description };
  }
  
  /**
   * Analyze correlations between injection sites and symptoms
   */
  private analyzeSiteCorrelations(injections: Injection[], symptoms: SymptomLog[]) {
    const siteSymptoms: { [site: string]: { [symptom: string]: number } } = {};
    
    symptoms.forEach(symptom => {
      const relevantInjection = injections.find(inj => 
        inj.timestamp <= symptom.timestamp &&
        symptom.timestamp.getTime() - inj.timestamp.getTime() <= (7 * 24 * 60 * 60 * 1000)
      );
      
      if (relevantInjection) {
        if (!siteSymptoms[relevantInjection.site]) {
          siteSymptoms[relevantInjection.site] = {};
        }
        
        siteSymptoms[relevantInjection.site][symptom.symptom] = 
          (siteSymptoms[relevantInjection.site][symptom.symptom] || 0) + 1;
      }
    });
    
    return Object.entries(siteSymptoms).map(([site, symptoms]) => ({
      site,
      symptoms: Object.entries(symptoms)
        .map(([symptom, count]) => ({
          symptom,
          frequency: count
        }))
        .sort((a, b) => b.frequency - a.frequency)
    }));
  }
  
  /**
   * Analyze correlations between dose and symptoms
   */
  private analyzeDoseCorrelations(injections: Injection[], symptoms: SymptomLog[]) {
    const doseSymptoms: { [dose: number]: { severities: number[]; symptoms: string[] } } = {};
    
    symptoms.forEach(symptom => {
      const relevantInjection = injections.find(inj => 
        inj.timestamp <= symptom.timestamp &&
        symptom.timestamp.getTime() - inj.timestamp.getTime() <= (7 * 24 * 60 * 60 * 1000)
      );
      
      if (relevantInjection) {
        if (!doseSymptoms[relevantInjection.dose]) {
          doseSymptoms[relevantInjection.dose] = { severities: [], symptoms: [] };
        }
        
        doseSymptoms[relevantInjection.dose].severities.push(symptom.severity);
        doseSymptoms[relevantInjection.dose].symptoms.push(symptom.symptom);
      }
    });
    
    return Object.entries(doseSymptoms).map(([dose, data]) => ({
      dose: parseFloat(dose),
      avgSymptomSeverity: Math.round((data.severities.reduce((sum, s) => sum + s, 0) / data.severities.length) * 10) / 10,
      commonSymptoms: [...new Set(data.symptoms)].slice(0, 3)
    }));
  }
  
  /**
   * Generate actionable recommendations based on patterns
   */
  private generateRecommendations(
    patterns: InjectionSymptomPattern[], 
    peakWindow: { days: number[]; description: string } | null,
    siteCorrelations: any[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (peakWindow && peakWindow.days.length > 0) {
      if (peakWindow.days[0] <= 2) {
        recommendations.push(`Your symptoms typically peak ${peakWindow.days[0]}-${Math.max(...peakWindow.days)} days after injection. Plan lighter activities during this window.`);
      }
    }
    
    // Most problematic symptoms
    const topPatterns = patterns.slice(0, 2);
    topPatterns.forEach(pattern => {
      if (pattern.confidence === 'high' && pattern.avgSeverity >= 6) {
        recommendations.push(`${pattern.symptom} consistently occurs ${this.getMostCommonValue(pattern.daysAfterInjection)} days post-injection. Discuss symptom management strategies with your provider.`);
      }
    });
    
    // Site-specific recommendations
    const problematicSites = siteCorrelations.filter(site => 
      site.symptoms.length > 0 && site.symptoms[0].frequency > 2
    );
    
    if (problematicSites.length > 0) {
      recommendations.push(`Consider avoiding injection sites that correlate with higher symptom frequency.`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring your patterns. More data will improve insight accuracy.');
    }
    
    return recommendations;
  }
  
  /**
   * Helper methods
   */
  private getMostCommonValue(arr: number[]): number {
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });
    
    return parseInt(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
  }
  
  private generatePatternDescription(symptom: string, day: number, severity: number, frequency: number): string {
    const severityDesc = severity >= 7 ? 'severe' : severity >= 5 ? 'moderate' : 'mild';
    const freqDesc = frequency >= 0.7 ? 'consistently' : frequency >= 0.4 ? 'frequently' : 'occasionally';
    
    if (day === 0) {
      return `${symptom} ${freqDesc} occurs on injection day with ${severityDesc} intensity`;
    } else {
      return `${symptom} ${freqDesc} appears ${day} day${day > 1 ? 's' : ''} after injection with ${severityDesc} intensity`;
    }
  }
  
  private calculateConfidenceScore(injections: Injection[], symptoms: SymptomLog[], patterns: InjectionSymptomPattern[]): number {
    const dataPoints = injections.length + symptoms.length;
    const patternStrength = patterns.filter(p => p.confidence === 'high').length;
    
    let score = Math.min(dataPoints * 2, 60); // Base score from data volume
    score += patternStrength * 15; // Bonus for strong patterns
    
    return Math.min(score, 100);
  }
  
  private getInsufficientDataInsights(): InjectionSymptomCorrelationInsights {
    return {
      patterns: [],
      peakSymptomWindow: null,
      siteCorrelations: [],
      doseCorrelations: [],
      recommendations: [
        'Continue logging injections and symptoms for at least 2-3 weeks to identify patterns.',
        'Consistent tracking will unlock personalized insights about your medication response.'
      ],
      confidenceScore: 0
    };
  }
  
  private getErrorInsights(): InjectionSymptomCorrelationInsights {
    return {
      patterns: [],
      peakSymptomWindow: null,
      siteCorrelations: [],
      doseCorrelations: [],
      recommendations: ['Unable to analyze patterns at this time. Please try again later.'],
      confidenceScore: 0
    };
  }
}

export const injectionSymptomCorrelationService = new InjectionSymptomCorrelationService();