import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { app } from '../firebase/config';
import crypto from 'crypto';

const db = getFirestore(app);

interface CacheEntry {
  key: string;
  data: any;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  userId?: string;
  tags?: string[];
}

class CacheService {
  private readonly CACHE_COLLECTION = 'api_cache';
  private readonly DEFAULT_TTL = 60 * 60 * 24; // 24 hours in seconds
  private readonly MEAL_CACHE_TTL = 60 * 60 * 12; // 12 hours for meal data
  
  /**
   * Generate a cache key from request parameters
   */
  generateCacheKey(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, any>);
    
    const paramString = JSON.stringify(sortedParams);
    return crypto.createHash('md5').update(paramString).digest('hex');
  }

  /**
   * Get cached data if it exists and is not expired
   */
  async get<T>(key: string, userId?: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.CACHE_COLLECTION, key);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const cacheEntry = docSnap.data() as CacheEntry;
      
      // Check if cache is expired
      if (cacheEntry.expiresAt.toDate() < new Date()) {
        // Delete expired cache
        await deleteDoc(docRef);
        return null;
      }
      
      // Check if userId matches (for user-specific caches)
      if (userId && cacheEntry.userId && cacheEntry.userId !== userId) {
        return null;
      }
      
      return cacheEntry.data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache data with optional TTL and tags
   */
  async set<T>(
    key: string, 
    data: T, 
    options?: {
      ttl?: number;
      userId?: string;
      tags?: string[];
    }
  ): Promise<void> {
    try {
      const ttl = options?.ttl || this.DEFAULT_TTL;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl * 1000);
      
      const cacheEntry: CacheEntry = {
        key,
        data,
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt),
        userId: options?.userId,
        tags: options?.tags
      };
      
      const docRef = doc(db, this.CACHE_COLLECTION, key);
      await setDoc(docRef, cacheEntry);
    } catch (error) {
      console.error('Cache set error:', error);
      // Don't throw - caching failures shouldn't break the app
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      const docRef = doc(db, this.CACHE_COLLECTION, key);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear cache entries by tag
   */
  async clearByTag(tag: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.CACHE_COLLECTION),
        where('tags', 'array-contains', tag)
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Cache clear by tag error:', error);
    }
  }

  /**
   * Clear user-specific cache
   */
  async clearUserCache(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.CACHE_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Cache clear user error:', error);
    }
  }

  /**
   * Clear expired cache entries (maintenance function)
   */
  async clearExpired(): Promise<void> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.CACHE_COLLECTION),
        where('expiresAt', '<', now)
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`Cleared ${querySnapshot.size} expired cache entries`);
    } catch (error) {
      console.error('Cache clear expired error:', error);
    }
  }

  /**
   * Cache meal generation results
   */
  async cacheMealGeneration(
    params: {
      preferences: any;
      mealType?: string;
      userId?: string;
    },
    result: any
  ): Promise<void> {
    const cacheKey = this.generateCacheKey({
      type: 'meal_generation',
      preferences: params.preferences,
      mealType: params.mealType
    });
    
    await this.set(cacheKey, result, {
      ttl: this.MEAL_CACHE_TTL,
      userId: params.userId,
      tags: ['meal_generation', params.mealType || 'any']
    });
  }

  /**
   * Get cached meal generation results
   */
  async getCachedMealGeneration(params: {
    preferences: any;
    mealType?: string;
    userId?: string;
  }): Promise<any | null> {
    const cacheKey = this.generateCacheKey({
      type: 'meal_generation',
      preferences: params.preferences,
      mealType: params.mealType
    });
    
    return await this.get(cacheKey, params.userId);
  }

  /**
   * Cache Spoonacular API responses
   */
  async cacheSpoonacularResponse(
    endpoint: string,
    params: any,
    response: any,
    ttl?: number
  ): Promise<void> {
    const cacheKey = this.generateCacheKey({
      api: 'spoonacular',
      endpoint,
      params
    });
    
    await this.set(cacheKey, response, {
      ttl: ttl || this.DEFAULT_TTL,
      tags: ['spoonacular', endpoint]
    });
  }

  /**
   * Get cached Spoonacular response
   */
  async getCachedSpoonacularResponse(
    endpoint: string,
    params: any
  ): Promise<any | null> {
    const cacheKey = this.generateCacheKey({
      api: 'spoonacular',
      endpoint,
      params
    });
    
    return await this.get(cacheKey);
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export the class for testing
export default CacheService;