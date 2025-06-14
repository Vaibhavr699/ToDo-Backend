import Task from '../models/Task.js';
import User from '../models/User.js';
import cron from 'node-cron';
import Notification from '../models/Notification.js';

// Function to check for upcoming task due dates and create notifications
export const checkUpcomingDueDates = async () => {
  try {
    const today = new Date();
    // Set to start of today for comparison
    today.setHours(0, 0, 0, 0);

    // Find tasks due in the next 24 hours (or whatever interval you define)
    // For simplicity, let's say tasks due today or tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      dueDate: { $gte: today, $lte: tomorrow },
      status: { $ne: 'completed' }, // Only consider uncompleted tasks
    });

    for (const task of tasks) {
      const existingNotification = await Notification.findOne({
        task: task._id,
        type: 'upcoming_due_date',
        read: false, // Only if the notification hasn't been read
      });

      if (!existingNotification) {
        // Create a new notification
        const notification = new Notification({
          user: task.user, // Assuming task has a user ID
          task: task._id,
          type: 'warning',
          title: 'Upcoming Task Due',
          message: `Task '${task.title}' is due soon!`, // Customize message
          read: false,
          createdAt: new Date(),
        });
        await notification.save();
        console.log(`Notification created for task: ${task.title}`);
      }
    }
  } catch (error) {
    console.error('Error checking upcoming due dates:', error);
  }
};

// Schedule the cron job to run, for example, every day at midnight
// You can adjust the cron schedule as needed.
// For testing, you might want to run it more frequently, like every minute: '* * * * *'
// Or every hour: '0 * * * *'
export const startDueDateCheckCron = () => {
  cron.schedule('* * * * *', () => { // Runs every minute for testing
    console.log('Running scheduled job: checkUpcomingDueDates');
    checkUpcomingDueDates();
  });
}; 