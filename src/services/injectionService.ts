import { Injection, DoseSchedule, InjectionSite } from '@/types/injection';

class InjectionService {
  private readonly STORAGE_KEY = 'glp1_injections';
  private readonly DOSE_SCHEDULE_KEY = 'glp1_dose_schedule';
  private readonly SITE_ROTATION_DAYS = 14; // FDA recommends 2 week rotation

  // Get all injections from local storage
  getInjections(): Injection[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    
    const injections = JSON.parse(stored);
    // Convert date strings back to Date objects
    return injections.map((inj: any) => ({
      ...inj,
      timestamp: new Date(inj.timestamp)
    }));
  }

  // Save injection to local storage
  saveInjection(injection: Omit<Injection, 'id'>): Injection {
    const injections = this.getInjections();
    const newInjection: Injection = {
      ...injection,
      id: `inj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    injections.push(newInjection);
    injections.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(injections));
    return newInjection;
  }

  // Get the most recent injection
  getLastInjection(): Injection | null {
    const injections = this.getInjections();
    return injections.length > 0 ? injections[0] : null;
  }

  // Get days since last injection
  getDaysSinceLastInjection(): number {
    const lastInjection = this.getLastInjection();
    if (!lastInjection) return -1;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastInjection.timestamp.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Get hours since last injection (useful for daily medications)
  getHoursSinceLastInjection(): number {
    const lastInjection = this.getLastInjection();
    if (!lastInjection) return -1;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastInjection.timestamp.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    return diffHours;
  }

  // Check if it's time for next injection
  isInjectionDue(medication: string): boolean {
    const lastInjection = this.getLastInjection();
    if (!lastInjection) return true;
    
    const daysSince = this.getDaysSinceLastInjection();
    const hoursSince = this.getHoursSinceLastInjection();
    
    // Daily medications (Saxenda, Victoza)
    if (medication === 'saxenda' || medication === 'victoza') {
      return hoursSince >= 24;
    }
    
    // Weekly medications (all others)
    return daysSince >= 7;
  }

  // Get injection sites with rotation warnings
  getInjectionSites(): InjectionSite[] {
    const injections = this.getInjections();
    const now = new Date();
    
    const sites: InjectionSite[] = [
      { id: 'abdomen-left', label: 'Left Abdomen', isAvailable: true, coordinates: { x: 35, y: 50 } },
      { id: 'abdomen-right', label: 'Right Abdomen', isAvailable: true, coordinates: { x: 65, y: 50 } },
      { id: 'thigh-left', label: 'Left Thigh', isAvailable: true, coordinates: { x: 40, y: 70 } },
      { id: 'thigh-right', label: 'Right Thigh', isAvailable: true, coordinates: { x: 60, y: 70 } },
      { id: 'arm-left', label: 'Left Arm', isAvailable: true, coordinates: { x: 25, y: 35 } },
      { id: 'arm-right', label: 'Right Arm', isAvailable: true, coordinates: { x: 75, y: 35 } }
    ];
    
    // Check each site for recent use
    sites.forEach(site => {
      const lastUseAtSite = injections.find(inj => inj.site === site.id);
      if (lastUseAtSite) {
        site.lastUsed = lastUseAtSite.timestamp;
        const daysSinceUse = Math.floor(
          (now.getTime() - lastUseAtSite.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        );
        site.isAvailable = daysSinceUse >= this.SITE_ROTATION_DAYS;
      }
    });
    
    return sites;
  }

  // Get sites that were used too recently
  getSiteRotationWarnings(): InjectionSite[] {
    return this.getInjectionSites().filter(site => !site.isAvailable);
  }

  // Get current dose schedule
  getDoseSchedule(): DoseSchedule | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(this.DOSE_SCHEDULE_KEY);
    if (!stored) return null;
    
    const schedule = JSON.parse(stored);
    return {
      ...schedule,
      startDate: new Date(schedule.startDate),
      nextEscalationDate: schedule.nextEscalationDate ? new Date(schedule.nextEscalationDate) : undefined
    };
  }

  // Save dose schedule
  saveDoseSchedule(schedule: DoseSchedule): void {
    localStorage.setItem(this.DOSE_SCHEDULE_KEY, JSON.stringify(schedule));
  }

  // Check if dose escalation is available
  canEscalateDose(): boolean {
    const schedule = this.getDoseSchedule();
    if (!schedule || !schedule.nextEscalationDate) return false;
    
    const now = new Date();
    return now >= schedule.nextEscalationDate;
  }

  // Get injection history for a specific period
  getInjectionHistory(days: number = 30): Injection[] {
    const injections = this.getInjections();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return injections.filter(inj => inj.timestamp >= cutoffDate);
  }

  // Get injection pattern analysis
  getInjectionPattern() {
    const injections = this.getInjectionHistory(30);
    
    if (injections.length < 2) {
      return {
        averageInterval: null,
        consistency: 'insufficient_data',
        missedDoses: 0
      };
    }
    
    // Calculate intervals between injections
    const intervals: number[] = [];
    for (let i = 1; i < injections.length; i++) {
      const diff = injections[i - 1].timestamp.getTime() - injections[i].timestamp.getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const expectedInterval = this.getDoseSchedule()?.medication === 'saxenda' || 
                            this.getDoseSchedule()?.medication === 'victoza' ? 1 : 7;
    
    // Calculate consistency
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    
    const consistency = variance < 1 ? 'excellent' : 
                       variance < 2 ? 'good' : 
                       variance < 3 ? 'fair' : 'poor';
    
    // Estimate missed doses
    const daysCovered = 30;
    const expectedDoses = Math.floor(daysCovered / expectedInterval);
    const missedDoses = Math.max(0, expectedDoses - injections.length);
    
    return {
      averageInterval: avgInterval,
      consistency,
      missedDoses,
      adherenceRate: ((expectedDoses - missedDoses) / expectedDoses * 100).toFixed(0) + '%'
    };
  }

  // Delete an injection
  deleteInjection(id: string): void {
    const injections = this.getInjections();
    const filtered = injections.filter(inj => inj.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Clear all injection data (for testing or user reset)
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.DOSE_SCHEDULE_KEY);
  }
}

export const injectionService = new InjectionService();
export default InjectionService;