import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

export interface MealLogEntry {
  id: string;
  mealSlot: 'breakfast' | 'mid-morning' | 'lunch' | 'afternoon' | 'dinner' | 'evening';
  timeEaten?: string; // HH:MM format
  hadProtein: boolean;
  hadVegetables: boolean;
  mealName?: string; // Optional meal description
  notes?: string; // Optional notes
  loggedAt: Date;
}

export interface DailyMealLog {
  id: string; // Format: userId_YYYY-MM-DD
  userId: string;
  date: string; // YYYY-MM-DD format
  meals: MealLogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MealLogStats {
  totalMealsLogged: number;
  proteinMealsCount: number;
  vegetableMealsCount: number;
  proteinPercentage: number;
  vegetablePercentage: number;
  mealsLoggedToday: number;
  streak: number; // Days with at least one meal logged
  weekComparison?: {
    thisWeekProteinPercentage: number;
    lastWeekProteinPercentage: number;
    thisWeekVegetablePercentage: number;
    lastWeekVegetablePercentage: number;
    thisWeekMealsLogged: number;
    lastWeekMealsLogged: number;
  };
  mealSlotInsights?: {
    slotName: string;
    proteinFrequency: number; // How often this slot includes protein
    vegetableFrequency: number; // How often this slot includes vegetables
    totalEntries: number;
  }[];
}

class MealLoggingService {
  private collectionInitialized = false;

  /**
   * Initialize the mealLogs collection if it doesn't exist
   */
  private async initializeCollection(): Promise<void> {
    if (this.collectionInitialized) return;
    
    try {
      // Simply mark as initialized - Firestore will create collection on first write
      this.collectionInitialized = true;
    } catch (error: any) {
      console.error('Error initializing meal logs collection:', error);
      this.collectionInitialized = true;
    }
  }

  /**
   * Get today's meal log for a user
   */
  async getTodaysMealLog(userId: string): Promise<DailyMealLog> {
    await this.initializeCollection();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return await this.getMealLogForDate(userId, today);
  }

  /**
   * Get meal log for a specific date
   */
  async getMealLogForDate(userId: string, date: string): Promise<DailyMealLog> {
    await this.initializeCollection();
    try {
      const logId = `${userId}_${date}`;
      const logRef = doc(db, 'mealLogs', logId);
      const logDoc = await getDoc(logRef);
      
      if (!logDoc.exists()) {
        // Create empty log for the date
        const emptyLog: DailyMealLog = {
          id: logId,
          userId,
          date,
          meals: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(logRef, {
          ...emptyLog,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        return emptyLog;
      }
      
      const data = logDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        meals: data.meals?.map((meal: any) => ({
          ...meal,
          loggedAt: meal.loggedAt?.toDate() || new Date()
        })) || []
      } as DailyMealLog;
    } catch (error: any) {
      console.error('Error fetching meal log:', error);
      // If it's a permissions error and we're trying to create a new log, 
      // return an empty log structure
      if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
        console.log('Permissions error, creating new empty log');
        const logId = `${userId}_${date}`;
        return {
          id: logId,
          userId,
          date,
          meals: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      throw error;
    }
  }

  /**
   * Log a meal entry
   */
  async logMeal(userId: string, mealEntry: {
    mealSlot: MealLogEntry['mealSlot'];
    timeEaten?: string;
    hadProtein: boolean;
    hadVegetables: boolean;
    mealName?: string;
    notes?: string;
  }): Promise<DailyMealLog> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyLog = await this.getMealLogForDate(userId, today);
      
      const newEntry: MealLogEntry = {
        id: `${mealEntry.mealSlot}_${Date.now()}`,
        mealSlot: mealEntry.mealSlot,
        timeEaten: mealEntry.timeEaten || null,
        hadProtein: mealEntry.hadProtein,
        hadVegetables: mealEntry.hadVegetables,
        mealName: mealEntry.mealName || null,
        notes: mealEntry.notes || null,
        loggedAt: new Date()
      };
      
      // Remove any existing entry for this meal slot (replace, don't duplicate)
      const updatedMeals = dailyLog.meals.filter(meal => meal.mealSlot !== mealEntry.mealSlot);
      updatedMeals.push(newEntry);
      
      const logRef = doc(db, 'mealLogs', dailyLog.id);
      await updateDoc(logRef, {
        meals: updatedMeals,
        updatedAt: serverTimestamp()
      });
      
      return await this.getMealLogForDate(userId, today);
    } catch (error) {
      console.error('Error logging meal:', error);
      throw error;
    }
  }

  /**
   * Clear a meal entry
   */
  async clearMealEntry(userId: string, mealSlot: MealLogEntry['mealSlot']): Promise<DailyMealLog> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyLog = await this.getMealLogForDate(userId, today);
      
      const updatedMeals = dailyLog.meals.filter(meal => meal.mealSlot !== mealSlot);
      
      const logRef = doc(db, 'mealLogs', dailyLog.id);
      await updateDoc(logRef, {
        meals: updatedMeals,
        updatedAt: serverTimestamp()
      });
      
      return await this.getMealLogForDate(userId, today);
    } catch (error) {
      console.error('Error clearing meal entry:', error);
      throw error;
    }
  }

  /**
   * Get meal log history for date range
   */
  async getMealLogHistory(userId: string, days: number = 7): Promise<DailyMealLog[]> {
    await this.initializeCollection();
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      const logsRef = collection(db, 'mealLogs');
      const q = query(
        logsRef,
        where('userId', '==', userId),
        where('date', '>=', startDateStr),
        orderBy('date', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const logs: DailyMealLog[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        logs.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          meals: data.meals?.map((meal: any) => ({
            ...meal,
            loggedAt: meal.loggedAt?.toDate() || new Date()
          })) || []
        } as DailyMealLog);
      });
      
      return logs;
    } catch (error: any) {
      console.error('Error fetching meal log history:', error);
      // If it's a permissions error on empty collection, return empty array
      if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
        console.log('Collection may not exist yet, returning empty history');
        return [];
      }
      return [];
    }
  }

  /**
   * Get meal logging statistics
   */
  async getMealLogStats(userId: string, days: number = 30): Promise<MealLogStats> {
    try {
      const history = await this.getMealLogHistory(userId, days);
      
      let totalMealsLogged = 0;
      let proteinMealsCount = 0;
      let vegetableMealsCount = 0;
      let streak = 0;
      let consecutiveDays = true;
      
      // Calculate basic stats
      for (const dailyLog of history) {
        const mealsForDay = dailyLog.meals.length;
        totalMealsLogged += mealsForDay;
        
        // Count protein and veggie meals
        dailyLog.meals.forEach(meal => {
          if (meal.hadProtein) proteinMealsCount++;
          if (meal.hadVegetables) vegetableMealsCount++;
        });
        
        // Calculate streak (consecutive days with at least one meal logged)
        if (consecutiveDays) {
          if (mealsForDay > 0) {
            streak++;
          } else {
            consecutiveDays = false;
          }
        }
      }
      
      // Today's meals count
      const today = new Date().toISOString().split('T')[0];
      const todayLog = history.find(log => log.date === today);
      const mealsLoggedToday = todayLog?.meals.length || 0;
      
      // Week comparison (this week vs last week)
      const now = new Date();
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
      
      const thisWeekLogs = history.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startOfThisWeek;
      });
      
      const lastWeekLogs = history.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startOfLastWeek && logDate < startOfThisWeek;
      });
      
      const thisWeekStats = this.calculateWeekStats(thisWeekLogs);
      const lastWeekStats = this.calculateWeekStats(lastWeekLogs);
      
      // Meal slot insights
      const mealSlotInsights = this.calculateMealSlotInsights(history);
      
      return {
        totalMealsLogged,
        proteinMealsCount,
        vegetableMealsCount,
        proteinPercentage: totalMealsLogged > 0 ? (proteinMealsCount / totalMealsLogged) * 100 : 0,
        vegetablePercentage: totalMealsLogged > 0 ? (vegetableMealsCount / totalMealsLogged) * 100 : 0,
        mealsLoggedToday,
        streak,
        weekComparison: {
          thisWeekProteinPercentage: thisWeekStats.proteinPercentage,
          lastWeekProteinPercentage: lastWeekStats.proteinPercentage,
          thisWeekVegetablePercentage: thisWeekStats.vegetablePercentage,
          lastWeekVegetablePercentage: lastWeekStats.vegetablePercentage,
          thisWeekMealsLogged: thisWeekStats.totalMeals,
          lastWeekMealsLogged: lastWeekStats.totalMeals
        },
        mealSlotInsights
      };
    } catch (error) {
      console.error('Error calculating meal log stats:', error);
      return {
        totalMealsLogged: 0,
        proteinMealsCount: 0,
        vegetableMealsCount: 0,
        proteinPercentage: 0,
        vegetablePercentage: 0,
        mealsLoggedToday: 0,
        streak: 0
      };
    }
  }

  private calculateWeekStats(logs: DailyMealLog[]) {
    let totalMeals = 0;
    let proteinMeals = 0;
    let vegetableMeals = 0;
    
    logs.forEach(log => {
      totalMeals += log.meals.length;
      log.meals.forEach(meal => {
        if (meal.hadProtein) proteinMeals++;
        if (meal.hadVegetables) vegetableMeals++;
      });
    });
    
    return {
      totalMeals,
      proteinPercentage: totalMeals > 0 ? (proteinMeals / totalMeals) * 100 : 0,
      vegetablePercentage: totalMeals > 0 ? (vegetableMeals / totalMeals) * 100 : 0
    };
  }

  private calculateMealSlotInsights(history: DailyMealLog[]) {
    const slotStats: { [key: string]: { protein: number; vegetables: number; total: number } } = {};
    
    history.forEach(log => {
      log.meals.forEach(meal => {
        if (!slotStats[meal.mealSlot]) {
          slotStats[meal.mealSlot] = { protein: 0, vegetables: 0, total: 0 };
        }
        
        slotStats[meal.mealSlot].total++;
        if (meal.hadProtein) slotStats[meal.mealSlot].protein++;
        if (meal.hadVegetables) slotStats[meal.mealSlot].vegetables++;
      });
    });
    
    return Object.entries(slotStats).map(([slotName, stats]) => ({
      slotName,
      proteinFrequency: stats.total > 0 ? (stats.protein / stats.total) * 100 : 0,
      vegetableFrequency: stats.total > 0 ? (stats.vegetables / stats.total) * 100 : 0,
      totalEntries: stats.total
    })).sort((a, b) => b.totalEntries - a.totalEntries); // Sort by most used slots
  }
}

// Export singleton instance
export const mealLoggingService = new MealLoggingService();

export default MealLoggingService;