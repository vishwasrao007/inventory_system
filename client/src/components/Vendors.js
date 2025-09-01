import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Building2 } from 'lucide-react';
import { useRefresh } from '../contexts/RefreshContext';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVendor, setNewVendor] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const { refreshTrigger, triggerRefresh } = useRefresh();

  useEffect(() => {
    fetchVendors();
  }, [refreshTrigger]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchVendors();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!newVendor.trim()) return;

    setAdding(true);
    setError('');

    try {
      const response = await axios.post('/api/vendors', {
        name: newVendor.trim()
      });
      setVendors(response.data.vendors);
      setNewVendor('');
      triggerRefresh(); // Trigger global refresh
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add vendor');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteVendor = async (vendorName) => {
    if (!window.confirm(`Are you sure you want to delete "${vendorName}"?`)) {
      return;
    }

    try {
      const response = await axios.delete(`/api/vendors/${encodeURIComponent(vendorName)}`);
      setVendors(response.data.vendors);
      triggerRefresh(); // Trigger global refresh
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete vendor');
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
        <h1 className="text-2xl font-bold text-white mb-2">Vendors</h1>
        <p className="text-dark-400">Manage product vendors for your inventory</p>
      </div>

      {/* Add Vendor Form */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Add New Vendor</h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleAddVendor} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              placeholder="Enter vendor name"
              className="input-field w-full"
              disabled={adding}
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newVendor.trim()}
            className="btn-primary flex items-center space-x-2"
          >
            {adding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Add Vendor</span>
          </button>
        </form>
      </div>

      {/* Vendors List */}
      <div className="card">
        <div className="p-6 border-b border-dark-800">
          <h2 className="text-lg font-semibold text-white">All Vendors ({vendors.length})</h2>
        </div>

        {vendors.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No vendors found</h3>
            <p className="text-dark-400">Add your first vendor to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {vendors.map((vendor, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-dark-800/50">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{vendor}</h3>
                    <p className="text-sm text-dark-400">Product vendor</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteVendor(vendor)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"
                  title="Delete vendor"
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
            <h3 className="text-sm font-medium text-blue-400 mb-1">Vendor Management</h3>
            <p className="text-sm text-blue-300/80">
              Vendors help organize your products by supplier. You cannot delete a vendor that is currently used by products. 
              Make sure to update or remove products before deleting their vendors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendors;
