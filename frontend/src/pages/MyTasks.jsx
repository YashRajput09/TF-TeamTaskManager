import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import {
  Plus,
  Search,
  Calendar,
  Flag,
  User,
  History,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "./utility/axiosInstance";
import toast from "react-hot-toast";

const nowISO = () => new Date().toISOString();

const MyTasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [openHistory, setOpenHistory] = useState({});
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // New state for mobile toggle
  const [mobileView, setMobileView] = useState("assigned"); // "assigned" or "created"

  useEffect(() => {
    const allUserTask = async () => {
      try {
        const { data } = await axiosInstance.get(`/task/get-user-task`);
        setTasks(data?.assignedTasks || []);
        setCreatedTasks(data?.createdTasks || []);
      } catch (error) {
        console.log(error);
      }
    };
    allUserTask();
  }, []);

  const toggleHistory = (e, id) => {
    e.stopPropagation();
    setOpenHistory((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      High: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[priority] || colors["Medium"];
  };

  const getStatusColor = (status) => {
    const colors = {
      Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      Pending: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    };
    return colors[status] || colors["Pending"];
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      task.status.toLowerCase().replace(" ", "-") === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCreatedTasks = createdTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      task.status.toLowerCase().replace(" ", "-") === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDueDate = (dateString) => {
    if (!dateString) return { text: "No due date", color: "text-gray-400" };

    const date = new Date(dateString);
    const now = new Date();

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

  const renderTaskCard = (task, isCreated = false) => (
    <Card key={task._id} hover className="cursor-pointer">
      <div className="flex flex-col space-y-2">
        <Link to={`/tasks/${task._id}`} className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {task.description}
              </p>
              
              <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="truncate">To: {task?.assignedTo?.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {(() => {
                    const due = formatDueDate(task?.deadline);
                    return (
                      <span className={`inline-flex items-center gap-1 ${due.color}`}>
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{due.text}</span>
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-center space-x-1">
                  <Flag className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{task?.group?.[0]?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div
          onClick={(e) => e.stopPropagation()}
          className="border-t border-gray-200 dark:border-gray-700 pt-3"
        >
          <button
            onClick={(e) => toggleHistory(e, task._id)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Task History
              </span>
            </div>
            {openHistory[task._id] ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {openHistory[task._id] && (
            <div className="mt-3 space-y-2">
              {(task?.history || []).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No history yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {[...(task?.history || [])].reverse().map((ev, idx) => (
                    <li
                      key={`${task._id}-h-${idx}`}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 px-3 sm:px-4 lg:px-8 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {ev?.message}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(ev.date).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage and track your assigned tasks
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col space-y-4">
          {/* Search */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {["all", "in-progress", "pending", "completed"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`
                  px-3 sm:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                  ${
                    selectedFilter === filter
                      ? "gradient-primary text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }
                `}
              >
                {filter
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Mobile Toggle - Only visible on mobile */}
      <div className="lg:hidden px-0">
        <Card className="bg-red-800 px-0 rounded-full py-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileView("assigned")}
              className={`
                flex-1 px-1 py-1 flex justify-center items-center  rounded-full text-sm font-medium transition-all
                ${
                  mobileView === "assigned"
                    ? "gradient-primary bg-blue-900/40 text-blue-500   shadow-sm"
                    : " text-gray-700 dark:text-gray-300"
                }
              `}
            >
              Assigned Tasks  ({filteredTasks.length}) 
            </button>
            <button
              onClick={() => setMobileView("created")}
              className={`
                flex-1 px-2 py-1 flex justify-center items-center rounded-full text-sm font-medium transition-all
                ${
                  mobileView === "created"
                    ? "gradient-primary bg-blue-900/40 text-blue-500  shadow-sm"
                    : " text-gray-700 dark:text-gray-300"
                }
              `}
            >
              Created Tasks ({filteredCreatedTasks.length})
            </button>
          </div>
        </Card>
      </div>

      {/* Tasks List - Desktop view (side by side) */}
      <div className="hidden lg:flex lg:justify-between lg:gap-6">
        {/* Assigned Tasks */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            Assigned Tasks ({filteredTasks.length})
          </h2>
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks found matching your criteria.
                </p>
              </Card>
            ) : (
              filteredTasks
                .filter((task) => {
                  if (selectedFilter === "completed") {
                    return task.status === "Completed";
                  }
                  return task.status !== "Completed";
                })
                .map((task) => renderTaskCard(task))
            )}
          </div>
        </div>

        {/* Created Tasks */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            Created Tasks ({filteredCreatedTasks.length})
          </h2>
          <div className="space-y-4">
            {filteredCreatedTasks.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks found matching your criteria.
                </p>
              </Card>
            ) : (
              filteredCreatedTasks.map((task) => renderTaskCard(task, true))
            )}
          </div>
        </div>
      </div>

      {/* Tasks List - Mobile view (toggled) */}
      <div className="lg:hidden space-y-4">
        {mobileView === "assigned" ? (
          <>
            {filteredTasks.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No assigned tasks found matching your criteria.
                </p>
              </Card>
            ) : (
              filteredTasks
                .filter((task) => {
                  if (selectedFilter === "completed") {
                    return task.status === "Completed";
                  }
                  return task.status !== "Completed";
                })
                .map((task) => renderTaskCard(task))
            )}
          </>
        ) : (
          <>
            {filteredCreatedTasks.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No created tasks found matching your criteria.
                </p>
              </Card>
            ) : (
              filteredCreatedTasks.map((task) => renderTaskCard(task, true))
            )}
          </>
        )}
      </div>

      {/* Task Count */}
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center pb-4">
        {mobileView === "assigned" || window.innerWidth >= 1024 ? (
          <span className="lg:hidden">
            Showing {filteredTasks.length} assigned task(s)
          </span>
        ) : (
          <span className="lg:hidden">
            Showing {filteredCreatedTasks.length} created task(s)
          </span>
        )}
        <span className="hidden lg:inline">
          Showing {filteredTasks.length} assigned and {filteredCreatedTasks.length} created task(s)
        </span>
      </div>
    </div>
  );
};

export default MyTasks;