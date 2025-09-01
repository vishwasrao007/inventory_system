import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Save, Building2, Palette, Image } from 'lucide-react';
import { useRefresh } from '../contexts/RefreshContext';

const Settings = () => {
  const [settings, setSettings] = useState({
    logo: null,
    companyName: 'Inventory System'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const { refreshTrigger } = useRefresh();

  useEffect(() => {
    fetchSettings();
  }, [refreshTrigger]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setErrors({});
    
    try {
      await axios.put('/api/settings', {
        companyName: settings.companyName
      });
      
      // Trigger refresh to update other components
      window.location.reload();
    } catch (error) {
      console.error('Failed to save settings:', error);
      setErrors({ save: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ logo: 'Please select a valid image file.' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ logo: 'File size must be less than 5MB.' });
      return;
    }

    setLogoUploading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post('/api/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSettings(prev => ({
        ...prev,
        logo: response.data.logo
      }));

      // Trigger refresh to update other components
      window.location.reload();
    } catch (error) {
      console.error('Failed to upload logo:', error);
      setErrors({ logo: 'Failed to upload logo. Please try again.' });
    } finally {
      setLogoUploading(false);
    }
  };

  const removeLogo = () => {
    setSettings(prev => ({
      ...prev,
      logo: null
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-dark-400">Manage your application settings and branding</p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Building2 className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-white">Company Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleInputChange}
                className="input-field w-full"
                placeholder="Enter company name"
              />
            </div>



            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>

            {errors.save && (
              <p className="text-red-400 text-sm">{errors.save}</p>
            )}
          </div>
        </div>

        {/* Logo Management */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Image className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-white">Logo Management</h2>
          </div>

          <div className="space-y-4">
            {/* Current Logo Display */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Current Logo
              </label>
              <div className="flex items-center space-x-4">
                {settings.logo ? (
                  <div className="relative">
                    <img
                      src={settings.logo}
                      alt="Company Logo"
                      className="h-20 w-20 object-contain border border-dark-600 rounded-md bg-white p-2"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 border-2 border-dashed border-dark-600 rounded-md flex items-center justify-center">
                    <Image className="h-8 w-8 text-dark-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-dark-300">
                    {settings.logo ? 'Logo uploaded successfully' : 'No logo uploaded'}
                  </p>
                  <p className="text-xs text-dark-400">
                    Recommended size: 200x200px or larger
                  </p>
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Upload New Logo
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className={`btn-secondary w-full flex items-center justify-center space-x-2 cursor-pointer ${
                    logoUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {logoUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{logoUploading ? 'Uploading...' : 'Choose Logo File'}</span>
                </label>
              </div>
              <p className="text-xs text-dark-400 mt-1">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>

            {errors.logo && (
              <p className="text-red-400 text-sm">{errors.logo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-white">Preview</h2>
        </div>
        
        <div className="bg-dark-800 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Company Logo"
                className="h-12 w-12 object-contain bg-white p-1 rounded"
              />
            ) : (
              <div className="h-12 w-12 bg-primary-500 rounded flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">
                {settings.companyName}
              </h3>
              <p className="text-sm text-dark-400">Inventory Management System</p>
            </div>
          </div>
          <p className="text-sm text-dark-300">
            This is how your logo and company name will appear in the login page and throughout the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
