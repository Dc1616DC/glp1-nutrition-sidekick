'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { pantryService, Pantry, PantryItem } from '../../services/pantryService';
import { useRouter } from 'next/navigation';

export default function PantryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pantry, setPantry] = useState<Pantry | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    expirationDate: '',
    notes: ''
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/signin?redirect=pantry');
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
        await loadPantry();
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      setHasPremiumAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const loadPantry = async () => {
    if (!user) return;
    
    try {
      const userPantry = await pantryService.getUserPantry(user.uid);
      setPantry(userPantry);
    } catch (error) {
      console.error('Error loading pantry:', error);
    }
  };

  const addItem = async () => {
    if (!user || !newItem.name.trim()) return;
    
    try {
      const updatedPantry = await pantryService.addItemToPantry(user.uid, {
        name: newItem.name.trim(),
        category: newItem.category || undefined,
        quantity: newItem.quantity || '1',
        expirationDate: newItem.expirationDate ? new Date(newItem.expirationDate) : undefined,
        notes: newItem.notes || undefined
      });
      
      setPantry(updatedPantry);
      setNewItem({ name: '', category: '', quantity: '', expirationDate: '', notes: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  const updateItem = async () => {
    if (!user || !editingItem) return;
    
    try {
      const updates = {
        name: editingItem.name,
        category: editingItem.category,
        quantity: editingItem.quantity,
        expirationDate: editingItem.expirationDate,
        notes: editingItem.notes,
        isLow: editingItem.isLow
      };
      
      const updatedPantry = await pantryService.updatePantryItem(user.uid, editingItem.id, updates);
      setPantry(updatedPantry);
      setEditingItem(null);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!user || !confirm('Remove this item from your pantry?')) return;
    
    try {
      const updatedPantry = await pantryService.removeItemFromPantry(user.uid, itemId);
      setPantry(updatedPantry);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const toggleLowStock = async (itemId: string) => {
    if (!user) return;
    
    try {
      const updatedPantry = await pantryService.toggleLowStock(user.uid, itemId);
      setPantry(updatedPantry);
    } catch (error) {
      console.error('Error toggling low stock:', error);
    }
  };


  // Filter items based on search and filters
  const filteredItems = pantry?.items.filter(item => {
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesExpiring = !showExpiringOnly || (item.expirationDate && item.expirationDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const matchesLowStock = !showLowStockOnly || item.isLow;
    
    return matchesSearch && matchesCategory && matchesExpiring && matchesLowStock;
  }) || [];

  // Group items by category
  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as { [key: string]: PantryItem[] });

  const categories = ['Produce', 'Protein', 'Dairy', 'Grains', 'Pantry', 'Frozen', 'Other'];

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your pantry...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">🥫 Pantry Tracker</h1>
          <p className="mt-2 text-lg text-gray-600">Track ingredients and generate meals with what you have</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-8 text-white text-center">
          <div className="text-4xl mb-4">🥫</div>
          <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
          <p className="text-orange-100 mb-6">
            Never waste food again! Track your ingredients and get AI meal suggestions using what you already have.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🥫 Pantry Features:</h3>
              <ul className="text-sm space-y-1">
                <li>• Track all your ingredients</li>
                <li>• Set expiration date alerts</li>
                <li>• Mark low stock items</li>
                <li>• Organize by categories</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold mb-2">🍽️ Smart Meal Generation:</h3>
              <ul className="text-sm space-y-1">
                <li>• "Use what I have" meal suggestions</li>
                <li>• Prevent food waste</li>
                <li>• Smart shopping recommendations</li>
                <li>• Batch cooking for efficiency</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/analytics')}
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Upgrade to Premium - $9.99/mo
          </button>
          <p className="text-xs text-orange-200 mt-2">7-day free trial • Cancel anytime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🥫 My Pantry</h1>
          <p className="text-gray-600">Track your ingredients and reduce food waste</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {pantry && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{pantry.items.length}</div>
            <div className="text-gray-600">Total Items</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{pantry.items.filter(item => item.isLow).length}</div>
            <div className="text-gray-600">Low Stock</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {pantry.items.filter(item => item.expirationDate && item.expirationDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-gray-600">Expiring Soon</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {Object.keys(pantry.items.reduce((groups, item) => ({ ...groups, [item.category]: true }), {})).length}
            </div>
            <div className="text-gray-600">Categories</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search pantry items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Expiring Filter */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showExpiringOnly}
                onChange={(e) => setShowExpiringOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Expiring Soon</span>
            </label>
          </div>

          {/* Low Stock Filter */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Low Stock</span>
            </label>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredItems.length} of {pantry?.items.length || 0} items
        </div>
      </div>

      {/* Pantry Items */}
      {!pantry || pantry.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🥫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Pantry is Empty</h2>
          <p className="text-gray-600 mb-6">
            Start tracking your ingredients to reduce food waste and get personalized meal suggestions.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Add Your First Item
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Matching Items</h2>
          <p className="text-gray-600 mb-6">
            Try adjusting your search terms or filters to find your items.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setShowExpiringOnly(false);
              setShowLowStockOnly(false);
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => {
            const items = groupedItems[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
                  <p className="text-sm text-gray-600">{items.length} items</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border transition-all ${
                          item.isLow
                            ? 'bg-red-50 border-red-200'
                            : item.expirationDate && item.expirationDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => toggleLowStock(item.id)}
                              className={`text-xs px-2 py-1 rounded ${
                                item.isLow
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-600 hover:bg-red-200 hover:text-red-800'
                              }`}
                              title="Toggle low stock"
                            >
                              {item.isLow ? '⚠️' : '📉'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <div>Quantity: {item.quantity}</div>
                          {item.expirationDate && (
                            <div className={item.expirationDate <= new Date() ? 'text-red-600 font-semibold' : ''}>
                              Expires: {item.expirationDate.toLocaleDateString()}
                            </div>
                          )}
                          {item.notes && (
                            <div className="mt-1 text-gray-500">{item.notes}</div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Pantry Item</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
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
              
              <input
                type="text"
                placeholder="Quantity (e.g., 2 cups, 1 bag)"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <input
                type="date"
                placeholder="Expiration date (optional)"
                value={newItem.expirationDate}
                onChange={(e) => setNewItem(prev => ({ ...prev, expirationDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Notes (optional)"
                value={newItem.notes}
                onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({ name: '', category: '', quantity: '', expirationDate: '', notes: '' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addItem}
                disabled={!newItem.name.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Pantry Item</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                value={editingItem.name}
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <select
                value={editingItem.category}
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, category: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Quantity"
                value={editingItem.quantity}
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, quantity: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <input
                type="date"
                value={editingItem.expirationDate ? editingItem.expirationDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEditingItem(prev => prev ? { 
                  ...prev, 
                  expirationDate: e.target.value ? new Date(e.target.value) : undefined 
                } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Notes (optional)"
                value={editingItem.notes || ''}
                onChange={(e) => setEditingItem(prev => prev ? { ...prev, notes: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingItem.isLow}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, isLow: e.target.checked } : null)}
                  className="mr-2"
                />
                <span className="text-sm">Mark as low stock</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={updateItem}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}