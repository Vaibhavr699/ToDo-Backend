import Task from '../models/Task.js';
import sendEmail from './emailService.js';
import cron from 'node-cron';

const checkDueTasks = async () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const tasks = await Task.find({
    dueDate: {
      $gte: now,
      $lte: oneHourLater,
    },
    status: { $ne: 'completed' },
  }).populate('user');

  tasks.forEach(async task => {
    await sendEmail({
      email: task.user.email,
      subject: 'Task Due Soon',
      message: `Your task "${task.title}" is due at ${task.dueDate}`,
    });
  });
};

export const scheduleDueDateNotifications = () => {
  // Run every hour
  cron.schedule('0 * * * *', checkDueTasks);
};