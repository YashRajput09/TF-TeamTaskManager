// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Layout';
// // imports at the top
// import Login from './pages/Login';
// import Signup from './pages/Signup';

// // inside your <Routes>

// import Dashboard from './pages/Dashboard';
// import MyTasks from './pages/MyTasks';
// import CreateTask from './pages/CreateTask';
// import Teams from './pages/Teams';
// import Notifications from './pages/Notification';
// import Settings from './pages/Settings';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Layout />}>
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="my-tasks" element={<MyTasks />} />
//           <Route path="create-task" element={<CreateTask />} />
//           <Route path="teams" element={<Teams />} />
//           <Route path="notifications" element={<Notifications />} />
//           <Route path="settings" element={<Settings />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Automation from "./pages/Automation";
import Calendar from "./pages/Calendar";
import Telegram from "./pages/Telegram";
import Dashboard from "./pages/Dashboard";
import MyTasks from "./pages/MyTasks";
import CreateTask from "./pages/CreateTask";
import Teams from "./pages/Teams";
import Notifications from "./pages/Notification";
import Settings from "./pages/Settings";

// --- tiny helpers ---
const isAuthed = () => {
  try {
    return !!localStorage.getItem("auth_user");
  } catch {
    return false;
  }
};

function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  return isAuthed() ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="my-tasks" element={<MyTasks />} />
          <Route path="create-task" element={<CreateTask />} />
          <Route path="teams" element={<Teams />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="automation" element={<Automation />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="telegram" element={<Telegram />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthed() ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
