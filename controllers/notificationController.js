import { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead 
} from '../models/Notification.js';

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    console.log('Getting notifications for user:', req.user.id);
    const notifications = await getUserNotifications(req.user.id);
    console.log('Found notifications:', notifications);
    res.status(200).json({ data: notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    console.log('Marking notification as read:', notificationId, 'for user:', req.user.id);
    const notification = await markAsRead(notificationId, req.user.id);
    
    if (!notification) {
      console.log('Notification not found:', notificationId);
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    console.log('Notification marked as read:', notification);
    res.status(200).json({ data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    console.log('Marking all notifications as read for user:', req.user.id);
    await markAllAsRead(req.user.id);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
}; 