
import express from 'express'
import { isAdmin, isAuthenticated } from '../middleware/authenticateUser.js';
import { assignTask, createTask } from '../controller/task.controller.js';


const router=express.Router();

router.post("/create-task/:groupId",isAuthenticated,isAdmin,createTask);
router.post("/assign-task/:groupId",isAuthenticated,isAdmin,assignTask);

export default router;