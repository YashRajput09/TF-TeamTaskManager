import React, { useState } from 'react';
import {  CheckCircle, AlertTriangle } from 'lucide-react';
import axiosInstance from '../utility/axiosInstance';

const AutoRedistribution = ({ groupId, groupName }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    minTasksPerUser: 1,
    maxTasksPerUser: 3,
    sendNotifications: true
  });

  const handleAutoRedistribute = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.post(
        `/automation/groups/${groupId}/auto-redistribute`,
        settings
      );
      if (data.success) {
        setResult(data);
      } else {
        setError('Auto redistribution failed');
      }
    } catch (err) {
      setError('Error during auto redistribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {/* <AutoFixHigh className="w-5 h-5 text-green-500" /> */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Auto Task Redistribution
        </h3>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Min Tasks per User
            </label>
            <input
              type="number"
              value={settings.minTasksPerUser}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                minTasksPerUser: parseInt(e.target.value)
              }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Tasks per User
            </label>
            <input
              type="number"
              value={settings.maxTasksPerUser}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                maxTasksPerUser: parseInt(e.target.value)
              }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notifications
            </label>
            <select
              value={settings.sendNotifications}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                sendNotifications: e.target.value === 'true'
              }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={true}>Send Notifications</option>
              <option value={false}>No Notifications</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className={`rounded-lg p-4 mb-4 ${
            result.tasksReassigned > 0 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className={`w-5 h-5 ${
                result.tasksReassigned > 0 ? 'text-green-500' : 'text-blue-500'
              }`} />
              <span className={`font-medium ${
                result.tasksReassigned > 0 
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                {result.message}
              </span>
            </div>
            
            {result.tasksReassigned > 0 && (
              <div className="space-y-1 text-sm">
                <p className={result.tasksReassigned > 0 ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}>
                  • Tasks reassigned: {result.summary.tasksReassigned}
                </p>
                <p className={result.tasksReassigned > 0 ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}>
                  • Notifications sent: {result.summary.notificationsSent}
                </p>
                {result.redistributionLog.map((log, index) => (
                  <p key={index} className={result.tasksReassigned > 0 ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}>
                    • {log}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleAutoRedistribute}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2 py-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Redistributing Tasks...</span>
            </>
          ) : (
            <>
              {/* <AutoFixHigh className="w-4 h-4" /> */}
              <span>Auto Redistribute Tasks</span>
            </>
          )}
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Automatically balance tasks across team members in {groupName}. 
        The system will move tasks from overloaded users to underloaded users based on current workload.
      </p>
    </div>
  );
};

export default AutoRedistribution;