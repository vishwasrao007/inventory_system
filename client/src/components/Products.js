import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Download
} from 'lucide-react';
import ProductModal from './ProductModal';
import { useRefresh } from '../contexts/RefreshContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  // const [categories, setCategories] = useState([]);
  // const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const { refreshTrigger, triggerRefresh } = useRefresh();

  useEffect(() => {
    fetchProducts();
    // fetchCategories();
    // fetchVendors();
  }, [refreshTrigger]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProducts();
        // fetchCategories();
        // fetchVendors();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // const fetchCategories = async () => {
  //   try {
  //     const response = await axios.get('/api/categories');
  //     setCategories(response.data);
  //   } catch (error) {
  //     console.error('Failed to fetch categories:', error);
  //   }
  // };

  // const fetchVendors = async () => {
  //   try {
  //     const response = await axios.get('/api/vendors');
  //     setVendors(response.data);
  //   } catch (error) {
  //     console.error('Failed to fetch vendors:', error);
  //   }
  // };

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        (product.productCode && String(product.productCode).toLowerCase().includes(term)) ||
        product.name.toLowerCase().includes(term) ||
        product.vendor.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === 'profitPercentage') {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        }

        if (sortOrder === 'desc') {
          return bVal - aVal;
        }
        return aVal - bVal;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, sortOrder]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    fetchProducts();
    triggerRefresh(); // Trigger global refresh
    handleModalClose();
  };

  const exportToExcel = () => {
    // Create CSV content with BOM for proper Excel encoding
    const BOM = '\uFEFF';
    const headers = [
      'Product Code',
      'Product Name',
      'Category',
      'Vendor',
      'Buying Price (₹)',
      'Selling Price (₹)',
      'Profit %',
      'Quantity',
      'Sold',
      'Available Stock',
      'Created Date',
      'Last Updated'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => [
        product.productCode || 'N/A',
        `"${product.name}"`,
        product.category || 'N/A',
        product.vendor || 'N/A',
        product.buyingPrice || 0,
        product.sellingPrice || 0,
        product.profitPercentage || 0,
        product.quantity || 0,
        product.sold || 0,
        (product.quantity || 0) - (product.sold || 0),
        product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN') : 'N/A',
        product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-IN') : 'N/A'
      ].join(','))
    ].join('\n');

    // Create and download file with BOM for Excel compatibility
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSummary = () => {
    // Calculate summary statistics
    const totalProducts = filteredProducts.length;
    const totalValue = filteredProducts.reduce((sum, product) => 
      sum + (product.buyingPrice * product.quantity), 0
    );
    const totalSold = filteredProducts.reduce((sum, product) => 
      sum + (product.sold || 0), 0
    );
    const totalProfit = filteredProducts.reduce((sum, product) => 
      sum + ((product.sellingPrice - product.buyingPrice) * (product.sold || 0)), 0
    );

    // Create summary CSV
    const BOM = '\uFEFF';
    const summaryHeaders = [
      'Metric',
      'Value',
      'Details'
    ];

    const summaryData = [
      ['Total Products', totalProducts, 'Number of products in inventory'],
      ['Total Inventory Value', `₹${totalValue.toFixed(2)}`, 'Total value of all products at buying price'],
      ['Total Units Sold', totalSold, 'Total units sold across all products'],
      ['Total Profit', `₹${totalProfit.toFixed(2)}`, 'Total profit from sold units'],
      ['Average Profit %', `${((totalProfit / totalValue) * 100).toFixed(2)}%`, 'Average profit percentage'],
      ['Export Date', new Date().toLocaleDateString('en-IN'), 'Date when this summary was exported'],
      ['Export Time', new Date().toLocaleTimeString('en-IN'), 'Time when this summary was exported']
    ];

    const summaryContent = [
      summaryHeaders.join(','),
      ...summaryData.map(row => row.join(','))
    ].join('\n');

    // Download summary file
    const blob = new Blob([BOM + summaryContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_summary_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-white mb-2">Products</h1>
          <p className="text-dark-400">Manage your inventory products</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <button
              className="btn-secondary flex items-center space-x-2"
              disabled={filteredProducts.length === 0}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={exportToExcel}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-700 transition-colors flex items-center space-x-2"
                  disabled={filteredProducts.length === 0}
                >
                  <Download className="h-4 w-4" />
                  <span>Export All Products</span>
                </button>
                <button
                  onClick={exportSummary}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-dark-700 transition-colors flex items-center space-x-2"
                  disabled={filteredProducts.length === 0}
                >
                  <Download className="h-4 w-4" />
                  <span>Export Summary</span>
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="">Sort by</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="quantity">Quantity</option>
              <option value="sold">Sold</option>
              <option value="profitPercentage">Profit %</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input-field"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-700 text-dark-300 hover:text-white'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-md transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-dark-700 text-dark-300 hover:text-white'
              }`}
            >
              Cards
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center space-x-2"
              disabled={filteredProducts.length === 0}
              title="Export all products to Excel (CSV)"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export All</span>
            </button>
            <button
              onClick={exportSummary}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center space-x-2"
              disabled={filteredProducts.length === 0}
              title="Export summary statistics"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Count */}
      <div className="text-sm text-dark-400">
        {filteredProducts.length} of {products.length} products
      </div>

      {/* Products Display */}
      {viewMode === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header w-40">Image</th>
                  <th className="table-header">Code</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Vendor</th>
                  <th className="table-header">Buying Price</th>
                  <th className="table-header">Selling Price</th>
                  <th className="table-header">Profit %</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Sold</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-dark-800/50">
                    <td className="table-cell w-40">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-32 w-32 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-32 w-32 bg-dark-700 rounded-md flex items-center justify-center">
                          <Package className="h-16 w-16 text-dark-400" />
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-dark-300">{product.productCode || '-'}</td>
                    <td className="table-cell font-medium">{product.name}</td>
                    <td className="table-cell">
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="table-cell">{product.vendor}</td>
                    <td className="table-cell">₹{product.buyingPrice}</td>
                    <td className="table-cell">₹{product.sellingPrice}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        parseFloat(product.profitPercentage) > 0 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.profitPercentage}%
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.quantity < 10 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                        {product.sold || 0}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="mobile-card border border-dark-700">
              <div className="flex flex-col items-center mb-4">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-32 w-32 object-cover rounded-md"
                  />
                ) : (
                  <div className="h-32 w-32 bg-dark-700 rounded-md flex items-center justify-center">
                    <Package className="h-16 w-16 text-dark-400" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-2 mb-3">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              <h3 className="font-semibold text-white mb-3 text-center text-lg line-clamp-2">{product.name}</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Code:</span>
                  <span className="text-white">{product.productCode || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Category:</span>
                  <span className="text-primary-400">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Vendor:</span>
                  <span className="text-white">{product.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Buying:</span>
                  <span className="text-white">₹{product.buyingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Selling:</span>
                  <span className="text-white">₹{product.sellingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Profit:</span>
                  <span className={`${
                    parseFloat(product.profitPercentage) > 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    {product.profitPercentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Quantity:</span>
                  <span className={`${
                    product.quantity < 10 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}>
                    {product.quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Sold:</span>
                  <span className="text-blue-400">
                    {product.sold || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="card p-12 text-center">
          <Package className="h-12 w-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
          <p className="text-dark-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
          </p>
          {!searchTerm && (
            <button onClick={handleAdd} className="btn-primary">
              Add Product
            </button>
          )}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={handleModalClose}
          onSaved={handleProductSaved}
        />
      )}
    </div>
  );
};

export default Products;
