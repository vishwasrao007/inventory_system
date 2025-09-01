const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'inventory-system-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: 'lax'
  },
  name: 'inventory-session'
}));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Data storage paths
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const productsFile = path.join(dataDir, 'products.json');
const categoriesFile = path.join(dataDir, 'categories.json');
const vendorsFile = path.join(dataDir, 'vendors.json');
const customersFile = path.join(dataDir, 'customers.json');
const settingsFile = path.join(dataDir, 'settings.json');

// Ensure data directory exists
fs.ensureDirSync(dataDir);
fs.ensureDirSync(path.join(__dirname, 'uploads'));

// Initialize data files if they don't exist
if (!fs.existsSync(usersFile)) {
  fs.writeJsonSync(usersFile, [
    {
      id: 1,
      username: 'nilesh',
      password: bcrypt.hashSync('nrao', 10),
      role: 'admin'
    }
  ]);
}

// Initialize settings file
if (!fs.existsSync(settingsFile)) {
  fs.writeJsonSync(settingsFile, {
    logo: null,
    companyName: 'Inventory System'
  });
}

if (!fs.existsSync(productsFile)) {
  fs.writeJsonSync(productsFile, []);
}

if (!fs.existsSync(categoriesFile)) {
  fs.writeJsonSync(categoriesFile, [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 
    'Sports', 'Automotive', 'Health & Beauty', 'Toys'
  ]);
}

if (!fs.existsSync(vendorsFile)) {
  fs.writeJsonSync(vendorsFile, [
    'Amazon', 'Walmart', 'Target', 'Best Buy', 
    'Costco', 'Home Depot', 'Apple', 'Samsung'
  ]);
}

if (!fs.existsSync(customersFile)) {
  fs.writeJsonSync(customersFile, []);
}

// Helper functions
const readData = (filePath) => {
  try {
    return fs.readJsonSync(filePath);
  } catch (error) {
    return [];
  }
};

const writeData = (filePath, data) => {
  fs.writeJsonSync(filePath, data, { spaces: 2 });
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Routes

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readData(usersFile);
  
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  if (req.session.userId) {
    const users = readData(usersFile);
    const user = users.find(u => u.id === req.session.userId);
    res.json({ 
      authenticated: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Products CRUD
app.get('/api/products', requireAuth, (req, res) => {
  const products = readData(productsFile);
  res.json(products);
});


app.post('/api/products', requireAuth, upload.single('image'), (req, res) => {
  try {
    const products = readData(productsFile);
    const newProduct = {
      id: Date.now(),
      productCode: req.body.productCode || '',
      name: req.body.name,
      category: req.body.category,
      vendor: req.body.vendor,
      buyingPrice: parseFloat(req.body.buyingPrice),
      sellingPrice: parseFloat(req.body.sellingPrice),
      quantity: parseInt(req.body.quantity),
      sold: parseInt(req.body.sold) || 0,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date().toISOString()
    };
    
    // Calculate profit percentage
    newProduct.profitPercentage = ((newProduct.sellingPrice - newProduct.buyingPrice) / newProduct.buyingPrice * 100).toFixed(2);
    
    products.push(newProduct);
    writeData(productsFile, products);
    
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Bulk create products (JSON body, no file uploads)
app.post('/api/products/bulk', requireAuth, (req, res) => {
  try {
    const input = Array.isArray(req.body) ? req.body : req.body.products;
    if (!Array.isArray(input) || input.length === 0) {
      return res.status(400).json({ error: 'No products provided' });
    }
    const products = readData(productsFile);
    const created = [];
    for (const item of input) {
      const product = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        productCode: item.productCode || '',
        name: item.name,
        category: item.category,
        vendor: item.vendor,
        buyingPrice: parseFloat(item.buyingPrice),
        sellingPrice: parseFloat(item.sellingPrice),
        quantity: parseInt(item.quantity),
        sold: parseInt(item.sold) || 0,
        image: null,
        createdAt: new Date().toISOString()
      };
      product.profitPercentage = ((product.sellingPrice - product.buyingPrice) / product.buyingPrice * 100).toFixed(2);
      products.push(product);
      created.push(product);
    }
    writeData(productsFile, products);
    res.json({ success: true, createdCount: created.length, products: created });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk create products' });
  }
});

app.put('/api/products/:id', requireAuth, upload.single('image'), (req, res) => {
  try {
    const products = readData(productsFile);
    const requestedId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === requestedId || p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const updatedProduct = {
      ...products[productIndex],
      productCode: req.body.productCode ?? products[productIndex].productCode ?? '',
      name: req.body.name,
      category: req.body.category,
      vendor: req.body.vendor,
      buyingPrice: parseFloat(req.body.buyingPrice),
      sellingPrice: parseFloat(req.body.sellingPrice),
      quantity: parseInt(req.body.quantity),
      sold: parseInt(req.body.sold) || products[productIndex].sold || 0,
      updatedAt: new Date().toISOString()
    };
    
    if (req.file) {
      updatedProduct.image = `/uploads/${req.file.filename}`;
    }
    
    // Calculate profit percentage
    updatedProduct.profitPercentage = ((updatedProduct.sellingPrice - updatedProduct.buyingPrice) / updatedProduct.buyingPrice * 100).toFixed(2);
    
    products[productIndex] = updatedProduct;
    writeData(productsFile, products);
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
  try {
    const products = readData(productsFile);
    const requestedId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === requestedId || p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete image file if exists
    const product = products[productIndex];
    if (product.image) {
      const imagePath = path.join(__dirname, product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    products.splice(productIndex, 1);
    writeData(productsFile, products);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  const products = readData(productsFile);
  
  const stats = {
    totalProducts: products.length,
    totalStockQuantity: products.reduce((sum, p) => sum + (p.quantity || 0), 0),
    totalVendors: new Set(products.map(p => p.vendor)).size,
    lowStockAlerts: products.filter(p => (p.quantity || 0) < 10).length,
    totalValue: products.reduce((sum, p) => sum + ((p.buyingPrice || 0) * (p.quantity || 0)), 0),
    totalSold: products.reduce((sum, p) => sum + (p.sold || 0), 0),
    totalSoldProfit: products.reduce((sum, p) => {
      const sold = p.sold || 0;
      const profitPerUnit = (p.sellingPrice || 0) - (p.buyingPrice || 0);
      return sum + (sold * profitPerUnit);
    }, 0),
    categories: products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {})
  };
  
  res.json(stats);
});

// Search products
app.get('/api/products/search', requireAuth, (req, res) => {
  const { q, sortBy, sortOrder } = req.query;
  let products = readData(productsFile);
  
  // Search
  if (q) {
    const searchTerm = q.toLowerCase();
    products = products.filter(p => 
      (p.productCode && String(p.productCode).toLowerCase().includes(searchTerm)) ||
      p.name.toLowerCase().includes(searchTerm) ||
      p.vendor.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }
  
  // Sort
  if (sortBy) {
    products.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'profitPercentage' || sortBy === 'sold') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortOrder === 'desc') {
        return bVal - aVal;
      }
      return aVal - bVal;
    });
  }
  
  res.json(products);
});

// Categories CRUD (No authentication required)
app.get('/api/categories', (req, res) => {
  const categories = readData(categoriesFile);
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const categories = readData(categoriesFile);
    if (categories.includes(name.trim())) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    categories.push(name.trim());
    writeData(categoriesFile, categories);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

app.delete('/api/categories/:name', (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.name);
    const categories = readData(categoriesFile);
    const index = categories.indexOf(categoryName);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if category is used by any products
    const products = readData(productsFile);
    const isUsed = products.some(product => product.category === categoryName);
    
    if (isUsed) {
      return res.status(400).json({ error: 'Cannot delete category that is used by products' });
    }
    
    categories.splice(index, 1);
    writeData(categoriesFile, categories);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Vendors CRUD (No authentication required)
app.get('/api/vendors', (req, res) => {
  const vendors = readData(vendorsFile);
  res.json(vendors);
});

app.post('/api/vendors', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }
    
    const vendors = readData(vendorsFile);
    if (vendors.includes(name.trim())) {
      return res.status(400).json({ error: 'Vendor already exists' });
    }
    
    vendors.push(name.trim());
    writeData(vendorsFile, vendors);
    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add vendor' });
  }
});

app.delete('/api/vendors/:name', (req, res) => {
  try {
    const vendorName = decodeURIComponent(req.params.name);
    const vendors = readData(vendorsFile);
    const index = vendors.indexOf(vendorName);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check if vendor is used by any products
    const products = readData(productsFile);
    const isUsed = products.some(product => product.vendor === vendorName);
    
    if (isUsed) {
      return res.status(400).json({ error: 'Cannot delete vendor that is used by products' });
    }
    
    vendors.splice(index, 1);
    writeData(vendorsFile, vendors);
    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

// Customers CRUD (No authentication required)
app.get('/api/customers', (req, res) => {
  const customers = readData(customersFile);
  res.json(customers);
});

app.post('/api/customers', (req, res) => {
  try {
    const { name, address, mobileNumber, productCodes, date, time } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ error: 'Address is required' });
    }
    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }
    if (!productCodes || productCodes.length === 0) {
      return res.status(400).json({ error: 'At least one product is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    if (!time) {
      return res.status(400).json({ error: 'Time is required' });
    }

    const customers = readData(customersFile);
    const newCustomer = {
      id: Date.now(),
      name: name.trim(),
      address: address.trim(),
      mobileNumber: mobileNumber.trim(),
      productCodes: productCodes,
      date: date,
      time: time,
      createdAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    writeData(customersFile, customers);
    res.json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.put('/api/customers/:id', (req, res) => {
  try {
    const customers = readData(customersFile);
    const customerId = parseInt(req.params.id);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const { name, address, mobileNumber, productCodes, date, time } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ error: 'Address is required' });
    }
    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }
    if (!productCodes || productCodes.length === 0) {
      return res.status(400).json({ error: 'At least one product is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    if (!time) {
      return res.status(400).json({ error: 'Time is required' });
    }

    const updatedCustomer = {
      ...customers[customerIndex],
      name: name.trim(),
      address: address.trim(),
      mobileNumber: mobileNumber.trim(),
      productCodes: productCodes,
      date: date,
      time: time,
      updatedAt: new Date().toISOString()
    };

    customers[customerIndex] = updatedCustomer;
    writeData(customersFile, customers);
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    const customers = readData(customersFile);
    const customerId = parseInt(req.params.id);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    customers.splice(customerIndex, 1);
    writeData(customersFile, customers);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Settings API endpoints
app.get('/api/settings', (req, res) => {
  try {
    const settings = readData(settingsFile);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const { companyName } = req.body;
    const settings = readData(settingsFile);
    
    if (companyName !== undefined) {
      settings.companyName = companyName;
    }
    
    writeData(settingsFile, settings);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Logo upload endpoint
app.post('/api/settings/logo', upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No logo file uploaded' });
    }
    
    const settings = readData(settingsFile);
    settings.logo = `/uploads/${req.file.filename}`;
    writeData(settingsFile, settings);
    
    res.json({ 
      success: true, 
      logo: settings.logo 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
