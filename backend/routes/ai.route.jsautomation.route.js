import express from 'express';
import { isAuthenticated, isAdmin } from '../middlewares/auth.js';
import { analyzeWorkload, autoRedistributeTasks } from '../controllers/automationController.js';

const router = express.Router();

//  AI Workload Analysis
router.get('/groups/:groupId/workload-analysis', isAuthenticated, isAdmin, analyzeWorkload);

//  Auto Redistribution
router.post('/groups/:groupId/auto-redistribute', isAuthenticated, isAdmin, autoRedistributeTasks);

export default router;