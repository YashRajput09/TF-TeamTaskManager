import React, { useState, useEffect } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import axiosInstance from '../utility/axiosInstance';

const GroupSelector = ({ onGroupSelect, selectedGroup }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/group/all-groups'); 
      if (data.success) {
        setGroups(data.groups);
      } else {
        setError('Failed to fetch groups');
      }
    } catch (err) {
      setError('Error fetching groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupSelect = (group) => {
    onGroupSelect(group);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
        <span>Loading groups...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Group for Analysis
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="flex items-center space-x-3">
          <Users className="w-5 h-5 text-gray-400" />
          <span className="text-gray-900 dark:text-white">
            {selectedGroup ? selectedGroup.name : 'Select a group...'}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {groups.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No groups found. Create a group first.
            </div>
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupSelect(group)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0 ${
                  selectedGroup?.id === group.id 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' 
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                <div className="font-medium">{group.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {group.memberCount} members • Created by {group.createdBy}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  ID: {group.id}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default GroupSelector;