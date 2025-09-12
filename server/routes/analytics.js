const express = require('express');
const { statements, db } = require('../database/db');
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
    const totalUsers = db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE 1=1 ${dateFilter}
    `).get();

    // Active users (logged in recently)
    const activeUsers = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE last_login_at >= datetime('now', '-24 hours')
    `).get();

    // Total sessions
    const totalSessions = db.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE 1=1 ${dateFilter}
    `).get();

    // Revenue
    const revenue = db.prepare(`
      SELECT SUM(amount) as total FROM payments 
      WHERE status = 'completed' ${dateFilter.replace('created_at', 'completed_at')}
    `).get();

    // Average session time
    const avgSessionTime = db.prepare(`
      SELECT AVG(duration) as avg_duration FROM sessions 
      WHERE status = 'completed' ${dateFilter}
    `).get();

    // Popular subjects
    const popularSubjects = db.prepare(`
      SELECT subject, COUNT(*) as session_count,
             ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sessions WHERE 1=1 ${dateFilter}), 1) as percentage
      FROM sessions 
      WHERE 1=1 ${dateFilter}
      GROUP BY subject 
      ORDER BY session_count DESC 
      LIMIT 10
    `).all();

    // Peak hours
    const peakHours = db.prepare(`
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
    const growth = db.prepare(`
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
    const completionRates = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sessions), 1) as percentage
      FROM sessions 
      GROUP BY status
    `).all();

    // Average session duration by subject
    const durationBySubject = db.prepare(`
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
    const ratingsDistribution = db.prepare(`
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
    const instructorStats = db.prepare(`
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
    const dailyRevenue = db.prepare(`
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
    const revenueBySubject = db.prepare(`
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
    const totalRevenue = db.prepare(`
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

// Admin dashboard overview (combines multiple stats for dashboard)
router.get('/dashboard', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Get current stats
    const totalUsers = db.prepare(`SELECT COUNT(*) as count FROM users`).get();
    const activeUsers = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE is_online = 1 OR last_login_at >= datetime('now', '-1 hour')
    `).get();
    const totalSessions = db.prepare(`SELECT COUNT(*) as count FROM sessions`).get();
    const completedSessions = db.prepare(`
      SELECT COUNT(*) as count FROM sessions WHERE status = 'completed'
    `).get();
    
    // Revenue
    const revenue = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'
    `).get();
    
    // Average session time
    const avgSessionTime = db.prepare(`
      SELECT COALESCE(AVG(duration), 0) as avg_duration FROM sessions 
      WHERE status = 'completed' AND duration > 0
    `).get();
    
    // Recent sessions (last 10)
    const recentSessions = db.prepare(`
      SELECT 
        s.id,
        s.subject,
        s.duration,
        s.status,
        s.price,
        s.created_at,
        l.name as learner_name,
        i.name as instructor_name
      FROM sessions s
      LEFT JOIN users l ON s.learner_id = l.id
      LEFT JOIN users i ON s.instructor_id = i.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `).all();
    
    // User role distribution
    const usersByRole = db.prepare(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role
    `).all();
    
    // Growth stats (compared to last month)
    const thisMonthUsers = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= datetime('now', 'start of month')
    `).get();
    
    const lastMonthUsers = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= datetime('now', 'start of month', '-1 month')
      AND created_at < datetime('now', 'start of month')
    `).get();
    
    const thisMonthSessions = db.prepare(`
      SELECT COUNT(*) as count FROM sessions 
      WHERE created_at >= datetime('now', 'start of month')
    `).get();
    
    const lastMonthSessions = db.prepare(`
      SELECT COUNT(*) as count FROM sessions 
      WHERE created_at >= datetime('now', 'start of month', '-1 month')
      AND created_at < datetime('now', 'start of month')
    `).get();
    
    // Calculate growth percentages
    const userGrowth = lastMonthUsers.count > 0 
      ? ((thisMonthUsers.count - lastMonthUsers.count) / lastMonthUsers.count * 100).toFixed(1)
      : 0;
    
    const sessionGrowth = lastMonthSessions.count > 0
      ? ((thisMonthSessions.count - lastMonthSessions.count) / lastMonthSessions.count * 100).toFixed(1)
      : 0;
    
    // Dispute rate (assuming we don't have disputes table, set to 0)
    const disputeRate = 0; // Can be updated when disputes feature is implemented
    
    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers: totalUsers.count,
          activeUsers: activeUsers.count,
          totalSessions: totalSessions.count,
          completedSessions: completedSessions.count,
          revenue: revenue.total,
          avgSessionTime: Math.round(avgSessionTime.avg_duration || 0),
          disputeRate,
          userGrowth: parseFloat(userGrowth),
          sessionGrowth: parseFloat(sessionGrowth)
        },
        recentSessions: recentSessions.map(session => ({
          id: session.id,
          learner: session.learner_name || 'Unknown',
          instructor: session.instructor_name || 'Unassigned',
          subject: session.subject,
          duration: session.duration || 0,
          status: session.status,
          revenue: session.price || 0,
          createdAt: session.created_at
        })),
        usersByRole
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to get dashboard analytics' });
  }
});

// Get all users for admin management
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    if (role && role !== 'all') {
      whereClause += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const users = db.prepare(`
      SELECT 
        id, name, email, role, rating, total_sessions, is_verified, 
        is_online, created_at, last_login_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    
    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM users ${whereClause}
    `).get(...params);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

module.exports = router;