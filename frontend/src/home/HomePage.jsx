import React, { useState } from "react";
import { Home, CheckSquare, Plus, Users, Bell, Settings, LogOut, Search, Moon, Sun } from "lucide-react";

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TeamTask
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Collaborate & Achieve</p>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {[
              { name: "Dashboard", icon: Home, active: true },
              { name: "My Tasks", icon: CheckSquare },
              { name: "Create Task", icon: Plus },
              { name: "Team", icon: Users },
              { name: "Notifications", icon: Bell },
              { name: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.name}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.active
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://i.pravatar.cc/40"
                alt="avatar"
                className="w-10 h-10 rounded-full border-2 border-blue-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-sm">Yasshu</div>
                <div className="text-xs text-gray-500">Product Manager</div>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Section */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, Yasshu! 👋</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Here's what's happening today</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 relative transition">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="text-sm opacity-90 mb-1">Tasks Due Today</div>
                <div className="text-4xl font-bold">3</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="text-sm opacity-90 mb-1">In Progress</div>
                <div className="text-4xl font-bold">7</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="text-sm opacity-90 mb-1">Completed</div>
                <div className="text-4xl font-bold">12</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Tasks */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">📋 My Tasks</h2>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full">
                    3 due today
                  </span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { task: "Complete API Integration", priority: "high" },
                    { task: "Update Frontend Design", priority: "medium" },
                    { task: "Review Team Pull Requests", priority: "low" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition">
                      <input type="checkbox" className="w-5 h-5 rounded accent-blue-500" />
                      <span className="flex-1">{item.task}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.priority === "high" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" :
                        item.priority === "medium" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300" :
                        "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Activity */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4">🧩 Team Activity</h2>
                
                <div className="space-y-4">
                  {[
                    { name: "Priya", action: "finished", task: "UI Design", icon: "✅" },
                    { name: "Yasshu", action: "started", task: "Redis Setup", icon: "⚙️" },
                    { name: "Team", action: "extended deadline", task: "API Integration", icon: "⏰" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                        {item.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{item.name}</span> {item.action}{" "}
                          <span className="text-gray-600 dark:text-gray-400">"{item.task}"</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">2 hours ago {item.icon}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            Made with ❤️ by Yasshu
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HomePage;