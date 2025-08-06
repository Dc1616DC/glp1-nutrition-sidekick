import { getFirestore, collection, doc, getDoc, setDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

export interface SavedMeal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  nutritionTotals: {
    calories: number;
    protein: number;
    fiber: number;
    carbs?: number;
    fat?: number;
  };
  servingSize: string;
  cookingTime: number;
  mealType: string;
  tags: string[];
  rating?: number; // 1-5 stars
  notes?: string;
  source: 'ai_generated' | 'curated' | 'imported';
  originalGenerationData?: any; // Store original API response for regeneration
  savedAt: Date;
  lastAccessedAt?: Date;
  isPrivate: boolean;
  generationPreferences?: any; // Store preferences used to generate this meal
}

export interface SaveMealRequest {
  meal: {
    title: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    nutritionTotals: any;
    servingSize: string;
    cookingTime: number;
    mealType: string;
  };
  tags?: string[];
  notes?: string;
  source?: 'ai_generated' | 'curated' | 'imported';
  originalData?: any;
  generationPreferences?: any;
}

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
        title: saveRequest.meal.title,
        description: saveRequest.meal.description,
        ingredients: saveRequest.meal.ingredients || [],
        instructions: saveRequest.meal.instructions || [],
        nutritionTotals: saveRequest.meal.nutritionTotals || {},
        servingSize: saveRequest.meal.servingSize || '1 serving',
        cookingTime: saveRequest.meal.cookingTime || 30,
        mealType: saveRequest.meal.mealType || 'lunch',
        tags: saveRequest.tags || [],
        notes: saveRequest.notes,
        source: saveRequest.source || 'ai_generated',
        originalGenerationData: saveRequest.originalData,
        generationPreferences: saveRequest.generationPreferences,
        savedAt: new Date(),
        isPrivate: true // All meals are private by default
      };

      const mealRef = doc(db, 'savedMeals', mealId);
      await setDoc(mealRef, {
        ...savedMeal,
        savedAt: serverTimestamp()
      });

      console.log(`✅ Saved meal "${savedMeal.title}" for user ${userId}`);
      return savedMeal;
    } catch (error) {
      console.error('Error saving meal:', error);
      throw error;
    }
  }

  /**
   * Get user's saved meals
   */
  async getUserSavedMeals(userId: string): Promise<SavedMeal[]> {
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
        meals.push({
          ...data,
          savedAt: data.savedAt?.toDate() || new Date(),
          lastAccessedAt: data.lastAccessedAt?.toDate()
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
      
      return {
        ...data,
        savedAt: data.savedAt?.toDate() || new Date(),
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

    return await this.updateSavedMeal(mealId, userId, { rating });
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
        meals.push({
          ...data,
          savedAt: data.savedAt?.toDate() || new Date(),
          lastAccessedAt: data.lastAccessedAt?.toDate()
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