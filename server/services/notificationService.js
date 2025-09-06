const { statements } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Create and send notification
  async createNotification(userId, title, message, type = 'system', data = {}) {
    try {
      const notificationId = uuidv4();
      
      // Save to database
      statements.db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, data)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(notificationId, userId, title, message, type, JSON.stringify(data));

      const notification = {
        id: notificationId,
        title,
        message,
        type,
        data,
        created_at: new Date().toISOString(),
        is_read: false
      };

      // Send real-time notification
      this.io.to(`user_${userId}`).emit('notification', notification);

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      return null;
    }
  }

  // Session-related notifications
  async notifySessionMatched(learnerId, instructorId, sessionData) {
    await Promise.all([
      this.createNotification(
        learnerId,
        'Instructor Found!',
        `${sessionData.instructorName} is ready to help with ${sessionData.subject}`,
        'session',
        { sessionId: sessionData.id, action: 'join_session' }
      ),
      this.createNotification(
        instructorId,
        'New Student Matched',
        `Help a student with ${sessionData.subject} - ${sessionData.topic}`,
        'session',
        { sessionId: sessionData.id, action: 'join_session' }
      )
    ]);
  }

  async notifySessionStarting(sessionId, participants) {
    const session = statements.getSessionById.get(sessionId);
    if (!session) return;

    for (const userId of participants) {
      await this.createNotification(
        userId,
        'Session Starting Soon',
        `Your ${session.subject} session starts in 10 minutes`,
        'reminder',
        { sessionId, action: 'join_session' }
      );
    }
  }

  async notifySessionCompleted(sessionId, learnerId, instructorId) {
    const session = statements.getSessionById.get(sessionId);
    if (!session) return;

    await Promise.all([
      this.createNotification(
        learnerId,
        'Session Completed',
        'Please rate your learning experience',
        'session',
        { sessionId, action: 'rate_session' }
      ),
      this.createNotification(
        instructorId,
        'Session Completed',
        'Great job helping a student learn!',
        'session',
        { sessionId, action: 'view_earnings' }
      )
    ]);
  }

  // Payment notifications
  async notifyPaymentReceived(instructorId, amount, sessionData) {
    await this.createNotification(
      instructorId,
      'Payment Received',
      `You earned $${amount.toFixed(2)} from your ${sessionData.subject} session`,
      'payment',
      { amount, sessionId: sessionData.id }
    );
  }

  async notifyPayoutProcessed(instructorId, amount, method) {
    await this.createNotification(
      instructorId,
      'Payout Processed',
      `$${amount.toFixed(2)} has been sent to your ${method} account`,
      'payment',
      { amount, method }
    );
  }

  // System notifications
  async notifySystemMaintenance(userIds, scheduledTime) {
    const message = `System maintenance scheduled for ${scheduledTime}. Sessions may be temporarily unavailable.`;
    
    for (const userId of userIds) {
      await this.createNotification(
        userId,
        'Scheduled Maintenance',
        message,
        'system'
      );
    }
  }

  async notifyNewFeature(userIds, featureName, description) {
    for (const userId of userIds) {
      await this.createNotification(
        userId,
        `New Feature: ${featureName}`,
        description,
        'system',
        { feature: featureName }
      );
    }
  }

  // Bulk notifications
  async sendBulkNotification(userIds, title, message, type = 'system', data = {}) {
    const notifications = [];
    
    for (const userId of userIds) {
      const notification = await this.createNotification(userId, title, message, type, data);
      if (notification) {
        notifications.push(notification);
      }
    }
    
    return notifications;
  }

  // Get notification statistics
  getNotificationStats(userId) {
    try {
      const stats = statements.db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
          SUM(CASE WHEN type = 'session' THEN 1 ELSE 0 END) as session_notifications,
          SUM(CASE WHEN type = 'payment' THEN 1 ELSE 0 END) as payment_notifications,
          SUM(CASE WHEN type = 'system' THEN 1 ELSE 0 END) as system_notifications
        FROM notifications 
        WHERE user_id = ?
      `).get(userId);

      return stats;
    } catch (error) {
      console.error('Get notification stats error:', error);
      return null;
    }
  }

  // Mark notifications as read
  markAsRead(notificationIds, userId) {
    try {
      const placeholders = notificationIds.map(() => '?').join(',');
      statements.db.prepare(`
        UPDATE notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP 
        WHERE id IN (${placeholders}) AND user_id = ?
      `).run(...notificationIds, userId);

      return true;
    } catch (error) {
      console.error('Mark notifications as read error:', error);
      return false;
    }
  }

  // Clean old notifications
  cleanOldNotifications(daysOld = 30) {
    try {
      const result = statements.db.prepare(`
        DELETE FROM notifications 
        WHERE created_at < datetime('now', '-${daysOld} days')
      `).run();

      console.log(`Cleaned ${result.changes} old notifications`);
      return result.changes;
    } catch (error) {
      console.error('Clean old notifications error:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;