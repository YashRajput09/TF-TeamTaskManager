import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import { Search, Calendar, Flag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './utility/axiosInstance';

// current user (assigner)
const currentUser = 'Vishal Patidar';

const sampleTasks = [
  { id: 101, title: 'Draft onboarding guide', description: 'Create a concise onboarding doc for new developers.', team: 'Dev Team', priority: 'High', dueDate: '2025-11-20', status: 'In Progress', assignee: 'Jane Smith', assignedBy: 'Vishal Patidar' },
  { id: 102, title: 'Design empty state illustrations', description: 'Illustrations for pages with no data yet.', team: 'Design Team', priority: 'Medium', dueDate: '2025-11-25', status: 'Pending', assignee: 'Alice Johnson', assignedBy: 'Vishal Patidar' },
  { id: 103, title: 'Write Q4 email copy', description: 'Email copy for holiday promotion.', team: 'Marketing', priority: 'Low', dueDate: '', status: 'Pending', assignee: 'Mike Johnson', assignedBy: 'Vishal Patidar' },
];

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
  const [tasks,setTasks] = useState();

  useEffect(() => {
    const allUserTask=async ()=>{
         try {
          const {data}=await axiosInstance.get(`/task/get-user-task`);
        setTasks(data?.assignedTasks);
        // setCreatedTasks(data?.createdTasks);
         } catch (error) {
          console.log(error)
         }
   }
   allUserTask();
  }, [])
  const assignedByMe = useMemo(
    () => tasks?.filter(t => (t.assignedBy || '').toLowerCase() === currentUser.toLowerCase()),
    [tasks]
  );





  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assignedByMe;
    return assignedByMe.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.team.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q)
    );
  }, [assignedByMe, query]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assigned Tasks</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Tasks you assigned to your team</p>
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
              placeholder="Search assigned tasks..."
              className="input-field pl-10"
            />
          </div>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {tasks?.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-gray-600 dark:text-gray-400">No tasks assigned by you.</p>
          </Card>
        ) : (
          tasks?.map(task => (
            <Card
              key={task.id}
              hover
              className="cursor-pointer"
            >
              {/* Make the entire visible area clickable */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/tasks/${task._id}`, { state: { task, viewerRole: 'admin' } })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/tasks/${task._id}`, { state: { task, viewerRole: 'admin' } });
                  }
                }}
                className="flex items-start justify-between focus:outline-none"
                aria-label={`Open details for ${task.title}`}
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{task.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-4 h-4" /> {task.assignedTo?.name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {task.deadline ? `Due ${task?.deadline}` : 'No due date'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Flag className="w-4 h-4" /> {task.team}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}