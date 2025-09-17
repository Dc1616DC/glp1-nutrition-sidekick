import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Injection, DoseSchedule, InjectionSite } from '@/types/injection';

class FirestoreInjectionService {
  private readonly SITE_ROTATION_DAYS = 14; // FDA recommends 2 week rotation
  private userId: string | null = null;

  // Set the current user ID (must be called when auth state changes)
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  // Get all injections from Firestore
  async getInjections(): Promise<Injection[]> {
    if (!this.userId) return [];
    
    try {
      const injectionsRef = collection(db, 'userInjections', this.userId, 'injections');
      const q = query(injectionsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp.toDate()
      } as Injection));
    } catch (error) {
      console.error('Error fetching injections from Firestore:', error);
      return [];
    }
  }

  // Save injection to Firestore
  async saveInjection(injection: Omit<Injection, 'id'>): Promise<Injection> {
    if (!this.userId) throw new Error('User not authenticated');
    
    const newInjection: Injection = {
      ...injection,
      id: `inj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    try {
      const injectionRef = doc(db, 'userInjections', this.userId, 'injections', newInjection.id);
      await setDoc(injectionRef, {
        ...newInjection,
        timestamp: Timestamp.fromDate(newInjection.timestamp),
        userId: this.userId
      });
      
      return newInjection;
    } catch (error) {
      console.error('Error saving injection to Firestore:', error);
      throw error;
    }
  }

  // Get the most recent injection
  async getLastInjection(): Promise<Injection | null> {
    if (!this.userId) return null;
    
    try {
      const injectionsRef = collection(db, 'userInjections', this.userId, 'injections');
      const q = query(injectionsRef, orderBy('timestamp', 'desc'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return {
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp.toDate()
      } as Injection;
    } catch (error) {
      console.error('Error fetching last injection:', error);
      return null;
    }
  }

  // Get days since last injection
  async getDaysSinceLastInjection(): Promise<number> {
    const lastInjection = await this.getLastInjection();
    if (!lastInjection) return -1;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastInjection.timestamp.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Get hours since last injection (useful for daily medications)
  async getHoursSinceLastInjection(): Promise<number> {
    const lastInjection = await this.getLastInjection();
    if (!lastInjection) return -1;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastInjection.timestamp.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    return diffHours;
  }

  // Check if it's time for next injection
  async isInjectionDue(medication: string): Promise<boolean> {
    const lastInjection = await this.getLastInjection();
    if (!lastInjection) return true;
    
    const daysSince = await this.getDaysSinceLastInjection();
    const hoursSince = await this.getHoursSinceLastInjection();
    
    // Daily medications (Saxenda, Victoza)
    if (medication === 'saxenda' || medication === 'victoza') {
      return hoursSince >= 24;
    }
    
    // Weekly medications (all others)
    return daysSince >= 7;
  }

  // Get injection sites with rotation warnings
  async getInjectionSites(): Promise<InjectionSite[]> {
    const injections = await this.getInjections();
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
  async getSiteRotationWarnings(): Promise<InjectionSite[]> {
    const sites = await this.getInjectionSites();
    return sites.filter(site => !site.isAvailable);
  }

  // Get current dose schedule from Firestore
  async getDoseSchedule(): Promise<DoseSchedule | null> {
    if (!this.userId) return null;
    
    try {
      const scheduleRef = doc(db, 'userInjections', this.userId);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (!scheduleDoc.exists()) return null;
      
      const data = scheduleDoc.data();
      if (!data.doseSchedule) return null;
      
      return {
        ...data.doseSchedule,
        startDate: data.doseSchedule.startDate.toDate(),
        nextEscalationDate: data.doseSchedule.nextEscalationDate ? 
          data.doseSchedule.nextEscalationDate.toDate() : undefined
      };
    } catch (error) {
      console.error('Error fetching dose schedule:', error);
      return null;
    }
  }

  // Save dose schedule to Firestore
  async saveDoseSchedule(schedule: DoseSchedule): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      const scheduleRef = doc(db, 'userInjections', this.userId);
      await setDoc(scheduleRef, {
        doseSchedule: {
          ...schedule,
          startDate: Timestamp.fromDate(schedule.startDate),
          nextEscalationDate: schedule.nextEscalationDate ? 
            Timestamp.fromDate(schedule.nextEscalationDate) : null
        },
        userId: this.userId,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving dose schedule:', error);
      throw error;
    }
  }

  // Check if dose escalation is available
  async canEscalateDose(): Promise<boolean> {
    const schedule = await this.getDoseSchedule();
    if (!schedule || !schedule.nextEscalationDate) return false;
    
    const now = new Date();
    return now >= schedule.nextEscalationDate;
  }

  // Get injection history for a specific period
  async getInjectionHistory(days: number = 30): Promise<Injection[]> {
    const injections = await this.getInjections();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return injections.filter(inj => inj.timestamp >= cutoffDate);
  }

  // Get injection pattern analysis
  async getInjectionPattern() {
    const injections = await this.getInjectionHistory(30);
    
    if (injections.length < 2) {
      return {
        averageInterval: null,
        consistency: 'insufficient_data',
        missedDoses: 0,
        adherenceRate: 'N/A'
      };
    }
    
    // Calculate intervals between injections
    const intervals: number[] = [];
    for (let i = 1; i < injections.length; i++) {
      const diff = injections[i - 1].timestamp.getTime() - injections[i].timestamp.getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const schedule = await this.getDoseSchedule();
    const expectedInterval = schedule?.medication === 'saxenda' || 
                            schedule?.medication === 'victoza' ? 1 : 7;
    
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
  async deleteInjection(id: string): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      const injectionRef = doc(db, 'userInjections', this.userId, 'injections', id);
      await deleteDoc(injectionRef);
    } catch (error) {
      console.error('Error deleting injection:', error);
      throw error;
    }
  }

  // Clear all injection data (for testing or user reset)
  async clearAllData(): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      // Delete all injections
      const injections = await this.getInjections();
      await Promise.all(
        injections.map(inj => this.deleteInjection(inj.id))
      );
      
      // Delete dose schedule
      const scheduleRef = doc(db, 'userInjections', this.userId);
      await deleteDoc(scheduleRef);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Migrate data from localStorage to Firestore (one-time migration)
  async migrateFromLocalStorage(): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    
    try {
      // Check if migration already done
      const migrationCheck = await this.getInjections();
      if (migrationCheck.length > 0) {
        console.log('Data already exists in Firestore, skipping migration');
        return;
      }

      // Get data from localStorage
      const storedInjections = localStorage.getItem('glp1_injections');
      const storedSchedule = localStorage.getItem('glp1_dose_schedule');
      
      if (storedInjections) {
        const injections = JSON.parse(storedInjections);
        for (const injection of injections) {
          await this.saveInjection({
            ...injection,
            timestamp: new Date(injection.timestamp)
          });
        }
        console.log(`Migrated ${injections.length} injections to Firestore`);
      }
      
      if (storedSchedule) {
        const schedule = JSON.parse(storedSchedule);
        await this.saveDoseSchedule({
          ...schedule,
          startDate: new Date(schedule.startDate),
          nextEscalationDate: schedule.nextEscalationDate ? 
            new Date(schedule.nextEscalationDate) : undefined
        });
        console.log('Migrated dose schedule to Firestore');
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem('glp1_injections');
      localStorage.removeItem('glp1_dose_schedule');
      console.log('Cleared localStorage after migration');
    } catch (error) {
      console.error('Error during migration:', error);
      // Don't clear localStorage if migration failed
      throw error;
    }
  }
}

export const firestoreInjectionService = new FirestoreInjectionService();
export default FirestoreInjectionService;