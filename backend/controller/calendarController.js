import { google } from 'googleapis';
import userModel from '../models/user_model.js';
import { Task } from '../models/task.modal.js';

// Google Calendar configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/callback' 
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Check calendar connection status
export const calendarStatus = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    
    if (!user.googleCalendar?.isConnected) {
      return res.json({
        connected: false,
        message: 'Google Calendar not connected'
      });
    }

    oauth2Client.setCredentials({
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken
    });

    const response = await calendar.calendarList.list();
    
    res.json({
      connected: true,
      message: 'Google Calendar is connected',
      lastSync: user.googleCalendar.lastSync,
      calendars: response.data.items.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        primary: cal.primary
      }))
    });
  } catch (error) {
    await userModel.findByIdAndUpdate(req.user._id, {
      'googleCalendar.isConnected': false
    });
    
    res.json({
      connected: false,
      message: 'Calendar connection expired. Please reconnect.'
    });
  }
};

// Connect Google Calendar
export const connectCalendar = (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.user._id.toString()
    });

    res.json({
      success: true,
      authUrl,
      message: 'Please authorize the app to access your Google Calendar'
    });
  } catch (error) {
    res.status(500).json({ message: 'Calendar connection failed', error: error.message });
  }
};

// Handle OAuth callback
export const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code missing' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens to user
    await userModel.findByIdAndUpdate(userId, {
      googleCalendar: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isConnected: true,
        lastSync: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Google Calendar connected successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save calendar credentials', error: error.message });
  }
};

// Disconnect Google Calendar
export const disconnectCalendar = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.user._id, {
      googleCalendar: {
        isConnected: false,
        lastSync: null
      }
    });

    res.json({
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect calendar', error: error.message });
  }
};

// Sync task to Google Calendar
export const syncTaskToCalendar = async (req, res) => {
  try {
    const { sendReminders = true, reminderMinutes = [10, 60], colorId = "5" } = req.body;

    const task = await Task.findById(req.params.taskId)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const user = await userModel.findById(req.user._id);
    if (!user?.googleCalendar?.accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials({
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken
    });

    const event = {
      summary: `Task: ${task.title}`,
      description: `Task: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nAssigned to: ${task.assignedTo.name}\nStatus: ${task.status}`,
      start: {
        dateTime: new Date(task.deadline).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(new Date(task.deadline).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'UTC',
      },
      colorId: colorId,
      reminders: {
        useDefault: false,
        overrides: sendReminders ? reminderMinutes.map(minutes => ({
          method: 'popup',
          minutes: minutes
        })) : []
      }
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    task.calendarEventId = calendarResponse.data.id;
    await task.save();

    res.json({
      success: true,
      message: 'Task synced to Google Calendar successfully',
      event: {
        id: calendarResponse.data.id,
        htmlLink: calendarResponse.data.htmlLink,
        summary: calendarResponse.data.summary
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Calendar sync failed', error: error.message });
  }
};

// Get calendar events
export const getCalendarEvents = async (req, res) => {
  try {
    const { startDate, endDate, maxResults = 50 } = req.query;

    const user = await userModel.findById(req.user._id);
    if (!user?.googleCalendar?.accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials({
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken
    });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      timeMax: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.map(event => ({
      eventId: event.id,
      summary: event.summary,
      description: event.description,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      location: event.location,
      htmlLink: event.htmlLink,
      status: event.status
    }));

    res.json({
      success: true,
      events,
      total: events.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch calendar events', error: error.message });
  }
};

// Bulk sync tasks to calendar
export const bulkSyncTasks = async (req, res) => {
  try {
    const { taskIds, calendarId = 'primary', defaultReminders = [10, 60] } = req.body;

    const user = await userModel.findById(req.user._id);
    if (!user?.googleCalendar?.accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials({
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken
    });

    const tasks = await Task.find({
      _id: { $in: taskIds },
      groupId: req.params.groupId
    }).populate('assignedTo', 'name email');

    const results = {
      successfulSyncs: 0,
      failedSyncs: 0,
      details: []
    };

    for (const task of tasks) {
      try {
        if (task.calendarEventId) {
          results.details.push({
            taskId: task._id,
            title: task.title,
            status: 'already_synced',
            eventId: task.calendarEventId
          });
          continue;
        }

        const event = {
          summary: `Task: ${task.title}`,
          description: `Task: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nAssigned to: ${task.assignedTo.name}\nStatus: ${task.status}`,
          start: {
            dateTime: new Date(task.deadline).toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: new Date(new Date(task.deadline).getTime() + 60 * 60 * 1000).toISOString(),
            timeZone: 'UTC',
          },
          colorId: "5",
          reminders: {
            useDefault: false,
            overrides: defaultReminders.map(minutes => ({
              method: 'popup',
              minutes: minutes
            }))
          }
        };

        const calendarResponse = await calendar.events.insert({
          calendarId: calendarId,
          resource: event,
        });

        task.calendarEventId = calendarResponse.data.id;
        await task.save();

        results.successfulSyncs++;
        results.details.push({
          taskId: task._id,
          title: task.title,
          status: 'success',
          eventId: calendarResponse.data.id,
          htmlLink: calendarResponse.data.htmlLink
        });

      } catch (error) {
        results.failedSyncs++;
        results.details.push({
          taskId: task._id,
          title: task.title,
          status: 'failed',
          error: error.message
        });
      }
    }

    await userModel.findByIdAndUpdate(req.user._id, {
      'googleCalendar.lastSync': new Date()
    });

    res.json({
      success: true,
      message: `Bulk sync completed: ${results.successfulSyncs} successful, ${results.failedSyncs} failed`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Bulk sync failed', error: error.message });
  }
};

// Remove task from calendar
export const removeTaskFromCalendar = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!task.calendarEventId) {
      return res.status(400).json({ message: 'Task not synced to calendar' });
    }

    const user = await userModel.findById(req.user._id);
    if (!user?.googleCalendar?.accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }

    oauth2Client.setCredentials({
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken
    });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: task.calendarEventId
    });

    task.calendarEventId = undefined;
    await task.save();

    res.json({
      success: true,
      message: 'Task removed from Google Calendar successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove task from calendar', error: error.message });
  }
};