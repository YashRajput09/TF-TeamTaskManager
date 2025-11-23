import express from 'express';
import { isAuthenticated } from '../middleware/authenticateUser.js';
import { calendarStatus, connectCalendar, syncTaskToCalendar, createGroupMeeting, handleCallback} from '../controller/calendarController.js';

const router = express.Router();

// Check calendar connection status
router.get('/status', isAuthenticated, calendarStatus);

// Connect Google Calendar
router.get('/connect', isAuthenticated, connectCalendar);

// Sync task to Google Calendar
router.post('/tasks/:taskId/sync', isAuthenticated, syncTaskToCalendar);

// Create Meeting for Entire Group
router.post("/group/meeting", isAuthenticated, createGroupMeeting);

router.get("/callback", handleCallback);


export default router;