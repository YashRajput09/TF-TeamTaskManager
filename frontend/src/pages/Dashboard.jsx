import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Users,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import axiosInstance from "./utility/axiosInstance";

const Dashboard = () => {
  const navigate = useNavigate();

  // Backend-driven state
  const [userAssignedTask, setUserAssignedTask] = useState([]);
  const [userCreatedTask, setUserCreatedTask] = useState([]);
  const [userGroups, setUserGroups] = useState([]);

  useEffect(() => {
    const allUserTask = async () => {
      try {
        const { data } = await axiosInstance.get(`/task/get-user-task`);
        console.log(data?.assignedTasks);
        console.log(data?.createdTasks);
        setUserAssignedTask(data?.assignedTasks);
        setUserCreatedTask(data?.createdTasks);
      } catch (error) {
        console.log(error);
      }
    };
    const getUserGroups = async () => {
      const { data } = await axiosInstance.get(`/user/myprofile`);
      console.log(data?.groups);
      setUserGroups(data?.groups);
    };

    // Call both in parallel
    allUserTask();
    getUserGroups();
  }, []);

  // Stats
  const stats = [
    {
      label: "Total Tasks",
      value: String(userAssignedTask.length + userCreatedTask.length),
      change: "+0%",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      label: "In Progress",
      value: String(
        userAssignedTask.filter((t) => t.status === "In Progress").length
      ),
      change: "+0%",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Completed",
      value: String(
        userAssignedTask.filter((t) => t.status === "Completed").length
      ),
      change: "+0%",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      label: "Teams",
      value: String(userGroups.length),
      change: "+0",
      icon: Users,
      color: "text-orange-500",
    },
  ];

  // Normalize groups for UI
  const teams = userGroups.map((g, idx) => ({
    id: g.id || g._id || idx + 1,
    name: g.name || g.groupName || "Untitled Group",
    membersCount: Array.isArray(g.members)
      ? g.members.length
      : g.membersCount ?? 0,
    activeTasks: g.activeTasks ?? 0,
    progress: typeof g.progress === "number" ? g.progress : 0,
    color: g.color || "bg-blue-500",
  }));

  // Normalize assigned tasks for "My Recent Tasks"
  const recent = userAssignedTask.map((t, idx) => ({
    id: t.id || t._id || idx + 1,
    title: t.title || t.name || "Untitled Task",
    team: t.team?.name || t.team || t.teamName || "Team",
    priority: t.priority || "Medium",
    dueDate: t.deadline || t.dueDate || "",
    status: t.status || "Pending",
    description: t.description || "",
    assignee: t.assignee?.name || t.assignee || "",
    raw: t,
  }));

  // date formate
  // 🧠 Utility: Format date and calculate relative due status
  const formatDueDate = (dateString) => {
    if (!dateString) return { text: "No due date", color: "text-gray-400" };

    const date = new Date(dateString);
    const now = new Date();

    // Format: 25 Nov 2025
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays > 3) {
      return {
        text: `Due in ${diffDays} days (${formattedDate})`,
        color: "text-green-600 dark:text-green-400",
      };
    } else if (diffDays > 0) {
      return {
        text: `Due soon (${formattedDate})`,
        color: "text-orange-500 dark:text-orange-400",
      };
    } else if (diffDays === 0) {
      return {
        text: `Due today (${formattedDate})`,
        color: "text-yellow-500 dark:text-yellow-400",
      };
    } else {
      return {
        text: `Overdue ${Math.abs(diffDays)} days (${formattedDate})`,
        color: "text-red-500 dark:text-red-400",
      };
    }
  };

  const handleAccept = async (task_id) => {
    try {
      console.log(task_id)
      const { data } = await axiosInstance.put(
        `/task/update-status/${task_id}` ,{status:"In-progress"}
      );
      console.log(data);
      // alert("task accepted ");
      toast.success("Accepted")
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening today.
          </p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <div className="mt-2 flex items-center space-x-1 text-sm">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 ${stat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* My Recent Tasks + Teams Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Recent Tasks */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              My Recent Tasks
            </h2>
            <a
              href="/my-tasks"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all
            </a>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 px-4 pb-4">
                No tasks assigned to you yet.
              </p>
            ) : (
              recent?.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() =>
                        navigate(`/tasks/${task.id}`, {
                          state: { task, viewerRole: "member" },
                        })
                      }
                      className="text-sm font-semibold text-gray-900 dark:text-white truncate"
                    >
                      {task.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                      <span>{task?.group?.name}</span>
                      <span>•</span>
                      <span>
                        {console.log(task)}
                        {/* {task.dueDate ? `Due ${task.dueDate}` : "No due date"} */}
                        {(() => {
                          const due = formatDueDate(task.dueDate);
                          return (
                            <span
                              className={`flex items-center gap-1 text-xs ${due.color}`}
                            >
                              <Calendar className="w-3 h-3" />
                              {due.text}
                            </span>
                          );
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {/* { console.log(task?.id)} */}
                    {task.status === "Assigned" && (
                      <button
                        onClick={() => {
                          handleAccept(task?.id);
                        }}
                        className="px-2 py-1 rounded-md text-xs hover:opacity-60 font-medium  text-green-700  dark:text-green-400"
                      >
                        {"Accept"}
                      </button>
                    )}
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      {task.priority}
                    </span>
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* All Teams Overview */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              All Teams Overview
            </h2>
            <button
              onClick={() => navigate("/teams")}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              View all teams
            </button>
          </div>

          <div className="space-y-3">
            {teams?.map((t) => (
              <div
              // <Link
                key={t.id}
                onClick={()=>navigate(`/teams/${t.id}`)}
                // to={`/teams/${t._id}`}
                className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${t.color} rounded-lg`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {t.membersCount} members • {t.activeTasks} active
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${t.color}`}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div> */}
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {t.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
