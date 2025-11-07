import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import {
  ArrowLeft,
  Calendar,
  Flag,
  MessageSquare,
  UploadCloud,
  Paperclip,
  User,
} from "lucide-react";
import axiosInstance from "./utility/axiosInstance";
import { useAuth } from "../context/AuthProvider";

// 🧠 Utility: Format and colorize due date
const formatDueDate = (dateString) => {
  if (!dateString) return { text: "No due date", color: "text-gray-400" };

  const date = new Date(dateString);
  const now = new Date();

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

  if (diffDays > 3) {
    return {
      text: `Due in ${diffDays} days (${formattedDate})`,
      color: "text-green-600 dark:text-green-400",
    };
  } else if (diffDays > 0) {
    return {
      text: `Due soon (${formattedDate})`,
      color: "text-orange-500 dark:text-orange-400",
    };
  } else if (diffDays === 0) {
    return {
      text: `Due today (${formattedDate})`,
      color: "text-yellow-500 dark:text-yellow-400",
    };
  } else {
    return {
      text: `Overdue ${Math.abs(diffDays)} days (${formattedDate})`,
      color: "text-red-500 dark:text-red-400",
    };
  }
};

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

  const { profile } = useAuth();

  console.log(profile);

  const taskFromState = location.state?.task || null;
  const viewerRole =
    location.state?.viewerRole === "admin" ? "admin" : "member"; // <-- role gate

  const [adminFiles, setAdminFiles] = useState([]);
  const [memberFiles, setMemberFiles] = useState([]);
  const [task, setTask] = useState();
  const [comments, setComments] = useState();
  const [newComment, setNewComment] = useState("");

  // For member uploads, optional display name
  const [memberUploadName, setMemberUploadName] = useState("");

  // const task = useMemo(() => taskFromState, [taskFromState]);

  console.log(task);

  // New states
  const [submissionFiles, setSubmissionFiles] = useState([]); // files member selects to submit
  const [submissionNote, setSubmissionNote] = useState(""); // optional message by member
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // helper to know if current user is task creator (admin for this task)
  const isTaskAdmin =
    profile &&
    task &&
    (profile._id === task.createdBy?._id || profile.role === "admin");
  // useEffect(() => {
  //  const getTask=async()=>{
  //   try {
  //     const {data}=await axiosInstance.get(`/task/get-single-task/${taskId}`)
  //     console.log(data);
  //     setTask(data);
  //   } catch (error) {
  //     console.log(error)
  //   }
  //  }

  //  getTask();

  // }, [])

  // define reusable fetchTask and fetchComments so we can call after submit/approve
  const fetchTask = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/task/get-single-task/${taskId}`
      );
      setTask(data);

      // split attachments into admin/member
      if (data.attachments && Array.isArray(data.attachments)) {
        const admin = [];
        const member = [];

        data.attachments.forEach((file) => {
          // Determine admin by uploadedBy or createdBy
          const role =
            file?.uploadedBy?._id === data?.createdBy?._id ? "admin" : "member";
          const fileObj = {
            id: file?._id,
            name:
              file?.filename ||
              file?.url?.split("/").pop() ||
              file?.name ||
              "file",
            size: file?.size || null,
            from: file.uploadedBy?.name || "Unknown",
            url: file?.url || file?.fileUrl,
          };
          if (role === "admin") admin.push(fileObj);
          else member.push(fileObj);
        });

        setAdminFiles(admin);
        setMemberFiles(member);
      } else {
        setAdminFiles([]);
        setMemberFiles([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/comment/getAll-comment/${taskId}`
      );
      const sorted = data?.allComments?.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setComments(sorted || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  console.log(adminFiles);
  console.log(memberFiles);

  console.log(task);

  const onUploadAdmin = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({
      id: `admin-${f.name}-${Date.now()}`,
      name: f.name,
      size: f.size,
      from: "Admin",
    }));
    setAdminFiles((prev) => [...mapped, ...prev]);
    e.target.value = "";
  };

  const onUploadMember = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({
      id: `member-${f.name}-${Date.now()}`,
      name: f.name,
      size: f.size,
      from: memberUploadName?.trim() || "Member",
    }));
    setMemberFiles((prev) => [...mapped, ...prev]);
    e.target.value = "";
  };

  const addComment = async (e) => {
    try {
      e.preventDefault();
      if (!newComment.trim()) return;

      const { data } = await axiosInstance.post(
        `/comment/add-comment/${taskId}`,
        { message: newComment }
      );
      console.log(data);
      alert("Comment added");

      setComments((prev) => [
        { id: `c-${Date.now()}`, author: "You", text: newComment.trim() },
        ...prev,
      ]);
      setNewComment("");
    } catch (error) {
      console.log(error);
    }
  };
  // Member selects files to submit
  const handleSubmissionFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSubmissionFiles(files);
    e.target.value = "";
  };

  // Submit task (member) -> POST /task/:taskId/submit (multipart)
  const handleSubmitTask = async (e) => {
    e?.preventDefault?.();
    if (!submissionFiles.length) {
      alert("Please choose files to submit.");
      return;
    }

    try {
      setLoadingSubmit(true);
      const attachment = new FormData();
      // include note if provided
      if (submissionNote) attachment.append("message", submissionNote);

      // Append multiple files. Backend must accept files with key 'files' or adjust accordingly.
      // If backend expects a single file field name, adjust the key here to e.g. 'profileImage' or 'attachments'
      submissionFiles.forEach((file, idx) => {
        attachment.append("attachment", file);
        attachment.append("url","") // <<-- change 'files' if backend expects another key
      });

      const { data } = await axiosInstance.put(
        `/task/${taskId}/submit`,
        attachment,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(data)
      // assume backend returns updated task; if not, we re-fetch
      if (data?.task) {
        setTask(data.task);
      } else {
        // re-fetch to get latest state
        await fetchTask(); // we will expose fetchTask below
      }

      // reset UI
      setSubmissionFiles([]);
      setSubmissionNote("");
      alert("Submitted successfully — status pending for admin approval.");
    } catch (err) {
      console.error("Submit error:", err);
      alert(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoadingSubmit(false);
    }
  };
  // Admin approves or declines submission
  const handleAdminAction = async (action, declineMessage = "") => {
    if (!["approve", "decline"].includes(action)) return;
    if (action === "decline" && !declineMessage) {
      const reason = prompt("Provide decline message (optional):");
      declineMessage = reason || "";
    }

    try {
      setProcessingAction(true);
      const payload =
        action === "approve"
          ? { action: "approve" }
          : { action: "decline", message: declineMessage };

      const { data } = await axiosInstance.post(
        `/task/${taskId}/approve`,
        payload
      );

      if (data?.task) setTask(data.task);
      else await fetchTask();

      alert(
        `Task ${action === "approve" ? "approved" : "declined"} successfully.`
      );
    } catch (err) {
      console.error("Admin action error:", err);
      alert(err?.response?.data?.message || "Action failed");
    } finally {
      setProcessingAction(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Task
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              We couldn’t load this task. Try opening it from Dashboard or My
              Tasks.
            </p>
          </div>
        </div>

        <Card className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you plan to deep link directly, store tasks in a global store /
            backend and fetch by <code>ID</code> ({taskId}).
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {task?.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              {task?.assignedTo && (
                <span className="inline-flex items-center gap-1">
                  <User className="w-4 h-4" /> {task?.assignedTo?.name}
                </span>
              )}
              {task.team && (
                <span className="inline-flex items-center gap-1">
                  <Flag className="w-4 h-4" /> {task.team}
                </span>
              )}
              {!!task.deadline && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Due {task?.deadline}
                </span>
              )}
              {/* {(() => {
                const due = formatDueDate(task.dueDate);
                return (
                  <span
                    className={`inline-flex items-center gap-1 ${due.color}`}
                  >
                    <Calendar className="w-4 h-4" /> {due.text}
                  </span>
                );
              })()} */}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Description
        </h2>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          {task.description || "No description provided."}
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
              <button type="submit" className="btn-primary">
                Add Comment
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {comments?.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No comments yet.
              </p>
            ) : (
              comments?.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {c?.commentedBy?.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {c.message}
                  </p>
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
              {viewerRole === "admin" && (
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

            {/* Admin controls - shown only to admins */}
            {isTaskAdmin && task?.status === "Pending" && (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleAdminAction("approve")}
                  disabled={processingAction}
                  className="btn-primary"
                >
                  {processingAction ? "Processing..." : "Approve"}
                </button>

                <button
                  onClick={() => {
                    const reason = prompt(
                      "Provide decline message (optional):"
                    );
                    handleAdminAction("decline", reason || "");
                  }}
                  disabled={processingAction}
                  className="btn-secondary"
                >
                  Decline
                </button>
              </div>
            )}

            {adminFiles.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No files yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {adminFiles.map((f) => (
                  <li
                    key={f.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {f.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.ceil(f.size / 1024)} KB
                    </span>
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
              {/* {viewerRole !== "admin" && (
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
              )} */}
              {/* Member submission area - visible to members (not admin) */}
              {viewerRole !== "admin" && (
                <div className="mb-4 border rounded p-3 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-sm font-semibold mb-2">
                    Submit your work
                  </h3>

                  <label className="block text-xs text-gray-500 mb-2">
                    Attach files
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleSubmissionFilesChange}
                    className="mb-2"
                  />

                  {submissionFiles.length > 0 && (
                    <ul className="mb-2">
                      {submissionFiles.map((f, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {f.name} • {Math.ceil(f.size / 1024)} KB
                        </li>
                      ))}
                    </ul>
                  )}

                  <textarea
                    placeholder="Optional message (notes for admin)"
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    className="w-full rounded-md bg-white dark:bg-gray-700/50 px-3 py-2 mb-2 text-sm"
                    rows={3}
                  />

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setSubmissionFiles([]);
                        setSubmissionNote("");
                      }}
                      type="button"
                      className="btn-secondary"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSubmitTask}
                      disabled={loadingSubmit}
                      className="btn-primary"
                    >
                      {loadingSubmit ? "Submitting..." : "Submit Task"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {memberFiles.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No files yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {memberFiles.map((f) => (
                  <li
                    key={f.id}
                    className="py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {f.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        • by {f.from}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.ceil(f.size / 1024)} KB
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* Mobile-friendly member input */}
            {viewerRole !== "admin" && (
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
