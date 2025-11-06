import React from 'react';
import { Search, Bell, Moon, Sun, Menu, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ toggleDarkMode, darkMode, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_user"); // ✅ Clear auth
    navigate("/login"); // ✅ Redirect to login
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks, teams..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Mobile search */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* ✅ Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
