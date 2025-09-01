import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, Eye, EyeOff, Building2 } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    logo: null,
    companyName: 'Inventory System'
  });
  
  const { login } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 mb-4 flex items-center justify-center">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Company Logo"
                className="h-20 w-20 object-contain bg-white p-2 rounded-lg border border-dark-600"
              />
            ) : (
              <div className="h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {settings.companyName}
          </h2>
          <p className="text-dark-400">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark-200 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10 w-full"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-dark-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 w-full"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-dark-400 hover:text-dark-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-dark-400 hover:text-dark-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 bg-dark-800 rounded-md">
            <p className="text-sm text-dark-300 mb-2">Demo Credentials:</p>
            <p className="text-xs text-dark-400">
              Username: <span className="text-primary-400">nilesh</span>
            </p>
            <p className="text-xs text-dark-400">
              Password: <span className="text-primary-400">nrao</span>
            </p>
          </div> */}
        </div>

        {/* Developer Credit */}
        <div className="absolute bottom-4 right-4 text-right">
          <p className="text-xs text-dark-400 italic">
            DEVELOP BY : <strong>NILESH VISHWASRAO</strong>
          </p>
          <p className="text-xs text-dark-400 italic">
            MOBILE NUMBER: <strong>8082174432</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
