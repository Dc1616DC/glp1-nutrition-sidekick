import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, collection, query, where, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

export interface UserSubscription {
  userId: string;
  isPremium: boolean;
  subscriptionType: 'free' | 'premium';
  subscriptionStatus: 'active' | 'canceled' | 'expired';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  mealGenerationsUsed: number;
  mealGenerationsLimit: number;
  resetDate: Date; // When the monthly limit resets
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageStats {
  mealGenerationsUsed: number;
  mealGenerationsLimit: number;
  mealGenerationsRemaining: number;
  canGenerate: boolean;
  resetDate: Date;
  daysUntilReset: number;
}

class SubscriptionService {
  private readonly FREE_MEAL_LIMIT = 0; // No AI meal generations for free users
  private readonly PREMIUM_MEAL_LIMIT = 999999; // Unlimited for premium users

  /**
   * Get user's subscription information
   */
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    try {
      const subscriptionRef = doc(db, 'userSubscriptions', userId);
      const subscriptionDoc = await getDoc(subscriptionRef);
      
      if (!subscriptionDoc.exists()) {
        // Create new free subscription
        const newSubscription = await this.createFreeSubscription(userId);
        return newSubscription;
      }
      
      const data = subscriptionDoc.data();
      const subscription: UserSubscription = {
        ...data,
        currentPeriodStart: data.currentPeriodStart?.toDate(),
        currentPeriodEnd: data.currentPeriodEnd?.toDate(),
        resetDate: data.resetDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as UserSubscription;
      
      // Check if we need to reset monthly limits
      if (this.shouldResetLimits(subscription)) {
        return await this.resetMonthlyLimits(userId, subscription);
      }
      
      return subscription;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  /**
   * Check if user can generate meals and get usage stats
   */
  async getUsageStats(userId: string): Promise<UsageStats> {
    const subscription = await this.getUserSubscription(userId);
    
    const remaining = Math.max(0, subscription.mealGenerationsLimit - subscription.mealGenerationsUsed);
    const canGenerate = remaining > 0;
    
    const today = new Date();
    const timeDiff = subscription.resetDate.getTime() - today.getTime();
    const daysUntilReset = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return {
      mealGenerationsUsed: subscription.mealGenerationsUsed,
      mealGenerationsLimit: subscription.mealGenerationsLimit,
      mealGenerationsRemaining: remaining,
      canGenerate,
      resetDate: subscription.resetDate,
      daysUntilReset: Math.max(0, daysUntilReset)
    };
  }

  /**
   * Use a meal generation (increment counter)
   */
  async useMealGeneration(userId: string): Promise<{ success: boolean; usageStats: UsageStats }> {
    try {
      const stats = await this.getUsageStats(userId);
      
      if (!stats.canGenerate) {
        return {
          success: false,
          usageStats: stats
        };
      }
      
      // Increment usage counter
      const subscriptionRef = doc(db, 'userSubscriptions', userId);
      await updateDoc(subscriptionRef, {
        mealGenerationsUsed: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Return updated stats
      const updatedStats = await this.getUsageStats(userId);
      return {
        success: true,
        usageStats: updatedStats
      };
    } catch (error) {
      console.error('Error using meal generation:', error);
      throw error;
    }
  }

  /**
   * Upgrade user to premium
   */
  async upgradeToPremium(userId: string): Promise<UserSubscription> {
    try {
      const subscriptionRef = doc(db, 'userSubscriptions', userId);
      const now = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      
      await updateDoc(subscriptionRef, {
        isPremium: true,
        subscriptionType: 'premium',
        subscriptionStatus: 'active',
        currentPeriodStart: serverTimestamp(),
        currentPeriodEnd: periodEnd,
        mealGenerationsLimit: this.PREMIUM_MEAL_LIMIT,
        updatedAt: serverTimestamp()
      });
      
      return await this.getUserSubscription(userId);
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      throw error;
    }
  }

  /**
   * Cancel premium subscription (at end of period)
   */
  async cancelPremiumSubscription(userId: string): Promise<UserSubscription> {
    try {
      const subscriptionRef = doc(db, 'userSubscriptions', userId);
      
      await updateDoc(subscriptionRef, {
        subscriptionStatus: 'canceled',
        updatedAt: serverTimestamp()
      });
      
      return await this.getUserSubscription(userId);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's meal generation history
   */
  async getMealGenerationHistory(userId: string, days: number = 30): Promise<DocumentData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const historyRef = collection(db, 'userMealHistory');
      const q = query(
        historyRef,
        where('userId', '==', userId),
        where('generatedAt', '>=', startDate),
        orderBy('generatedAt', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const history: DocumentData[] = [];
      
      snapshot.forEach(doc => {
        history.push({
          id: doc.id,
          ...doc.data(),
          generatedAt: doc.data().generatedAt?.toDate()
        });
      });
      
      return history;
    } catch (error) {
      console.error('Error fetching meal generation history:', error);
      return [];
    }
  }

  // Private helper methods
  private async createFreeSubscription(userId: string): Promise<UserSubscription> {
    const now = new Date();
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1); // Reset on the 1st of each month
    resetDate.setHours(0, 0, 0, 0);
    
    const subscription: UserSubscription = {
      userId,
      isPremium: false,
      subscriptionType: 'free',
      subscriptionStatus: 'active',
      mealGenerationsUsed: 0,
      mealGenerationsLimit: this.FREE_MEAL_LIMIT,
      resetDate,
      createdAt: now,
      updatedAt: now
    };
    
    const subscriptionRef = doc(db, 'userSubscriptions', userId);
    await setDoc(subscriptionRef, {
      ...subscription,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resetDate: resetDate
    });
    
    return subscription;
  }

  private shouldResetLimits(subscription: UserSubscription): boolean {
    const today = new Date();
    return today >= subscription.resetDate;
  }

  private async resetMonthlyLimits(userId: string, subscription: UserSubscription): Promise<UserSubscription> {
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    nextResetDate.setDate(1);
    nextResetDate.setHours(0, 0, 0, 0);
    
    const subscriptionRef = doc(db, 'userSubscriptions', userId);
    await updateDoc(subscriptionRef, {
      mealGenerationsUsed: 0,
      resetDate: nextResetDate,
      updatedAt: serverTimestamp()
    });
    
    return await this.getUserSubscription(userId);
  }

  /**
   * Record a meal generation in history
   */
  async recordMealGeneration(_userId: string, mealData: Record<string, unknown>): Promise<void> {
    try {
      const historyRef = collection(db, 'userMealHistory');
      await setDoc(doc(historyRef), {
        userId: _userId,
        mealData,
        generatedAt: serverTimestamp(),
        source: mealData.source || 'unknown'
      });
    } catch (error) {
      console.error('Error recording meal generation:', error);
      // Don't throw - this is for history tracking only
    }
  }

  /**
   * Check if user has access to premium features
   */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    // TEMPORARY: Allow premium access for testing
    // TODO: Remove this before production
    console.log('⚠️ DEV MODE: Premium access granted for testing');
    return true;
    
    // Original code (commented out for testing):
    // const subscription = await this.getUserSubscription(userId);
    // return subscription.isPremium && subscription.subscriptionStatus === 'active';
  }

  /**
   * Check if user can access symptom tracking (premium only based on requirements)
   */
  async canAccessSymptomTracking(userId: string): Promise<boolean> {
    return await this.hasPremiumAccess(userId);
  }

}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

export default SubscriptionService;