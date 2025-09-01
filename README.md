# 🏪 Modern Inventory Management System

A **fully responsive**, modern inventory management web application built with React, Node.js, and Tailwind CSS. Features a beautiful dark theme UI that works perfectly on desktop, tablet, and mobile devices.

## ✨ Features

### 🔐 Authentication
- Secure login system with session management
- User authentication with bcrypt password hashing
- Protected routes and API endpoints

### 📊 Dashboard
- **Dark theme** by default with modern UI design
- **Responsive stats cards** showing:
  - Total Products
  - Total Stock Quantity
  - Total Vendors
  - Low Stock Alerts
- **Interactive charts** (Bar chart and Pie chart) for category distribution
- **Total inventory value** calculation

### 📦 Product Management
- **Full CRUD operations**: Create, Read, Update, Delete products
- **Image upload** support with preview
- **Auto-calculated profit percentage**
- **Multiple product fields**:
  - Product Name
  - Category (dropdown)
  - Vendor
  - Buying Price
  - Selling Price
  - Quantity
  - Product Image

### 🔍 Search & Filter
- **Global search** across product name, vendor, and category
- **Sorting** by price, quantity, or profit percentage
- **Real-time filtering** with instant results

### 📱 Responsive Design
- **Mobile-first approach** with breakpoints for all devices
- **Table view** for desktop with full feature set
- **Card view** for mobile and tablet with optimized layout
- **Collapsible sidebar** for mobile navigation
- **Touch-friendly** interface elements

### 🎨 Modern UI/UX
- **Dark theme** with custom color palette
- **Smooth animations** and transitions
- **Loading states** and error handling
- **Modern icons** from Lucide React
- **Custom scrollbars** and form styling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Beautiful charts and graphs
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **fs-extra** - Enhanced file system operations

### Data Storage
- **JSON files** - Simple file-based storage
- **No database setup required** - Perfect for small to medium businesses

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory_system
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
inventory_system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── data/              # JSON data files
│   ├── uploads/           # Uploaded images
│   ├── index.js           # Main server file
│   └── package.json
├── package.json
└── README.md
```

## 🎯 Key Components

### Frontend Components
- **Login** - Authentication form with validation
- **Layout** - Responsive sidebar and navigation
- **Dashboard** - Stats cards and charts
- **Products** - Product list with search and filters
- **ProductModal** - Add/edit product form
- **LoadingSpinner** - Loading states

### Backend Features
- **Authentication routes** - Login, logout, session management
- **Product CRUD** - Full product management API
- **File upload** - Image upload with validation
- **Dashboard stats** - Analytics and reporting
- **Search & filter** - Product search and sorting

## 📱 Responsive Breakpoints

- **Mobile**: < 768px - Stacked cards, collapsible sidebar
- **Tablet**: 768px - 1024px - 2-column layout, responsive tables
- **Desktop**: > 1024px - Full table view, sidebar always visible

## 🎨 Customization

### Colors
The app uses a custom dark theme with primary colors defined in `tailwind.config.js`:

```javascript
colors: {
  dark: {
    50: '#f8fafc',
    // ... more shades
    950: '#020617',
  },
  primary: {
    50: '#eff6ff',
    // ... more shades
    900: '#1e3a8a',
  }
}
```

### Categories
Edit the categories array in `Products.js` to customize product categories:

```javascript
const categories = [
  'Electronics', 'Clothing', 'Books', 'Home & Garden', 
  'Sports', 'Automotive', 'Health & Beauty', 'Toys'
];
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check auth status

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/search` - Search products

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚀 Deployment

### Frontend (React)
```bash
cd client
npm run build
```

### Backend (Node.js)
```bash
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify the server is running on port 5000
4. Check that the frontend is running on port 3000

## 🎉 Features in Action

- **Add products** with images and auto-calculated profit
- **Search and filter** products in real-time
- **View analytics** with beautiful charts
- **Responsive design** that works on any device
- **Modern dark theme** for comfortable viewing

---

**Built with ❤️ using React, Node.js, and Tailwind CSS**
