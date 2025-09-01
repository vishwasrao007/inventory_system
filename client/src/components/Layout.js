import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRefresh } from '../contexts/RefreshContext';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  Menu, 
  X,
  User,
  Tags,
  Building2,
  Settings as SettingsIcon
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    logo: null,
    companyName: 'Inventory System'
  });
  const { user, logout } = useAuth();
  const { triggerRefresh } = useRefresh();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Tags },
    { name: 'Vendors', href: '/vendors', icon: Building2 },
    { name: 'Customers', href: '/customers', icon: User },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const handleNavClick = () => {
    triggerRefresh();
    setSidebarOpen(false);
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Trigger refresh when route changes
  useEffect(() => {
    triggerRefresh();
  }, [location.pathname, triggerRefresh]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-dark-800">
          <div className="flex items-center space-x-3">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Company Logo"
                className="h-8 w-8 object-contain bg-white p-1 rounded"
              />
            ) : (
              <div className="h-8 w-8 bg-primary-600 rounded flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
            )}
            <h1 className="text-xl font-bold text-white">{settings.companyName}</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                    }
                  `}
                  onClick={handleNavClick}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-dark-400 capitalize">
                {user?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-md transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-dark-900 border-b border-dark-800">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex-1 lg:hidden" />
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-dark-400">
                <span>Welcome back,</span>
                <span className="text-white font-medium">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
