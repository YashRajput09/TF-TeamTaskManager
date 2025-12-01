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
import { IoCheckmarkCircle, IoCheckmarkDoneSharp } from "react-icons/io5";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";

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

  const taskFromState = location.state?.task || null;

  const [adminFiles, setAdminFiles] = useState([]);
  const [memberFiles, setMemberFiles] = useState([]);
  const [task, setTask] = useState();
  const [comments, setComments] = useState();
  const [newComment, setNewComment] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [editField, setEditField] = useState({});
  const [editText, setEditText] = useState();

  // For member uploads, optional display name
  const [memberUploadName, setMemberUploadName] = useState("");

  // const task = useMemo(() => taskFromState, [taskFromState]);

  // New states
  const [submissionFiles, setSubmissionFiles] = useState([]); // files member selects to submit
  const [submissionNote, setSubmissionNote] = useState(""); // optional message by member
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  // Add state for managing dropdown
  const [openDropdown, setOpenDropdown] = useState(null);

  // helper to know if current user is task creator (admin for this task)
  const isTaskAdmin =
    profile &&
    task &&
    (profile._id === task.createdBy?._id || profile.role === "admin");
  // useEffect(() => {
  //  const getTask=async()=>{
  //   try {
  //     const {data}=await axiosInstance.get(`/task/get-single-task/${taskId}`)
  //
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

      setLoadingAdd(true);
      const { data } = await axiosInstance.post(
        `/comment/add-comment/${taskId}`,
        { message: newComment }
      );

      // alert("Comment added");
      console.log(data);
      setComments((prev) => [
        {
          _id: `${Date.now()}`,
          commentedBy: profile,
          message: newComment.trim(),
        },
        ...prev,
      ]);
      console.log(comments);
      toast.success("Comment Added");
      setNewComment("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAdd(false);
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
      // alert("Please choose files to submit.");
      toast.error("Please choose files to submit.");
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
        attachment.append("url", ""); // <<-- change 'files' if backend expects another key
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
      // alert("Submitted successfully — status pending for admin approval.");
      toast.success(
        "Submitted successfully — status pending for admin approval."
      );
    } catch (err) {
      console.error("Submit error:", err);
      // alert(err?.response?.data?.message || "Submission failed");
      toast.error(err?.response?.data?.message || "Submission failed");
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

      const { data } = await axiosInstance.put(
        `/task/${taskId}/approve`,
        payload
      );

      if (data?.task) setTask(data.task);
      else await fetchTask();

      // alert(
      //   `Task ${action === "approve" ? "approved" : "declined"} successfully.`
      // );
      toast.success(
        `Task ${action === "approve" ? "approved" : "declined"} successfully.`
      );
    } catch (err) {
      console.error("Admin action error:", err);
      // alert(err?.response?.data?.message || "Action failed");
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setProcessingAction(false);
    }
  };

  const deleteComment = async (commentId) => {
    // Handle delete
    console.log("Delete comment:", commentId);
    try {
      const { data } = await axiosInstance.delete(
        `comment/${task?._id}/comment/${commentId}/delete`
      );
      console.log(data);
      setComments(data?.all_comment.reverse());
      toast.success("Comment deleted");
      setOpenDropdown(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (commentId) => {
    try {
      const { data } = await axiosInstance.put(
        `/comment/${task?._id}/comment/${commentId}/edit-comment`,
        {
          newText: editText,
        }
      );
console.log(commentId)
      console.log(data);
      const updatedComment=data?.updated_comment
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? updatedComment : comment
        )
      );
    } catch (error) {
      console.log(error);
    }
  };
console.log(comments)
  const isChanged = (commentText) => commentText !== editText?.trim();
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
    <div className="space-y-4">
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
              {task?.group && (
                <span className="inline-flex items-center gap-1">
                  <Flag className="w-4 h-4" />{" "}
                  {task?.groupId || task?.group[0]?.name}
                </span>
              )}
              {/* {!!task.deadline && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Due {task?.deadline}
                </span>
              )} */}
              {(() => {
                const due = formatDueDate(task?.deadline);
                return (
                  <span
                    className={`inline-flex items-center gap-1 ${due.color}`}
                  >
                    <Calendar className="w-4 h-4" /> {due.text}
                  </span>
                );
              })()}
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    task.priority === "Critical"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : task.priority === "High"
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : task.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  }`}
                >
                  {task?.priority}
                </span>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : task.status === "In-progress"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {task?.status}
                </span>
              </div>
            </div>
            <div className="mt-2">
              {/* {task.status === "Declined" ? ( */}
              {task.history[task.history.length - 1].message ===
              "submission declined" ? (
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-4 py-2 text-sm text-red-700 dark:text-red-300">
                  ❌ Task declined by <strong>{task?.createdBy?.name}</strong>
                  <div className="mt-2 text-xs italic text-red-500 dark:text-red-400">
                    Reason: {task?.declineMessage}
                  </div>
                </div>
              ) : task.status === "Completed" ? (
                <div className="rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 px-4 py-2 text-sm text-green-700 dark:text-green-300">
                  ✅ Task approved by <strong>{task?.createdBy?.name}</strong>
                </div>
              ) : task.status === "Pending" ? (
                <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 px-4 py-2 text-sm text-yellow-700 dark:text-yellow-300">
                  ⏳ Task submission pending review by {task?.createdBy?.name}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="">
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
              <button
                type="submit"
                className="px-4 border border-white text-gray-300 bg-slate-700 rounded-xl"
              >
                {loadingAdd ? (
                  <>
                    <div className="flex w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </form>

          <div className="space-y-1">
            {comments?.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No comments yet.
              </p>
            ) : (
              comments?.map((c) => (
                <div
                  key={c?._id}
                  className={`${
                    c?.commentedBy?._id === profile._id ? "justify-end" : "justify-start"
                  } flex relative group`}
                >
                  <div
                    className={`${
                      c?.commentedBy?._id === profile._id
                        ? "bg-slate-700 text-white"
                        : "bg-gray-50 dark:bg-gray-700/50"
                    } px-4 py-3 rounded-2xl relative`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p
                          className={`text-xs ${
                            c?.commentedBy?._id === profile._id
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          } mb-1 font-medium`}
                        >
                          @{c?.commentedBy?.name}
                        </p>
                        <p
                          className={`text-sm ${
                            c?.commentedBy?._id === profile._id
                              ? "text-white"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {!editField[c?._id] ? (
                            c?.message
                          ) : (
                            <div className="flex transition-all duration-300 w-full space-x-1">
                              <div className="flex flex-grow  rounded focus-within:border-b-2  bg-red-800/10 transition-all duration-100 border-red-800 overflow-auto justify-start items-center">
                                <textarea
                                  name="editText"
                                  placeholder="Type new Comment"
                                  value={editText}
                                  onBlur={() =>
                                    setTimeout(() => {
                                      setEditField({
                                        [c._id]: false,
                                      });
                                    }, 300)
                                  }
                                  autoFocus
                                  onChange={(e) => {
                                    setEditText(e.target.value);
                                  }}
                                  className="input resize-y h-[30px] bg-transparent focus:outline-none flex-grow  rounded-md  "
                                />
                              </div>

                              <button
                                disabled={!isChanged(c?.message)}
                                onClick={() => {
                                  handleEdit(c?._id);
                                }}
                                className={` ${
                                  isChanged(c.message)
                                    ? "bg-green-500/20 text-green-500 hover:bg-green-900/40"
                                    : "bg-gray-400/20 text-gray-400"
                                } active:scale-95  p-1 rounded  cursor-pointer duration-300 `}
                              >
                                <IoCheckmarkDoneSharp size={20} />
                              </button>
                            </div>
                          )}
                        </p>
                      </div>

                      {/* Three Dot Menu - Only for user's own comments */}
                      {c?.commentedBy?._id === profile._id && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === c._id ? null : c._id
                              )
                            }
                            className="p-1 rounded-full hover:bg-white/20 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {openDropdown === c._id && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdown(null)}
                              />
                              {console.log(editField)}
                              <div className="absolute right-0 top-8 z-20 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                <button
                                  onClick={() => {
                                    // Handle edit
                                    setEditText(c?.message);
                                    setEditField({
                                      [c?._id]: !editField[c?._id],
                                    });
                                    console.log("Edit comment:", c._id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteComment(c?._id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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
              {isTaskAdmin && (
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
                    {f.url && f.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={f.url}
                          alt={f.name || "admin file"}
                          className="w-full h-12 object-cover rounded-md"
                        />
                      </a>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-xs text-gray-500">
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          View file
                        </a>
                      </div>
                    )}
                    {/* <span className="text-sm text-gray-900 dark:text-gray-100">
                      {f.name}
                    </span> */}
                    {f.size > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.ceil(f.size / 1024)} KB
                      </span>
                    )}
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
              {!isTaskAdmin && (
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
                {memberFiles?.map((f) => (
                  <li
                    key={f.id}
                    className="py-2 flex items-center justify-between"
                  >
                    {f.url && f.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={f.url}
                          alt={f.name || "admin file"}
                          className="w-full h-12 object-cover rounded-md"
                        />
                      </a>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-xs text-gray-500">
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          View file
                        </a>
                      </div>
                    )}
                    {/* <span className="text-sm text-gray-900 dark:text-gray-100">
                      {f.name}
                    </span> */}
                    {f.size > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.ceil(f.size / 1024)} KB
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Mobile-friendly member input */}
            {isTaskAdmin && (
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
