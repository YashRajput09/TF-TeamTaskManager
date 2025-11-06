import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import { ArrowLeft, Calendar, Flag, MessageSquare, UploadCloud, Paperclip, User } from 'lucide-react';

/**
 * TaskDetail expects to be navigated with `state.task` from Dashboard/MyTasks/Teams/AssignedTasks.
 * viewerRole in state controls who can upload:
 * - 'admin'  -> can upload only to Admin files
 * - 'member' -> can upload only to Members files
 * If not provided, defaults to 'member'.
 */
export default function TaskDetail() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();
  const taskFromState = location.state?.task || null;
  const viewerRole = location.state?.viewerRole === 'admin' ? 'admin' : 'member'; // <-- role gate

  const [adminFiles, setAdminFiles] = useState([]);
  const [memberFiles, setMemberFiles] = useState([]);
  const [comments, setComments] = useState([
    { id: 'c1', author: 'Sarah Williams', text: 'Please align this with the new branding.' },
    { id: 'c2', author: 'Vishal Patidar', text: 'Noted. I\'ll update by EOD.' },
  ]);
  const [newComment, setNewComment] = useState('');

  // For member uploads, optional display name
  const [memberUploadName, setMemberUploadName] = useState('');

  const task = useMemo(() => taskFromState, [taskFromState]);

  const onUploadAdmin = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({
      id: `admin-${f.name}-${Date.now()}`,
      name: f.name,
      size: f.size,
      from: 'Admin',
    }));
    setAdminFiles((prev) => [...mapped, ...prev]);
    e.target.value = '';
  };

  const onUploadMember = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({
      id: `member-${f.name}-${Date.now()}`,
      name: f.name,
      size: f.size,
      from: memberUploadName?.trim() || 'Member',
    }));
    setMemberFiles((prev) => [...mapped, ...prev]);
    e.target.value = '';
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [{ id: `c-${Date.now()}`, author: 'You', text: newComment.trim() }, ...prev ]);
    setNewComment('');
  };

  if (!task) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              We couldn’t load this task. Try opening it from Dashboard or My Tasks.
            </p>
          </div>
        </div>

        <Card className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you plan to deep link directly, store tasks in a global store / backend and fetch by <code>ID</code> ({taskId}).
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              {task.assignee && (
                <span className="inline-flex items-center gap-1">
                  <User className="w-4 h-4" /> {task.assignee}
                </span>
              )}
              {task.team && (
                <span className="inline-flex items-center gap-1">
                  <Flag className="w-4 h-4" /> {task.team}
                </span>
              )}
              {!!task.dueDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Due {task.dueDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Description</h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          {task.description || 'No description provided.'}
        </p>
      </Card>

      {/* Content: two-column layout; right column has two rows (Admin files, Member files). Left column = Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Comments */}
        <Card className="lg:col-span-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Comments
            </h2>
          </div>

          <form onSubmit={addComment} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment…"
              className="w-full rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 outline-none text-sm"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button type="submit" className="btn-primary">Add Comment</button>
            </div>
          </form>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{c.author}</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{c.text}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right: two stacked rows for Files */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admin Files */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Paperclip className="w-5 h-5" /> Files shared by Admin
              </h2>

              {/* Admin can upload to admin files; members cannot */}
              {viewerRole === 'admin' && (
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={onUploadAdmin}
                  />
                </label>
              )}
            </div>

            {adminFiles.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No files yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {adminFiles.map((f) => (
                  <li key={f.id} className="py-2 flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-gray-100">{f.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{Math.ceil(f.size / 1024)} KB</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Member Files */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Paperclip className="w-5 h-5" /> Files shared by Members
              </h2>

              {/* Members can upload to members files; admin cannot */}
              {viewerRole !== 'admin' && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={memberUploadName}
                    onChange={(e) => setMemberUploadName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="hidden md:block rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 text-sm outline-none"
                  />
                  <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={onUploadMember}
                    />
                  </label>
                </div>
              )}
            </div>

            {memberFiles.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No files yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {memberFiles.map((f) => (
                  <li key={f.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">{f.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">• by {f.from}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{Math.ceil(f.size / 1024)} KB</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Mobile-friendly member input */}
            {viewerRole !== 'admin' && (
              <div className="mt-4 md:hidden">
                <input
                  type="text"
                  value={memberUploadName}
                  onChange={(e) => setMemberUploadName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 text-sm outline-none"
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
