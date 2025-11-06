//Calendar.jsx
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Calendar, RefreshCw, CheckCircle, XCircle, Link } from 'lucide-react';

const CalendarPage = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const checkCalendarStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/calendar/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectCalendar = async () => {
    try {
      const response = await fetch('/calendar/connect', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const syncTask = async (taskId) => {
    setSyncing(true);
    try {
      const response = await fetch(`/calendar/tasks/${taskId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sendReminders: true,
          reminderMinutes: [10, 60]
        })
      });
      const data = await response.json();
      alert('Task synced to calendar successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    checkCalendarStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar Integration</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Connect and sync with Google Calendar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendar Status</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 p-4 rounded-lg ${
                status.connected 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20'
              }`}>
                {status.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {status.connected ? 'Connected' : 'Not Connected'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {status.message}
                  </p>
                </div>
              </div>

              {status.connected && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Connected Calendars</h3>
                  {status.calendars?.map(cal => (
                    <div key={cal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">{cal.summary}</span>
                        {cal.primary && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={status.connected ? checkCalendarStatus : connectCalendar}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Link className="w-4 h-4" />
                <span>{status.connected ? 'Reconnect Calendar' : 'Connect Google Calendar'}</span>
              </button>
            </div>
          ) : null}
        </Card>

        {/* Quick Sync */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <RefreshCw className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Sync</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sync your tasks to Google Calendar with reminders and notifications
          </p>

          <div className="space-y-3">
            {/* Example task sync - you can replace with dynamic tasks */}
            {[
              { id: 'task-1', title: 'Update landing page design', dueDate: '2024-11-15' },
              { id: 'task-2', title: 'Fix authentication bug', dueDate: '2024-11-12' },
            ].map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: {task.dueDate}</p>
                </div>
                <button
                  onClick={() => syncTask(task.id)}
                  disabled={syncing || !status?.connected}
                  className="btn-secondary flex items-center space-x-2 text-sm"
                >
                  {syncing ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span>Sync</span>
                </button>
              </div>
            ))}
          </div>

          {!status?.connected && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Connect Google Calendar to enable task synchronization
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;