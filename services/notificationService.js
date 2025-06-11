const Task = require('../models/Task');
const User = require('../models/User');
const cron = require('node-cron');
const { createNotification } = require('../models/Notification');

// Schedule job to run every hour
const scheduleDueDateNotifications = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find tasks that are due soon
      const upcomingTasks = await Task.find({
        dueDate: {
          $gte: now,
          $lte: oneDayFromNow
        },
        status: { $ne: 'completed' }
      }).populate('user', 'email name');

      for (const task of upcomingTasks) {
        const dueDate = new Date(task.dueDate);
        let notificationType = 'info';
        let message = '';
        let priority = 'normal';

        // Determine notification type and message based on due date
        if (dueDate <= oneHourFromNow) {
          notificationType = 'warning';
          message = `Task "${task.title}" is due in less than an hour!`;
          priority = 'high';
        } else if (dueDate <= twoHoursFromNow) {
          notificationType = 'warning';
          message = `Task "${task.title}" is due in 2 hours`;
          priority = 'high';
        } else if (dueDate <= oneDayFromNow) {
          notificationType = 'info';
          message = `Task "${task.title}" is due tomorrow`;
          priority = 'normal';
        }

        // Create notification if it doesn't exist for this time window
        const existingNotification = await Notification.findOne({
          task: task._id,
          type: notificationType,
          createdAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } // Within last hour
        });

        if (!existingNotification) {
          await createNotification({
            user: task.user._id,
            task: task._id,
            type: notificationType,
            title: 'Task Due Soon',
            message,
            priority,
            read: false
          });
        }
      }

      console.log(`[${new Date().toISOString()}] Due date notifications check completed`);
    } catch (error) {
      console.error('Error in due date notification job:', error);
    }
  });
};

module.exports = {
  scheduleDueDateNotifications
}; 