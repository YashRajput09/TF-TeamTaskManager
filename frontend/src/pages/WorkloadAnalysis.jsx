import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';
import axiosInstance from '../utility/axiosInstance';

const WorkloadAnalysis = ({ groupId, groupName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWorkloadAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get(
        `/automation/groups/${groupId}/workload-analysis?timeframe=7`
      );
      if (data.success) {
        setAnalysis(data);
      } else {
        setError('Failed to fetch workload analysis');
      }
    } catch (err) {
      setError('Error fetching workload analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchWorkloadAnalysis();
    }
  }, [groupId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'overloaded': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'balanced': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'underloaded': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'available': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No analysis data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Workload Analysis - {groupName}
        </h3>
        <button
          onClick={fetchWorkloadAnalysis}
          className="btn-secondary flex items-center space-x-2 text-sm"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.analysis.totalTasks}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Load</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.analysis.averageLoad.toFixed(1)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Team Size</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.analysis.users.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Timeframe</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analysis.analysis.timeframe}d
          </p>
        </div>
      </div>

      {/* User Workload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analysis.analysis.users.map((user) => (
          <div
            key={user.userId}
            className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">{user.name}</h4>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Workload Score</span>
                  <span className="font-medium">{user.workloadScore}/10</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      user.workloadScore >= 6 
                        ? 'bg-red-500' 
                        : user.workloadScore >= 4 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(user.workloadScore * 10, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Total: {user.currentTasks}</span>
                <span>Pending: {user.pendingTasks}</span>
                <span>Done: {user.completedTasks}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      {analysis.aiInsights && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">AI Insights</h4>
          </div>
          
          {analysis.aiInsights.bottleneckUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Bottleneck: {analysis.aiInsights.bottleneckUsers.length} user(s) overloaded</span>
            </div>
          )}
          
          {analysis.aiInsights.availableCapacity.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 mb-2">
              <Users className="w-4 h-4" />
              <span>Available: {analysis.aiInsights.availableCapacity.length} user(s) can take more tasks</span>
            </div>
          )}

          {analysis.aiInsights.recommendations?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Recommendations:</p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {analysis.aiInsights.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkloadAnalysis;