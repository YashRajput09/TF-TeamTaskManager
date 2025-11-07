import React, { useEffect, useMemo, useState, useRef } from 'react';
import Card from '../components/Card';
import { Search, Calendar, Flag, User, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utility/axiosInstance';

/**
 * This component will attempt the following endpoints (in order) until one succeeds:
 *  - <BASE>/get-user-task
 *  - <BASE>/get-user-task (with common prefixes tried below)
 *
 * You can override the exact endpoint by setting REACT_APP_TASKS_ENDPOINT in your .env,
 * e.g. REACT_APP_TASKS_ENDPOINT=/api/task/get-user-task
 *
 * If REACT_APP_TASKS_ENDPOINT is not set, the component will try a small list of likely endpoints.
 */

const ENV_ENDPOINT =  'http://localhost:3000/api/task/get-user-task';
const LIKELY_ENDPOINTS = [
  ENV_ENDPOINT,
  '/api/task/get-user-task',  // common mounting possibilities
  '/api/tasks/get-user-task',
  '/api/task/get-user-task/',
  '/task/get-user-task',
  '/tasks/get-user-task',
  '/get-user-task'
].filter(Boolean); // remove empty strings

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

export default function AssignedTasks() {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('created'); // 'created' | 'assigned'

  const [userName, setUserName] = useState('');
  const [createdTasks, setCreatedTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(false);
  const pollRef = useRef(null);
  const endpointRef = useRef(null); // stores the working endpoint once found

  useEffect(() => {
    mountedRef.current = true;
    discoverAndFetch();

    // refresh on window focus
    const onFocus = () => fetchTasks();
    window.addEventListener('focus', onFocus);

    // poll every 7 seconds
    pollRef.current = setInterval(() => {
      fetchTasks();
    }, 7000);

    return () => {
      mountedRef.current = false;
      window.removeEventListener('focus', onFocus);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attempt endpoints one by one until success; set endpointRef to working one
  async function discoverAndFetch() {
    setIsLoading(true);
    setError(null);

    // If user explicitly set REACT_APP_TASKS_ENDPOINT, try it first only
    const endpointsToTry = ENV_ENDPOINT ? [ENV_ENDPOINT, ...LIKELY_ENDPOINTS] : LIKELY_ENDPOINTS;

    for (let ep of endpointsToTry) {
      if (!ep) continue;
      try {
        const trimmed = ep.endsWith('/') ? ep.slice(0, -1) : ep;
        const res = await axiosInstance.get(trimmed);
        // If we get 2xx - assume it's the right one
        if (res && (res.status >= 200 && res.status < 300)) {
          endpointRef.current = trimmed;
          // process response
          processResponseData(res.data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // try next endpoint; only set error after all fail
        // console.debug('endpoint trial failed', ep, err?.message);
      }
    }

    // none succeeded
    if (mountedRef.current) {
      setError('Could not reach tasks endpoint. Please check REACT_APP_TASKS_ENDPOINT or server routes.');
      setIsLoading(false);
    }
  }

  async function fetchTasks() {
    if (!endpointRef.current) {
      // if not discovered yet, try discovery
      await discoverAndFetch();
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(endpointRef.current);
      processResponseData(res.data);
      console.log(res.data)
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // On fetch error, clear endpointRef so discovery re-runs next time
      endpointRef.current = null;
      setError(err?.response?.data?.message || err.message || 'Error fetching tasks');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }

  function processResponseData(data) {
    // Expected shape from your backend (getUserAllTask):
    // { userName, createdTasks, assignedTasks }
    // But we handle variations defensively.
    const userNameFromRes = data?.userName || data?.user || data?.name || '';
    const created = data?.createdTasks || data?.created || data?.created_tasks || [];
    const assigned = data?.assignedTasks || data?.assigned || data?.assigned_tasks || [];

    if (!mountedRef.current) return;
    setUserName(userNameFromRes);
    setCreatedTasks(Array.isArray(created) ? created : []);
    setAssignedTasks(Array.isArray(assigned) ? assigned : []);
    setError(null);
  }

  // pick tasks depending on active tab
  const tasks = activeTab === 'created' ? createdTasks : assignedTasks;

  // search & filter
  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(t =>
      (t.title || t.name || '').toString().toLowerCase().includes(q) ||
      (t.description || t.desc || '').toString().toLowerCase().includes(q) ||
      (t.team || t.category || '').toString().toLowerCase().includes(q) ||
      ((t.assignedTo?.name) || t.assignee || '').toString().toLowerCase().includes(q)
    );
  }, [tasks, query]);

  const displayAssignee = (task) => {
    if (!task) return 'Unassigned';
    if (typeof task.assignedTo === 'object') return task.assignedTo.name || task.assignedTo.fullName || 'Unassigned';
    return task.assignedTo || task.assignee || 'Unassigned';
  };
  const displayTeam = (task) => task.team || task.category || '—';
  const displayDue = (task) => task.deadline || task.dueDate || '';

  const handleManualRefresh = () => fetchTasks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assigned Tasks</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {userName ? `Tasks for ${userName}` : 'Tasks you created or are assigned to'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md shadow-sm bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'created' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200'}`}
            >
              Created
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`px-3 py-1 text-sm rounded ${activeTab === 'assigned' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-200'}`}
            >
              Assigned
            </button>
          </div>

          <button
            onClick={handleManualRefresh}
            title="Refresh"
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'created' ? 'created' : 'assigned'} tasks...`}
              className="block w-full pl-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="min-w-[110px] text-right text-xs text-gray-500 dark:text-gray-400">
            <div>{isLoading ? 'Updating...' : `${filtered.length} shown`}</div>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </Card>
      )}

      {/* Loading empty state */}
      {isLoading && filtered.length === 0 && (
        <Card className="py-10 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </Card>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && !isLoading ? (
          <Card className="py-10 text-center">
            <p className="text-gray-600 dark:text-gray-400">No tasks to show.</p>
            <p className="text-xs text-gray-400 mt-2">Try switching tabs or adjusting the search.</p>
          </Card>
        ) : (
          filtered.map((task) => {
            const id = task._id || task.id || task.taskId || Math.random().toString(36).slice(2, 9);
            const title = task.title || task.name || 'Untitled Task';
            const description = task.description || task.desc || '';
            const priority = task.priority || 'Medium';
            const status = task.status || 'Pending';

            return (
              <Card key={id} hover className="cursor-pointer">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/tasks/${id}`, { state: { task, viewerRole: 'admin' } })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/tasks/${id}`, { state: { task, viewerRole: 'admin' } });
                    }
                  }}
                  className="flex items-start justify-between focus:outline-none"
                  aria-label={`Open details for ${title}`}
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-4 h-4" /> {displayAssignee(task)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {displayDue(task.toDateString()) ? `Due ${displayDue(task.toDateString())}` : 'No due date'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Flag className="w-4 h-4" /> {displayTeam(task)}
                      </span>
                    </div>
                    {description ? <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p> : null}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
