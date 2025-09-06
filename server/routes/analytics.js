const express = require('express');
const { statements } = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Admin only middleware
const requireAdmin = (req, res, next) => {
  const user = statements.getUserById.get(req.user.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Platform overview analytics
router.get('/overview', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    
    let dateFilter = '';
    switch (timeframe) {
      case 'day':
        dateFilter = "AND created_at >= datetime('now', '-1 day')";
        break;
      case 'week':
        dateFilter = "AND created_at >= datetime('now', '-7 days')";
        break;
      case 'month':
        dateFilter = "AND created_at >= datetime('now', '-30 days')";
        break;
      case 'quarter':
        dateFilter = "AND created_at >= datetime('now', '-90 days')";
        break;
    }

    // Total users
    const totalUsers = statements.db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE 1=1 ${dateFilter}
    `).get();

    // Active users (logged in recently)
    const activeUsers = statements.db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE last_login_at >= datetime('now', '-24 hours')
    `).get();

    // Total sessions
    const totalSessions = statements.db.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE 1=1 ${dateFilter}
    `).get();

    // Revenue
    const revenue = statements.db.prepare(`
      SELECT SUM(amount) as total FROM payments 
      WHERE status = 'completed' ${dateFilter.replace('created_at', 'completed_at')}
    `).get();

    // Average session time
    const avgSessionTime = statements.db.prepare(`
      SELECT AVG(duration) as avg_duration FROM sessions 
      WHERE status = 'completed' ${dateFilter}
    `).get();

    // Popular subjects
    const popularSubjects = statements.db.prepare(`
      SELECT subject, COUNT(*) as session_count,
             ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sessions WHERE 1=1 ${dateFilter}), 1) as percentage
      FROM sessions 
      WHERE 1=1 ${dateFilter}
      GROUP BY subject 
      ORDER BY session_count DESC 
      LIMIT 10
    `).all();

    // Peak hours
    const peakHours = statements.db.prepare(`
      SELECT strftime('%H:00', created_at) as hour, COUNT(*) as sessions
      FROM sessions 
      WHERE 1=1 ${dateFilter}
      GROUP BY strftime('%H', created_at)
      ORDER BY sessions DESC
      LIMIT 8
    `).all();

    res.json({
      success: true,
      analytics: {
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        totalSessions: totalSessions.count,
        revenue: revenue.total || 0,
        avgSessionTime: avgSessionTime.avg_duration || 0,
        popularSubjects,
        peakHours
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to get analytics overview' });
  }
});

// User growth analytics
router.get('/user-growth', authenticateToken, requireAdmin, (req, res) => {
  try {
    const growth = statements.db.prepare(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY date(created_at)) as total_users
      FROM users 
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date
    `).all();

    res.json({ success: true, growth });
  } catch (error) {
    console.error('User growth analytics error:', error);
    res.status(500).json({ error: 'Failed to get user growth analytics' });
  }
});

// Session analytics
router.get('/sessions', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Session completion rates
    const completionRates = statements.db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sessions), 1) as percentage
      FROM sessions 
      GROUP BY status
    `).all();

    // Average session duration by subject
    const durationBySubject = statements.db.prepare(`
      SELECT 
        subject,
        AVG(duration) as avg_duration,
        COUNT(*) as session_count
      FROM sessions 
      WHERE status = 'completed'
      GROUP BY subject
      ORDER BY avg_duration DESC
    `).all();

    // Session ratings distribution
    const ratingsDistribution = statements.db.prepare(`
      SELECT 
        rating,
        COUNT(*) as count
      FROM sessions 
      WHERE rating IS NOT NULL
      GROUP BY rating
      ORDER BY rating
    `).all();

    res.json({
      success: true,
      sessionAnalytics: {
        completionRates,
        durationBySubject,
        ratingsDistribution
      }
    });
  } catch (error) {
    console.error('Session analytics error:', error);
    res.status(500).json({ error: 'Failed to get session analytics' });
  }
});

// Instructor performance analytics
router.get('/instructors', authenticateToken, requireAdmin, (req, res) => {
  try {
    const instructorStats = statements.db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.rating,
        COUNT(s.id) as total_sessions,
        AVG(s.duration) as avg_session_duration,
        AVG(s.rating) as avg_session_rating,
        SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
        SUM(p.amount * 0.8) as total_earnings
      FROM users u
      LEFT JOIN sessions s ON u.id = s.instructor_id
      LEFT JOIN payments p ON s.id = p.session_id AND p.status = 'completed'
      WHERE u.role = 'instructor'
      GROUP BY u.id, u.name, u.rating
      ORDER BY total_sessions DESC
      LIMIT 50
    `).all();

    res.json({ success: true, instructorStats });
  } catch (error) {
    console.error('Instructor analytics error:', error);
    res.status(500).json({ error: 'Failed to get instructor analytics' });
  }
});

// Revenue analytics
router.get('/revenue', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Daily revenue for last 30 days
    const dailyRevenue = statements.db.prepare(`
      SELECT 
        date(completed_at) as date,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM payments 
      WHERE status = 'completed' AND completed_at >= datetime('now', '-30 days')
      GROUP BY date(completed_at)
      ORDER BY date
    `).all();

    // Revenue by subject
    const revenueBySubject = statements.db.prepare(`
      SELECT 
        s.subject,
        SUM(p.amount) as revenue,
        COUNT(p.id) as transactions,
        AVG(p.amount) as avg_transaction
      FROM payments p
      JOIN sessions s ON p.session_id = s.id
      WHERE p.status = 'completed'
      GROUP BY s.subject
      ORDER BY revenue DESC
    `).all();

    // Platform commission
    const totalRevenue = statements.db.prepare(`
      SELECT SUM(amount) as total FROM payments WHERE status = 'completed'
    `).get();

    const platformCommission = totalRevenue.total * 0.2; // 20% commission

    res.json({
      success: true,
      revenueAnalytics: {
        dailyRevenue,
        revenueBySubject,
        totalRevenue: totalRevenue.total || 0,
        platformCommission
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to get revenue analytics' });
  }
});

module.exports = router;