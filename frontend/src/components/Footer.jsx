import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="px-4 py-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 TeamTask. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
             Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;