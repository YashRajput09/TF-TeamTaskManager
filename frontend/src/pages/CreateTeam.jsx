import React, { useState } from 'react';
import Card from '../components/Card';
import { Save, X, Calendar, Flag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utility/axiosInstance';

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
    console.log(formData)
    // TODO: Integrate with API to create task
    try {
       const {data}=await axiosInstance.post(`/group/create-group`,formData) 

       console.log(data)
    } catch (error) {
        console.log(error)
    }

    console.log('Creating task:', formData);
    
    // Simulate success and navigate back
    alert('Task created successfully!');
    navigate('/my-tasks');
  };

  const handleCancel = () => {
    navigate('/my-tasks');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Team</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Fill in the details to create a new task</p>
      </div>

      {/* Create Task Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Name*
            </label>
            <input
              type="text"
              id="title"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter task title"
              className="input-field"
            />
          </div>

          {/* Task Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <span>Create Team</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Tips for Creating Tasks</h3>
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