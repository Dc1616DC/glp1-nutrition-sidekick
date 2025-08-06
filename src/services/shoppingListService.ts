import { getFirestore, collection, doc, getDoc, setDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, where, arrayUnion, arrayRemove } from 'firebase/firestore';
import { app } from '../firebase/config';

const db = getFirestore(app);

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  isChecked: boolean;
  addedAt: Date;
  mealId?: string; // Reference to saved meal if item came from meal
  mealTitle?: string; // Title of meal for reference
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

export interface CreateShoppingListRequest {
  name: string;
  items?: {
    name: string;
    quantity: string;
    category?: string;
  }[];
}

class ShoppingListService {
  /**
   * Create a new shopping list
   */
  async createShoppingList(userId: string, request: CreateShoppingListRequest): Promise<ShoppingList> {
    try {
      const listId = doc(collection(db, 'dummy')).id;
      
      const items: ShoppingListItem[] = (request.items || []).map((item, index) => ({
        id: `item_${index}`,
        name: item.name,
        quantity: item.quantity,
        category: item.category || this.categorizeItem(item.name),
        isChecked: false,
        addedAt: new Date()
      }));

      const shoppingList: ShoppingList = {
        id: listId,
        userId,
        name: request.name,
        items,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false
      };

      const listRef = doc(db, 'shoppingLists', listId);
      await setDoc(listRef, {
        ...shoppingList,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        items: items.map(item => ({
          ...item,
          addedAt: serverTimestamp()
        }))
      });

      console.log(`✅ Created shopping list "${shoppingList.name}" for user ${userId}`);
      return shoppingList;
    } catch (error) {
      console.error('Error creating shopping list:', error);
      throw error;
    }
  }

  /**
   * Get user's shopping lists
   */
  async getUserShoppingLists(userId: string, includeArchived = false): Promise<ShoppingList[]> {
    try {
      const listsRef = collection(db, 'shoppingLists');
      const q = query(
        listsRef,
        where('userId', '==', userId),
        ...(includeArchived ? [] : [where('isArchived', '==', false)]),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const lists: ShoppingList[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        lists.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          items: data.items?.map((item: any) => ({
            ...item,
            addedAt: item.addedAt?.toDate() || new Date()
          })) || []
        } as ShoppingList);
      });

      return lists;
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      throw error;
    }
  }

  /**
   * Get a specific shopping list
   */
  async getShoppingList(listId: string, userId: string): Promise<ShoppingList | null> {
    try {
      const listRef = doc(db, 'shoppingLists', listId);
      const listDoc = await getDoc(listRef);
      
      if (!listDoc.exists()) {
        return null;
      }
      
      const data = listDoc.data();
      
      // Verify ownership
      if (data.userId !== userId) {
        throw new Error('Access denied');
      }
      
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        items: data.items?.map((item: any) => ({
          ...item,
          addedAt: item.addedAt?.toDate() || new Date()
        })) || []
      } as ShoppingList;
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      throw error;
    }
  }

  /**
   * Add item to shopping list
   */
  async addItemToList(listId: string, userId: string, item: {
    name: string;
    quantity: string;
    category?: string;
    mealId?: string;
    mealTitle?: string;
  }): Promise<ShoppingList> {
    try {
      const shoppingList = await this.getShoppingList(listId, userId);
      if (!shoppingList) {
        throw new Error('Shopping list not found');
      }

      const newItem: ShoppingListItem = {
        id: `item_${Date.now()}`,
        name: item.name,
        quantity: item.quantity,
        category: item.category || this.categorizeItem(item.name),
        isChecked: false,
        addedAt: new Date(),
        mealId: item.mealId,
        mealTitle: item.mealTitle
      };

      const listRef = doc(db, 'shoppingLists', listId);
      await updateDoc(listRef, {
        items: arrayUnion({
          ...newItem,
          addedAt: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });

      return await this.getShoppingList(listId, userId) as ShoppingList;
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
      throw error;
    }
  }

  /**
   * Update shopping list item
   */
  async updateListItem(listId: string, userId: string, itemId: string, updates: Partial<ShoppingListItem>): Promise<ShoppingList> {
    try {
      const shoppingList = await this.getShoppingList(listId, userId);
      if (!shoppingList) {
        throw new Error('Shopping list not found');
      }

      const updatedItems = shoppingList.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );

      const listRef = doc(db, 'shoppingLists', listId);
      await updateDoc(listRef, {
        items: updatedItems.map(item => ({
          ...item,
          addedAt: serverTimestamp()
        })),
        updatedAt: serverTimestamp()
      });

      return await this.getShoppingList(listId, userId) as ShoppingList;
    } catch (error) {
      console.error('Error updating shopping list item:', error);
      throw error;
    }
  }

  /**
   * Remove item from shopping list
   */
  async removeItemFromList(listId: string, userId: string, itemId: string): Promise<ShoppingList> {
    try {
      const shoppingList = await this.getShoppingList(listId, userId);
      if (!shoppingList) {
        throw new Error('Shopping list not found');
      }

      const updatedItems = shoppingList.items.filter(item => item.id !== itemId);

      const listRef = doc(db, 'shoppingLists', listId);
      await updateDoc(listRef, {
        items: updatedItems.map(item => ({
          ...item,
          addedAt: serverTimestamp()
        })),
        updatedAt: serverTimestamp()
      });

      return await this.getShoppingList(listId, userId) as ShoppingList;
    } catch (error) {
      console.error('Error removing item from shopping list:', error);
      throw error;
    }
  }

  /**
   * Clear all checked items from shopping list
   */
  async clearCheckedItems(listId: string, userId: string): Promise<ShoppingList> {
    try {
      const shoppingList = await this.getShoppingList(listId, userId);
      if (!shoppingList) {
        throw new Error('Shopping list not found');
      }

      const uncheckedItems = shoppingList.items.filter(item => !item.isChecked);

      const listRef = doc(db, 'shoppingLists', listId);
      await updateDoc(listRef, {
        items: uncheckedItems.map(item => ({
          ...item,
          addedAt: serverTimestamp()
        })),
        updatedAt: serverTimestamp()
      });

      return await this.getShoppingList(listId, userId) as ShoppingList;
    } catch (error) {
      console.error('Error clearing checked items:', error);
      throw error;
    }
  }

  /**
   * Archive shopping list
   */
  async archiveShoppingList(listId: string, userId: string): Promise<void> {
    try {
      const shoppingList = await this.getShoppingList(listId, userId);
      if (!shoppingList) {
        throw new Error('Shopping list not found');
      }

      const listRef = doc(db, 'shoppingLists', listId);
      await updateDoc(listRef, {
        isArchived: true,
        updatedAt: serverTimestamp()
      });

      console.log(`📦 Archived shopping list ${listId} for user ${userId}`);
    } catch (error) {
      console.error('Error archiving shopping list:', error);
      throw error;
    }
  }

  /**
   * Delete shopping list
   */
  async deleteShoppingList(listId: string, userId: string): Promise<void> {
    try {
      const shoppingList = await this.getShoppingList(listId, userId);
      if (!shoppingList) {
        throw new Error('Shopping list not found');
      }

      const listRef = doc(db, 'shoppingLists', listId);
      await deleteDoc(listRef);
      
      console.log(`🗑️ Deleted shopping list ${listId} for user ${userId}`);
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      throw error;
    }
  }

  /**
   * Create shopping list from saved meal
   */
  async createListFromMeal(userId: string, mealId: string, mealTitle: string, ingredients: string[]): Promise<ShoppingList> {
    try {
      const items = ingredients.map(ingredient => ({
        name: ingredient,
        quantity: '1', // Default quantity, user can edit
        category: this.categorizeItem(ingredient)
      }));

      const listName = `${mealTitle} - Shopping List`;
      
      return await this.createShoppingList(userId, {
        name: listName,
        items
      });
    } catch (error) {
      console.error('Error creating shopping list from meal:', error);
      throw error;
    }
  }

  /**
   * Categorize shopping list item automatically
   */
  private categorizeItem(itemName: string): string {
    const item = itemName.toLowerCase();
    
    // Produce
    if (item.includes('apple') || item.includes('banana') || item.includes('orange') || 
        item.includes('lettuce') || item.includes('tomato') || item.includes('carrot') ||
        item.includes('spinach') || item.includes('broccoli') || item.includes('onion')) {
      return 'Produce';
    }
    
    // Proteins
    if (item.includes('chicken') || item.includes('beef') || item.includes('pork') || 
        item.includes('fish') || item.includes('salmon') || item.includes('egg') ||
        item.includes('turkey') || item.includes('tofu')) {
      return 'Protein';
    }
    
    // Dairy
    if (item.includes('milk') || item.includes('cheese') || item.includes('yogurt') || 
        item.includes('butter') || item.includes('cream')) {
      return 'Dairy';
    }
    
    // Grains/Carbs
    if (item.includes('rice') || item.includes('bread') || item.includes('pasta') || 
        item.includes('quinoa') || item.includes('oats')) {
      return 'Grains';
    }
    
    // Pantry/Condiments
    if (item.includes('oil') || item.includes('salt') || item.includes('pepper') || 
        item.includes('sauce') || item.includes('vinegar') || item.includes('spice')) {
      return 'Pantry';
    }
    
    return 'Other';
  }
}

// Export singleton instance
export const shoppingListService = new ShoppingListService();

export default ShoppingListService;