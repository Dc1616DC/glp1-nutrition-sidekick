import { injectionService } from './injectionService';
import { injectionSymptomCorrelationService } from './injectionSymptomCorrelationService';

export interface MealContextWarning {
  type: 'caution' | 'tip' | 'timing';
  message: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
}

export interface InjectionMealContext {
  daysSinceInjection: number;
  isInjectionDay: boolean;
  isPeakSymptomWindow: boolean;
  warnings: MealContextWarning[];
  tips: string[];
  confidence: number;
}

class InjectionMealContextService {
  /**
   * Get meal-specific warnings based on injection timing and patterns
   */
  async getMealContext(userId: string, mealType?: string): Promise<InjectionMealContext> {
    // Get current injection status
    const daysSince = injectionService.getDaysSinceLastInjection();
    const lastInjection = injectionService.getLastInjection();
    
    // Get correlation insights
    const insights = await injectionSymptomCorrelationService.analyzeInjectionSymptomCorrelations(userId);
    
    const context: InjectionMealContext = {
      daysSinceInjection: daysSince,
      isInjectionDay: daysSince === 0,
      isPeakSymptomWindow: false,
      warnings: [],
      tips: [],
      confidence: insights.confidenceScore
    };
    
    // No injection data yet
    if (daysSince === -1 || !lastInjection) {
      return context;
    }
    
    // Check if we're in peak symptom window
    if (insights.peakSymptomWindow && insights.peakSymptomWindow.days.includes(daysSince)) {
      context.isPeakSymptomWindow = true;
    }
    
    // Generate contextual warnings based on patterns
    this.generateWarnings(context, insights, daysSince, mealType);
    
    // Generate helpful tips
    this.generateTips(context, insights, daysSince, mealType);
    
    return context;
  }
  
  /**
   * Generate warnings based on injection timing and patterns
   */
  private generateWarnings(
    context: InjectionMealContext,
    insights: any,
    daysSince: number,
    mealType?: string
  ): void {
    // Injection day warning
    if (daysSince === 0) {
      context.warnings.push({
        type: 'timing',
        message: 'Injection day - some users experience immediate mild nausea. Consider eating this meal before injecting if you haven\'t already.',
        severity: 'low',
        icon: '💉'
      });
    }
    
    // Peak symptom window warnings
    if (context.isPeakSymptomWindow && insights.confidenceScore > 40) {
      const topSymptom = insights.patterns[0];
      if (topSymptom) {
        const severity = topSymptom.avgSeverity >= 7 ? 'high' : 
                        topSymptom.avgSeverity >= 5 ? 'medium' : 'low';
        
        context.warnings.push({
          type: 'caution',
          message: `Based on your patterns, ${topSymptom.symptom} risk is elevated today (day ${daysSince} post-injection). Consider smaller portions and eat slowly.`,
          severity,
          icon: '⚠️'
        });
      }
    }
    
    // Specific symptom-based warnings
    insights.patterns.forEach((pattern: any) => {
      if (pattern.daysAfterInjection.includes(daysSince) && pattern.confidence !== 'low') {
        if (pattern.symptom === 'nausea' && pattern.avgSeverity >= 5) {
          context.warnings.push({
            type: 'caution',
            message: 'Your nausea patterns suggest keeping portions moderate and avoiding strong flavors today.',
            severity: 'medium',
            icon: '🤢'
          });
        }
        
        if (pattern.symptom === 'early fullness' && mealType) {
          context.warnings.push({
            type: 'tip',
            message: 'You may feel full quickly today. Start with half portions and save the rest for later if needed.',
            severity: 'low',
            icon: '🍽️'
          });
        }
        
        if (pattern.symptom === 'heartburn') {
          context.warnings.push({
            type: 'caution',
            message: 'Heartburn risk detected. Avoid lying down for 2-3 hours after eating.',
            severity: 'medium',
            icon: '🔥'
          });
        }
      }
    });
    
    // Deduplicate similar warnings
    const uniqueWarnings = new Map<string, MealContextWarning>();
    context.warnings.forEach(warning => {
      const key = warning.type + warning.severity;
      if (!uniqueWarnings.has(key) || warning.message.length > uniqueWarnings.get(key)!.message.length) {
        uniqueWarnings.set(key, warning);
      }
    });
    
    context.warnings = Array.from(uniqueWarnings.values())
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 3); // Max 3 warnings to avoid overwhelming
  }
  
  /**
   * Generate helpful tips based on patterns
   */
  private generateTips(
    context: InjectionMealContext,
    insights: any,
    daysSince: number,
    mealType?: string
  ): void {
    // Good days - encouraging messages
    const hasNoSymptomRisk = !insights.patterns.some((p: any) => 
      p.daysAfterInjection.includes(daysSince)
    );
    
    if (hasNoSymptomRisk && daysSince > 0) {
      context.tips.push('📊 Based on your patterns, today is typically a good day for normal portions.');
    }
    
    // Pre-symptom day preparation
    if (insights.peakSymptomWindow) {
      const peakDays = insights.peakSymptomWindow.days;
      const tomorrow = daysSince + 1;
      
      if (peakDays.includes(tomorrow) && !peakDays.includes(daysSince)) {
        context.tips.push(`💡 Tomorrow may be more challenging (day ${tomorrow}). Consider meal prepping today.`);
      }
    }
    
    // Positive reinforcement for consistency
    if (insights.confidenceScore > 60) {
      context.tips.push('✅ Your consistent tracking is providing personalized insights!');
    }
    
    // Time-of-day specific tips
    const hour = new Date().getHours();
    if (mealType === 'breakfast' && context.isPeakSymptomWindow) {
      context.tips.push('🌅 Morning meals during peak days: Start with something bland like toast, then add protein if tolerated.');
    }
    
    if (mealType === 'dinner' && daysSince === 0) {
      context.tips.push('🌙 Injection day dinner: Light meals may help with overnight comfort.');
    }
    
    // Limit to 2 tips
    context.tips = context.tips.slice(0, 2);
  }
  
  /**
   * Get a simple risk assessment for the current day
   */
  async getDailyRiskLevel(userId: string): Promise<'low' | 'medium' | 'high' | 'unknown'> {
    const context = await this.getMealContext(userId);
    
    if (context.confidence < 30) return 'unknown';
    
    const highSeverityWarnings = context.warnings.filter(w => w.severity === 'high').length;
    const mediumSeverityWarnings = context.warnings.filter(w => w.severity === 'medium').length;
    
    if (highSeverityWarnings > 0) return 'high';
    if (mediumSeverityWarnings > 1 || context.isPeakSymptomWindow) return 'medium';
    
    return 'low';
  }
}

export const injectionMealContextService = new InjectionMealContextService();