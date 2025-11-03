
import express from 'express'
import { isAdmin, isAuthenticated } from '../middleware/authenticateUser.js';
import { createTask } from '../controller/task.controller.js';


const router=express.Router();

router.post("/create-task/:groupId",isAuthenticated,isAdmin,createTask);

export default router;