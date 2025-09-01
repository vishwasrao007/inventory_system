import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User,
  Phone,
  MapPin,
  Package
} from 'lucide-react';
import { useRefresh } from '../contexts/RefreshContext';

const CustomerModal = ({ customer, onClose, onSaved, products }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobileNumber: '',
    productCodes: [],
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5)
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [productSearchTerm, setProductSearchTerm] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        address: customer.address || '',
        mobileNumber: customer.mobileNumber || '',
        productCodes: customer.productCodes || [],
        date: customer.date || new Date().toISOString().split('T')[0],
        time: customer.time || new Date().toTimeString().split(' ')[0].substring(0, 5)
      });
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProductCodeChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      productCodes: checked 
        ? [...prev.productCodes, value]
        : prev.productCodes.filter(code => code !== value)
    }));
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    if (!productSearchTerm) return true;
    
    // Special case: show only selected products
    if (productSearchTerm === 'SELECTED') {
      return formData.productCodes.includes(product.productCode);
    }
    
    const searchTerm = productSearchTerm.toLowerCase();
    return (
      product.productCode?.toLowerCase().includes(searchTerm) ||
      product.name?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm)
    );
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Customer name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required';
    if (formData.productCodes.length === 0) newErrors.productCodes = 'At least one product is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (customer) {
        // Update existing customer
        await axios.put(`/api/customers/${customer.id}`, formData);
      } else {
        // Create new customer
        await axios.post('/api/customers', formData);
      }
      
      onSaved();
    } catch (error) {
      console.error('Failed to save customer:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save customer. Please try again.';
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
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <Plus className="h-6 w-6 transform rotate-45" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter customer name"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                className={`input-field w-full ${errors.mobileNumber ? 'border-red-500' : ''}`}
                placeholder="Enter mobile number"
              />
              {errors.mobileNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`input-field w-full ${errors.address ? 'border-red-500' : ''}`}
                placeholder="Enter customer address"
              />
              {errors.address && (
                <p className="text-red-400 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input-field w-full"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="input-field w-full"
              />
            </div>

            {/* Product Codes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Select Products *
              </label>
              
              {/* Product Search */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                  <input
                    type="text"
                    placeholder="Search products by code, name, or category..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="input-field pl-10 w-full"
                  />
                </div>
              </div>

              {/* Products List */}
              <div className="border border-dark-700 rounded-md">
                {/* Products Count and Actions */}
                <div className="p-2 bg-dark-800 border-b border-dark-700 flex items-center justify-between">
                  <div className="text-xs text-dark-400">
                    {filteredProducts.length} of {products.length} products
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        const visibleProductCodes = filteredProducts.map(p => p.productCode);
                        setFormData(prev => ({
                          ...prev,
                          productCodes: [...new Set([...prev.productCodes, ...visibleProductCodes])]
                        }));
                      }}
                      className="text-xs text-primary-400 hover:text-primary-300 px-2 py-1 rounded hover:bg-primary-500/10 transition-colors"
                    >
                      Select All Visible
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, productCodes: [] }))}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                {/* Products Grid */}
                <div className="max-h-40 overflow-y-auto p-3">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredProducts.map((product) => (
                        <label key={product.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-dark-800 rounded-md transition-colors">
                          <input
                            type="checkbox"
                            value={product.productCode}
                            checked={formData.productCodes.includes(product.productCode)}
                            onChange={handleProductCodeChange}
                            className="rounded border-dark-600 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {product.productCode}
                            </div>
                            <div className="text-xs text-dark-300 truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-primary-400">
                              {product.category}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-dark-400">
                      <p className="text-sm">No products found matching "{productSearchTerm}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Products Summary */}
              {formData.productCodes.length > 0 && (
                <div className="mt-2 p-2 bg-primary-500/10 border border-primary-500/20 rounded-md">
                  <div className="text-xs text-primary-400 mb-1">
                    Selected: {formData.productCodes.length} product(s)
                  </div>
                  <div className="text-xs text-white mb-2">
                    {formData.productCodes.join(', ')}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setProductSearchTerm('')}
                      className="text-xs text-primary-400 hover:text-primary-300 px-2 py-1 rounded hover:bg-primary-500/20 transition-colors"
                    >
                      Show All Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductSearchTerm('SELECTED')}
                      className="text-xs text-primary-400 hover:text-primary-300 px-2 py-1 rounded hover:bg-primary-500/20 transition-colors"
                    >
                      Show Only Selected
                    </button>
                  </div>
                </div>
              )}

              {errors.productCodes && (
                <p className="text-red-400 text-sm mt-1">{errors.productCodes}</p>
              )}
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
                <User className="h-4 w-4" />
              )}
              <span>{customer ? 'Update Customer' : 'Add Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'name', 'date'
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const { refreshTrigger, triggerRefresh } = useRefresh();

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [refreshTrigger]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCustomers();
        fetchProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  // Filter and sort customers based on search term and sort option
  useEffect(() => {
    let filtered = [...customers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.mobileNumber.includes(term) ||
        customer.address.toLowerCase().includes(term) ||
        customer.productCodes.some(code => code.toLowerCase().includes(term))
      );
    }

    // Sort customers based on sortBy
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time);
        case 'oldest':
          return new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time);
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, sortBy]);

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`/api/customers/${customerId}`);
        fetchCustomers();
        triggerRefresh();
      } catch (error) {
        console.error('Failed to delete customer:', error);
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleCustomerSaved = () => {
    fetchCustomers();
    triggerRefresh();
    handleModalClose();
  };

  const getProductImage = (productCode) => {
    const product = products.find(p => p.productCode === productCode);
    return product?.image || null;
  };

  const getProductName = (productCode) => {
    const product = products.find(p => p.productCode === productCode);
    return product?.name || productCode;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Customers</h1>
          <p className="text-dark-400">Manage your customer information</p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search and Sort */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          
          {/* Sort Dropdown */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-full"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Count */}
      <div className="text-sm text-dark-400">
        {filteredCustomers.length} of {customers.length} customers
      </div>

      {/* Customers Display (Horizontal Layout) */}
      <div className="flex flex-col space-y-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="card p-6 border border-dark-700 transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
            {/* Customer Info */}
            <div className="mb-4">
              <h3 className="font-semibold text-white mb-2 text-lg">{customer.name}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-dark-400" />
                  <span className="text-white">{customer.mobileNumber}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-dark-400 mt-0.5" />
                  <span className="text-dark-300 line-clamp-2">{customer.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-dark-400" />
                  <span className="text-primary-400">{customer.date} at {customer.time}</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-dark-200 mb-2">Products:</h4>
              <div className="space-y-3">
                {customer.productCodes.map((productCode, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-dark-800 rounded-md">
                    {getProductImage(productCode) ? (
                      <img
                        src={getProductImage(productCode)}
                        alt={getProductName(productCode)}
                        className="h-[120px] w-[120px] object-cover rounded-md border border-dark-600"
                      />
                    ) : (
                      <div className="h-[120px] w-[120px] bg-dark-700 rounded-md flex items-center justify-center border border-dark-600">
                        <Package className="h-14 w-14 text-dark-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {productCode}
                      </div>
                      <div className="text-xs text-dark-300 truncate">
                        {getProductName(productCode)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-2 pt-4 border-t border-dark-800">
              <button
                onClick={() => handleEdit(customer)}
                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(customer.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="card p-12 text-center">
          <User className="h-12 w-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No customers found</h3>
          <p className="text-dark-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first customer'}
          </p>
          {!searchTerm && (
            <button onClick={handleAdd} className="btn-primary">
              Add Customer
            </button>
          )}
        </div>
      )}

      {/* Customer Modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={handleModalClose}
          onSaved={handleCustomerSaved}
          products={products}
        />
      )}
    </div>
  );
};

export default Customers;
