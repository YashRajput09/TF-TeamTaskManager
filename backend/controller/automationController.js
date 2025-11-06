import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task } from '../models/task.model.js';
import { groupModel } from '../models/group.model.js';
import userModel from '../models/user_model.js';
import { sendTelegramMessage } from './telegramController.js';

// AI Workload Analysis
export const analyzeWorkload = async (req, res) => {
  try {
    const { timeframe = 7, includePending = true } = req.query;
    
    const group = await groupModel.findById(req.params.groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    const tasks = await Task.find({
      groupId: req.params.groupId,
      ...(includePending === 'false' ? { status: { $ne: 'Done' } } : {})
    });
    
    const analysis = await analyzeWorkloadWithAI(group.members, tasks, parseInt(timeframe));
    
    res.json({
      success: true,
      analysis: {
        timeframe: parseInt(timeframe),
        totalTasks: tasks.length,
        averageLoad: analysis.users.reduce((sum, user) => sum + user.workloadScore, 0) / analysis.users.length,
        overloadThreshold: 5,
        users: analysis.users
      },
      aiInsights: analysis.aiInsights
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Auto Redistribution
export const autoRedistributeTasks = async (req, res) => {
  try {
    const { minTasksPerUser = 2, maxTasksPerUser = 4 } = req.body;
    
    const group = await groupModel.findById(req.params.groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const tasks = await Task.find({
      groupId: req.params.groupId,
      status: { $in: ['Assigned', 'In-progress', 'Pending'] }
    });

    const groupMembers = group.members;
    
    // Calculate current distribution
    const userTaskCount = {};
    groupMembers.forEach(member => {
      userTaskCount[member._id] = tasks.filter(task => 
        task.assignedTo.toString() === member._id.toString()
      ).length;
    });

    const totalTasks = tasks.length;
    const targetTasksPerUser = Math.min(
      maxTasksPerUser,
      Math.max(minTasksPerUser, Math.ceil(totalTasks / groupMembers.length))
    );

    // Find overloaded and underloaded users
    const overloadedUsers = [];
    const availableUsers = [];
    
    groupMembers.forEach(member => {
      const currentTasks = userTaskCount[member._id];
      if (currentTasks > targetTasksPerUser) {
        overloadedUsers.push({
          user: member,
          excessTasks: currentTasks - targetTasksPerUser,
          taskIds: tasks
            .filter(task => task.assignedTo.toString() === member._id.toString())
            .map(task => task._id)
            .slice(0, currentTasks - targetTasksPerUser)
        });
      } else if (currentTasks < targetTasksPerUser) {
        availableUsers.push({
          user: member,
          capacity: targetTasksPerUser - currentTasks
        });
      }
    });

    const redistributionPlan = [];
    let redistributionLog = [];

    overloadedUsers.forEach(overloaded => {
      let tasksToMove = overloaded.excessTasks;
      const tasksAvailable = overloaded.taskIds;
      
      availableUsers.forEach(available => {
        if (tasksToMove > 0 && available.capacity > 0) {
          const tasksToTransfer = Math.min(tasksToMove, available.capacity);
          const tasksForTransfer = tasksAvailable.splice(0, tasksToTransfer);
          
          tasksForTransfer.forEach(taskId => {
            redistributionPlan.push({
              taskId: taskId.toString(),
              newAssigneeId: available.user._id.toString(),
              notifyUsers: true,
              addNote: `Auto-redistributed for workload balance`
            });
          });
          
          redistributionLog.push(
            `Moving ${tasksToTransfer} tasks from ${overloaded.user.name} to ${available.user.name}`
          );
          
          tasksToMove -= tasksToTransfer;
          available.capacity -= tasksToTransfer;
        }
      });
    });

    const results = {
      tasksReassigned: 0,
      failedReassignments: 0,
      notificationsSent: 0
    };

    const details = [];

    for (const plan of redistributionPlan) {
      try {
        const task = await Task.findByIdAndUpdate(
          plan.taskId,
          { assignedTo: plan.newAssigneeId },
          { new: true }
        ).populate('assignedTo', 'name');

        if (task) {
          results.tasksReassigned++;
          
          // Send notification if enabled
          if (plan.notifyUsers) {
            const newAssignee = await userModel.findById(plan.newAssigneeId);
            if (newAssignee && newAssignee.telegramChatId) {
              await sendTelegramMessage(
                newAssignee.telegramChatId,
                `🔀 Task "${task.title}" has been assigned to you for workload balancing`
              );
              results.notificationsSent++;
            }
          }
          
          details.push({
            taskId: task._id,
            title: task.title,
            status: 'success'
          });
        }
      } catch (error) {
        results.failedReassignments++;
        details.push({
          taskId: plan.taskId,
          title: 'Unknown',
          status: 'failed',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Auto redistribution completed: ${results.tasksReassigned} tasks reassigned`,
      summary: {
        tasksReassigned: results.tasksReassigned,
        failedReassignments: results.failedReassignments,
        notificationsSent: results.notificationsSent
      },
      redistributionLog,
      details
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// AI Analysis Function
const analyzeWorkloadWithAI = async (users, tasks, timeframe = 7) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const modelConfigs = [
      { model: 'gemini-1.5-flash' },
      { model: 'gemini-1.5-pro' },
      { model: 'gemini-1.0-pro' },
      { model: 'gemini-pro' }
    ];
    
    let lastError = null;
    
    for (const config of modelConfigs) {
      try {
        console.log(`🔄 Trying model: ${config.model}`);
        const model = genAI.getGenerativeModel(config);
        
        const prompt = `Analyze this team workload and return JSON only:
        
        USERS: ${JSON.stringify(users.map(u => ({ id: u._id, name: u.name })))}
        TASKS: ${JSON.stringify(tasks.map(t => ({
          id: t._id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          assignedTo: t.assignedTo,
          deadline: t.deadline
        })))}
        
        Return JSON with this exact structure:
        {
          "users": [
            {
              "userId": "user_id_here",
              "workloadScore": 8.7,
              "status": "overloaded|balanced|underloaded",
              "recommendedAction": "redistribute|maintain|assign_more"
            }
          ],
          "aiInsights": {
            "bottleneckUsers": ["user_id"],
            "availableCapacity": ["user_id"],
            "riskTasks": ["task_id"],
            "recommendations": ["specific recommendation here"]
          }
        }`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('🤖 AI Raw Response:', text);
        
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          console.log(`✅ AI Analysis successful with model: ${config.model}`);
          return analysis;
        }
        
        throw new Error('No valid JSON in AI response');
        
      } catch (error) {
        lastError = error;
        console.log(`❌ Model ${config.model} failed:`, error.message);
      }
    }
    
    throw lastError || new Error('All AI models failed');
    
  } catch (error) {
    console.error('🚨 All AI models failed, using enhanced basic calculation');
    return calculateEnhancedWorkload(users, tasks, timeframe);
  }
};

// Enhanced workload calculation (fallback)
const calculateEnhancedWorkload = (users, tasks, timeframe) => {
  console.log('🔧 Using enhanced workload calculation');
  
  const userWorkload = users.map(user => {
    const userTasks = tasks.filter(task => 
      task.assignedTo && task.assignedTo.toString() === user._id.toString()
    );
    
    const pendingTasks = userTasks.filter(task => 
      task.status !== 'Done'
    );
    
    let workloadScore = 0;
    pendingTasks.forEach(task => {
      if (task.priority === 'High') workloadScore += 3;
      else if (task.priority === 'Medium') workloadScore += 2;
      else workloadScore += 1;
    });
    
    let status = 'balanced';
    let recommendedAction = 'maintain';
    
    if (workloadScore >= 6) {
      status = 'overloaded';
      recommendedAction = 'redistribute';
    } else if (workloadScore <= 2 && pendingTasks.length > 0) {
      status = 'underloaded';
      recommendedAction = 'assign_more';
    } else if (pendingTasks.length === 0) {
      status = 'available';
      recommendedAction = 'assign_tasks';
    }
    
    return {
      userId: user._id,
      name: user.name,
      currentTasks: userTasks.length,
      pendingTasks: pendingTasks.length,
      completedTasks: userTasks.filter(t => t.status === 'Done').length,
      workloadScore,
      status,
      recommendedAction
    };
  });
  
  const bottleneckUsers = userWorkload
    .filter(user => user.status === 'overloaded')
    .map(user => user.userId);
    
  const availableCapacity = userWorkload
    .filter(user => user.status === 'underloaded' || user.status === 'available')
    .map(user => user.userId);
  
  const riskTasks = tasks.filter(task => {
    if (task.priority === 'High' && task.status !== 'Done') {
      const daysUntilDeadline = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24);
      return daysUntilDeadline <= 2;
    }
    return false;
  }).map(task => task._id);
  
  const recommendations = [];
  const overloadedUsers = userWorkload.filter(u => u.status === 'overloaded');
  const availableUsers = userWorkload.filter(u => u.status === 'underloaded' || u.status === 'available');
  
  if (overloadedUsers.length > 0 && availableUsers.length > 0) {
    overloadedUsers.forEach(overloaded => {
      availableUsers.forEach(available => {
        recommendations.push(
          `Move 1-2 tasks from ${overloaded.name} to ${available.name} to balance workload`
        );
      });
    });
  }
  
  if (riskTasks.length > 0) {
    recommendations.push(`Monitor ${riskTasks.length} high-priority tasks with approaching deadlines`);
  }
  
  return {
    users: userWorkload,
    aiInsights: {
      bottleneckUsers,
      availableCapacity,
      riskTasks,
      recommendations: recommendations.slice(0, 3)
    }
  };
};