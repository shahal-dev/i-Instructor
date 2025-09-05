const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { statements } = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Create a new session
router.post('/create', authenticateToken, (req, res) => {
  try {
    const { instructorId, subject, topic, description, price } = req.body;
    const sessionId = uuidv4();

    statements.createSession.run(
      sessionId,
      req.user.userId,
      instructorId,
      subject,
      topic,
      description || null,
      price || 0
    );

    const session = statements.getSessionById.get(sessionId);
    res.json({ success: true, session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get session details
router.get('/:sessionId', authenticateToken, (req, res) => {
  try {
    const session = statements.getSessionById.get(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is part of this session
    if (session.learner_id !== req.user.userId && session.instructor_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Update session status
router.put('/:sessionId/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    const session = statements.getSessionById.get(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is part of this session
    if (session.learner_id !== req.user.userId && session.instructor_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    statements.updateSessionStatus.run(status, req.params.sessionId);
    const updatedSession = statements.getSessionById.get(req.params.sessionId);

    res.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ error: 'Failed to update session status' });
  }
});

// Get user sessions
router.get('/user/history', authenticateToken, (req, res) => {
  try {
    const sessions = statements.getUserSessions.all(req.user.userId, req.user.userId);
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Failed to get user sessions' });
  }
});

// Rate a session
router.post('/:sessionId/rate', authenticateToken, (req, res) => {
  try {
    const { rating, review } = req.body;
    const session = statements.getSessionById.get(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Only learner can rate
    if (session.learner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Only learners can rate sessions' });
    }

    // Update session with rating
    statements.db.prepare(`
      UPDATE sessions 
      SET rating = ?, review = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(rating, review, req.params.sessionId);

    // Update instructor's average rating
    const instructorStats = statements.db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_sessions
      FROM sessions 
      WHERE instructor_id = ? AND rating IS NOT NULL
    `).get(session.instructor_id);

    statements.db.prepare(`
      UPDATE users 
      SET rating = ?, total_sessions = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(
      instructorStats.avg_rating || 0,
      instructorStats.total_sessions || 0,
      session.instructor_id
    );

    res.json({ success: true, message: 'Session rated successfully' });
  } catch (error) {
    console.error('Rate session error:', error);
    res.status(500).json({ error: 'Failed to rate session' });
  }
});

// Get session messages
router.get('/:sessionId/messages', authenticateToken, (req, res) => {
  try {
    const session = statements.getSessionById.get(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user is part of this session
    if (session.learner_id !== req.user.userId && session.instructor_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = statements.getSessionMessages.all(req.params.sessionId);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({ error: 'Failed to get session messages' });
  }
});

module.exports = router;