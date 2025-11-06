import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { TrendingUp, CheckCircle, Clock, Users, ArrowUpRight, Calendar } from 'lucide-react';
import axiosInstance from '../utility/axiosInstance';

const Dashboard = () => {

  const [userAssignedTask,setUserAssignedTask]=useState();
  const [userCreatedTask,setUserCreatedTask]=useState();
  const [userGroups,setUserGroups]=useState();

 useEffect(() => {
   const allUserTask=async ()=>{
         try {
          const {data}=await axiosInstance.get(`/task/get-user-task`);
          console.log(data?.assignedTasks)
          console.log(data?.createdTasks)
        setUserAssignedTask(data?.assignedTasks)
        setUserCreatedTask(data?.createdTasks)
         } catch (error) {
          console.log(error)
         }
   }
   const getUserGroups=async ()=>{
    const {data}=await axiosInstance.get(`/user/myprofile`);
    console.log(data?.groups)
    setUserGroups(data?.groups);
    
   }

   allUserTask();
   getUserGroups();
 },[])
 
  // Sample data - replace with API calls
  const stats = [
    { label: 'Total Tasks', value: '48', change: '+12%', icon: CheckCircle, color: 'text-green-500' },
    { label: 'In Progress', value: '23', change: '+5%', icon: Clock, color: 'text-blue-500' },
    { label: 'Completed', value: '25', change: '+8%', icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Team Members', value: '12', change: '+2', icon: Users, color: 'text-orange-500' },
  ];

  // Teams overview shown on Dashboard instead of "Quick Stats"
  const teams =userGroups;

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Last 30 days</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <div className="mt-2 flex items-center space-x-1 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* My Recent Tasks + Teams Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Recent Tasks (unchanged) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Recent Tasks</h2>
            <a href="/my-tasks" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
              View all
            </a>
          </div>
          <div className="space-y-3">
            {
            // [
            //   { id: 1, title: 'Update landing page design', team: 'Design Team', priority: 'High',    dueDate: '2024-11-15', status: 'In Progress' },
            //   { id: 2, title: 'Fix authentication bug',      team: 'Dev Team',    priority: 'Critical',dueDate: '2024-11-12', status: 'In Progress' },
            //   { id: 3, title: 'Prepare Q4 presentation',     team: 'Marketing',   priority: 'Medium', dueDate: '2024-11-20', status: 'Pending' },
            //   { id: 4, title: 'Code review for PR #234',     team: 'Dev Team',    priority: 'Low',    dueDate: '2024-11-18', status: 'Completed' },
            // ]
            userAssignedTask?.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{task.title}</h3>
                  <div className="mt-1 flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                    <span>{task.team}</span>
                    <span>•</span>
                   
                    <span>Due {task?.deadline}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    {task.priority}
                  </span>
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* All Teams Overview (replaces Quick Stats) */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">All Teams Overview</h2>
            <button
              onClick={() => navigate('/teams')}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all teams
            </button>
          </div>

          <div className="space-y-3">
            {teams?.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/teams?team=${t.id}`)}
                className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${t.color} rounded-lg`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{teams?.length} members • {t.activeTasks} active</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${t.color}`} style={{ width: `${t.progress}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t.progress}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
