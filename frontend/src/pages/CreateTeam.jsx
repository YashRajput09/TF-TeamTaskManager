import React, { useState } from 'react';
import Card from '../components/Card';
import { Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './utility/axiosInstance';
import toast from 'react-hot-toast';

const CreateTask = () => {
  const navigate = useNavigate();
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
   
    // TODO: Integrate with API to create task
    try {
       const {data}=await axiosInstance.post(`/group/create-group`,formData) 

     
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to create group");
        console.log(error)
    }


    
    // Simulate success and navigate back
    toast.success('Team created successfully!')
    navigate('/my-tasks');
  };

  const handleCancel = () => {
    navigate('/my-tasks');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Team</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Fill in the details to create a new team</p>
      </div>

      {/* Create Task Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="grid grid-cols-1 gap-1">
            <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Frontend Team, Marketing Squad"
              className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Choose a short, descriptive team name.</p>
          </div>

          {/* Task Description */}
          <div className="grid grid-cols-1 gap-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe the team, responsibilities, or purpose."
              className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">A concise description helps others understand the team's focus.</p>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Save className="w-4 h-4" />
              <span>Create Team</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Tips Card */}
      <Card className="p-4 mt-5 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Tips for Creating Teams</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Use clear and descriptive titles</li>
          <li>Break down large teams into subgroups if needed</li>
          <li>Define responsibilities so members know their role</li>
          <li>Keep descriptions concise and actionable</li>
        </ul>
      </Card>
    </div>
  );
};

export default CreateTask;
