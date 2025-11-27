import express from "express";
import { isAuthenticated } from "../middleware/authenticateUser.js";
import {
  getMyNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} from "../controller/notification.controller.js";

const router = express.Router();

router.get("/my", isAuthenticated, getMyNotifications);
router.put("/mark-read/:id", isAuthenticated, markRead);
router.put("/mark-all-read", isAuthenticated, markAllRead);
router.delete("/delete/:id", isAuthenticated, deleteNotification);

export default router;
