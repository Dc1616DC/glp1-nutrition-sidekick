import { getFirestore, collection, doc, getDoc, setDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { app } from '../firebase/config';
import { SavedMeal, SaveMealRequest } from '../types/savedMeals';
import { offlineService } from './offlineService';

const db = getFirestore(app);

// Helper function to remove undefined values from objects (Firebase doesn't allow them)
const cleanUndefinedValues = <T>(obj: T): T => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefinedValues) as T;
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>).forEach(key => {
      const value = (obj as Record<string, unknown>)[key];
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    });
    return cleaned as T;
  }
  return obj;
};

// Types are now imported from ../types/savedMeals

class SavedMealsService {
  /**
   * Save a meal to user's collection
   */
  async saveMeal(userId: string, saveRequest: SaveMealRequest): Promise<SavedMeal> {
    try {
      const mealId = doc(collection(db, 'dummy')).id; // Generate unique ID
      
      const savedMeal: SavedMeal = {
        id: mealId,
        userId,
        title: saveRequest.meal.title || 'Untitled Meal',
        description: saveRequest.meal.description || '',
        ingredients: saveRequest.meal.ingredients || [],
        instructions: saveRequest.meal.instructions || [],
        nutritionTotals: saveRequest.meal.nutritionTotals || { calories: 0, protein: 0, fiber: 0 },
        servingSize: saveRequest.meal.servingSize || '1 serving',
        cookingTime: saveRequest.meal.cookingTime || 30,
        mealType: saveRequest.meal.mealType || 'lunch',
        tags: saveRequest.tags || [],
        notes: saveRequest.notes || '',
        source: saveRequest.source || 'ai_generated',
        originalGenerationData: saveRequest.originalData || {},
        generationPreferences: saveRequest.generationPreferences || {},
        savedAt: new Date(),
        isPrivate: true // All meals are private by default
      };

      const mealRef = doc(db, 'savedMeals', mealId);
      
      // Clean the saved meal object to remove any undefined values
      const cleanedSavedMeal = cleanUndefinedValues({
        ...savedMeal,
        savedAt: serverTimestamp()
      });
      
      await setDoc(mealRef, cleanedSavedMeal);

      console.log(`✅ Saved meal "${savedMeal.title}" for user ${userId}`);
      return savedMeal;
    } catch (error) {
      console.error('Error saving meal to Firebase, attempting offline storage:', error);
      
      // Try to save offline if Firebase fails
      try {
        await offlineService.saveMealOffline({
          ...savedMeal,
          userId,
          source: 'offline_fallback'
        });
        console.log(`💾 Saved meal "${savedMeal.title}" offline for user ${userId}`);
        return savedMeal;
      } catch (offlineError) {
        console.error('Failed to save meal both online and offline:', offlineError);
        throw error;
      }
    }
  }

  /**
   * Get user's saved meals with optional filters and sorting
   */
  async getUserSavedMeals(userId: string): Promise<SavedMeal[]> {
    // TODO: Implement filters and sort when needed
    try {
      const mealsRef = collection(db, 'savedMeals');
      const q = query(
        mealsRef,
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const meals: SavedMeal[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Handle different date formats - could be Timestamp, Date, or string
        let savedAtDate: Date;
        if (data.savedAt?.toDate) {
          // Firestore Timestamp
          savedAtDate = data.savedAt.toDate();
        } else if (data.savedAt instanceof Date) {
          // Already a Date object
          savedAtDate = data.savedAt;
        } else if (typeof data.savedAt === 'string') {
          // String date
          savedAtDate = new Date(data.savedAt);
        } else {
          // Fallback to current date
          savedAtDate = new Date();
        }
        
        let lastAccessedDate: Date | undefined;
        if (data.lastAccessedAt?.toDate) {
          lastAccessedDate = data.lastAccessedAt.toDate();
        } else if (data.lastAccessedAt instanceof Date) {
          lastAccessedDate = data.lastAccessedAt;
        } else if (typeof data.lastAccessedAt === 'string') {
          lastAccessedDate = new Date(data.lastAccessedAt);
        }
        
        meals.push({
          ...data,
          savedAt: savedAtDate,
          lastAccessedAt: lastAccessedDate
        } as SavedMeal);
      });

      return meals;
    } catch (error) {
      console.error('Error fetching saved meals:', error);
      throw error;
    }
  }

  /**
   * Get a specific saved meal
   */
  async getSavedMeal(mealId: string, userId: string): Promise<SavedMeal | null> {
    try {
      const mealRef = doc(db, 'savedMeals', mealId);
      const mealDoc = await getDoc(mealRef);
      
      if (!mealDoc.exists()) {
        return null;
      }
      
      const data = mealDoc.data();
      
      // Verify ownership
      if (data.userId !== userId) {
        throw new Error('Access denied');
      }
      
      // Update last accessed time
      await updateDoc(mealRef, {
        lastAccessedAt: serverTimestamp()
      });
      
      // Handle different date formats
      let savedAtDate: Date;
      if (data.savedAt?.toDate) {
        savedAtDate = data.savedAt.toDate();
      } else if (data.savedAt instanceof Date) {
        savedAtDate = data.savedAt;
      } else if (typeof data.savedAt === 'string') {
        savedAtDate = new Date(data.savedAt);
      } else {
        savedAtDate = new Date();
      }
      
      return {
        ...data,
        savedAt: savedAtDate,
        lastAccessedAt: new Date()
      } as SavedMeal;
    } catch (error) {
      console.error('Error fetching saved meal:', error);
      throw error;
    }
  }

  /**
   * Update a saved meal
   */
  async updateSavedMeal(mealId: string, userId: string, updates: Partial<SavedMeal>): Promise<SavedMeal> {
    try {
      const mealRef = doc(db, 'savedMeals', mealId);
      const mealDoc = await getDoc(mealRef);
      
      if (!mealDoc.exists()) {
        throw new Error('Meal not found');
      }
      
      const data = mealDoc.data();
      if (data.userId !== userId) {
        throw new Error('Access denied');
      }
      
      // Don't allow changing core identification fields
      const allowedUpdates = { ...updates };
      delete allowedUpdates.id;
      delete allowedUpdates.userId;
      delete allowedUpdates.savedAt;
      
      await updateDoc(mealRef, {
        ...allowedUpdates,
        lastAccessedAt: serverTimestamp()
      });
      
      return await this.getSavedMeal(mealId, userId) as SavedMeal;
    } catch (error) {
      console.error('Error updating saved meal:', error);
      throw error;
    }
  }

  /**
   * Delete a saved meal
   */
  async deleteSavedMeal(mealId: string, userId: string): Promise<void> {
    try {
      const mealRef = doc(db, 'savedMeals', mealId);
      const mealDoc = await getDoc(mealRef);
      
      if (!mealDoc.exists()) {
        throw new Error('Meal not found');
      }
      
      const data = mealDoc.data();
      if (data.userId !== userId) {
        throw new Error('Access denied');
      }
      
      await deleteDoc(mealRef);
      console.log(`🗑️ Deleted saved meal ${mealId} for user ${userId}`);
    } catch (error) {
      console.error('Error deleting saved meal:', error);
      throw error;
    }
  }

  /**
   * Rate a saved meal
   */
  async rateMeal(mealId: string, userId: string, rating: number): Promise<SavedMeal> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    try {
      return await this.updateSavedMeal(mealId, userId, { rating });
    } catch (error) {
      console.error('Error rating meal online, attempting offline storage:', error);
      
      // Try to save rating offline if Firebase fails
      try {
        await offlineService.rateMealOffline({
          mealId,
          userId,
          rating,
          timestamp: Date.now()
        });
        console.log(`💾 Saved rating for meal ${mealId} offline`);
        
        // Return the meal with updated rating - this is best effort
        const meal = await this.getSavedMeal(mealId, userId);
        if (meal) {
          meal.rating = rating;
          return meal;
        }
        throw error;
      } catch (offlineError) {
        console.error('Failed to save rating both online and offline:', offlineError);
        throw error;
      }
    }
  }

  /**
   * Add notes to a saved meal
   */
  async addMealNotes(mealId: string, userId: string, notes: string): Promise<SavedMeal> {
    return await this.updateSavedMeal(mealId, userId, { notes });
  }

  /**
   * Get meals by tag
   */
  async getMealsByTag(userId: string, tag: string): Promise<SavedMeal[]> {
    try {
      const mealsRef = collection(db, 'savedMeals');
      const q = query(
        mealsRef,
        where('userId', '==', userId),
        where('tags', 'array-contains', tag),
        orderBy('savedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const meals: SavedMeal[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Handle different date formats - could be Timestamp, Date, or string
        let savedAtDate: Date;
        if (data.savedAt?.toDate) {
          // Firestore Timestamp
          savedAtDate = data.savedAt.toDate();
        } else if (data.savedAt instanceof Date) {
          // Already a Date object
          savedAtDate = data.savedAt;
        } else if (typeof data.savedAt === 'string') {
          // String date
          savedAtDate = new Date(data.savedAt);
        } else {
          // Fallback to current date
          savedAtDate = new Date();
        }
        
        let lastAccessedDate: Date | undefined;
        if (data.lastAccessedAt?.toDate) {
          lastAccessedDate = data.lastAccessedAt.toDate();
        } else if (data.lastAccessedAt instanceof Date) {
          lastAccessedDate = data.lastAccessedAt;
        } else if (typeof data.lastAccessedAt === 'string') {
          lastAccessedDate = new Date(data.lastAccessedAt);
        }
        
        meals.push({
          ...data,
          savedAt: savedAtDate,
          lastAccessedAt: lastAccessedDate
        } as SavedMeal);
      });

      return meals;
    } catch (error) {
      console.error('Error fetching meals by tag:', error);
      throw error;
    }
  }

  /**
   * Get all user's meal tags
   */
  async getUserMealTags(userId: string): Promise<string[]> {
    try {
      const meals = await this.getUserSavedMeals(userId);
      const tagsSet = new Set<string>();
      
      meals.forEach(meal => {
        meal.tags.forEach(tag => tagsSet.add(tag));
      });
      
      return Array.from(tagsSet).sort();
    } catch (error) {
      console.error('Error fetching user meal tags:', error);
      return [];
    }
  }

  /**
   * Search saved meals
   */
  async searchSavedMeals(userId: string, searchTerm: string): Promise<SavedMeal[]> {
    try {
      const allMeals = await this.getUserSavedMeals(userId);
      const term = searchTerm.toLowerCase();
      
      return allMeals.filter(meal => 
        meal.title.toLowerCase().includes(term) ||
        meal.description?.toLowerCase().includes(term) ||
        meal.ingredients.some(ingredient => ingredient.toLowerCase().includes(term)) ||
        meal.tags.some(tag => tag.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching saved meals:', error);
      return [];
    }
  }

  /**
   * Get meal statistics for user
   */
  async getMealStats(userId: string): Promise<{
    totalMeals: number;
    favoriteRating: number;
    mostCommonTags: string[];
    avgRating: number;
    mealsByType: { [key: string]: number };
  }> {
    try {
      const meals = await this.getUserSavedMeals(userId);
      
      const stats = {
        totalMeals: meals.length,
        favoriteRating: 0,
        mostCommonTags: [] as string[],
        avgRating: 0,
        mealsByType: {} as { [key: string]: number }
      };
      
      if (meals.length === 0) return stats;
      
      // Calculate ratings
      const ratedMeals = meals.filter(meal => meal.rating);
      if (ratedMeals.length > 0) {
        stats.avgRating = ratedMeals.reduce((sum, meal) => sum + (meal.rating || 0), 0) / ratedMeals.length;
        stats.favoriteRating = Math.max(...ratedMeals.map(meal => meal.rating || 0));
      }
      
      // Count meal types
      meals.forEach(meal => {
        stats.mealsByType[meal.mealType] = (stats.mealsByType[meal.mealType] || 0) + 1;
      });
      
      // Get most common tags
      const tagCounts: { [key: string]: number } = {};
      meals.forEach(meal => {
        meal.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      stats.mostCommonTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);
      
      return stats;
    } catch (error) {
      console.error('Error calculating meal stats:', error);
      return {
        totalMeals: 0,
        favoriteRating: 0,
        mostCommonTags: [],
        avgRating: 0,
        mealsByType: {}
      };
    }
  }

  /**
   * Check if a meal is already saved (by title)
   */
  async isMealSaved(userId: string, mealTitle: string): Promise<boolean> {
    try {
      const meals = await this.getUserSavedMeals(userId);
      return meals.some(meal => 
        meal.title.toLowerCase() === mealTitle.toLowerCase()
      );
    } catch (error) {
      console.error('Error checking if meal is saved:', error);
      return false;
    }
  }
}

// Export singleton instance
export const savedMealsService = new SavedMealsService();

export default SavedMealsService;