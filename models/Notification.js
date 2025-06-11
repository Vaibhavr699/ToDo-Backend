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
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info'
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

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 