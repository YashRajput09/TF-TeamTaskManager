import express from 'express'
import { addComment, deleteComment, editComment, getAllComments } from '../controller/comment.controller.js';
import { isAuthenticated } from '../middleware/authenticateUser.js';

const router=express.Router();

router.post("/add-comment/:taskId",isAuthenticated,addComment);
router.get("/getAll-comment/:taskId",isAuthenticated,getAllComments);

router.put("/:taskId/comment/:commentId/edit-comment",isAuthenticated,editComment);
router.delete("/:taskId/comment/:commentId/delete",isAuthenticated,deleteComment);


export default router;
