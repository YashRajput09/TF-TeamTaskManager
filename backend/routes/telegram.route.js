import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { registerTelegram, testTelegram } from '../controllers/telegramController.js';

const router = express.Router();

// Register Telegram chat ID
router.post('/register-user', isAuthenticated, registerTelegram);

// Test Telegram connection
router.get('/test', isAuthenticated, testTelegram);

export default router;