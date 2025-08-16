// Offline data service for PWA support
class OfflineService {
  private dbName = 'glp1-offline-db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for different types of offline data
        if (!db.objectStoreNames.contains('savedMeals')) {
          db.createObjectStore('savedMeals', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('mealLogs')) {
          db.createObjectStore('mealLogs', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('ratings')) {
          db.createObjectStore('ratings', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('shoppingLists')) {
          db.createObjectStore('shoppingLists', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }
      };
    });
  }

  // Generic method to save data offline
  async saveOfflineData(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put({
        id: data.id || this.generateId(),
        data,
        timestamp: Date.now(),
        synced: false
      });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to save offline data to ${storeName}`));
      };
    });
  }

  // Generic method to get offline data
  async getOfflineData(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get offline data from ${storeName}`));
      };
    });
  }

  // Remove synced data
  async removeOfflineData(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to remove offline data from ${storeName}`));
      };
    });
  }

  // Save meal offline for later sync
  async saveMealOffline(mealData: any): Promise<void> {
    try {
      await this.saveOfflineData('savedMeals', mealData);
      
      // Register for background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('meal-save-sync');
      }
    } catch (error) {
      console.error('Failed to save meal offline:', error);
      throw error;
    }
  }

  // Save meal log offline
  async logMealOffline(logData: any): Promise<void> {
    try {
      await this.saveOfflineData('mealLogs', logData);
      
      // Register for background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('meal-log-sync');
      }
    } catch (error) {
      console.error('Failed to log meal offline:', error);
      throw error;
    }
  }

  // Save rating offline
  async rateMealOffline(ratingData: any): Promise<void> {
    try {
      await this.saveOfflineData('ratings', ratingData);
      
      // Register for background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('rating-sync');
      }
    } catch (error) {
      console.error('Failed to rate meal offline:', error);
      throw error;
    }
  }

  // Save user preferences offline
  async savePreferencesOffline(preferences: any): Promise<void> {
    try {
      await this.saveOfflineData('userPreferences', {
        key: 'mealPreferences',
        ...preferences
      });
    } catch (error) {
      console.error('Failed to save preferences offline:', error);
      throw error;
    }
  }

  // Get saved preferences
  async getPreferencesOffline(): Promise<any> {
    try {
      const prefs = await this.getOfflineData('userPreferences');
      return prefs.find(p => p.data.key === 'mealPreferences')?.data || null;
    } catch (error) {
      console.error('Failed to get preferences offline:', error);
      return null;
    }
  }

  // Check if device is online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get network status
  getNetworkStatus(): { online: boolean; type: string } {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    return {
      online: navigator.onLine,
      type: connection?.effectiveType || 'unknown'
    };
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    if (!this.db) await this.init();

    const stores = ['savedMeals', 'mealLogs', 'ratings', 'shoppingLists', 'userPreferences'];
    
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
      });
    }
  }

  // Get offline storage usage stats
  async getStorageStats(): Promise<{
    savedMeals: number;
    mealLogs: number;
    ratings: number;
    shoppingLists: number;
  }> {
    try {
      const [savedMeals, mealLogs, ratings, shoppingLists] = await Promise.all([
        this.getOfflineData('savedMeals'),
        this.getOfflineData('mealLogs'),
        this.getOfflineData('ratings'),
        this.getOfflineData('shoppingLists')
      ]);

      return {
        savedMeals: savedMeals.length,
        mealLogs: mealLogs.length,
        ratings: ratings.length,
        shoppingLists: shoppingLists.length
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        savedMeals: 0,
        mealLogs: 0,
        ratings: 0,
        shoppingLists: 0
      };
    }
  }

  // Generate unique ID for offline data
  private generateId(): string {
    return `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Sync offline data when back online
  async syncWhenOnline(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Still offline, skipping sync');
      return;
    }

    try {
      // Get all unsynced data
      const [savedMeals, mealLogs, ratings] = await Promise.all([
        this.getOfflineData('savedMeals'),
        this.getOfflineData('mealLogs'),
        this.getOfflineData('ratings')
      ]);

      // Filter unsynced items
      const unsyncedMeals = savedMeals.filter(item => !item.synced);
      const unsyncedLogs = mealLogs.filter(item => !item.synced);
      const unsyncedRatings = ratings.filter(item => !item.synced);

      console.log(`Syncing: ${unsyncedMeals.length} meals, ${unsyncedLogs.length} logs, ${unsyncedRatings.length} ratings`);

      // You would implement actual sync logic here
      // This is a placeholder for the sync implementation
      
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }
}

// Export singleton instance
export const offlineService = new OfflineService();
export default OfflineService;