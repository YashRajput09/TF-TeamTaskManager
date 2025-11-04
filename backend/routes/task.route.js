
import express from 'express'
import { isAdmin, isAuthenticated } from '../middleware/authenticateUser.js';
import { assignTask, createTask, getAllTask, getSingleAllTask, getUserAllTask } from '../controller/task.controller.js';


const router=express.Router();

router.post("/create-task/:groupId",isAuthenticated,isAdmin,createTask);
router.post("/assign-task/:groupId",isAuthenticated,isAdmin,assignTask);
router.get("/getAll-task/:groupId",isAuthenticated,getAllTask);  //  get all task of group
router.get("/get-user-task",isAuthenticated,getUserAllTask);  //  get all task of group
router.get("/get-single-task/:taskId",isAuthenticated,getSingleAllTask);  //  get all task of group

export default router;