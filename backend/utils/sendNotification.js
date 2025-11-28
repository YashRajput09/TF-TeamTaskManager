// services/notification.service.js

import Notification from "../models/notification.model.js";
import { io } from "../app.js";

const ICONS = {
  task_assigned: "📋",
  task_submitted: "📤",
  task_approved: "✔️",
  task_rejected: "❌",
  added_to_team: "👥",
  removed_from_team: "🚫",
  default: "🔔",
};

/**
 * Send notification (DB + socket.io)
 */
export async function pushNotification({
  userId,
  title,
  message,
  type = "default",
}) {
  try {
    const icon = ICONS[type] || ICONS.default;

    // 1️⃣ Save to database
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      icon,
    });

    // 2️⃣ Emit real-time notification
    io.to(userId.toString()).emit("notification", {
      id: notification._id,
      title,
      message,
      icon,
      type,
      read: false,
      createdAt: notification.createdAt,
    });

    console.log("🔔 Notification sent:", title);

    return notification;
  } catch (error) {
    console.log("❌ Notification Error:", error);
  }
}
