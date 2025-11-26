import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Calendar, RefreshCw, CheckCircle, XCircle, Link } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import axiosInstance from './utility/axiosInstance';

const CalendarPage = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ---------------------------
  // CHECK CALENDAR STATUS
  // ---------------------------
  const checkCalendarStatus = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/calendar/status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStatus(data);
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // CONNECT GOOGLE CALENDAR
  // ---------------------------
  const connectCalendar = async () => {
    try {
      const { data } = await axiosInstance.get('/api/calendar/connect', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Redirect user to Google Authentication URL
      window.location.href = data.authUrl;

    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  // ---------------------------
  // SYNC TASK TO GOOGLE CALENDAR
  // ---------------------------
  const syncTask = async (taskId) => {
    setSyncing(true);
    try {
      await axiosInstance.post(`/api/calendar/tasks/${taskId}/sync`,
        {
          sendReminders: true,
          reminderMinutes: [10, 60]
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

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

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("connected") === "true") {
    checkCalendarStatus();
  }
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

        <button
          className="flex bg-blue-950 px-3 py-2 rounded-lg items-center gap-2 text-white"
          onClick={() => navigate("/calendar/create-meeting")}
        >
          Schedule Meeting <Link size={16} />
        </button>
      </div>

      {/* TWO CARDS START */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ---------- CONNECTION STATUS ---------- */}
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
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-yellow-50 dark:bg-yellow-900/20"
              }`}>
                {status.connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-500" />
                )}

                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {status.connected ? "Connected" : "Not Connected"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {status.message}
                  </p>
                </div>
              </div>

              {status.connected && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Connected Calendars</h3>

                  {status.calendars?.map((cal) => (
                    <div key={cal.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between">
                      <span className="text-gray-700 dark:text-white">{cal.summary}</span>
                      {cal.primary && (
                        <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">Primary</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={status.connected ? checkCalendarStatus : connectCalendar}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Link size={16} />
                {status.connected ? "Reconnect Calendar" : "Connect Google Calendar"}
              </button>
            </div>
          ) : null}
        </Card>

        {/* ---------- QUICK SYNC ---------- */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <RefreshCw className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Sync</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sync your tasks with Google Calendar
          </p>

          <div className="space-y-3">
            {[{ id: "task-1", title: "Update landing page", due: "2024-11-15" }].map((task) => (
              <div key={task.id} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium dark:text-white">{task.title}</p>
                  <p className="text-sm text-gray-500">Due: {task.due}</p>
                </div>

                <button
                  onClick={() => syncTask(task.id)}
                  disabled={syncing || !status?.connected}
                  className="btn-secondary flex items-center gap-2"
                >
                  {syncing ? <RefreshCw className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  Sync
                </button>
              </div>
            ))}
          </div>

          {!status?.connected && (
            <div className="mt-4 p-3 bg-yellow-50 rounded">
              <p className="text-sm text-yellow-800">
                Connect Google Calendar first
              </p>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default CalendarPage;
