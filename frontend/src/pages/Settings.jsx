import React, { useState } from 'react';
import Card from '../components/Card';
import { User, Bell, Lock, Palette, Globe, Save } from 'lucide-react';

const Settings = () => {
  // Profile settings state
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Product Manager',
    bio: 'Passionate about building great products and leading amazing teams.',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskAssignments: true,
    taskComments: true,
    teamUpdates: true,
    weeklyDigest: false,
  });

  // App settings state
  const [appSettings, setAppSettings] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAppSettingChange = (e) => {
    const { name, value } = e.target;
    setAppSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // TODO: Integrate with API
    alert('Profile updated successfully!');
  };

  const handleSaveNotifications = () => {
    // TODO: Integrate with API
    alert('Notification preferences updated!');
  };

  const handleSaveAppSettings = () => {
    // TODO: Integrate with API
    alert('App settings updated!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-2xl text-white font-semibold">JD</span>
            </div>
            <div>
              <button className="btn-secondary text-sm">Change Photo</button>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="input-field"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="input-field"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={profile.role}
              onChange={handleProfileChange}
              className="input-field"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleProfileChange}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleSaveProfile} className="btn-primary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'taskAssignments' && 'Get notified when tasks are assigned to you'}
                  {key === 'taskComments' && 'Get notified about comments on your tasks'}
                  {key === 'teamUpdates' && 'Receive updates about your team activities'}
                  {key === 'weeklyDigest' && 'Receive a weekly summary of your activities'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleSaveNotifications} className="btn-primary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </Card>

      {/* App Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">App Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={appSettings.language}
              onChange={handleAppSettingChange}
              className="input-field"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              value={appSettings.timezone}
              onChange={handleAppSettingChange}
              className="input-field"
            >
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              id="dateFormat"
              name="dateFormat"
              value={appSettings.dateFormat}
              onChange={handleAppSettingChange}
              className="input-field"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleSaveAppSettings} className="btn-primary flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Password</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Last changed 3 months ago
            </p>
            <button className="btn-secondary text-sm">Change Password</button>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Add an extra layer of security to your account
            </p>
            <button className="btn-secondary text-sm">Enable 2FA</button>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Active Sessions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Manage devices where you're currently logged in
            </p>
            <button className="btn-secondary text-sm">View Sessions</button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <h3 className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">Delete Account</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all duration-200 text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;