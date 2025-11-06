import express from 'express'
import { addComment, getAllComments } from '../controller/comment.controller.js';
import { isAuthenticated } from '../middleware/authenticateUser.js';

const router=express.Router();

router.post("/add-comment/:taskId",isAuthenticated,addComment);
router.get("/getAll-comment/:taskId",isAuthenticated,getAllComments);

export default router;
