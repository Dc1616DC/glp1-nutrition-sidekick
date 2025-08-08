import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

export interface MealCommitment {
  userId: string;
  committedSlots: string[]; // ['breakfast', 'lunch', 'dinner', etc.]
  reminderSettings: {
    enabled: boolean;
    times: { [slot: string]: string }; // Custom reminder times per slot (HH:MM format)
  };
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitmentStats {
  commitmentRate: number; // % of committed meals actually logged
  currentStreak: number; // Days meeting all commitments
  bestStreak: number;
  totalCommittedMeals: number;
  totalLoggedCommittedMeals: number;
  byMealSlot: {
    [slot: string]: {
      committed: boolean;
      completionRate: number;
      missedCount: number;
      loggedCount: number;
    }
  };
  lastWeekComparison?: {
    thisWeekRate: number;
    lastWeekRate: number;
    improvement: number;
  };
}

// Default reminder times for each meal slot
export const DEFAULT_REMINDER_TIMES = {
  'breakfast': '08:00',
  'mid-morning': '10:30',
  'lunch': '13:00',
  'afternoon': '15:30',
  'dinner': '19:00',
  'evening': '21:00'
};

export const MEAL_SLOT_LABELS = {
  'breakfast': '🌅 Breakfast',
  'mid-morning': '☕ Mid-Morning Snack',
  'lunch': '🥪 Lunch',
  'afternoon': '🥨 Afternoon Snack',
  'dinner': '🍽️ Dinner',
  'evening': '🌙 Evening Snack'
};

class MealCommitmentService {
  /**
   * Get user's meal commitments
   */
  async getUserCommitments(userId: string): Promise<MealCommitment | null> {
    try {
      const commitmentRef = doc(db, 'mealCommitments', userId);
      const commitmentDoc = await getDoc(commitmentRef);
      
      if (!commitmentDoc.exists()) {
        return null;
      }
      
      const data = commitmentDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as MealCommitment;
    } catch (error) {
      console.error('Error fetching meal commitments:', error);
      return null;
    }
  }

  /**
   * Set or update user's meal commitments
   */
  async setUserCommitments(
    userId: string, 
    committedSlots: string[], 
    reminderSettings?: {
      enabled: boolean;
      times?: { [slot: string]: string };
    }
  ): Promise<MealCommitment> {
    try {
      const commitmentRef = doc(db, 'mealCommitments', userId);
      const existingDoc = await getDoc(commitmentRef);
      
      // Build reminder times for committed slots
      const reminderTimes: { [slot: string]: string } = {};
      committedSlots.forEach(slot => {
        reminderTimes[slot] = reminderSettings?.times?.[slot] || DEFAULT_REMINDER_TIMES[slot] || '12:00';
      });

      const commitment: Partial<MealCommitment> = {
        userId,
        committedSlots,
        reminderSettings: {
          enabled: reminderSettings?.enabled ?? true,
          times: reminderTimes
        },
        onboardingCompleted: true,
        updatedAt: new Date()
      };

      if (!existingDoc.exists()) {
        // Create new commitment
        commitment.createdAt = new Date();
        await setDoc(commitmentRef, {
          ...commitment,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Update existing commitment
        await updateDoc(commitmentRef, {
          ...commitment,
          updatedAt: serverTimestamp()
        });
      }

      // ✨ NEW: Sync with user's notification settings
      await this.syncCommitmentsWithNotificationSettings(userId, committedSlots, reminderTimes);

      return await this.getUserCommitments(userId) as MealCommitment;
    } catch (error) {
      console.error('Error setting meal commitments:', error);
      throw error;
    }
  }

  /**
   * Sync meal commitments with user notification settings
   * This ensures the reminders page reflects committed meals
   */
  private async syncCommitmentsWithNotificationSettings(
    userId: string, 
    committedSlots: string[], 
    reminderTimes: { [slot: string]: string }
  ): Promise<void> {
    try {
      // Import here to avoid circular dependencies
      const { updateUserProfile } = await import('../firebase/db');
      
      // Map commitment slots to notification setting keys
      const slotToNotificationMap: { [key: string]: string } = {
        'breakfast': 'breakfast',
        'mid-morning': 'morningSnack', 
        'lunch': 'lunch',
        'afternoon': 'afternoonSnack',
        'dinner': 'dinner',
        'evening': 'dinner' // Map evening to dinner for now
      };

      // Build notification settings - only include committed meals
      const notificationSettings: { [key: string]: string } = {
        breakfast: '',
        morningSnack: '',
        lunch: '',
        afternoonSnack: '',
        dinner: ''
      };

      // Enable notifications for committed slots
      committedSlots.forEach(slot => {
        const notificationKey = slotToNotificationMap[slot];
        if (notificationKey && reminderTimes[slot]) {
          notificationSettings[notificationKey] = reminderTimes[slot];
        }
      });

      // Update user profile with synced notification settings
      await updateUserProfile(userId, {
        notificationSettings
      });
      
      console.log('✅ Synced meal commitments with notification settings');
    } catch (error) {
      console.error('Error syncing commitments with notifications:', error);
      // Don't throw - this is a nice-to-have sync
    }
  }

  /**
   * Update reminder settings for commitments
   */
  async updateReminderSettings(
    userId: string,
    enabled: boolean,
    times?: { [slot: string]: string }
  ): Promise<void> {
    try {
      const commitmentRef = doc(db, 'mealCommitments', userId);
      const commitment = await this.getUserCommitments(userId);
      
      if (!commitment) {
        throw new Error('No commitments found');
      }

      await updateDoc(commitmentRef, {
        'reminderSettings.enabled': enabled,
        ...(times && { 'reminderSettings.times': times }),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      throw error;
    }
  }

  /**
   * Calculate commitment statistics
   */
  async calculateCommitmentStats(
    userId: string,
    mealLogs: any[] // Array of DailyMealLog from mealLoggingService
  ): Promise<CommitmentStats | null> {
    try {
      const commitment = await this.getUserCommitments(userId);
      if (!commitment || commitment.committedSlots.length === 0) {
        return null;
      }

      const stats: CommitmentStats = {
        commitmentRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalCommittedMeals: 0,
        totalLoggedCommittedMeals: 0,
        byMealSlot: {},
        lastWeekComparison: undefined
      };

      // Initialize slot stats
      commitment.committedSlots.forEach(slot => {
        stats.byMealSlot[slot] = {
          committed: true,
          completionRate: 0,
          missedCount: 0,
          loggedCount: 0
        };
      });

      // Calculate stats from meal logs
      let currentStreak = 0;
      let streakBroken = false;
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(today.getDate() - 14);

      let thisWeekCommitted = 0;
      let thisWeekLogged = 0;
      let lastWeekCommitted = 0;
      let lastWeekLogged = 0;

      // Sort logs by date (newest first)
      const sortedLogs = [...mealLogs].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      sortedLogs.forEach(dailyLog => {
        const logDate = new Date(dailyLog.date);
        const daysExpected = commitment.committedSlots.length;
        let daysLogged = 0;

        // Check each committed slot for this day
        commitment.committedSlots.forEach(slot => {
          const wasLogged = dailyLog.meals.some((meal: any) => meal.mealSlot === slot);
          
          if (wasLogged) {
            stats.byMealSlot[slot].loggedCount++;
            daysLogged++;
            stats.totalLoggedCommittedMeals++;
          } else {
            stats.byMealSlot[slot].missedCount++;
          }
          
          stats.totalCommittedMeals++;

          // Track weekly comparisons
          if (logDate >= sevenDaysAgo) {
            thisWeekCommitted++;
            if (wasLogged) thisWeekLogged++;
          } else if (logDate >= fourteenDaysAgo && logDate < sevenDaysAgo) {
            lastWeekCommitted++;
            if (wasLogged) lastWeekLogged++;
          }
        });

        // Calculate streak
        if (!streakBroken) {
          if (daysLogged === daysExpected) {
            currentStreak++;
          } else {
            streakBroken = true;
          }
        }
      });

      // Calculate completion rates
      stats.commitmentRate = stats.totalCommittedMeals > 0 
        ? (stats.totalLoggedCommittedMeals / stats.totalCommittedMeals) * 100 
        : 0;

      Object.keys(stats.byMealSlot).forEach(slot => {
        const slotStats = stats.byMealSlot[slot];
        const total = slotStats.loggedCount + slotStats.missedCount;
        slotStats.completionRate = total > 0 
          ? (slotStats.loggedCount / total) * 100 
          : 0;
      });

      // Set streaks
      stats.currentStreak = currentStreak;
      stats.bestStreak = Math.max(currentStreak, stats.bestStreak);

      // Calculate week comparison
      if (thisWeekCommitted > 0 && lastWeekCommitted > 0) {
        const thisWeekRate = (thisWeekLogged / thisWeekCommitted) * 100;
        const lastWeekRate = (lastWeekLogged / lastWeekCommitted) * 100;
        stats.lastWeekComparison = {
          thisWeekRate,
          lastWeekRate,
          improvement: thisWeekRate - lastWeekRate
        };
      }

      return stats;
    } catch (error) {
      console.error('Error calculating commitment stats:', error);
      return null;
    }
  }

  /**
   * Check if user should see onboarding for meal commitments
   */
  async shouldShowCommitmentOnboarding(userId: string): Promise<boolean> {
    try {
      const commitment = await this.getUserCommitments(userId);
      return !commitment || !commitment.onboardingCompleted;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return true;
    }
  }

  /**
   * Get meals that need logging based on commitments and current time
   */
  async getMealsNeedingLogging(
    userId: string,
    todaysLog: any // DailyMealLog from mealLoggingService
  ): Promise<string[]> {
    try {
      const commitment = await this.getUserCommitments(userId);
      if (!commitment) return [];

      const currentTime = new Date();
      const currentHourMinute = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      
      const needsLogging: string[] = [];

      commitment.committedSlots.forEach(slot => {
        // Check if this meal time has passed
        const mealTime = commitment.reminderSettings.times[slot] || DEFAULT_REMINDER_TIMES[slot];
        if (currentHourMinute >= mealTime) {
          // Check if it's been logged today
          const isLogged = todaysLog?.meals.some((meal: any) => meal.mealSlot === slot);
          if (!isLogged) {
            needsLogging.push(slot);
          }
        }
      });

      return needsLogging;
    } catch (error) {
      console.error('Error checking meals needing logging:', error);
      return [];
    }
  }
}

// Export singleton instance
export const mealCommitmentService = new MealCommitmentService();

export default MealCommitmentService;