const nodemailer = require('nodemailer');
const { statements } = require('../database/db');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send session reminder email
  async sendSessionReminder(userEmail, sessionData, reminderType = '10min') {
    const subject = `Session Reminder - ${sessionData.subject}`;
    const html = this.generateSessionReminderHTML(sessionData, reminderType);
    
    return this.sendEmail(userEmail, subject, html);
  }

  // Send session completion email
  async sendSessionCompletionEmail(learnerEmail, instructorEmail, sessionData) {
    const learnerSubject = 'Session Completed - Please Rate Your Experience';
    const instructorSubject = 'Session Completed - Payment Processed';
    
    const learnerHTML = this.generateSessionCompletionHTML(sessionData, 'learner');
    const instructorHTML = this.generateSessionCompletionHTML(sessionData, 'instructor');
    
    await Promise.all([
      this.sendEmail(learnerEmail, learnerSubject, learnerHTML),
      this.sendEmail(instructorEmail, instructorSubject, instructorHTML)
    ]);
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, userData) {
    const subject = `Welcome to i-Instructor, ${userData.name}!`;
    const html = this.generateWelcomeHTML(userData);
    
    return this.sendEmail(userEmail, subject, html);
  }

  // Send payment confirmation
  async sendPaymentConfirmation(userEmail, paymentData) {
    const subject = 'Payment Confirmation - i-Instructor';
    const html = this.generatePaymentConfirmationHTML(paymentData);
    
    return this.sendEmail(userEmail, subject, html);
  }

  // Send weekly summary
  async sendWeeklySummary(userEmail, summaryData) {
    const subject = 'Your Weekly Learning Summary';
    const html = this.generateWeeklySummaryHTML(summaryData);
    
    return this.sendEmail(userEmail, subject, html);
  }

  // Core email sending method
  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@i-instructor.com',
        to,
        subject,
        html
      });
      
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  // HTML Templates
  generateSessionReminderHTML(sessionData, reminderType) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .session-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>i-Instructor Session Reminder</h1>
          </div>
          <div class="content">
            <h2>Your session is starting ${reminderType === '10min' ? 'in 10 minutes' : 'soon'}!</h2>
            <div class="session-details">
              <h3>${sessionData.subject} - ${sessionData.topic}</h3>
              <p><strong>Instructor:</strong> ${sessionData.instructorName}</p>
              <p><strong>Time:</strong> ${new Date(sessionData.startTime).toLocaleString()}</p>
              <p><strong>Duration:</strong> ${sessionData.duration} minutes</p>
            </div>
            <p>Click the button below to join your session:</p>
            <a href="${process.env.CLIENT_URL}/session/${sessionData.id}" class="button">Join Session</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateSessionCompletionHTML(sessionData, userType) {
    const isLearner = userType === 'learner';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Session Completed Successfully!</h1>
          </div>
          <div class="content">
            <h2>${sessionData.subject} - ${sessionData.topic}</h2>
            <p><strong>Duration:</strong> ${sessionData.duration} minutes</p>
            <p><strong>Cost:</strong> $${sessionData.price}</p>
            
            ${isLearner ? `
              <p>We hope you found this session helpful! Please take a moment to rate your experience:</p>
              <a href="${process.env.CLIENT_URL}/rate-session/${sessionData.id}" class="button">Rate Session</a>
            ` : `
              <p>Great job helping a student learn! Your payment of $${(sessionData.price * 0.8).toFixed(2)} has been processed.</p>
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Earnings</a>
            `}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeHTML(userData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { background: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to i-Instructor!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userData.name},</h2>
            <p>Welcome to i-Instructor, Bangladesh's premier peer-to-peer learning platform!</p>
            
            ${userData.role === 'learner' ? `
              <p>As a learner, you can:</p>
              <ul>
                <li>Get instant help with any academic problem</li>
                <li>Connect with qualified instructors in 2 minutes</li>
                <li>Access our growing knowledge base</li>
                <li>Schedule sessions at your convenience</li>
              </ul>
              <a href="${process.env.CLIENT_URL}/get-help" class="button">Get Help Now</a>
            ` : `
              <p>As an instructor, you can:</p>
              <ul>
                <li>Help students and earn money</li>
                <li>Set your own availability</li>
                <li>Build your reputation and rating</li>
                <li>Contribute to the knowledge base</li>
              </ul>
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">Start Teaching</a>
            `}
            
            <a href="${process.env.CLIENT_URL}/knowledge" class="button">Browse Knowledge Base</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePaymentConfirmationHTML(paymentData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .payment-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmation</h1>
          </div>
          <div class="content">
            <h2>Payment Successful!</h2>
            <div class="payment-details">
              <p><strong>Amount:</strong> $${paymentData.amount}</p>
              <p><strong>Session:</strong> ${paymentData.subject} - ${paymentData.topic}</p>
              <p><strong>Instructor:</strong> ${paymentData.instructorName}</p>
              <p><strong>Date:</strong> ${new Date(paymentData.date).toLocaleString()}</p>
              <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
            </div>
            <p>Thank you for using i-Instructor!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWeeklySummaryHTML(summaryData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .stat-box { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center; }
          .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Weekly Learning Summary</h1>
          </div>
          <div class="content">
            <h2>Great progress this week, ${summaryData.userName}!</h2>
            
            <div class="stat-box">
              <h3>${summaryData.sessionsCompleted}</h3>
              <p>Sessions Completed</p>
            </div>
            
            <div class="stat-box">
              <h3>${summaryData.hoursLearned}</h3>
              <p>Hours Learned</p>
            </div>
            
            <div class="stat-box">
              <h3>${summaryData.topSubject}</h3>
              <p>Most Studied Subject</p>
            </div>
            
            <p>Keep up the excellent work! Ready for another week of learning?</p>
            <a href="${process.env.CLIENT_URL}/get-help" class="button">Continue Learning</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();