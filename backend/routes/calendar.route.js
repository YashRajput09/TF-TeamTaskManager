import express from 'express';
import { isAuthenticated } from '../middleware/authenticateUser.js';
import { 
  calendarStatus, 
  connectCalendar, 
  handleCallback,
  syncTaskToCalendar,
  disconnectCalendar,
  getCalendarEvents,
  bulkSyncTasks,
  removeTaskFromCalendar
} from '../controller/calendarController.js';

const router = express.Router();

// Check calendar connection status
router.get('/status', isAuthenticated, calendarStatus);

// Connect Google Calendar
router.get('/connect', isAuthenticated, connectCalendar);

// OAuth callback handler
router.get('/callback', handleCallback);

// Disconnect Google Calendar
router.delete('/disconnect', isAuthenticated, disconnectCalendar);

// Get calendar events
router.get('/events', isAuthenticated, getCalendarEvents);

// Sync task to Google Calendar
router.post('/tasks/:taskId/sync', isAuthenticated, syncTaskToCalendar);

// Remove task from calendar
router.delete('/tasks/:taskId/calendar-event', isAuthenticated, removeTaskFromCalendar);

// Bulk sync tasks
router.post('/groups/:groupId/sync-bulk', isAuthenticated, bulkSyncTasks);

export default router;