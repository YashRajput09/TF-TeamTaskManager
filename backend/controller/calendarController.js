import { google } from 'googleapis';
import userModel from '../models/user_model.js';
import { Task } from '../models/task.modal.js';

// Google Calendar configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/calendar/callback'
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Check calendar connection status is it connected or not 
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
      state: req.user._id
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