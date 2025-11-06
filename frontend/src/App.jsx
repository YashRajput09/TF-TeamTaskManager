import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthProvider";
import { Toaster } from "react-hot-toast";

// Layout and Pages
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";
import CreateTask from "./pages/CreateTask";
import CreateTeam from "./pages/CreateTeam";
import Teams from "./pages/Teams";
import Notifications from "./pages/Notification";
import Settings from "./pages/Settings";
import TaskDetail from "./pages/TaskDetail";
import AssignedTasks from "./pages/AssignedTasks";
import Automation from "./pages/Automation";
import Calendar from "./pages/Calendar";
import Telegram from "./pages/Telegram";

// --- Protected Route Wrappers ---
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

// --- App Component ---
export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
     <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <Signup />
            </GuestOnly>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Core Pages */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-tasks" element={<MyTasks />} />
          <Route path="create-task" element={<CreateTask />} />
          <Route path="create-team" element={<CreateTeam />} />
          <Route path="teams/:teamId" element={<Teams />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />

          {/* Task Detail + Assigned Tasks */}
          <Route path="tasks/:taskId" element={<TaskDetail />} />
          <Route path="assigned-tasks" element={<AssignedTasks />} />

          {/* Extra Features */}
          <Route path="automation" element={<Automation />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="telegram" element={<Telegram />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
