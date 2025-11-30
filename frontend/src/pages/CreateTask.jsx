import React, { useState } from "react";
import Card from "../components/Card";
import { Save, X, Calendar, Flag, Users, FileImage, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "./utility/axiosInstance";
import toast from "react-hot-toast";

const CreateTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const teamData = location?.state?.teamData;
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Assigned",
    deadline: "",
    assignedTo: "",
    attachments: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachments") {
      setFormData((prev) => ({ ...prev, attachments: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/task/create-task/${teamData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Task Created Successfully");
      navigate(`/teams/${teamData._id}`);
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message) {
        alert(error?.response?.data?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/my-tasks");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Create New Task
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-600 dark:text-gray-400">
          Fill in the details to create a new task
        </p>
      </div>

      {/* Create Task Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter task title"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Task Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
              rows={4}
              placeholder="Describe the task in detail..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Row: Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <span>Priority *</span>
                </div>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date *</span>
                </div>
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
                     {/* assignedTo */}
          <div>
            <label
              htmlFor="assignedTo"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Assign To *</span>
              </div>
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select team member</option>
              {teamData?.members?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          </div>


          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                <span>Attachment</span>
              </div>
            </label>
            <div className="relative">
              <input
                name="attachments"
                type="file"
                accept="image/png, image/jpeg, application/pdf"
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              />
            </div>
            {formData.attachments && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.attachments.name}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 lg:px-6 lg:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          💡 Tips for Creating Tasks
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Use clear and descriptive titles</li>
          <li>Break down large tasks into smaller subtasks</li>
          <li>Set realistic due dates</li>
          <li>Assign appropriate priority levels</li>
        </ul>
      </Card>
    </div>
  );
};

export default CreateTask;