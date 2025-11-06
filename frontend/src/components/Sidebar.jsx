import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  PlusSquare,
  Users,
  Bell,
  Settings,
  X,
  ClipboardList, // Assigned Tasks
  TrendingUp,    // AI Automation
  Calendar as CalendarIcon, // Calendar page (alias to avoid name clash)
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard",       icon: LayoutDashboard, label: "Dashboard" },
    { path: "/my-tasks",        icon: CheckSquare,     label: "My Tasks" },
    { path: "/assigned-tasks",  icon: ClipboardList,   label: "Assigned Tasks" }, // kept
    { path: "/create-task",     icon: PlusSquare,      label: "Create Task" },
    { path: "/teams",           icon: Users,           label: "Teams" },

    // from other branch (kept)
    { path: "/automation",      icon: TrendingUp,      label: "AI Automation" },
    { path: "/calendar",        icon: CalendarIcon,    label: "Calendar" },
    { path: "/telegram",        icon: Bell,            label: "Telegram Setup" },

    { path: "/notifications",   icon: Bell,            label: "Notifications" },
    { path: "/settings",        icon: Settings,        label: "Settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                TeamTask
              </span>
            </div>
            <button
              onClick={() => onClose && onClose()}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      active
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white font-semibold">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  John Doe
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  john@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
