import React from 'react';

const Card = ({ children, className = '', hover = false, blur = true }) => {
  return (
    <div 
      className={`
        rounded-xl p-6 shadow-sm
        ${blur ? 'card-blur' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;