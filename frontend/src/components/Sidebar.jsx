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
  LogOut,
  CheckSquare as BrandIcon
} from "lucide-react";
import axiosInstance from "../utility/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";

const Sidebar = ({ isOpen, onClose }) => {
  const { setIsAuthenticated, setProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    try {
      await axiosInstance.post("http://localhost:3000/user/logout", {}, { withCredentials: true });
      localStorage.removeItem("auth_user");
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
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
          border-r border-gray-200/50 dark:border-gray-700/50
          shadow-lg shadow-gray-900/30
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow">
                <BrandIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TeamTask
              </span>
            </div>
            <button
              onClick={() => onClose && onClose()}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800/70"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Nav (scrollable) */}
          <nav className="flex-1 overflow-y-auto  p-4 space-y-1">
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
                        ? "bg-linear-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

<<<<<<< HEAD
          {/* Footer with profile + logout */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50/70 dark:bg-gray-800/70">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow">
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
=======
          {/* ✅ Footer section with Logout button */}
         <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
    {/* ✅ Profile Image */}
    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 flex-shrink-0">
      {profileData?.profileImage?.url ? (
        <img
          src={profileData.profileImage.url}
          alt={profileData?.name || "User"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-white font-semibold">
          {profileData?.name?.[0]?.toUpperCase() || "U"}
        </div>
      )}
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
>>>>>>> 69f8cb356e84336c4584e5a261d2e12eacc5a8d8

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
