import Task from '../models/Task.js';
import User from '../models/User.js';
import cron from 'node-cron';
import Notification, { getDueNotifications, markAsSent } from '../models/Notification.js';
import { createTaskNotifications } from '../models/Notification.js';

// Function to check for upcoming tasks and create notifications
const checkUpcomingTasks = async () => {
  try {
    console.log('Checking for upcoming tasks...');
    const now = new Date();
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // Find tasks due in the next 24 hours
    const upcomingTasks = await Task.find({
      dueDate: { $gte: now, $lte: oneDayFromNow },
      status: { $ne: 'completed' }
    });

    console.log(`Found ${upcomingTasks.length} upcoming tasks`);

    // Create notifications for each task
    for (const task of upcomingTasks) {
      await createTaskNotifications(task);
    }
  } catch (error) {
    console.error('Error checking upcoming tasks:', error);
  }
};

// Function to process due notifications
const processDueNotifications = async () => {
  try {
    console.log('Processing due notifications...');
    const dueNotifications = await getDueNotifications();
    console.log(`Found ${dueNotifications.length} due notifications`);

    for (const notification of dueNotifications) {
      // Here you would typically send the notification to the user
      // For now, we'll just mark it as sent
      await markAsSent(notification._id);
      console.log(`Processed notification for task: ${notification.task.title}`);
    }
  } catch (error) {
    console.error('Error processing due notifications:', error);
  }
};

// Schedule jobs
const scheduleNotificationJobs = () => {
  // Check for upcoming tasks every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running scheduled task check...');
    checkUpcomingTasks();
  });

  // Process due notifications every minute
  cron.schedule('* * * * *', () => {
    console.log('Running scheduled notification processing...');
    processDueNotifications();
  });
};

// Initialize notification service
const initializeNotificationService = () => {
  console.log('Initializing notification service...');
  scheduleNotificationJobs();
  // Run initial checks
  checkUpcomingTasks();
  processDueNotifications();
};

// Notify all due/overdue tasks every minute
const notifyAllDueTasks = async () => {
  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    // Find all tasks due within the next hour or overdue and not completed
    const tasks = await Task.find({
      dueDate: { $lte: oneHourFromNow },
      status: { $ne: 'completed' }
    });
    for (const task of tasks) {
      // Only create a notification if the last one for this task and type was more than 1 min ago
      const lastNotif = await Notification.findOne({
        task: task._id,
        user: task.user,
        type: task.dueDate < now ? 'overdue' : 'due_soon'
      }).sort({ createdAt: -1 });
      if (!lastNotif || (new Date() - new Date(lastNotif.createdAt)) > 60 * 1000) {
        await Notification.create({
          user: task.user,
          task: task._id,
          type: task.dueDate < now ? 'overdue' : 'due_soon',
          title: task.dueDate < now ? 'Task Overdue' : 'Task Due Soon',
          message: `Your task "${task.title}" is ${task.dueDate < now ? 'overdue' : 'due soon'}!`,
          priority: 'high',
          scheduledFor: now,
          read: false,
          sent: false
        });
      }
    }
  } catch (error) {
    console.error('Error notifying due tasks:', error);
  }
};

// Schedule the job to run every minute
cron.schedule('* * * * *', () => {
  notifyAllDueTasks();
});

export default {
  initializeNotificationService,
  checkUpcomingTasks,
  processDueNotifications,
  notifyAllDueTasks
}; 