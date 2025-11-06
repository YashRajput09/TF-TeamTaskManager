import express from 'express';
import { isAuthenticated } from '../middleware/authenticateUser.js';
import { registerTelegram, testTelegram } from '../controller/telegramController.js';

const router = express.Router();


router.post('/register-user', isAuthenticated, registerTelegram);

router.get('/test', isAuthenticated, testTelegram);

export default router;