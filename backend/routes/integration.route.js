// routes/integration.route.js
import express from 'express';
import {isAuthenticated} from '../middleware/authenticateUser.js';
import { telegramIntegration } from '../controller/telegramController.js';

const router = express.Router();

router.route('/telegram/link-token').post(isAuthenticated, telegramIntegration);

export default router;
