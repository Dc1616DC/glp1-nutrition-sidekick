import { getFirestore, doc, getDoc, setDoc, serverTimestamp, updateDoc, DocumentData } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  expirationDate?: Date;
  isLow: boolean; // Flag for low stock
  notes?: string;
  addedAt: Date;
  lastUpdatedAt: Date;
}

export interface Pantry {
  id: string;
  userId: string;
  items: PantryItem[];
  lastUpdatedAt: Date;
}

export interface AddPantryItemRequest {
  name: string;
  category?: string;
  quantity: string;
  expirationDate?: Date;
  notes?: string;
}

class PantryService {
  /**
   * Get user's pantry
   */
  async getUserPantry(userId: string): Promise<Pantry> {
    try {
      const pantryRef = doc(db, 'pantries', userId);
      const pantryDoc = await getDoc(pantryRef);
      
      if (!pantryDoc.exists()) {
        // Create empty pantry for user
        const emptyPantry: Pantry = {
          id: userId,
          userId,
          items: [],
          lastUpdatedAt: new Date()
        };
        
        await setDoc(pantryRef, {
          ...emptyPantry,
          lastUpdatedAt: serverTimestamp()
        });
        
        return emptyPantry;
      }
      
      const data = pantryDoc.data();
      return {
        ...data,
        lastUpdatedAt: data.lastUpdatedAt?.toDate() || new Date(),
        items: data.items?.map((item: DocumentData) => ({
          ...item,
          addedAt: item.addedAt?.toDate() || new Date(),
          lastUpdatedAt: item.lastUpdatedAt?.toDate() || new Date(),
          expirationDate: item.expirationDate ? item.expirationDate.toDate() : undefined
        })) || []
      } as Pantry;
    } catch (error) {
      console.error('Error fetching pantry:', error);
      throw error;
    }
  }

  /**
   * Add item to pantry
   */
  async addItemToPantry(userId: string, itemRequest: AddPantryItemRequest): Promise<Pantry> {
    try {
      const pantry = await this.getUserPantry(userId);
      
      const newItem: PantryItem = {
        id: `item_${Date.now()}`,
        name: itemRequest.name.trim(),
        category: itemRequest.category || this.categorizeIngredient(itemRequest.name),
        quantity: itemRequest.quantity,
        expirationDate: itemRequest.expirationDate,
        isLow: false,
        notes: itemRequest.notes,
        addedAt: new Date(),
        lastUpdatedAt: new Date()
      };

      const updatedItems = [...pantry.items, newItem];

      const pantryRef = doc(db, 'pantries', userId);
      await updateDoc(pantryRef, {
        items: updatedItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          expirationDate: item.expirationDate || null,
          isLow: item.isLow,
          notes: item.notes || null,
          addedAt: item.addedAt,
          lastUpdatedAt: item.lastUpdatedAt
        })),
        lastUpdatedAt: serverTimestamp()
      });

      return await this.getUserPantry(userId);
    } catch (error) {
      console.error('Error adding item to pantry:', error);
      throw error;
    }
  }

  /**
   * Update pantry item
   */
  async updatePantryItem(userId: string, itemId: string, updates: Partial<PantryItem>): Promise<Pantry> {
    try {
      const pantry = await this.getUserPantry(userId);
      
      const updatedItems = pantry.items.map(item => 
        item.id === itemId 
          ? { ...item, ...updates, lastUpdatedAt: new Date() }
          : item
      );

      const pantryRef = doc(db, 'pantries', userId);
      await updateDoc(pantryRef, {
        items: updatedItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          expirationDate: item.expirationDate || null,
          isLow: item.isLow,
          notes: item.notes || null,
          addedAt: item.addedAt,
          lastUpdatedAt: item.lastUpdatedAt
        })),
        lastUpdatedAt: serverTimestamp()
      });

      return await this.getUserPantry(userId);
    } catch (error) {
      console.error('Error updating pantry item:', error);
      throw error;
    }
  }

  /**
   * Remove item from pantry
   */
  async removeItemFromPantry(userId: string, itemId: string): Promise<Pantry> {
    try {
      const pantry = await this.getUserPantry(userId);
      
      const updatedItems = pantry.items.filter(item => item.id !== itemId);

      const pantryRef = doc(db, 'pantries', userId);
      await updateDoc(pantryRef, {
        items: updatedItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          expirationDate: item.expirationDate || null,
          isLow: item.isLow,
          notes: item.notes || null,
          addedAt: item.addedAt,
          lastUpdatedAt: item.lastUpdatedAt
        })),
        lastUpdatedAt: serverTimestamp()
      });

      return await this.getUserPantry(userId);
    } catch (error) {
      console.error('Error removing item from pantry:', error);
      throw error;
    }
  }

  /**
   * Mark item as low stock
   */
  async toggleLowStock(userId: string, itemId: string): Promise<Pantry> {
    try {
      const pantry = await this.getUserPantry(userId);
      const item = pantry.items.find(i => i.id === itemId);
      
      if (!item) {
        throw new Error('Item not found');
      }

      return await this.updatePantryItem(userId, itemId, { isLow: !item.isLow });
    } catch (error) {
      console.error('Error toggling low stock:', error);
      throw error;
    }
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(userId: string, category: string): Promise<PantryItem[]> {
    try {
      const pantry = await this.getUserPantry(userId);
      return pantry.items.filter(item => item.category === category);
    } catch (error) {
      console.error('Error fetching items by category:', error);
      return [];
    }
  }

  /**
   * Get expiring items (within X days)
   */
  async getExpiringItems(userId: string, daysAhead: number = 7): Promise<PantryItem[]> {
    try {
      const pantry = await this.getUserPantry(userId);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

      return pantry.items.filter(item => {
        if (!item.expirationDate) return false;
        return item.expirationDate <= cutoffDate;
      }).sort((a, b) => {
        if (!a.expirationDate || !b.expirationDate) return 0;
        return a.expirationDate.getTime() - b.expirationDate.getTime();
      });
    } catch (error) {
      console.error('Error fetching expiring items:', error);
      return [];
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(userId: string): Promise<PantryItem[]> {
    try {
      const pantry = await this.getUserPantry(userId);
      return pantry.items.filter(item => item.isLow);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  }

  /**
   * Search pantry items
   */
  async searchPantryItems(userId: string, searchTerm: string): Promise<PantryItem[]> {
    try {
      const pantry = await this.getUserPantry(userId);
      const term = searchTerm.toLowerCase();
      
      return pantry.items.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching pantry items:', error);
      return [];
    }
  }

  /**
   * Get ingredients available for "use what I have" meal generation
   */
  async getAvailableIngredientsForMeals(userId: string): Promise<string[]> {
    try {
      const pantry = await this.getUserPantry(userId);
      
      // Filter out low stock items and items that are expired
      const availableItems = pantry.items.filter(item => {
        if (item.isLow) return false;
        if (item.expirationDate && item.expirationDate < new Date()) return false;
        return true;
      });

      return availableItems.map(item => item.name);
    } catch (error) {
      console.error('Error fetching available ingredients:', error);
      return [];
    }
  }

  /**
   * Add ingredients from shopping list to pantry
   */
  async addFromShoppingList(userId: string, ingredients: { name: string; quantity: string }[]): Promise<Pantry> {
    try {
      const pantry = await this.getUserPantry(userId);
      
      const newItems: PantryItem[] = ingredients.map((ingredient, index) => ({
        id: `item_${Date.now()}_${index}`,
        name: ingredient.name.trim(),
        category: this.categorizeIngredient(ingredient.name),
        quantity: ingredient.quantity,
        isLow: false,
        addedAt: new Date(),
        lastUpdatedAt: new Date()
      }));

      const updatedItems = [...pantry.items, ...newItems];

      const pantryRef = doc(db, 'pantries', userId);
      await updateDoc(pantryRef, {
        items: updatedItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          expirationDate: item.expirationDate || null,
          isLow: item.isLow,
          notes: item.notes || null,
          addedAt: item.addedAt,
          lastUpdatedAt: item.lastUpdatedAt
        })),
        lastUpdatedAt: serverTimestamp()
      });

      return await this.getUserPantry(userId);
    } catch (error) {
      console.error('Error adding from shopping list:', error);
      throw error;
    }
  }

  /**
   * Get pantry statistics
   */
  async getPantryStats(userId: string): Promise<{
    totalItems: number;
    itemsByCategory: { [category: string]: number };
    lowStockCount: number;
    expiringCount: number;
  }> {
    try {
      const pantry = await this.getUserPantry(userId);
      const expiringItems = await this.getExpiringItems(userId);
      
      const stats = {
        totalItems: pantry.items.length,
        itemsByCategory: {} as { [category: string]: number },
        lowStockCount: pantry.items.filter(item => item.isLow).length,
        expiringCount: expiringItems.length
      };

      pantry.items.forEach(item => {
        stats.itemsByCategory[item.category] = (stats.itemsByCategory[item.category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating pantry stats:', error);
      return {
        totalItems: 0,
        itemsByCategory: {},
        lowStockCount: 0,
        expiringCount: 0
      };
    }
  }

  /**
   * Categorize ingredient automatically
   */
  private categorizeIngredient(itemName: string): string {
    const item = itemName.toLowerCase();
    
    // Produce
    if (item.includes('apple') || item.includes('banana') || item.includes('orange') || 
        item.includes('lettuce') || item.includes('tomato') || item.includes('carrot') ||
        item.includes('spinach') || item.includes('broccoli') || item.includes('onion') ||
        item.includes('garlic') || item.includes('bell pepper') || item.includes('cucumber')) {
      return 'Produce';
    }
    
    // Proteins
    if (item.includes('chicken') || item.includes('beef') || item.includes('pork') || 
        item.includes('fish') || item.includes('salmon') || item.includes('egg') ||
        item.includes('turkey') || item.includes('tofu') || item.includes('beans') ||
        item.includes('lentils')) {
      return 'Protein';
    }
    
    // Dairy
    if (item.includes('milk') || item.includes('cheese') || item.includes('yogurt') || 
        item.includes('butter') || item.includes('cream')) {
      return 'Dairy';
    }
    
    // Grains/Carbs
    if (item.includes('rice') || item.includes('bread') || item.includes('pasta') || 
        item.includes('quinoa') || item.includes('oats') || item.includes('flour') ||
        item.includes('cereal')) {
      return 'Grains';
    }
    
    // Pantry/Condiments
    if (item.includes('oil') || item.includes('salt') || item.includes('pepper') || 
        item.includes('sauce') || item.includes('vinegar') || item.includes('spice') ||
        item.includes('herbs') || item.includes('seasoning')) {
      return 'Pantry';
    }
    
    // Frozen
    if (item.includes('frozen')) {
      return 'Frozen';
    }
    
    return 'Other';
  }
}

// Export singleton instance
export const pantryService = new PantryService();

export default PantryService;