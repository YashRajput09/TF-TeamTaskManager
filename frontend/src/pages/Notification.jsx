import React, { useState } from 'react';
import Card from '../components/Card';
import { Bell, CheckCheck, Trash2, Filter } from 'lucide-react';

const Notifications = () => {
  // Sample data - replace with API calls
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'task_assigned',
      title: 'New task assigned',
      message: 'You have been assigned to "Update landing page design"',
      time: '5 minutes ago',
      read: false,
      icon: '📋'
    },
    {
      id: 2,
      type: 'task_completed',
      title: 'Task completed',
      message: 'Jane Smith completed "Fix authentication bug"',
      time: '1 hour ago',
      read: false,
      icon: '✅'
    },
    {
      id: 3,
      type: 'comment',
      title: 'New comment',
      message: 'Mike Johnson commented on your task "Prepare Q4 presentation"',
      time: '2 hours ago',
      read: true,
      icon: '💬'
    },
    {
      id: 4,
      type: 'due_soon',
      title: 'Task due soon',
      message: '"Code review for PR #234" is due in 2 days',
      time: '3 hours ago',
      read: true,
      icon: '⏰'
    },
    {
      id: 5,
      type: 'team_update',
      title: 'Team update',
      message: 'Design Team reached 80% progress on Q4 goals',
      time: '5 hours ago',
      read: true,
      icon: '🎉'
    },
    {
      id: 6,
      type: 'mention',
      title: 'You were mentioned',
      message: 'Sarah Williams mentioned you in "Marketing Campaign Planning"',
      time: '1 day ago',
      read: true,
      icon: '👤'
    },
  ]);

  const [filter, setFilter] = useState('all'); // all, unread, read

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={handleMarkAllAsRead}
          className="mt-4 md:mt-0 btn-secondary flex items-center space-x-2 w-fit"
          disabled={unreadCount === 0}
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <div className="flex items-center space-x-2">
            {['all', 'unread', 'read'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all capitalize
                  ${filter === filterOption
                    ? 'gradient-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {filterOption}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No notifications to display</p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              hover
              className={`${!notification.read ? 'border-l-4 border-primary-500' : ''}`}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 text-2xl">
                  {notification.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        {notification.time}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 mt-2 ml-4 bg-primary-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Notification Settings Hint */}
      {notifications.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Manage Notification Preferences</h3>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-400">
                You can customize which notifications you receive in your{' '}
                <a href="/settings" className="underline hover:no-underline">settings page</a>.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Notifications;