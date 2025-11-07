import { groupModel } from '../models/group.model.js';
import { Task } from '../models/task.modal.js';
import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/authenticateUser.js';
import { 
  analyzeWorkload, 
  autoRedistributeTasks,
  getAIRedistributionSuggestions,
  executeAIRedistribution,
  getUserCapacityForecast,
  updateAIPreferences,
  getRedistributionHistory,
  debugRedistribution
} from '../controller/automationController.js';

const router = express.Router();

// DEBUG ROUTES - PUT THESE FIRST
router.get('/debug-all-tasks/:groupId', isAuthenticated, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    
    console.log('🔍 DEBUG: Looking for tasks with groupId:', groupId);
    
    // Find ALL tasks in this group, regardless of status
    const allTasks = await Task.find({ groupId: groupId })
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');

    console.log('📋 DEBUG: Found tasks:', allTasks.length);

    // Group tasks by status
    const tasksByStatus = {};
    allTasks.forEach(task => {
      if (!tasksByStatus[task.status]) {
        tasksByStatus[task.status] = [];
      }
      tasksByStatus[task.status].push({
        id: task._id,
        title: task.title,
        assignedTo: task.assignedTo?.name || 'Unassigned',
        priority: task.priority
      });
    });

    res.json({
      totalTasks: allTasks.length,
      tasksByStatus: tasksByStatus,
      allStatuses: Object.keys(tasksByStatus),
      sampleTasks: allTasks.slice(0, 3).map(t => ({
        id: t._id,
        title: t.title,
        status: t.status,
        assignedTo: t.assignedTo?.name,
        priority: t.priority
      }))
    });
  } catch (error) {
    console.error('❌ DEBUG Error:', error);
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
});

router.get('/debug/:groupId/distribution', isAuthenticated, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    
    const group = await groupModel.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const tasks = await Task.find({
      groupId: groupId,
      status: { $in: ['Assigned', 'In-progress', 'Pending'] }
    }).populate('assignedTo', 'name');

    // Calculate current distribution
    const userTaskCount = {};
    const userTasks = {};
    
    group.members.forEach(member => {
      const memberTasks = tasks.filter(task => 
        task.assignedTo && task.assignedTo._id.toString() === member._id.toString()
      );
      userTaskCount[member._id] = memberTasks.length;
      userTasks[member._id] = memberTasks;
    });

    const totalTasks = tasks.length;
    const targetTasksPerUser = Math.min(4, Math.max(2, Math.ceil(totalTasks / group.members.length)));

    // Find overloaded and underloaded users
    const overloadedUsers = [];
    const availableUsers = [];
    
    group.members.forEach(member => {
      const currentTasks = userTaskCount[member._id] || 0;
      if (currentTasks > targetTasksPerUser) {
        overloadedUsers.push({
          user: member.name,
          currentTasks: currentTasks,
          target: targetTasksPerUser,
          excess: currentTasks - targetTasksPerUser
        });
      } else if (currentTasks < targetTasksPerUser) {
        availableUsers.push({
          user: member.name,
          currentTasks: currentTasks,
          target: targetTasksPerUser,
          capacity: targetTasksPerUser - currentTasks
        });
      }
    });

    res.json({
      debug: {
        totalTasks: totalTasks,
        groupMembers: group.members.length,
        targetTasksPerUser: targetTasksPerUser,
        currentDistribution: userTaskCount,
        overloadedUsers: overloadedUsers,
        availableUsers: availableUsers,
        taskDetails: tasks.map(t => ({
          id: t._id,
          title: t.title,
          assignedTo: t.assignedTo?.name || 'Unassigned',
          status: t.status
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
});

// MAIN ROUTES
router.get('/groups/:groupId/workload-analysis', isAuthenticated, isAdmin, analyzeWorkload);
router.post('/groups/:groupId/auto-redistribute', isAuthenticated, isAdmin, autoRedistributeTasks);
router.post('/groups/:groupId/ai-redistribute/suggestions', isAuthenticated, isAdmin, getAIRedistributionSuggestions);
router.post('/groups/:groupId/ai-redistribute/execute', isAuthenticated, isAdmin, executeAIRedistribution);
router.get('/users/:userId/capacity-forecast', isAuthenticated, getUserCapacityForecast);
router.put('/groups/:groupId/ai-preferences', isAuthenticated, isAdmin, updateAIPreferences);
router.post('/debug/:groupId/redistribution', isAuthenticated, isAdmin, debugRedistribution);

export default router;