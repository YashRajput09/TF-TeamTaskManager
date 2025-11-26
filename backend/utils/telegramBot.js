// telegramBot.js
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import User from '../models/user_model.js';
import { Task } from '../models/task.modal.js'; // used for /tasks
dotenv.config();

// 1️⃣ Create bot instance from token in .env
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

/**
 * Small helper: get currently linked user from incoming Telegram message.
 * We use chat.id stored earlier in `user.telegramChatId`.
 */
async function getLinkedUser(ctx) {
  const chatId = ctx.chat.id.toString();

  const user = await User.findOne({ telegramChatId: chatId });

  if (!user) {
    await ctx.reply(
      "⚠️ Your Telegram isn’t linked yet.\n\n" +
      "1️⃣ Go to the web app → Telegram page\n" +
      "2️⃣ Generate a link code\n" +
      "3️⃣ Send that code here or use /verify <code>"
    );
    return null;
  }

  return user;
}

/**
 * Core function to handle link / verify tokens.
 * Used by /link, /verify, and plain text tokens.
 */
async function handleLinkToken(ctx, token) {
  const chatId = ctx.chat.id.toString();

  try {
    const user = await User.findOne({
      telegramLinkToken: token,
      telegramLinkTokenExpiresAt: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return ctx.reply(
        "❌ Invalid or expired link code.\n" +
        "Please generate a new one from the web app (Telegram settings)."
      );
    }

    // Save Telegram chat info on user so later we can send notifications/reminders
    user.telegramChatId = chatId;
    user.telegramLinked = true;
    user.telegramLinkToken = null; // clear used token
    user.telegramLinkTokenExpiresAt = null;
    await user.save();

    return ctx.reply(
      "✅ Your account has been linked!\n" +
      "You will now receive task updates, assignments & reminders here."
    );
  } catch (err) {
    console.error("Error in handleLinkToken:", err);
    return ctx.reply("⚠️ Something went wrong. Try again later.");
  }
}

/* ================================
   /start - intro + guidance
   ================================ */

bot.start((ctx) => {
  ctx.reply(
    "👋 Welcome to *TeamTask Bot*!\n\n" +
    "Here’s how to get started:\n" +
    "1️⃣ Open the web app → Settings → Telegram\n" +
    "2️⃣ Generate your link code\n" +
    "3️⃣ Send that code here or use: /verify <code>\n\n" +
    "Type /help to see all available commands.",
    { parse_mode: "Markdown" }
  );
});

/* ================================
   /help - list all commands
   ================================ */

bot.command("help", (ctx) => {
  ctx.reply(
    "📖 *TeamTask Bot Commands*\n\n" +
    "/start - Begin using TeamTask Bot and get verified\n" +
    "/help - Show all available commands and how to use them\n" +
    "/verify <code> - Paste your token here to verify your account\n" +
    "/tasks - View your current assigned tasks\n" +
    "/addtask - Create a new task quickly (via web app for now)\n" +
    "/updatestatus - Learn how to update a task status\n" +
    "/remindme - Set or manage task reminders\n" +
    "/notifications - Turn task notifications on or off (coming soon)\n" +
    "/team - View your team members and their task summary (coming soon)\n" +
    "/about - Learn more about the TeamTask Bot",
    { parse_mode: "Markdown" }
  );
});

/* ================================
   /link - old name for verification
   (kept for backward compatibility)
   ================================ */

bot.command("link", async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const token = parts[1];

  if (!token) {
    return ctx.reply("Usage: /link <your-code-from-web-app>");
  }

  return handleLinkToken(ctx, token.trim());
});

/* ================================
   /verify - nicer name for link
   ================================ */

bot.command("verify", async (ctx) => {
  const parts = ctx.message.text.split(" ");
  const token = parts[1];

  if (!token) {
    return ctx.reply("Usage: /verify <your-code-from-web-app>");
  }

  return handleLinkToken(ctx, token.trim());
});

/* ================================
   /tasks - show assigned tasks
   ================================ */

bot.command("tasks", async (ctx) => {
  try {
    const user = await getLinkedUser(ctx);
    if (!user) return; // not linked → message already sent

    // Fetch tasks where this user is assignee
    const tasks = await Task.find({
      assignedTo: user._id,
    })
      .sort({ deadline: 1 }) // earliest deadline first
      .limit(10); // avoid spamming too many

    if (!tasks.length) {
      return ctx.reply("✅ You currently have no assigned tasks. Enjoy the free time! 😄");
    }

    let text = "📝 *Your current assigned tasks:*\n\n";

    tasks.forEach((task, index) => {
      const deadlineText = task.deadline
        ? new Date(task.deadline).toLocaleString()
        : "Not set";

      text += `${index + 1}. *${task.title}*\n` +
              `   Status: ${task.status || "Not set"}\n` +
              `   Priority: ${task.priority || "Not set"}\n` +
              `   Deadline: ${deadlineText}\n\n`;
    });

    return ctx.reply(text, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Error in /tasks:", err);
    return ctx.reply("⚠️ Could not fetch your tasks. Please try again later.");
  }
});

/* ================================
   /addtask - quick create
   (for now: explains how, you can later
    wire actual creation via API)
   ================================ */

bot.command("addtask", async (ctx) => {
  const user = await getLinkedUser(ctx);
  if (!user) return;

  return ctx.reply(
    "⚙️ Quick add via bot is coming soon.\n\n" +
    "Right now, please create tasks from the web app:\n" +
    "• Go to *Create Task*\n" +
    "• Choose team, title, priority, and assignee\n\n" +
    "Later we can support something like:\n" +
    "`/addtask <team> | <title> | <deadline>`",
    { parse_mode: "Markdown" }
  );
});

/* ================================
   /updatestatus - explain flow
   (you already update from web UI;
    later you can wire this to your API)
   ================================ */

bot.command("updatestatus", async (ctx) => {
  const user = await getLinkedUser(ctx);
  if (!user) return;

  return ctx.reply(
    "🔄 Status updates currently happen inside the web app.\n\n" +
    "Open a task → change status to *In Progress* / *Pending* / *Completed*.\n\n" +
    "Later we can support:\n" +
    "`/updatestatus <taskId> <NewStatus>`",
    { parse_mode: "Markdown" }
  );
});

/* ================================
   /remindme - reminders info
   (you already have cron-based reminders)
   ================================ */

bot.command("remindme", async (ctx) => {
  const user = await getLinkedUser(ctx);
  if (!user) return;

  return ctx.reply(
    "⏰ Reminders are automatically sent before task deadlines.\n\n" +
    "Soon you'll be able to customize reminders from here, e.g.:\n" +
    "`/remindme <taskId> 30m`\n" +
    "`/remindme <taskId> 1h`",
    { parse_mode: "Markdown" }
  );
});

/* ================================
   /notifications - toggle on/off
   (you can later store a flag on user)
   ================================ */

bot.command("notifications", async (ctx) => {
  const user = await getLinkedUser(ctx);
  if (!user) return;

  // For now just informational – later you can actually toggle a boolean field
  return ctx.reply(
    "🔔 Notification settings from bot are coming soon.\n\n" +
    "Right now, all important task updates & reminders are sent automatically " +
    "if your Telegram is linked."
  );
});

/* ================================
   /team - team summary
   (placeholder until you decide group logic)
   ================================ */

bot.command("team", async (ctx) => {
  const user = await getLinkedUser(ctx);
  if (!user) return;

  return ctx.reply(
    "👥 Team summary from Telegram is not wired yet.\n\n" +
    "Plan:\n" +
    "• Detect which teams you belong to\n" +
    "• Show members + basic task stats\n\n" +
    "Example future command:\n" +
    "`/team` → shows members & how many tasks they have.",
    { parse_mode: "Markdown" }
  );
});

/* ================================
   /about - simple info
   ================================ */

bot.command("about", (ctx) => {
  ctx.reply(
    "ℹ️ *About TeamTask Bot*\n\n" +
    "TeamTask Bot connects your Task Manager with Telegram.\n" +
    "You’ll get:\n" +
    "• New task assignment alerts\n" +
    "• Deadline reminders\n" +
    "• Status & workload updates\n\n" +
    "Built to keep your team aligned without always opening the web app.",
    { parse_mode: "Markdown" }
  );
});

/* ================================
   Plain text handler:
   if user just sends the token without /verify
   ================================ */

bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();

  // If it starts with '/', it's a command → ignore here
  if (text.startsWith("/")) return;

  // Treat plain text as possible link token
  return handleLinkToken(ctx, text);
});

export default bot;
