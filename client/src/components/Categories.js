import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Tags } from 'lucide-react';
import { useRefresh } from '../contexts/RefreshContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const { refreshTrigger, triggerRefresh } = useRefresh();

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCategories();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setAdding(true);
    setError('');

    try {
      const response = await axios.post('/api/categories', {
        name: newCategory.trim()
      });
      setCategories(response.data.categories);
      setNewCategory('');
      triggerRefresh(); // Trigger global refresh
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/categories/${encodeURIComponent(categoryName)}`);
      setCategories(response.data.categories);
      triggerRefresh(); // Trigger global refresh
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Categories</h1>
        <p className="text-dark-400">Manage product categories for your inventory</p>
      </div>

      {/* Add Category Form */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Add New Category</h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAddCategory} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="input-field w-full"
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newCategory.trim()}
            className="btn-primary flex items-center space-x-2"
          >
            {adding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Add Category</span>
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="card">
        <div className="p-6 border-b border-dark-800">
          <h2 className="text-lg font-semibold text-white">All Categories ({categories.length})</h2>
        </div>

        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tags className="h-12 w-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No categories found</h3>
            <p className="text-dark-400">Add your first category to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-dark-800/50">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <Tags className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{category}</h3>
                    <p className="text-sm text-dark-400">Product category</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card p-6 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start space-x-3">
          <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-400 mb-1">Category Management</h3>
            <p className="text-sm text-blue-300/80">
              Categories help organize your products. You cannot delete a category that is currently used by products. 
              Make sure to update or remove products before deleting their categories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
