import { google } from 'googleapis';
import userModel from '../models/user_model.js';
import { Task } from '../models/task.modal.js';
import { groupModel } from '../models/group.model.js';
// import Task from "../models/group.model.js"; // adjust path if needed


// Google Calendar configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI 
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
      'https://www.googleapis.com/auth/calendar.events',
       "https://www.googleapis.com/auth/userinfo.email",
       "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: "consent",
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

    const calendarResponse =  calendar.events.insert({
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

// =============================
// CREATE TEAM MEETING (NEW FEATURE)
// =============================

export const createGroupMeeting = async (req, res) => {
  try {
    const { groupId, title, description, start, end } = req.body;

    // Admin
    const admin = await userModel.findById(req.user._id);
    if (!admin.googleCalendar?.refreshToken) {
      return res.status(400).json({ message: "Please connect Google Calendar first." });
    }

    // Group
    const group = await groupModel.findById(groupId).populate("members");
    if (!group) return res.status(404).json({ message: "Group not found." });

    // Collect attendee emails
    const attendees = group.members.map((m) => ({
      email: m.email,
    }));

    // Setup OAuth client
    oauth2Client.setCredentials({
      refresh_token: admin.googleCalendar.refreshToken,
    });

    const calendarClient = google.calendar({
      version: "v3",
      auth: oauth2Client,
    });

    // Prepare event payload
    const event = {
      summary: title,
      description: description || "Team Meeting",
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: "meet-" + Date.now(),
        },
      },
      reminders: { useDefault: true },
    };

    // Insert event to Google Calendar
    const response = await calendarClient.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
       requestBody: event,
    });

    return res.status(200).json({
      success: true,
      message: "Meeting created & invitations sent!",
      eventLink: response.data.htmlLink,
      meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri || null,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Meeting creation failed",
      error: error.message
    });
  }
};

// Handle OAuth callback
export const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;
    // console.log("GOOGLE CALLBACK HIT");
    // console.log("code:", code);
    // console.log("userId from state:", userId);

    if (!code) {
      return res.status(400).json({ message: 'Authorization code missing' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // console.log("google calender token: ", tokens);
    
    // Save tokens to user
    await userModel.findByIdAndUpdate(userId, {
      googleCalendar: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isConnected: true,
        lastSync: new Date()
      }
    });

    // res.json({
    //   success: true,
    //   message: 'Google Calendar connected successfully!'
    // });
    res.redirect(`${process.env.FRONTEND_URL}/calendar?connected=true`);
  } catch (error) {
      console.error("CALENDAR CALLBACK ERROR:", error);
     res.redirect(`${process.env.FRONTEND_URL}/calendar?connected=false`);
  }
};