import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { RootState } from '@/store/store';
import { useTheme } from '@/context/ThemeContext';

interface SettingsTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface AppSettings {
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
    marketing: boolean;
    updates: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    sidebarCompact: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'default' | 'large';
  };
  privacy: {
    shareUsageData: boolean;
    allowCookies: boolean;
    showProfileToOthers: boolean;
  };
  export: {
    includePersonalInfo: boolean;
    includePaymentInfo: boolean;
    includeUsageData: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      marketing: false,
      updates: true,
    },
    appearance: {
      theme: 'system',
      sidebarCompact: false,
      reducedMotion: false,
      fontSize: 'default',
    },
    privacy: {
      shareUsageData: true,
      allowCookies: true,
      showProfileToOthers: true,
    },
    export: {
      includePersonalInfo: true,
      includePaymentInfo: false,
      includeUsageData: true,
    },
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Tabs configuration
  const tabs: SettingsTab[] = [
    {
      id: 'appearance',
      name: 'Appearance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: 'data',
      name: 'Data & Export',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
    },
  ];

  // Load user settings
  useEffect(() => {
    // In a real app, you would fetch this from an API
    // For this demo, we'll simulate a loading delay
    setTimeout(() => {
      // Set the theme setting to match the current theme setting
      setSettings(prevSettings => ({
        ...prevSettings,
        appearance: {
          ...prevSettings.appearance,
          theme: theme as 'light' | 'dark' | 'system',
        }
      }));
      
      setIsLoading(false);
    }, 800);
  }, [theme]);

  // Handle checkbox toggle
  const handleCheckboxChange = (section: keyof AppSettings, setting: string) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [setting]: !settings[section][setting as keyof typeof settings[typeof section]],
      },
    });
  };

  // Handle theme change
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        theme: newTheme,
      },
    });
    
    setTheme(newTheme);
  };

  // Handle font size change
  const handleFontSizeChange = (fontSize: 'small' | 'default' | 'large') => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        fontSize,
      },
    });
    
    // Apply font size changes
    const htmlElement = document.documentElement;
    
    switch (fontSize) {
      case 'small':
        htmlElement.style.fontSize = '14px';
        break;
      case 'default':
        htmlElement.style.fontSize = '16px';
        break;
      case 'large':
        htmlElement.style.fontSize = '18px';
        break;
    }
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, you would submit this to an API
    // For this demo, we'll simulate a successful save
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Settings saved successfully!',
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }, 1000);
  };

  // Handle export data
  const handleExportData = () => {
    // In a real app, you would trigger a data export process
    // For this demo, we'll simulate a successful export request
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Data export request submitted. You will receive your data via email shortly.',
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }, 1000);
  };

  // Render Appearance Tab content
  const renderAppearanceTab = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Theme
        </h2>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Choose how AI Platform looks to you. Select a single theme, or sync with your system settings.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className={`border rounded-lg p-4 cursor-pointer ${
              settings.appearance.theme === 'light'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
            onClick={() => handleThemeChange('light')}
          >
            <div className="bg-white border border-slate-200 rounded-md p-3 mb-3">
              <div className="h-2 w-8 bg-slate-400 rounded-full mb-2"></div>
              <div className="h-2 w-16 bg-slate-300 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <div className={`h-4 w-4 mr-2 border rounded-full flex items-center justify-center ${
                settings.appearance.theme === 'light'
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {settings.appearance.theme === 'light' && (
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">Light</span>
            </div>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer ${
              settings.appearance.theme === 'dark'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
            onClick={() => handleThemeChange('dark')}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-md p-3 mb-3">
              <div className="h-2 w-8 bg-slate-600 rounded-full mb-2"></div>
              <div className="h-2 w-16 bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <div className={`h-4 w-4 mr-2 border rounded-full flex items-center justify-center ${
                settings.appearance.theme === 'dark'
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {settings.appearance.theme === 'dark' && (
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">Dark</span>
            </div>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer ${
              settings.appearance.theme === 'system'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
            }`}
            onClick={() => handleThemeChange('system')}
          >
            <div className="bg-gradient-to-r from-white to-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-3 mb-3">
              <div className="h-2 w-8 bg-slate-400 rounded-full mb-2"></div>
              <div className="h-2 w-16 bg-slate-300 rounded-full"></div>
            </div>
            <div className="flex items-center">
              <div className={`h-4 w-4 mr-2 border rounded-full flex items-center justify-center ${
                settings.appearance.theme === 'system'
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {settings.appearance.theme === 'system' && (
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                )}
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">System</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          Current theme: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
          {settings.appearance.theme === 'system' && ' (based on your system settings)'}
        </p>
      </div>
      
      {/* Font Size */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Font Size
        </h2>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Adjust the font size to make content easier to read.
        </p>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleFontSizeChange('small')}
            className={`px-4 py-2 rounded-md text-sm ${
              settings.appearance.fontSize === 'small'
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            Small
          </button>
          
          <button
            onClick={() => handleFontSizeChange('default')}
            className={`px-4 py-2 rounded-md text-sm ${
              settings.appearance.fontSize === 'default'
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            Default
          </button>
          
          <button
            onClick={() => handleFontSizeChange('large')}
            className={`px-4 py-2 rounded-md text-sm ${
              settings.appearance.fontSize === 'large'
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
            }`}
          >
            Large
          </button>
        </div>
      </div>
      
      {/* Sidebar and Motion */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Display Options
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="sidebarCompact" className="font-medium text-slate-900 dark:text-white text-sm">
                Compact Sidebar
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Use a more compact sidebar that takes up less space.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="sidebarCompact"
                type="checkbox"
                checked={settings.appearance.sidebarCompact}
                onChange={() => handleCheckboxChange('appearance', 'sidebarCompact')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="reducedMotion" className="font-medium text-slate-900 dark:text-white text-sm">
                Reduce Animation
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Minimize motion effects throughout the application.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="reducedMotion"
                type="checkbox"
                checked={settings.appearance.reducedMotion}
                onChange={() => handleCheckboxChange('appearance', 'reducedMotion')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  // Render Notifications Tab content
  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Email Notifications
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="emailNotifs" className="font-medium text-slate-900 dark:text-white text-sm">
                Email Notifications
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Receive notifications via email for important updates.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="emailNotifs"
                type="checkbox"
                checked={settings.notifications.email}
                onChange={() => handleCheckboxChange('notifications', 'email')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="marketingEmails" className="font-medium text-slate-900 dark:text-white text-sm">
                Marketing Emails
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Receive promotional emails about special offers and new features.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="marketingEmails"
                type="checkbox"
                checked={settings.notifications.marketing}
                onChange={() => handleCheckboxChange('notifications', 'marketing')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="updateEmails" className="font-medium text-slate-900 dark:text-white text-sm">
                Product Updates
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Receive emails about new features and platform updates.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="updateEmails"
                type="checkbox"
                checked={settings.notifications.updates}
                onChange={() => handleCheckboxChange('notifications', 'updates')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* App Notifications */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          In-App Notifications
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="browserNotifs" className="font-medium text-slate-900 dark:text-white text-sm">
                Browser Notifications
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Receive notifications in your browser when tasks are completed.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="browserNotifs"
                type="checkbox"
                checked={settings.notifications.browser}
                onChange={() => handleCheckboxChange('notifications', 'browser')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="mobileNotifs" className="font-medium text-slate-900 dark:text-white text-sm">
                Mobile Push Notifications
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Receive notifications on your mobile device when tasks are completed.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="mobileNotifs"
                type="checkbox"
                checked={settings.notifications.mobile}
                onChange={() => handleCheckboxChange('notifications', 'mobile')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  // Render Privacy Tab content
  const renderPrivacyTab = () => (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Privacy Settings
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="shareUsageData" className="font-medium text-slate-900 dark:text-white text-sm">
                Share Usage Data
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Help us improve by sharing anonymous usage data and crash reports.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="shareUsageData"
                type="checkbox"
                checked={settings.privacy.shareUsageData}
                onChange={() => handleCheckboxChange('privacy', 'shareUsageData')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="allowCookies" className="font-medium text-slate-900 dark:text-white text-sm">
                Allow Cookies
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Allow the use of cookies to improve your experience.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="allowCookies"
                type="checkbox"
                checked={settings.privacy.allowCookies}
                onChange={() => handleCheckboxChange('privacy', 'allowCookies')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="showProfileToOthers" className="font-medium text-slate-900 dark:text-white text-sm">
                Profile Visibility
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Allow other users to see your profile and activity.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="showProfileToOthers"
                type="checkbox"
                checked={settings.privacy.showProfileToOthers}
                onChange={() => handleCheckboxChange('privacy', 'showProfileToOthers')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Deletion */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Data Management
        </h2>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Manage your personal data stored on our platform.
        </p>
        
        <div className="space-y-4">
          <button
            type="button"
            className="text-sm px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Download My Data
          </button>
          
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              className="text-sm px-4 py-2 border border-red-300 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete My Account
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );

  // Render Data & Export Tab content
  const renderDataTab = () => (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Export Your Data
        </h2>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Export a copy of your data from AI Platform. This process may take a few minutes, and you will be notified when your data is ready to download.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="includePersonalInfo" className="font-medium text-slate-900 dark:text-white text-sm">
                Include Personal Information
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Include your profile data, contact information, and preferences.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="includePersonalInfo"
                type="checkbox"
                checked={settings.export.includePersonalInfo}
                onChange={() => handleCheckboxChange('export', 'includePersonalInfo')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="includePaymentInfo" className="font-medium text-slate-900 dark:text-white text-sm">
                Include Payment History
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Include records of your payments and subscription details.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="includePaymentInfo"
                type="checkbox"
                checked={settings.export.includePaymentInfo}
                onChange={() => handleCheckboxChange('export', 'includePaymentInfo')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label htmlFor="includeUsageData" className="font-medium text-slate-900 dark:text-white text-sm">
                Include Usage Data
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Include data about your AI tool usage and generated content.
              </p>
            </div>
            <div className="ml-3 flex items-center h-5">
              <input
                id="includeUsageData"
                type="checkbox"
                checked={settings.export.includeUsageData}
                onChange={() => handleCheckboxChange('export', 'includeUsageData')}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              onClick={handleExportData}
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Export My Data'}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Your data will be exported as a ZIP file and sent to your email address.
            </p>
          </div>
        </div>
      </div>
      
      {/* Data Usage */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Data Usage
        </h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                Total Storage Used
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                2.4 GB / 10 GB
              </div>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                style={{ width: '24%' }}
              ></div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Your Pro Plan includes 10 GB of storage for your generated content.
            </p>
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                AI Model Usage
              </div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                76 / 100 hours
              </div>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                style={{ width: '76%' }}
              ></div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Your Pro Plan includes 100 hours of AI model usage per month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'data':
        return renderDataTab();
      default:
        return renderAppearanceTab();
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your application preferences and account settings.
          </p>
        </div>
        
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  notification.type === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex flex-col md:flex-row md:space-x-6">
          <div className="w-full md:w-64 mb-6 md:mb-0">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-1">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/25'
                    }`}
                  >
                    <span className="truncate flex items-center">
                      <span className="mr-3">{tab.icon}</span>
                      {tab.name}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="flex-1">
            {isLoading && !notification ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading loading-lg"></div>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
