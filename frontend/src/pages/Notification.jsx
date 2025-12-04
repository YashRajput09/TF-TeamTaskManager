import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import { Bell, Trash2, CheckCheck, Filter, Clock } from "lucide-react";
import axiosInstance from "./utility/axiosInstance";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthProvider";

const socket = io(import.meta.env.VITE_BACKEND_SOCKET_URL || "http://localhost:3000", {
  transports: ["websocket"],
  withCredentials: true,
});

// format time ago
const formatTimeAgo = (dateString) => {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day ago`;
};

const Notifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // fetch from backend
  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get("/notifications/my");
      setNotifications(data.notifications || []);
    } catch (err) {
      console.log("Error:", err);
    }
    setLoading(false);
  };

  // realtime listen
  useEffect(() => {
    if (!profile?._id) return;

    socket.emit("join", profile._id);

    socket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => socket.off("notification");
  }, [profile]);

  useEffect(() => {
    if (profile?._id) fetchNotifications();
  }, [profile]);

  // mark one read
  const markRead = async (id) => {
    await axiosInstance.put(`/notifications/mark-read/${id}`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  // mark all read
  const markAllRead = async () => {
    await axiosInstance.put(`/notifications/mark-all-read`);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // delete notif
  const deleteNotif = async (id) => {
    await axiosInstance.delete(`/notifications/delete/${id}`);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  // filtering
  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.read);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500">{notifications.filter((n) => !n.read).length} unread</p>
        </div>

        <button
          onClick={markAllRead}
          className="btn-secondary flex items-center gap-2"
        >
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>

      {/* filters */}
      <Card className="flex items-center gap-3 p-4 backdrop-blur-md">
        <Filter size={18} className="text-gray-500" />
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-lg capitalize transition ${
              f === filter
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </Card>

      {/* list */}
      <div className="space-y-3">
        {filtered.map((n) => (
          <Card
            key={n._id}
            hover
            className={`relative p-4 border-l-4 ${
              !n.read ? "border-blue-500" : "border-transparent"
            }`}
          >
            <div className="flex gap-4">
              <div className="text-2xl">{n.icon || "🔔"}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {n.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{n.message}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={14} /> {formatTimeAgo(n.createdAt)}
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-3">
                {!n.read && (
                  <button
                    onClick={() => markRead(n._id)}
                    className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotif(n._id)}
                  className="hover:bg-red-200 dark:hover:bg-red-900 p-2 rounded-lg"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
