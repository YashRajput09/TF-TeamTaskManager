import React, { useState } from "react";
import Card from "../components/Card";
import { Save, X, Calendar, Flag, Users, FileImage } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "./utility/axiosInstance";
import toast from "react-hot-toast";

const CreateTask = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const teamData = location?.state?.teamData;


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

  // const handleChange = (e) => {
  //   const { name, value,files } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

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
    // TODO: Integrate with API to create task
    try {
      // console.log("Creating task:", formData);

      const { data } = await axiosInstance.post(
        `/task/create-task/${teamData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

     
      // Simulate success and navigate back
      // alert("Task created successfully!");
      toast.success("Task Created Successfully")
      navigate(`/teams/${teamData._id}`);
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message) {
        alert(error?.response?.data?.message);
      }
    }
  };

  const handleCancel = () => {
    navigate("/my-tasks");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Task
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
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
              placeholder="Enter task title"
              className="input-field"
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
              rows={4}
              placeholder="Describe the task in detail..."
              className="input-field resize-none"
            />
          </div>

          {/* Row: Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center space-x-2">
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
                className="input-field"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              {/* <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select> */}
            </div>
          </div>

          {/* Row: Due Date and Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Due Date */}
            <div>
              <label
                htmlFor="deadline"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center space-x-2">
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
                className="input-field"
              />
            </div>

            {/* Team */}
            {/* <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Team *</span>
                </div>
              </label>
              <select
                id="team"
                name="team"
                value={formData.team}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select a team</option>
                <option value="Design Team">Design Team</option>
                <option value="Dev Team">Dev Team</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Product">Product</option>
              </select>
            </div> */}
          </div>

          {/* assignedTo */}
          <div>
            <label
              htmlFor="assignedTo"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Assign To *
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select team member</option>

              {teamData?.members?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Attachment
            </label>
            <div className="relative">
              <FileImage className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                name="attachments"
                type="file"
                accept="image/png, image/jpeg, application/pdf"
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Create Task</span>
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
