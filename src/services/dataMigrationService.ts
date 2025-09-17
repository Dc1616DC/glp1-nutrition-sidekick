import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { firestoreInjectionService } from './firestoreInjectionService';

interface MigrationResult {
  success: boolean;
  migratedItems: string[];
  errors: string[];
}

class DataMigrationService {
  private migrationInProgress = false;
  private migrationCompleted = false;

  /**
   * Main migration function - migrates all localStorage data to Firestore
   */
  async migrateAllData(userId: string): Promise<MigrationResult> {
    if (this.migrationInProgress) {
      console.log('Migration already in progress');
      return { success: false, migratedItems: [], errors: ['Migration already in progress'] };
    }

    if (this.migrationCompleted) {
      console.log('Migration already completed for this session');
      return { success: true, migratedItems: [], errors: [] };
    }

    this.migrationInProgress = true;
    const result: MigrationResult = {
      success: true,
      migratedItems: [],
      errors: []
    };

    try {
      // Check if migration has already been done for this user
      const migrationStatusRef = doc(db, 'userSettings', userId);
      const migrationDoc = await getDoc(migrationStatusRef);
      
      if (migrationDoc.exists() && migrationDoc.data()?.migrationCompleted) {
        console.log('User data already migrated to Firestore');
        this.migrationCompleted = true;
        return { success: true, migratedItems: ['Already migrated'], errors: [] };
      }

      // 1. Migrate injection data
      try {
        await this.migrateInjectionData(userId);
        result.migratedItems.push('Injection data');
      } catch (error) {
        console.error('Failed to migrate injection data:', error);
        result.errors.push('Injection data migration failed');
      }

      // 2. Migrate onboarding state
      try {
        await this.migrateOnboardingState(userId);
        result.migratedItems.push('Onboarding state');
      } catch (error) {
        console.error('Failed to migrate onboarding state:', error);
        result.errors.push('Onboarding state migration failed');
      }

      // 3. Migrate user settings
      try {
        await this.migrateUserSettings(userId);
        result.migratedItems.push('User settings');
      } catch (error) {
        console.error('Failed to migrate user settings:', error);
        result.errors.push('User settings migration failed');
      }

      // 4. Migrate notification preferences
      try {
        await this.migrateNotificationPreferences(userId);
        result.migratedItems.push('Notification preferences');
      } catch (error) {
        console.error('Failed to migrate notification preferences:', error);
        result.errors.push('Notification preferences migration failed');
      }

      // 5. Migrate evening toolkit data
      try {
        await this.migrateEveningToolkitData(userId);
        result.migratedItems.push('Evening toolkit data');
      } catch (error) {
        console.error('Failed to migrate evening toolkit data:', error);
        result.errors.push('Evening toolkit data migration failed');
      }

      // Mark migration as completed
      await setDoc(migrationStatusRef, {
        migrationCompleted: true,
        migrationDate: Timestamp.now(),
        userId,
        migratedItems: result.migratedItems,
        errors: result.errors
      }, { merge: true });

      // Clean up localStorage after successful migration (optional)
      if (result.errors.length === 0) {
        this.cleanupLocalStorage();
      }

      this.migrationCompleted = true;
      result.success = result.errors.length === 0;

    } catch (error) {
      console.error('Migration failed:', error);
      result.success = false;
      result.errors.push('General migration error');
    } finally {
      this.migrationInProgress = false;
    }

    return result;
  }

  /**
   * Migrate injection data to Firestore
   */
  private async migrateInjectionData(userId: string): Promise<void> {
    // Set user ID for the injection service
    firestoreInjectionService.setUserId(userId);
    
    // The injection service already has a migration method
    await firestoreInjectionService.migrateFromLocalStorage();
  }

  /**
   * Migrate onboarding state to Firestore
   */
  private async migrateOnboardingState(userId: string): Promise<void> {
    const onboardingCompleted = localStorage.getItem('glp1-enhanced-onboarding-completed');
    const onboardingSkipped = localStorage.getItem('glp1-onboarding-skipped');
    const userProfileStr = localStorage.getItem('glp1-user-profile');
    const nutritionOnboardingSeen = localStorage.getItem('nutritionOnboardingSeen');
    const educationSeen = localStorage.getItem('educationOnboardingSeen');
    const proteinGuideViewed = localStorage.getItem('proteinGuideViewed');
    const calculatorComplete = localStorage.getItem('tdeeCalculated');

    const updates: any = {};

    if (onboardingCompleted === 'true') {
      updates.onboardingCompleted = true;
      updates.onboardingCompletedAt = new Date().toISOString();
    }

    if (onboardingSkipped === 'true') {
      updates.onboardingSkipped = true;
    }

    if (nutritionOnboardingSeen === 'true') {
      updates.nutritionOnboardingSeen = true;
    }

    if (educationSeen === 'true') {
      updates.educationSeen = true;
    }

    if (proteinGuideViewed === 'true') {
      updates.proteinGuideViewed = true;
    }

    if (calculatorComplete === 'true') {
      updates.calculatorComplete = true;
    }

    if (userProfileStr) {
      try {
        const userProfile = JSON.parse(userProfileStr);
        if (userProfile.medication) updates.medication = userProfile.medication;
        if (userProfile.experience) updates.experience = userProfile.experience;
        if (userProfile.primaryConcerns) updates.primaryConcerns = userProfile.primaryConcerns;
      } catch (error) {
        console.error('Failed to parse user profile from localStorage:', error);
      }
    }

    if (Object.keys(updates).length > 0) {
      const profileRef = doc(db, 'userProfiles', userId);
      await setDoc(profileRef, updates, { merge: true });
    }
  }

  /**
   * Migrate user settings to Firestore
   */
  private async migrateUserSettings(userId: string): Promise<void> {
    const settings: any = {};

    // Collect all settings-related localStorage items
    const settingsKeys = [
      'darkMode',
      'notificationsEnabled',
      'soundEnabled',
      'autoLogMeals',
      'mealRemindersEnabled',
      'preferredMealTimes',
      'unitsPreference',
      'language',
      'timezone'
    ];

    for (const key of settingsKeys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          // Try to parse as JSON first
          settings[key] = JSON.parse(value);
        } catch {
          // If not JSON, store as string
          settings[key] = value;
        }
      }
    }

    // Store calculator-related data
    const tdeeData = localStorage.getItem('tdeeData');
    if (tdeeData) {
      try {
        const parsedData = JSON.parse(tdeeData);
        settings.tdee = parsedData.tdee;
        settings.targetCalories = parsedData.targetCalories;
        settings.proteinGoal = parsedData.proteinGoal;
        settings.calculatorData = parsedData;
      } catch (error) {
        console.error('Failed to parse TDEE data:', error);
      }
    }

    if (Object.keys(settings).length > 0) {
      const settingsRef = doc(db, 'userSettings', userId);
      await setDoc(settingsRef, {
        ...settings,
        userId,
        updatedAt: Timestamp.now()
      }, { merge: true });
    }
  }

  /**
   * Migrate notification preferences to Firestore
   */
  private async migrateNotificationPreferences(userId: string): Promise<void> {
    const notificationData: any = {};

    // Notification-related localStorage keys
    const notificationKeys = [
      'notificationPromptShown',
      'fcmToken',
      'notificationPermission',
      'mealReminderTimes',
      'injectionReminderEnabled',
      'symptomTrackingReminders'
    ];

    for (const key of notificationKeys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          notificationData[key] = JSON.parse(value);
        } catch {
          notificationData[key] = value;
        }
      }
    }

    if (Object.keys(notificationData).length > 0) {
      const notificationRef = doc(db, 'notificationPreferences', userId);
      await setDoc(notificationRef, {
        ...notificationData,
        userId,
        updatedAt: Timestamp.now()
      }, { merge: true });
    }
  }

  /**
   * Migrate evening toolkit data to Firestore
   */
  private async migrateEveningToolkitData(userId: string): Promise<void> {
    const eveningData = localStorage.getItem('eveningToolkitFollowUpData');
    const eveningHistory = localStorage.getItem('eveningToolkitHistory');
    const eveningInsights = localStorage.getItem('eveningToolkitInsights');

    const updates: any = {};

    if (eveningData) {
      try {
        updates.eveningToolkitData = JSON.parse(eveningData);
      } catch (error) {
        console.error('Failed to parse evening toolkit data:', error);
      }
    }

    if (eveningHistory) {
      try {
        updates.eveningToolkitHistory = JSON.parse(eveningHistory);
      } catch (error) {
        console.error('Failed to parse evening toolkit history:', error);
      }
    }

    if (eveningInsights) {
      try {
        updates.eveningToolkitInsights = JSON.parse(eveningInsights);
      } catch (error) {
        console.error('Failed to parse evening toolkit insights:', error);
      }
    }

    if (Object.keys(updates).length > 0) {
      const eveningRef = doc(db, 'userSettings', userId);
      await setDoc(eveningRef, {
        eveningToolkit: updates,
        userId,
        updatedAt: Timestamp.now()
      }, { merge: true });
    }
  }

  /**
   * Clean up localStorage after successful migration
   */
  private cleanupLocalStorage(): void {
    console.log('Cleaning up migrated localStorage data...');
    
    // List of keys to remove after successful migration
    const keysToRemove = [
      'glp1_injections',
      'glp1_dose_schedule',
      'glp1-enhanced-onboarding-completed',
      'glp1-onboarding-skipped',
      'glp1-user-profile',
      'nutritionOnboardingSeen',
      'educationOnboardingSeen',
      'proteinGuideViewed',
      'tdeeCalculated',
      'eveningToolkitFollowUpData',
      'eveningToolkitHistory',
      'eveningToolkitInsights'
    ];

    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    console.log('localStorage cleanup completed');
  }

  /**
   * Check if migration is needed for a user
   */
  async isMigrationNeeded(userId: string): Promise<boolean> {
    const migrationStatusRef = doc(db, 'userSettings', userId);
    const migrationDoc = await getDoc(migrationStatusRef);
    
    if (migrationDoc.exists() && migrationDoc.data()?.migrationCompleted) {
      return false;
    }

    // Check if there's any data in localStorage that needs migration
    const hasLocalData = 
      localStorage.getItem('glp1_injections') !== null ||
      localStorage.getItem('glp1-enhanced-onboarding-completed') !== null ||
      localStorage.getItem('tdeeData') !== null ||
      localStorage.getItem('eveningToolkitFollowUpData') !== null;

    return hasLocalData;
  }
}

export const dataMigrationService = new DataMigrationService();
export default DataMigrationService;