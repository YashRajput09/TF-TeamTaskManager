import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { calendarStatus, connectCalendar, syncTaskToCalendar } from '../controllers/calendarController.js';

const router = express.Router();

// Check calendar connection status
router.get('/status', isAuthenticated, calendarStatus);

// Connect Google Calendar
router.get('/connect', isAuthenticated, connectCalendar);

// Sync task to Google Calendar
router.post('/tasks/:taskId/sync', isAuthenticated, syncTaskToCalendar);

export default router;