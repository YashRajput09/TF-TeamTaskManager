import React, { useState } from 'react';
import Card from '../components/Card';
import { Plus, Search, Calendar, Flag, User, History as HistoryIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const nowISO = () => new Date().toISOString();

// Helper: seed a history timeline based on current status
const seedHistory = (status) => {
  const base = [{ type: 'assigned', label: 'Assigned', at: nowISO() }];
  if (status === 'In Progress' || status === 'Completed') {
    base.push({ type: 'inprogress', label: 'In Progress', at: nowISO() });
  }
  if (status === 'Completed') {
    base.push({ type: 'completed', label: 'Completed', at: nowISO() });
  }
  return base;
};

const MyTasks = () => {
  const navigate = useNavigate();

  // Sample data - replace with API calls
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Update landing page design', 
      description: 'Redesign the hero section with new branding',
      team: 'Design Team', 
      priority: 'High', 
      dueDate: '2025-11-15', 
      status: 'In Progress',
      assignee: 'John Doe',
      history: seedHistory('In Progress')
    },
    { 
      id: 2, 
      title: 'Fix authentication bug', 
      description: 'Users unable to login with Google OAuth',
      team: 'Dev Team', 
      priority: 'Critical', 
      dueDate: '2025-11-12', 
      status: 'In Progress',
      assignee: 'Jane Smith',
      history: seedHistory('In Progress')
    },
    { 
      id: 3, 
      title: 'Prepare Q4 presentation', 
      description: 'Quarterly results and future roadmap',
      team: 'Marketing', 
      priority: 'Medium', 
      dueDate: '2025-11-20', 
      status: 'Pending',
      assignee: 'John Doe',
      history: seedHistory('Pending')
    },
    { 
      id: 4, 
      title: 'Code review for PR #234', 
      description: 'Review new feature implementation',
      team: 'Dev Team', 
      priority: 'Low', 
      dueDate: '2025-11-18', 
      status: 'Completed',
      assignee: 'Mike Johnson',
      history: seedHistory('Completed')
    },
    { 
      id: 5, 
      title: 'Update documentation', 
      description: 'Add new API endpoints to docs',
      team: 'Dev Team', 
      priority: 'Medium', 
      dueDate: '2025-11-25', 
      status: 'Pending',
      assignee: 'John Doe',
      history: seedHistory('Pending')
    },
  ]);

  // Track which cards have their history expanded
  const [openHistory, setOpenHistory] = useState({}); // { [taskId]: boolean }

  const toggleHistory = (e, id) => {
    e.stopPropagation();
    setOpenHistory(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'High': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Low': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[priority] || colors['Medium'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Pending': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[status] || colors['Pending'];
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || task.status.toLowerCase().replace(' ', '-') === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // When user toggles the checkbox, also push a history event
  const toggleComplete = (e, task) => {
    e.stopPropagation();
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setTasks(prev => prev.map(t => {
      if (t.id !== task.id) return t;
      const newHistory = [...(t.history || [])];
      if (nextStatus === 'Completed') {
        newHistory.push({ type: 'completed', label: 'Completed', at: nowISO() });
      } else {
        newHistory.push({ type: 'reopened', label: 'Reopened', at: nowISO() });
      }
      return { ...t, status: nextStatus, history: newHistory };
    }));
  };

  // Optional helper to mark as "In Progress" from the card (you can add a button later if needed)
  const markInProgress = (e, task) => {
    e.stopPropagation();
    if (task.status === 'In Progress') return;
    setTasks(prev => prev.map(t => {
      if (t.id !== task.id) return t;
      const newHistory = [...(t.history || []), { type: 'inprogress', label: 'In Progress', at: nowISO() }];
      return { ...t, status: 'In Progress', history: newHistory };
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage and track your assigned tasks</p>
        </div>
        <Link to="/create-task" className="mt-4 md:mt-0 btn-primary flex items-center space-x-2 w-fit">
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'in-progress', 'pending', 'completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`
                  px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
                  ${selectedFilter === filter
                    ? 'gradient-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
              >
                {filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No tasks found matching your criteria.</p>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} hover className="cursor-pointer">
              console.log(task)
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'Completed'}
                      onChange={() => {
                        // Handle task completion toggle - integrate with API
                        const newTasks = tasks.map(t => 
                          t.id === task.id 
                            ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
                            : t
                        );
                        setTasks(newTasks);
                      }}
                      className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due {task.dueDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Flag className="w-4 h-4" />
                          <span>{task.team}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Badges */}
                  <div className="flex items-center space-x-2 md:ml-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Task History (toggle) */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="border-t border-gray-200 dark:border-gray-700 pt-3"
                >
                  <button
                    onClick={(e) => toggleHistory(e, task.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Task History</span>
                    </div>
                    {openHistory[task.id] ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {openHistory[task.id] && (
                    <div className="mt-3 space-y-2">
                      {(task.history || []).length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No history yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {task.history.map((ev, idx) => (
                            <li
                              key={`${task.id}-h-${idx}`}
                              className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-28 shrink-0">
                                {ev.label}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {new Date(ev.at).toLocaleString()}
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
          ))
        )}
      </div>

      {/* Task Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>
    </div>
  );
};

export default MyTasks;
