import React from 'react';
import Card from '../components/Card';
import { Users, TrendingUp, Clock, CheckCircle, Plus, MoreVertical } from 'lucide-react';

const Teams = () => {
  // Sample data - replace with API calls
  const teams = [
    {
      id: 1,
      name: 'Design Team',
      members: 5,
      activeTasks: 12,
      completedTasks: 45,
      progress: 78,
      color: 'bg-purple-500',
      recentActivity: [
        { user: 'Alice Johnson', action: 'completed task', task: 'Homepage redesign', time: '2 hours ago' },
        { user: 'Bob Smith', action: 'created task', task: 'Mobile mockups', time: '5 hours ago' },
      ]
    },
    {
      id: 2,
      name: 'Dev Team',
      members: 8,
      activeTasks: 23,
      completedTasks: 127,
      progress: 65,
      color: 'bg-blue-500',
      recentActivity: [
        { user: 'John Doe', action: 'completed task', task: 'API integration', time: '1 hour ago' },
        { user: 'Jane Smith', action: 'updated task', task: 'Bug fix #234', time: '3 hours ago' },
      ]
    },
    {
      id: 3,
      name: 'Marketing',
      members: 4,
      activeTasks: 8,
      completedTasks: 32,
      progress: 82,
      color: 'bg-green-500',
      recentActivity: [
        { user: 'Sarah Williams', action: 'completed task', task: 'Q4 Campaign', time: '4 hours ago' },
        { user: 'Mike Johnson', action: 'created task', task: 'Social media plan', time: '6 hours ago' },
      ]
    },
    {
      id: 4,
      name: 'Product',
      members: 6,
      activeTasks: 15,
      completedTasks: 89,
      progress: 71,
      color: 'bg-orange-500',
      recentActivity: [
        { user: 'Tom Brown', action: 'updated task', task: 'Feature roadmap', time: '2 hours ago' },
        { user: 'Emily Davis', action: 'completed task', task: 'User research', time: '5 hours ago' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage your teams and track their progress</p>
        </div>
        <button className="mt-4 md:mt-0 btn-primary flex items-center space-x-2 w-fit">
          <Plus className="w-4 h-4" />
          <span>Create Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map((team) => (
          <Card key={team.id} hover>
            <div className="space-y-4">
              {/* Team Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${team.color} rounded-xl flex items-center justify-center`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{team.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{team.members} members</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{team.activeTasks}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{team.completedTasks}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{team.progress}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{team.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${team.color} transition-all duration-500`}
                    style={{ width: `${team.progress}%` }}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {team.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                          <span className="font-medium">"{activity.task}"</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Team Performance Overview */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Team Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Team</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Members</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Active Tasks</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Completed</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 ${team.color} rounded-lg flex items-center justify-center`}>
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{team.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{team.members}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{team.activeTasks}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{team.completedTasks}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-full ${team.color} rounded-full`}
                          style={{ width: `${team.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{team.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Teams;