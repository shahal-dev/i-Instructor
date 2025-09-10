const express = require('express');
const { authenticateToken } = require('./auth');
const calendarService = require('../services/calendarService');

const router = express.Router();

// Set user availability
router.post('/availability', authenticateToken, async (req, res) => {
  try {
    const { availability } = req.body;
    
    if (!Array.isArray(availability)) {
      return res.status(400).json({ error: 'Availability must be an array' });
    }

    const result = await calendarService.setUserAvailability(req.user.userId, availability);
    
    if (result.success) {
      res.json({ success: true, message: 'Availability updated successfully' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
});

// Get user availability
router.get('/availability/:userId?', authenticateToken, (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    const result = calendarService.getUserAvailability(userId);
    
    if (result.success) {
      res.json({ success: true, availability: result.availability });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
});

// Get available time slots
router.get('/slots/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const { date, duration = 30 } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const result = calendarService.getAvailableSlots(userId, date, parseInt(duration));
    
    if (result.success) {
      res.json({ success: true, slots: result.slots });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Schedule a session
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const { instructorId, subject, topic, scheduledTime, duration, description } = req.body;
    
    const sessionData = {
      learnerId: req.user.userId,
      instructorId,
      subject,
      topic,
      scheduledTime,
      duration: parseInt(duration),
      description
    };

    const result = await calendarService.scheduleSession(sessionData);
    
    if (result.success) {
      res.json({ success: true, sessionId: result.sessionId });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Schedule session error:', error);
    res.status(500).json({ error: 'Failed to schedule session' });
  }
});

// Get user's scheduled sessions
router.get('/scheduled', authenticateToken, (req, res) => {
  try {
    const result = calendarService.getUserScheduledSessions(req.user.userId);
    
    if (result.success) {
      res.json({ success: true, sessions: result.sessions });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Get scheduled sessions error:', error);
    res.status(500).json({ error: 'Failed to get scheduled sessions' });
  }
});

// Check availability at specific time
router.post('/check-availability', authenticateToken, (req, res) => {
  try {
    const { userId, dateTime } = req.body;
    
    const isAvailable = calendarService.isUserAvailable(userId, dateTime);
    
    res.json({ success: true, available: isAvailable });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router;