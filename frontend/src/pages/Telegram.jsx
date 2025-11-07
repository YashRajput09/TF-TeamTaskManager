
import React, { useState } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import { MessageCircle, CheckCircle, Send, Bot, Bell, RefreshCw, Users } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

const TelegramPage = () => {
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const registerTelegram = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/telegram/register-user', { 
        telegramChatId: chatId 
      });

      const data = response.data;
      if (data.success) {
        setRegistered(true);
        alert('Telegram chat ID registered successfully!');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert(`Registration failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTelegram = async () => {
    setTesting(true);
    try {
      const response = await api.get('/api/telegram/test');
      
      const data = response.data;
      if (data.success) {
        alert('Test message sent! Check your Telegram.');
      } else {
        alert('Test failed: ' + data.message);
      }
    } catch (error) {
      console.error('Test failed:', error);
      alert(`Test failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Telegram Setup</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Configure Telegram notifications for task updates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setup Instructions */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Setup Instructions</h2>
          </div>

          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Find our Telegram Bot</p>
                <p>Search for <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">@PlannerAgent_bot</code> on Telegram</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Start the Bot</p>
                <p>Send <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">/start</code> command to begin</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Get Your Chat ID</p>
                <p>The bot will automatically send you your unique chat ID</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Register Below</p>
                <p>Enter your chat ID in the form and click register</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Get your Chat ID from @userinfobot on Telegram
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Simply search for @userinfobot on Telegram, start a conversation, and it will provide your numeric Chat ID
              </p>
            </div>
          </div>
        </Card>

        {/* Registration Form */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register Chat ID</h2>
          </div>

          <form onSubmit={registerTelegram} className="space-y-4">
            <div>
              <label htmlFor="chatId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Telegram Chat ID
              </label>
              <input
                type="text"
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g., 123456789"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This is a numeric ID that the bot provides when you start a conversation
              </p>
            </div>

            {/* Register Button - Always visible */}
            <button
              type="submit"
              disabled={loading || !chatId}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                loading || !chatId 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{loading ? 'Registering...' : 'Register Chat ID'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            {/* Test Button - Always visible but with different states */}
            <button
              onClick={testTelegram}
              disabled={testing}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors mb-2 ${
                testing 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400' 
                  : registered
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {testing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{testing ? 'Sending...' : 'Send Test Message'}</span>
            </button>

            {!registered && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Register your chat ID first to test notifications
              </p>
            )}
            {registered && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                ✓ Chat ID registered! You can now test notifications
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Notifications Info */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">What You'll Receive</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: CheckCircle, title: 'Task Assignments', desc: 'When new tasks are assigned to you' },
            { icon: Bell, title: 'Deadline Reminders', desc: '24h and 1h before deadlines' },
            { icon: RefreshCw, title: 'Status Updates', desc: 'When task status changes' },
            { icon: Users, title: 'Team Notifications', desc: 'AI redistribution alerts' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Icon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default TelegramPage;