
import express from 'express'
import { isAdmin, isAuthenticated } from '../middleware/authenticateUser.js';
import { approveTask, assignTask, createTask, getAllTask, getSingleAllTask, getUserAllTask, submitTask, updateTaskStatus, searchBlogs } from '../controller/task.controller.js';


const router=express.Router();

router.post("/create-task/:groupId",isAuthenticated,isAdmin,createTask);
router.post("/assign-task/:groupId",isAuthenticated,isAdmin,assignTask);
router.get("/getAll-task/:groupId",isAuthenticated,getAllTask);  //  get all task of group
router.get("/get-user-task",isAuthenticated,getUserAllTask);  //  get all task of user
router.get("/get-single-task/:taskId",isAuthenticated,getSingleAllTask);  //  get all task of loggedIn user

//update status
router.put("/update-status/:taskId",isAuthenticated,updateTaskStatus)
router.put("/:taskId/submit",isAuthenticated,submitTask)
router.put("/:taskId/approve",isAuthenticated,approveTask)

// search
router.route("/api/search").get(searchBlogs);


export default router;