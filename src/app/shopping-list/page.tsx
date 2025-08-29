'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { shoppingListService, ShoppingList, ShoppingListItem } from '../../services/shoppingListService';
import { useRouter } from 'next/navigation';

export default function ShoppingListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: ''
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin?redirect=shopping-list');
      return;
    }

    checkPremiumAccessAndLoadData();
  }, [user, authLoading, router]);

  const checkPremiumAccessAndLoadData = async () => {
    if (!user) return;
    
    try {
      const hasAccess = await subscriptionService.hasPremiumAccess(user.uid);
      setHasPremiumAccess(hasAccess);
      
      if (hasAccess) {
        await loadShoppingLists();
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      setHasPremiumAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const loadShoppingLists = async () => {
    if (!user) return;
    
    try {
      const lists = await shoppingListService.getUserShoppingLists(user.uid);
      setShoppingLists(lists);
      
      // Set active list to first list if none selected
      if (!activeList && lists.length > 0) {
        setActiveList(lists[0]);
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    }
  };

  const createNewList = async () => {
    if (!user || !newListName.trim()) return;
    
    try {
      const newList = await shoppingListService.createShoppingList(user.uid, {
        name: newListName.trim()
      });
      
      setShoppingLists(prev => [newList, ...prev]);
      setActiveList(newList);
      setNewListName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating shopping list:', error);
      alert('Failed to create shopping list');
    }
  };

  const addItemToActiveList = async () => {
    if (!user || !activeList || !newItem.name.trim()) return;
    
    try {
      const updatedList = await shoppingListService.addItemToList(activeList.id, user.uid, {
        name: newItem.name.trim(),
        quantity: newItem.quantity.trim() || '1',
        category: newItem.category || undefined
      });
      
      setActiveList(updatedList);
      setShoppingLists(prev => prev.map(list => 
        list.id === updatedList.id ? updatedList : list
      ));
      
      setNewItem({ name: '', quantity: '', category: '' });
      setShowAddItemModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const toggleItemCheck = async (item: ShoppingListItem) => {
    if (!user || !activeList) return;
    
    try {
      const updatedList = await shoppingListService.updateListItem(
        activeList.id, 
        user.uid, 
        item.id, 
        { isChecked: !item.isChecked }
      );
      
      setActiveList(updatedList);
      setShoppingLists(prev => prev.map(list => 
        list.id === updatedList.id ? updatedList : list
      ));
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user || !activeList || !confirm('Remove this item from your shopping list?')) return;
    
    try {
      const updatedList = await shoppingListService.removeItemFromList(activeList.id, user.uid, itemId);
      
      setActiveList(updatedList);
      setShoppingLists(prev => prev.map(list => 
        list.id === updatedList.id ? updatedList : list
      ));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const clearCheckedItems = async () => {
    if (!user || !activeList || !confirm('Clear all checked items?')) return;
    
    try {
      const updatedList = await shoppingListService.clearCheckedItems(activeList.id, user.uid);
      
      setActiveList(updatedList);
      setShoppingLists(prev => prev.map(list => 
        list.id === updatedList.id ? updatedList : list
      ));
    } catch (error) {
      console.error('Error clearing items:', error);
      alert('Failed to clear items');
    }
  };

  const deleteActiveList = async () => {
    if (!user || !activeList || !confirm('Delete this shopping list? This cannot be undone.')) return;
    
    try {
      await shoppingListService.deleteShoppingList(activeList.id, user.uid);
      
      setShoppingLists(prev => prev.filter(list => list.id !== activeList.id));
      setActiveList(shoppingLists.find(list => list.id !== activeList.id) || null);
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list');
    }
  };

  // Group items by category
  const groupedItems = activeList?.items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as { [key: string]: ShoppingListItem[] }) || {};

  const categories = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Other'];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your shopping lists...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Premium Access Gate
  if (hasPremiumAccess === false) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">🛒 Shopping Lists</h1>
          <p className="mt-2 text-lg text-gray-600">Create and manage smart shopping lists from your saved meals</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white text-center">
          <div className="text-4xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
          <p className="text-green-100 mb-6">
            Smart shopping lists that organize ingredients by category and sync with your cookbook.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🛒 Shopping Features:</h3>
              <ul className="text-sm space-y-1">
                <li>• Create lists from saved meals</li>
                <li>• Auto-categorized ingredients</li>
                <li>• Check off items while shopping</li>
                <li>• Multiple lists for different trips</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🧠 Smart Organization:</h3>
              <ul className="text-sm space-y-1">
                <li>• Group by store sections</li>
                <li>• Combine duplicate ingredients</li>
                <li>• Clear completed items</li>
                <li>• Export/share lists</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/pricing')}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Upgrade to Premium - $9.99/mo
          </button>
          <p className="text-xs text-green-200 mt-2">7-day free trial • Cancel anytime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Shopping Lists</h1>
          <p className="text-gray-600">Organize your grocery shopping with smart lists</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          + New List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - List Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Lists</h2>
            
            {shoppingLists.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-sm">No shopping lists yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="text-blue-500 text-sm hover:underline mt-2"
                >
                  Create your first list
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {shoppingLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setActiveList(list)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      activeList?.id === list.id
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{list.name}</div>
                    <div className="text-sm text-gray-500">
                      {list.items.length} items • {list.items.filter(item => item.isChecked).length} checked
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Active List */}
        <div className="lg:col-span-3">
          {!activeList ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Select a Shopping List</h2>
              <p className="text-gray-600 mb-6">
                Choose a list from the sidebar or create a new one to get started.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              {/* List Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{activeList.name}</h2>
                    <p className="text-gray-600 mt-1">
                      {activeList.items.length} items • {activeList.items.filter(item => item.isChecked).length} completed
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
                    >
                      + Add Item
                    </button>
                    {activeList.items.some(item => item.isChecked) && (
                      <button
                        onClick={clearCheckedItems}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600"
                      >
                        Clear Checked
                      </button>
                    )}
                    <button
                      onClick={deleteActiveList}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                    >
                      Delete List
                    </button>
                  </div>
                </div>
              </div>

              {/* Shopping List Items */}
              <div className="p-6">
                {activeList.items.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Empty Shopping List</h3>
                    <p className="text-gray-600 mb-4">
                      Add items manually or create a list from your saved meals.
                    </p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600"
                    >
                      Add First Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categories.map(category => {
                      const items = groupedItems[category];
                      if (!items || items.length === 0) return null;

                      return (
                        <div key={category}>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                            {category}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-center p-3 rounded-lg border transition-all ${
                                  item.isChecked
                                    ? 'bg-green-50 border-green-200 opacity-60'
                                    : 'bg-white border-gray-200 hover:shadow-md'
                                }`}
                              >
                                <button
                                  onClick={() => toggleItemCheck(item)}
                                  className={`mr-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    item.isChecked
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 hover:border-green-400'
                                  }`}
                                >
                                  {item.isChecked && '✓'}
                                </button>
                                
                                <div className="flex-1">
                                  <div className={`font-medium ${item.isChecked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {item.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.quantity}
                                    {item.mealTitle && (
                                      <span className="ml-2 text-blue-600">• from {item.mealTitle}</span>
                                    )}
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="ml-2 text-red-500 hover:text-red-700 text-sm"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Shopping List</h3>
            
            <input
              type="text"
              placeholder="List name (e.g., Weekly Groceries)"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createNewList()}
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewListName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNewList}
                disabled={!newListName.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Item</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <input
                type="text"
                placeholder="Quantity (e.g., 2 lbs, 1 bag)"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <select
                value={newItem.category}
                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Auto-categorize</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddItemModal(false);
                  setNewItem({ name: '', quantity: '', category: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addItemToActiveList}
                disabled={!newItem.name.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}