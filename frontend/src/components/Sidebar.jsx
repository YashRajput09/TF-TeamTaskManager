import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Calendar as CalendarIcon, // Calendar page (alias)
  LogOut,        // ✅ added icon
} from "lucide-react";
import axiosInstance from "../utility/axiosInstance";
import toast from "react-hot-toast"; // ✅ toast import
import { useAuth } from "../context/AuthProvider";

const Sidebar = ({ isOpen, onClose }) => {
  const { setIsAuthenticated, setProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // ✅ for redirect after logout
  const [profileData, setProfileData] = useState(null);

  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/my-tasks", icon: CheckSquare, label: "My Tasks" },
    { path: "/assigned-tasks", icon: ClipboardList, label: "Assigned Tasks" },
    { path: "/create-team", icon: PlusSquare, label: "Create Team" },
    { path: "/teams", icon: Users, label: "Teams" },
    { path: "/automation", icon: TrendingUp, label: "AI Automation" },
    { path: "/calendar", icon: CalendarIcon, label: "Calendar" },
    { path: "/telegram", icon: Bell, label: "Telegram Setup" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("http://localhost:3000/user/myprofile", {
          withCredentials: true,
        });
        setProfileData(res.data);
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      await axiosInstance.post("http://localhost:3000/user/logout", {}, { withCredentials: true });
      localStorage.removeItem("auth_user"); // optional cleanup
      setIsAuthenticated(false);
    setProfile(null);
       toast.success("Logged out successfully!");
      navigate("/login");

    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Try again!");
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 ${
                      active
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ✅ Footer section with Logout button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white font-semibold">
                  {profileData?.name?.[0] || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {profileData?.name || "Loading..."}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profileData?.email || ""}
                </p>
              </div>
            </div>

            {/* 👇 Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 mt-2 py-2 rounded-lg text-sm font-medium
              text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
