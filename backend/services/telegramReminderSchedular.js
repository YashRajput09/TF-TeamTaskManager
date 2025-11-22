// reminderScheduler.js
import cron from 'node-cron';
import {Task} from '../models/task.modal.js';
import { sendTaskNotification } from './telegramNotification.js';

const REMINDER_BEFORE_MINUTES = 24; // send reminder 30 mins before due

export const startReminderScheduler = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const threshold = new Date(
        now.getTime() + REMINDER_BEFORE_MINUTES * 60 * 60 * 1000
      );

      // Find tasks that:
      // - are not completed
      // - have dueDate between now and threshold
      // - have not had reminder sent yet
      const tasks = await Task.find({
        status: { $ne: 'completed' },
        dueDate: { $lte: threshold, $gte: now },
        reminderSent: { $ne: true },
      });

      for (const task of tasks) {
        if (task.assignee) {
          await sendTaskNotification(
            task.assignee,
            `⏰ *Reminder*\n\nTask *"${task.title}"* is due at *${new Date(
              task.dueDate
            ).toLocaleString()}*.`
          );
        }

        // Mark reminder as sent so we don't spam multiple times
        task.reminderSent = true;
        await task.save();
      }
    } catch (err) {
      console.error('Error in reminder scheduler:', err);
    }
  });
};
