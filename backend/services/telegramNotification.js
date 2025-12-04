import bot from "../utils/telegramBot.js";
import User from "../models/user_model.js";

// This function sends a "task assigned" notification to the given user
export const sendTaskNotification = async (userId, task) => {
  // 1. Find the user to get their telegramChatId
  const user = await User.findById(userId);

  // If user not found or not linked with Telegram, do nothing
  if (!user || !user.telegramChatId) return;

  const deadlineText = task.deadline
    ? new Date(task.deadline).toLocaleString()
    : "Not set";
    
    
  const text = `🆕 *New Task Assigned*\n\n` +
    `*Title:* ${task.title}\n` +
    `*Priority:* ${task.priority || "Not set"}\n` +
    `*Deadline:* ${deadlineText}`;
  try {
    await bot.telegram.sendMessage(user.telegramChatId, text, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error("Error sending Telegram task notification:", err);
  }
};
