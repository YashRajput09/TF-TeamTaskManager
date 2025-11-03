
import express from 'express'
import { isAdmin, isAuthenticated } from '../middleware/authenticateUser';


const router=express.Router();

// router.post("create-task",isAuthenticated,isAdmin,createTask)

export default router;