import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  type: {
    type: String,
    enum: ['due_soon', 'overdue', 'completed', 'updated'],
    default: 'due_soon'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  read: {
    type: Boolean,
    default: false
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create notification
export const createNotification = async (notificationData) => {
  try {
    console.log('Creating notification:', notificationData);
    const notification = new Notification(notificationData);
    await notification.save();
    console.log('Notification created:', notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    console.log('Getting notifications for user:', userId);
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('task', 'title dueDate status');
    console.log('Found notifications:', notifications.length);
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
  try {
    console.log('Marking notification as read:', notificationId, 'for user:', userId);
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
    console.log('Notification updated:', notification);
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (userId) => {
  try {
    console.log('Marking all notifications as read for user:', userId);
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
    console.log('Notifications updated:', result);
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get due notifications
export const getDueNotifications = async () => {
  try {
    const now = new Date();
    const notifications = await Notification.find({
      scheduledFor: { $lte: now },
      sent: false
    }).populate('user', 'email').populate('task', 'title dueDate status');
    return notifications;
  } catch (error) {
    console.error('Error getting due notifications:', error);
    throw error;
  }
};

// Mark notification as sent
export const markAsSent = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { sent: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    throw error;
  }
};

// Create task notifications
export const createTaskNotifications = async (task) => {
  try {
    const notifications = [];
    const dueDate = new Date(task.dueDate);
    const now = new Date();

    // Only create notifications for future tasks
    if (dueDate > now) {
      // Notification for 1 day before
      const oneDayBefore = new Date(dueDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      if (oneDayBefore > now) {
        notifications.push({
          user: task.user,
          task: task._id,
          type: 'due_soon',
          title: 'Task Due Tomorrow',
          message: `Your task "${task.title}" is due tomorrow.`,
          priority: 'high',
          scheduledFor: oneDayBefore
        });
      }

      // Notification for 1 hour before
      const oneHourBefore = new Date(dueDate);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);
      if (oneHourBefore > now) {
        notifications.push({
          user: task.user,
          task: task._id,
          type: 'due_soon',
          title: 'Task Due in 1 Hour',
          message: `Your task "${task.title}" is due in 1 hour.`,
          priority: 'high',
          scheduledFor: oneHourBefore
        });
      }
    }

    // Create all notifications
    const createdNotifications = await Notification.insertMany(notifications);
    console.log('Created task notifications:', createdNotifications.length);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating task notifications:', error);
    throw error;
  }
};

// Delete old notifications (older than 30 days)
export const deleteOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log('Deleting notifications older than:', thirtyDaysAgo);
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log('Deleted notifications:', result);
    return result;
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    throw error;
  }
};

// After Notification.create in notifyAllDueTasks, keep only 10 most recent notifications per user
notificationSchema.post('save', async function(doc) {
  try {
    const userId = doc.user;
    const notifications = await mongoose.model('Notification').find({ user: userId }).sort({ createdAt: -1 });
    if (notifications.length > 10) {
      const toDelete = notifications.slice(10);
      const idsToDelete = toDelete.map(n => n._id);
      await mongoose.model('Notification').deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (err) {
    console.error('Error deleting old notifications:', err);
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 