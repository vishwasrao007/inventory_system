import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, Package } from 'lucide-react';

const ProductModal = ({ product, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    category: '',
    vendor: '',
    buyingPrice: '',
    sellingPrice: '',
    quantity: '',
    sold: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchVendors();
    if (product) {
      setFormData({
        productCode: product.productCode || '',
        name: product.name || '',
        category: product.category || '',
        vendor: product.vendor || '',
        buyingPrice: product.buyingPrice || '',
        sellingPrice: product.sellingPrice || '',
        quantity: product.quantity || '',
        sold: product.sold || '',
        image: null
      });
      setImagePreview(product.image || null);
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.vendor.trim()) newErrors.vendor = 'Vendor is required';
    if (!formData.buyingPrice || formData.buyingPrice <= 0) newErrors.buyingPrice = 'Valid buying price is required';
    if (!formData.sellingPrice || formData.sellingPrice <= 0) newErrors.sellingPrice = 'Valid selling price is required';
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Skip pre-authentication check to avoid unnecessary redirects
    
    const submitData = new FormData();
    submitData.append('productCode', formData.productCode);
    submitData.append('name', formData.name);
    submitData.append('category', formData.category);
    submitData.append('vendor', formData.vendor);
    submitData.append('buyingPrice', formData.buyingPrice);
    submitData.append('sellingPrice', formData.sellingPrice);
    submitData.append('quantity', formData.quantity);
    submitData.append('sold', formData.sold);
    
    if (formData.image) {
      submitData.append('image', formData.image);
    }
    
    try {
      if (product) {
        // Update existing product
        await axios.put(`/api/products/${product.id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new product
        await axios.post('/api/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      onSaved();
    } catch (error) {
      console.error('Failed to save product:', error);
      
      // If authentication error, try to refresh session and retry once
      if (error.response?.status === 401) {
        console.error('Authentication failed, attempting session refresh');
        try {
          // Try to refresh the session by making a simple request
          await axios.get('/api/auth/status');
          // If successful, retry the original request
          if (product) {
            await axios.put(`/api/products/${product.id}`, submitData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } else {
            await axios.post('/api/products', submitData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          }
          onSaved();
          return;
        } catch (retryError) {
          console.error('Session refresh failed:', retryError);
          setErrors({ submit: 'Session expired. Please refresh the page and try again.' });
          return;
        }
      }
      
      const errorMessage = error.response?.data?.error || 'Failed to save product. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-dark-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <h2 className="text-xl font-semibold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Product Code
              </label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="e.g., SKU-001"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`input-field w-full ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-400 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Vendor *
              </label>
              <select
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                className={`input-field w-full ${errors.vendor ? 'border-red-500' : ''}`}
              >
                <option value="">Select vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
              {errors.vendor && (
                <p className="text-red-400 text-sm mt-1">{errors.vendor}</p>
              )}
            </div>

            {/* Buying Price */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Buying Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">
                  ₹
                </span>
                <input
                  type="number"
                  name="buyingPrice"
                  value={formData.buyingPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`input-field w-full pl-8 ${errors.buyingPrice ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.buyingPrice && (
                <p className="text-red-400 text-sm mt-1">{errors.buyingPrice}</p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Selling Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">
                  ₹
                </span>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`input-field w-full pl-8 ${errors.sellingPrice ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.sellingPrice && (
                <p className="text-red-400 text-sm mt-1">{errors.sellingPrice}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                className={`input-field w-full ${errors.quantity ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Sold */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Sold
              </label>
              <input
                type="number"
                name="sold"
                value={formData.sold}
                onChange={handleInputChange}
                min="0"
                className={`input-field w-full ${errors.sold ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.sold && (
                <p className="text-red-400 text-sm mt-1">{errors.sold}</p>
              )}
            </div>

            {/* Profit Calculation */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Profit %
              </label>
              <div className="input-field w-full bg-dark-700 text-white">
                {formData.buyingPrice && formData.sellingPrice ? (
                  <span className={parseFloat(formData.sellingPrice) > parseFloat(formData.buyingPrice) ? 'text-green-400' : 'text-red-400'}>
                    {((parseFloat(formData.sellingPrice) - parseFloat(formData.buyingPrice)) / parseFloat(formData.buyingPrice) * 100).toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-dark-400">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Product Image
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border border-dark-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dark-700 border-dashed rounded-lg cursor-pointer bg-dark-800 hover:bg-dark-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-dark-400" />
                    <p className="mb-2 text-sm text-dark-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-dark-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-dark-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Package className="h-4 w-4" />
              )}
              <span>{product ? 'Update Product' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
