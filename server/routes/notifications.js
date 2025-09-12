const express = require('express');
const nodemailer = require('nodemailer');
const { statements } = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@i-instructor.com',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Get user notifications
router.get('/', authenticateToken, (req, res) => {
  try {
    const notifications = statements.db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(req.user.userId);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, (req, res) => {
  try {
    statements.db.prepare(`
      UPDATE notifications 
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `).run(req.params.notificationId, req.user.userId);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Send session reminder emails
router.post('/session-reminder', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    const session = statements.db.prepare(`
      SELECT s.*, l.email as learner_email, l.name as learner_name,
             i.email as instructor_email, i.name as instructor_name
      FROM sessions s
      JOIN users l ON s.learner_id = l.id
      JOIN users i ON s.instructor_id = i.id
      WHERE s.id = ?
    `).get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Send reminder to both learner and instructor
    const reminderHtml = `
      <h2>Session Reminder - i-Instructor</h2>
      <p>Your session is starting soon!</p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${session.subject} - ${session.topic}</h3>
        <p><strong>Instructor:</strong> ${session.instructor_name}</p>
        <p><strong>Student:</strong> ${session.learner_name}</p>
        <p><strong>Time:</strong> ${new Date(session.started_at).toLocaleString()}</p>
      </div>
      <p>Join your session from your dashboard.</p>
    `;

    await Promise.all([
      sendEmail(session.learner_email, 'Session Starting Soon', reminderHtml),
      sendEmail(session.instructor_email, 'Session Starting Soon', reminderHtml)
    ]);

    res.json({ success: true, message: 'Reminder emails sent' });
  } catch (error) {
    console.error('Session reminder error:', error);
    res.status(500).json({ error: 'Failed to send session reminders' });
  }
});

// Update notification preferences
router.put('/preferences', authenticateToken, (req, res) => {
  try {
    const { emailNotifications, pushNotifications, sessionReminders } = req.body;
    
    const preferences = {
      emailNotifications: emailNotifications !== false,
      pushNotifications: pushNotifications !== false,
      sessionReminders: sessionReminders !== false
    };

    statements.db.prepare(`
      UPDATE users 
      SET notification_preferences = ?
      WHERE id = ?
    `).run(JSON.stringify(preferences), req.user.userId);

    res.json({ success: true, message: 'Notification preferences updated' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;