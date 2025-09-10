const cron = require('node-cron');
const emailService = require('./emailService');
const { statements } = require('../database/db');
const fileUploadService = require('./fileUploadService');

class SchedulerService {
  constructor() {
    this.initializeScheduledTasks();
  }

  initializeScheduledTasks() {
    // Send session reminders every minute
    cron.schedule('* * * * *', () => {
      this.sendSessionReminders();
    });

    // Send weekly summaries every Sunday at 9 AM
    cron.schedule('0 9 * * 0', () => {
      this.sendWeeklySummaries();
    });

    // Clean up old files every day at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.cleanupOldFiles();
    });

    // Update session statuses every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.updateSessionStatuses();
    });

    // Clean expired queue items every 10 minutes
    cron.schedule('*/10 * * * *', () => {
      this.cleanExpiredQueueItems();
    });

    console.log('Scheduled tasks initialized');
  }

  // Send session reminders
  async sendSessionReminders() {
    try {
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

      // Get sessions starting in 10 minutes
      const upcomingSessions = statements.db.prepare(`
        SELECT s.*, 
               l.email as learner_email, l.name as learner_name,
               i.email as instructor_email, i.name as instructor_name
        FROM sessions s
        JOIN users l ON s.learner_id = l.id
        JOIN users i ON s.instructor_id = i.id
        WHERE s.status = 'scheduled'
        AND s.started_at BETWEEN ? AND ?
        AND s.reminder_sent = 0
      `).all(now.toISOString(), tenMinutesFromNow.toISOString());

      for (const session of upcomingSessions) {
        const sessionData = {
          id: session.id,
          subject: session.subject,
          topic: session.topic,
          instructorName: session.instructor_name,
          startTime: session.started_at,
          duration: session.duration
        };

        // Send reminders to both learner and instructor
        await Promise.all([
          emailService.sendSessionReminder(session.learner_email, sessionData),
          emailService.sendSessionReminder(session.instructor_email, sessionData)
        ]);

        // Mark reminder as sent
        statements.db.prepare('UPDATE sessions SET reminder_sent = 1 WHERE id = ?').run(session.id);
      }

      if (upcomingSessions.length > 0) {
        console.log(`Sent ${upcomingSessions.length} session reminders`);
      }
    } catch (error) {
      console.error('Send session reminders error:', error);
    }
  }

  // Send weekly summaries
  async sendWeeklySummaries() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get users who had activity in the past week
      const activeUsers = statements.db.prepare(`
        SELECT DISTINCT u.id, u.email, u.name, u.role
        FROM users u
        JOIN sessions s ON (u.id = s.learner_id OR u.id = s.instructor_id)
        WHERE s.created_at >= ?
        AND u.preferences LIKE '%"emailUpdates":true%'
      `).all(oneWeekAgo.toISOString());

      for (const user of activeUsers) {
        const summaryData = await this.generateWeeklySummary(user.id, oneWeekAgo);
        
        if (summaryData.sessionsCompleted > 0) {
          await emailService.sendWeeklySummary(user.email, {
            userName: user.name,
            ...summaryData
          });
        }
      }

      console.log(`Sent weekly summaries to ${activeUsers.length} users`);
    } catch (error) {
      console.error('Send weekly summaries error:', error);
    }
  }

  // Generate weekly summary data
  async generateWeeklySummary(userId, fromDate) {
    try {
      const sessions = statements.db.prepare(`
        SELECT * FROM sessions 
        WHERE (learner_id = ? OR instructor_id = ?) 
        AND created_at >= ? 
        AND status = 'completed'
      `).all(userId, userId, fromDate.toISOString());

      const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const subjects = sessions.map(s => s.subject);
      const topSubject = this.getMostFrequent(subjects) || 'Various';

      return {
        sessionsCompleted: sessions.length,
        hoursLearned: Math.round(totalDuration / 60 * 10) / 10,
        topSubject
      };
    } catch (error) {
      console.error('Generate weekly summary error:', error);
      return { sessionsCompleted: 0, hoursLearned: 0, topSubject: 'None' };
    }
  }

  // Clean up old files
  async cleanupOldFiles() {
    try {
      const result = await fileUploadService.cleanupOldFiles(30); // 30 days old
      if (result.success) {
        console.log(`Cleaned up ${result.deletedCount} old files`);
      }
    } catch (error) {
      console.error('Cleanup old files error:', error);
    }
  }

  // Update session statuses
  updateSessionStatuses() {
    try {
      const now = new Date();

      // Mark scheduled sessions as active if they should have started
      const startedSessions = statements.db.prepare(`
        UPDATE sessions 
        SET status = 'active', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'scheduled' 
        AND started_at <= ?
      `).run(now.toISOString());

      // Mark active sessions as completed if they've exceeded expected duration + buffer
      const completedSessions = statements.db.prepare(`
        UPDATE sessions 
        SET status = 'completed', ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE status = 'active' 
        AND datetime(started_at, '+' || (duration + 15) || ' minutes') <= ?
      `).run(now.toISOString());

      if (startedSessions.changes > 0 || completedSessions.changes > 0) {
        console.log(`Updated ${startedSessions.changes} sessions to active, ${completedSessions.changes} to completed`);
      }
    } catch (error) {
      console.error('Update session statuses error:', error);
    }
  }

  // Clean expired queue items
  cleanExpiredQueueItems() {
    try {
      const now = new Date();
      
      const result = statements.db.prepare(`
        DELETE FROM session_queue 
        WHERE expires_at <= ? OR created_at <= datetime('now', '-30 minutes')
      `).run(now.toISOString());

      if (result.changes > 0) {
        console.log(`Cleaned ${result.changes} expired queue items`);
      }
    } catch (error) {
      console.error('Clean expired queue items error:', error);
    }
  }

  // Helper method to find most frequent item in array
  getMostFrequent(arr) {
    if (arr.length === 0) return null;
    
    const frequency = {};
    let maxCount = 0;
    let mostFrequent = null;

    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
      if (frequency[item] > maxCount) {
        maxCount = frequency[item];
        mostFrequent = item;
      }
    });

    return mostFrequent;
  }

  // Manual trigger methods for testing
  async triggerSessionReminders() {
    await this.sendSessionReminders();
  }

  async triggerWeeklySummaries() {
    await this.sendWeeklySummaries();
  }

  async triggerCleanup() {
    await this.cleanupOldFiles();
  }
}

module.exports = new SchedulerService();