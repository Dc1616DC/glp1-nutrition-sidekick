import { getFirestore, collection, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { app } from '../firebase/config';
import { proAnalyticsService, ComprehensiveAnalytics } from './proAnalyticsService';

const db = getFirestore(app);

export interface HealthcareReport {
  patientInfo: {
    reportId: string;
    generatedDate: string;
    reportingPeriod: string;
    medicationInfo: string;
  };
  summary: {
    overallScore: number;
    keyFindings: string[];
    concerningPatterns: string[];
    positiveIndicators: string[];
  };
  symptomAnalysis: {
    mostFrequentSymptoms: Array<{
      symptom: string;
      frequency: number;
      avgSeverity: number;
      trend: string;
    }>;
    symptomPatterns: string[];
    mealCorrelations: string[];
  };
  nutritionAssessment: {
    avgProteinIntake: number;
    avgFiberIntake: number;
    avgCalorieIntake: number;
    mealTiming: string[];
    effectiveMeals: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    dietaryAdjustments: string[];
  };
  dataQuality: {
    trackingConsistency: number;
    dataPoints: number;
    reliabilityScore: number;
  };
  disclaimer: string;
}

class HealthcareExportService {
  /**
   * Generate comprehensive healthcare provider report
   */
  async generateHealthcareReport(userId: string, timeRangeDays: number = 90): Promise<HealthcareReport> {
    try {
      // Get comprehensive analytics
      const analytics = await proAnalyticsService.generateComprehensiveAnalytics(userId, timeRangeDays);
      
      // Get raw symptom data
      const symptomLogs = await this.fetchSymptomLogs(userId, timeRangeDays);
      
      // Generate report sections
      const patientInfo = this.generatePatientInfo(timeRangeDays);
      const summary = this.generateExecutiveSummary(analytics, symptomLogs);
      const symptomAnalysis = this.generateSymptomAnalysis(analytics, symptomLogs);
      const nutritionAssessment = this.generateNutritionAssessment(analytics);
      const recommendations = this.generateRecommendations(analytics);
      const dataQuality = this.generateDataQualityAssessment(symptomLogs, analytics);

      return {
        patientInfo,
        summary,
        symptomAnalysis,
        nutritionAssessment,
        recommendations,
        dataQuality,
        disclaimer: this.getHealthcareDisclaimer()
      };
    } catch (error) {
      console.error('Error generating healthcare report:', error);
      throw error;
    }
  }

  /**
   * Export data in CSV format for healthcare providers
   */
  async exportSymptomDataCSV(userId: string, timeRangeDays: number = 90): Promise<string> {
    const logs = await this.fetchSymptomLogs(userId, timeRangeDays);
    
    const headers = ['Date', 'Time', 'Symptom', 'Severity (1-10)', 'Meal Related', 'Notes'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const date = new Date(log.timestamp.toDate());
      const dateStr = date.toLocaleDateString();
      const timeStr = date.toLocaleTimeString();
      
      const row = [
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${log.symptom}"`,
        log.severity.toString(),
        log.mealRelated ? 'Yes' : 'No',
        `"${(log.notes || '').replace(/"/g, '""')}"`
      ];
      
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Generate printable PDF report (returns formatted content)
   */
  async generatePrintableReport(userId: string, timeRangeDays: number = 90): Promise<string> {
    const report = await this.generateHealthcareReport(userId, timeRangeDays);
    
    // Return HTML content that can be converted to PDF
    return this.formatReportAsHTML(report);
  }

  // Private helper methods
  private async fetchSymptomLogs(userId: string, days: number): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logsRef = collection(db, `userSymptoms/${userId}/logs`);
    const q = query(
      logsRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const logs: any[] = [];
    
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    
    return logs;
  }

  private generatePatientInfo(timeRangeDays: number): HealthcareReport['patientInfo'] {
    const reportId = `HCR-${Date.now().toString(36).toUpperCase()}`;
    const endDate = new Date().toLocaleDateString();
    const startDate = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000).toLocaleDateString();
    
    return {
      reportId,
      generatedDate: new Date().toISOString(),
      reportingPeriod: `${startDate} - ${endDate} (${timeRangeDays} days)`,
      medicationInfo: 'GLP-1 Receptor Agonist (Patient self-reported)'
    };
  }

  private generateExecutiveSummary(analytics: ComprehensiveAnalytics, logs: any[]): HealthcareReport['summary'] {
    const keyFindings: string[] = [];
    const concerningPatterns: string[] = [];
    const positiveIndicators: string[] = [];
    
    // Analyze overall health score
    if (analytics.personalizedScore.overall >= 80) {
      positiveIndicators.push('Excellent overall symptom management and nutrition adherence');
    } else if (analytics.personalizedScore.overall < 60) {
      concerningPatterns.push('Below-average overall health score indicates need for intervention');
    }
    
    // Analyze symptom patterns
    const highFrequencySymptoms = analytics.symptomPatterns.filter(p => p.frequency > 5);
    if (highFrequencySymptoms.length > 0) {
      keyFindings.push(`High frequency symptoms: ${highFrequencySymptoms.map(s => s.symptom).join(', ')}`);
    }
    
    // Analyze trends
    const worseningSymptoms = analytics.symptomPatterns.filter(p => p.trend === 'worsening');
    if (worseningSymptoms.length > 0) {
      concerningPatterns.push(`Worsening symptoms: ${worseningSymptoms.map(s => s.symptom).join(', ')}`);
    }
    
    const improvingSymptoms = analytics.symptomPatterns.filter(p => p.trend === 'improving');
    if (improvingSymptoms.length > 0) {
      positiveIndicators.push(`Improving symptoms: ${improvingSymptoms.map(s => s.symptom).join(', ')}`);
    }
    
    // Data quality assessment
    if (analytics.personalizedScore.consistency >= 70) {
      positiveIndicators.push('Consistent data tracking indicates good patient engagement');
    } else {
      concerningPatterns.push('Inconsistent tracking may affect data reliability');
    }

    return {
      overallScore: analytics.personalizedScore.overall,
      keyFindings: keyFindings.length > 0 ? keyFindings : ['Patient showing typical GLP-1 medication response'],
      concerningPatterns: concerningPatterns.length > 0 ? concerningPatterns : ['No significant concerning patterns identified'],
      positiveIndicators: positiveIndicators.length > 0 ? positiveIndicators : ['Patient demonstrating medication compliance']
    };
  }

  private generateSymptomAnalysis(analytics: ComprehensiveAnalytics, logs: any[]): HealthcareReport['symptomAnalysis'] {
    const symptomCounts: { [key: string]: { count: number; totalSeverity: number } } = {};
    
    // Count symptoms and calculate averages
    logs.forEach(log => {
      if (!symptomCounts[log.symptom]) {
        symptomCounts[log.symptom] = { count: 0, totalSeverity: 0 };
      }
      symptomCounts[log.symptom].count++;
      symptomCounts[log.symptom].totalSeverity += log.severity;
    });
    
    const mostFrequentSymptoms = Object.entries(symptomCounts)
      .map(([symptom, data]) => ({
        symptom,
        frequency: data.count,
        avgSeverity: Number((data.totalSeverity / data.count).toFixed(1)),
        trend: analytics.symptomPatterns.find(p => p.symptom === symptom)?.trend || 'stable'
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
    
    const symptomPatterns: string[] = [];
    analytics.symptomPatterns.forEach(pattern => {
      if (pattern.frequency > 2) {
        symptomPatterns.push(
          `${pattern.symptom}: Most common in the ${pattern.timeOfDay} (${pattern.frequency}x, avg severity ${pattern.avgSeverity.toFixed(1)})`
        );
      }
    });
    
    const mealCorrelations: string[] = [];
    analytics.symptomPatterns.forEach(pattern => {
      if (Math.abs(pattern.mealCorrelation) > 0.3) {
        const correlation = pattern.mealCorrelation > 0 ? 'strongly correlated with' : 'often occurs independently of';
        mealCorrelations.push(`${pattern.symptom} ${correlation} meal consumption`);
      }
    });

    return {
      mostFrequentSymptoms,
      symptomPatterns: symptomPatterns.length > 0 ? symptomPatterns : ['No significant timing patterns identified'],
      mealCorrelations: mealCorrelations.length > 0 ? mealCorrelations : ['No strong meal correlations identified']
    };
  }

  private generateNutritionAssessment(analytics: ComprehensiveAnalytics): HealthcareReport['nutritionAssessment'] {
    const bestMeals = analytics.mealEffectiveness
      .sort((a, b) => b.symptomReduction - a.symptomReduction)
      .slice(0, 3);
    
    const avgProtein = bestMeals.reduce((sum, meal) => sum + meal.protein, 0) / Math.max(bestMeals.length, 1);
    const avgFiber = bestMeals.reduce((sum, meal) => sum + meal.fiber, 0) / Math.max(bestMeals.length, 1);
    const avgCalories = bestMeals.reduce((sum, meal) => sum + meal.calories, 0) / Math.max(bestMeals.length, 1);
    
    return {
      avgProteinIntake: Math.round(avgProtein),
      avgFiberIntake: Math.round(avgFiber),
      avgCalorieIntake: Math.round(avgCalories),
      mealTiming: bestMeals.map(meal => `${meal.mealType}: ${meal.optimalTiming}`),
      effectiveMeals: bestMeals.map(meal => 
        `${meal.mealType} (${meal.symptomReduction}% symptom reduction, ${meal.toleranceScore}/100 tolerance)`
      )
    };
  }

  private generateRecommendations(analytics: ComprehensiveAnalytics): HealthcareReport['recommendations'] {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    const dietaryAdjustments: string[] = [];
    
    // Process predictive model recommendations
    analytics.predictiveModel.recommendations.forEach(rec => {
      if (rec.priority === 'high') {
        immediate.push(rec.action);
      } else if (rec.priority === 'medium') {
        shortTerm.push(rec.action);
      } else {
        longTerm.push(rec.action);
      }
      
      if (rec.category === 'nutrition') {
        dietaryAdjustments.push(rec.action);
      }
    });
    
    // Add specific clinical recommendations based on patterns
    if (analytics.personalizedScore.symptomManagement < 60) {
      immediate.push('Consider medication timing adjustment or dose evaluation');
    }
    
    if (analytics.personalizedScore.nutrition < 70) {
      shortTerm.push('Referral to registered dietitian for GLP-1 specific nutrition counseling');
    }

    return {
      immediate: immediate.length > 0 ? immediate : ['Continue current medication regimen'],
      shortTerm: shortTerm.length > 0 ? shortTerm : ['Monitor symptom progression'],
      longTerm: longTerm.length > 0 ? longTerm : ['Maintain consistent follow-up schedule'],
      dietaryAdjustments: dietaryAdjustments.length > 0 ? dietaryAdjustments : ['Current dietary approach appears appropriate']
    };
  }

  private generateDataQualityAssessment(logs: any[], analytics: ComprehensiveAnalytics): HealthcareReport['dataQuality'] {
    const trackingConsistency = analytics.personalizedScore.consistency;
    const dataPoints = logs.length;
    
    // Calculate reliability based on consistency and volume
    const reliabilityScore = Math.min(100, 
      (trackingConsistency * 0.7 + Math.min(dataPoints / 30, 1) * 0.3) * 100
    );
    
    return {
      trackingConsistency: Math.round(trackingConsistency * 100),
      dataPoints,
      reliabilityScore: Math.round(reliabilityScore)
    };
  }

  private formatReportAsHTML(report: HealthcareReport): string {
    return `
      <html>
        <head>
          <title>GLP-1 Healthcare Report - ${report.patientInfo.reportId}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
            .metric { background: #f8fafc; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .score { font-size: 24px; font-weight: bold; }
            .disclaimer { background: #fef3cd; padding: 15px; border-radius: 5px; font-size: 12px; }
            ul { padding-left: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GLP-1 Medication Progress Report</h1>
            <p>Report ID: ${report.patientInfo.reportId}</p>
            <p>Generated: ${new Date(report.patientInfo.generatedDate).toLocaleDateString()}</p>
            <p>Period: ${report.patientInfo.reportingPeriod}</p>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="metric">
              <strong>Overall Health Score: </strong>
              <span class="score">${report.summary.overallScore}/100</span>
            </div>
            
            <h3>Key Findings:</h3>
            <ul>
              ${report.summary.keyFindings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
            
            <h3>Positive Indicators:</h3>
            <ul>
              ${report.summary.positiveIndicators.map(indicator => `<li>${indicator}</li>`).join('')}
            </ul>
            
            ${report.summary.concerningPatterns.length > 0 ? `
            <h3>Areas of Concern:</h3>
            <ul>
              ${report.summary.concerningPatterns.map(pattern => `<li>${pattern}</li>`).join('')}
            </ul>
            ` : ''}
          </div>

          <div class="section">
            <h2>Symptom Analysis</h2>
            
            <h3>Most Frequent Symptoms:</h3>
            <table>
              <tr><th>Symptom</th><th>Frequency</th><th>Avg Severity</th><th>Trend</th></tr>
              ${report.symptomAnalysis.mostFrequentSymptoms.map(symptom => `
                <tr>
                  <td>${symptom.symptom}</td>
                  <td>${symptom.frequency}</td>
                  <td>${symptom.avgSeverity}/10</td>
                  <td>${symptom.trend}</td>
                </tr>
              `).join('')}
            </table>
            
            <h3>Temporal Patterns:</h3>
            <ul>
              ${report.symptomAnalysis.symptomPatterns.map(pattern => `<li>${pattern}</li>`).join('')}
            </ul>
            
            <h3>Meal Correlations:</h3>
            <ul>
              ${report.symptomAnalysis.mealCorrelations.map(correlation => `<li>${correlation}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h2>Nutrition Assessment</h2>
            <div class="metric">
              <p><strong>Average Protein Intake:</strong> ${report.nutritionAssessment.avgProteinIntake}g per meal</p>
              <p><strong>Average Fiber Intake:</strong> ${report.nutritionAssessment.avgFiberIntake}g per meal</p>
              <p><strong>Average Caloric Intake:</strong> ${report.nutritionAssessment.avgCalorieIntake} calories per meal</p>
            </div>
            
            <h3>Effective Meal Types:</h3>
            <ul>
              ${report.nutritionAssessment.effectiveMeals.map(meal => `<li>${meal}</li>`).join('')}
            </ul>
            
            <h3>Optimal Meal Timing:</h3>
            <ul>
              ${report.nutritionAssessment.mealTiming.map(timing => `<li>${timing}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h2>Clinical Recommendations</h2>
            
            <h3>Immediate Actions:</h3>
            <ul>
              ${report.recommendations.immediate.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            
            <h3>Short-term (1-3 months):</h3>
            <ul>
              ${report.recommendations.shortTerm.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            
            <h3>Long-term (3+ months):</h3>
            <ul>
              ${report.recommendations.longTerm.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            
            <h3>Dietary Adjustments:</h3>
            <ul>
              ${report.recommendations.dietaryAdjustments.map(adj => `<li>${adj}</li>`).join('')}
            </ul>
          </div>

          <div class="section">
            <h2>Data Quality Assessment</h2>
            <div class="metric">
              <p><strong>Tracking Consistency:</strong> ${report.dataQuality.trackingConsistency}%</p>
              <p><strong>Data Points Collected:</strong> ${report.dataQuality.dataPoints}</p>
              <p><strong>Reliability Score:</strong> ${report.dataQuality.reliabilityScore}/100</p>
            </div>
          </div>

          <div class="disclaimer">
            <strong>Medical Disclaimer:</strong> ${report.disclaimer}
          </div>
        </body>
      </html>
    `;
  }

  private getHealthcareDisclaimer(): string {
    return `This report is generated from patient self-reported data collected through a digital health application. 
    The analysis is provided for informational purposes only and should be used in conjunction with clinical 
    judgment and direct patient assessment. Data quality depends on patient compliance with tracking protocols. 
    All recommendations should be evaluated in the context of the patient's complete medical history and current 
    treatment plan. This report does not replace professional medical evaluation or clinical decision-making.`;
  }
}

// Export singleton instance
export const healthcareExportService = new HealthcareExportService();

export default HealthcareExportService;