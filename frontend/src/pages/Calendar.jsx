// Calendar.jsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Calendar, RefreshCw, CheckCircle, XCircle, Link, LogOut, ExternalLink, AlertCircle } from 'lucide-react';

const CalendarPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [events, setEvents] = useState([]);
  const [showEvents, setShowEvents] = useState(false);
  const [connectionStep, setConnectionStep] = useState('idle');
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:3000'; 

  const checkCalendarStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      console.log('Fetching calendar status...');
      const response = await fetch(`${API_BASE}/api/calendar/status`, { // FIXED: Added API_BASE
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStatus(data);
      
    } catch (error) {
      console.error('Status check failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const connectCalendar = async () => {
    setError(null);
    setConnectionStep('connecting');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/calendar/connect`, { // FIXED: Added API_BASE
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.authUrl) {
        setConnectionStep('authorized');
        // Open in same window for better OAuth flow
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.message || 'Failed to connect to Google Calendar');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setError(error.message);
      setConnectionStep('idle');
    }
  };

  const disconnectCalendar = async () => { // ADDED: Missing function
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/calendar/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect calendar');
      }

      await checkCalendarStatus(); // Refresh status
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchCalendarEvents = async () => { // ADDED: Fetch events function
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/calendar/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      setEvents(data.events || []);
      setShowEvents(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const syncTaskToCalendar = async (taskId) => { // ADDED: Sync function
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}/sync-calendar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sendReminders: true,
          reminderMinutes: [10, 60]
        })
      });

      if (!response.ok) throw new Error('Failed to sync task');
      
      const data = await response.json();
      alert(`Task synced successfully! Event ID: ${data.event.id}`);
      await checkCalendarStatus(); // Refresh status
    } catch (error) {
      setError(error.message);
    }
  };

  const retryConnection = () => {
    setError(null);
    checkCalendarStatus();
  };

  useEffect(() => {
    checkCalendarStatus();
  }, []);

  // Sample tasks data - you can replace this with actual tasks from props or context
  const sampleTasks = [
    { 
      id: '1', 
      title: 'Update landing page design', 
      deadline: '2024-11-15T10:00:00Z',
      priority: 'high',
      status: 'in-progress',
      calendarEventId: null
    },
    { 
      id: '2', 
      title: 'Fix authentication bug', 
      deadline: '2024-11-12T14:00:00Z',
      priority: 'critical',
      status: 'todo',
      calendarEventId: null
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar Integration</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Connect and sync with Google Calendar
          </p>
        </div>
        
        {status?.connected && (
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={fetchCalendarEvents}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View Events</span>
            </button>
            <button
              onClick={disconnectCalendar}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-200">
                Connection Issue
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={retryConnection}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-3 py-1 text-red-600 text-sm border border-red-600 rounded hover:bg-red-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Modal */}
      {showEvents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Calendar Events</h3>
              <button onClick={() => setShowEvents(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map(event => (
                  <div key={event.eventId} className="border rounded-lg p-3">
                    <h4 className="font-semibold">{event.summary}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500">Start: {formatDate(event.start)}</p>
                    <p className="text-xs text-gray-500">End: {formatDate(event.end)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No events found</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status Card */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendar Status</h2>
            </div>
            <button
              onClick={checkCalendarStatus}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Checking status...</span>
            </div>
          ) : status ? (
            <div className="space-y-4">
              {/* Status Display */}
              <div className={`flex items-center space-x-3 p-4 rounded-lg ${
                status.connected 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              }`}>
                {status.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {status.connected ? 'Connected to Google Calendar' : 'Not Connected'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {status.message}
                  </p>
                  {status.lastSync && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Last sync: {new Date(status.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Connection Steps */}
              {!status.connected && connectionStep === 'connecting' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                      Redirecting to Google...
                    </h3>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    You will be redirected to Google to authorize calendar access.
                  </p>
                </div>
              )}

              {/* CONNECT BUTTON */}
              {!status.connected && (
                <div className="space-y-3">
                  <button
                    onClick={connectCalendar}
                    disabled={loading || connectionStep === 'connecting'}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  >
                    {connectionStep === 'connecting' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Link className="w-5 h-5" />
                    )}
                    <span>
                      {connectionStep === 'connecting' ? 'Connecting...' : 'Connect Google Calendar'}
                    </span>
                  </button>
                  
                  {/* Help Text */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                      Why connect Google Calendar?
                    </h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Sync tasks with due dates automatically</li>
                      <li>• Get reminders before deadlines</li>
                      <li>• View all your tasks alongside other events</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Connected State Actions */}
              {status.connected && (
                <div className="space-y-3">
                  <button
                    onClick={checkCalendarStatus}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Refresh Connection</span>
                  </button>
                  
                  {status.calendars && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        Your Calendars:
                      </h3>
                      {status.calendars.slice(0, 3).map(cal => (
                        <div key={cal.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{cal.summary}</span>
                          {cal.primary && (
                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Unable to load calendar status</p>
              <button
                onClick={retryConnection}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry Connection
              </button>
            </div>
          )}
        </Card>

        {/* Task Sync Card */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <RefreshCw className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Sync</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sync your tasks to Google Calendar with reminders and notifications
          </p>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sampleTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due: {formatDate(task.deadline)}
                  </p>
                  {task.calendarEventId && (
                    <p className="text-xs text-green-600 dark:text-green-400">✓ Synced</p>
                  )}
                </div>
                <button
                  onClick={() => syncTaskToCalendar(task.id)}
                  disabled={!status?.connected || task.calendarEventId}
                  className="ml-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded flex items-center space-x-1 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{task.calendarEventId ? 'Synced' : 'Sync'}</span>
                </button>
              </div>
            ))}
          </div>

          {!status?.connected && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Connect Google Calendar to enable task synchronization
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;