const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { statements } = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Add to matching queue
router.post('/queue', authenticateToken, (req, res) => {
  try {
    const { subject, topic, description, urgency, maxPrice } = req.body;
    const queueId = uuidv4();
    
    // Set expiration time (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    statements.addToQueue.run(
      queueId,
      req.user.userId,
      subject,
      topic,
      description || null,
      urgency || 'normal',
      maxPrice || null,
      expiresAt
    );

    // Try to find immediate match
    const match = findInstructorMatch(subject, maxPrice);
    
    if (match) {
      // Remove from queue and create session
      statements.removeFromQueue.run(queueId);
      
      const sessionId = uuidv4();
      statements.createSession.run(
        sessionId,
        req.user.userId,
        match.id,
        subject,
        topic,
        description,
        calculateSessionPrice(subject, match.rating, urgency)
      );

      const session = statements.getSessionById.get(sessionId);
      
      res.json({ 
        success: true, 
        matched: true, 
        session,
        instructor: match
      });
    } else {
      const queueItem = statements.getQueueItem.get(queueId);
      res.json({ 
        success: true, 
        matched: false, 
        queueItem,
        message: 'Added to queue. You will be notified when an instructor is available.'
      });
    }
  } catch (error) {
    console.error('Queue matching error:', error);
    res.status(500).json({ error: 'Failed to add to matching queue' });
  }
});

// Remove from queue
router.delete('/queue/:queueId', authenticateToken, (req, res) => {
  try {
    const queueItem = statements.getQueueItem.get(req.params.queueId);
    
    if (!queueItem) {
      return res.status(404).json({ error: 'Queue item not found' });
    }

    if (queueItem.learner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    statements.removeFromQueue.run(req.params.queueId);
    res.json({ success: true, message: 'Removed from queue' });
  } catch (error) {
    console.error('Remove from queue error:', error);
    res.status(500).json({ error: 'Failed to remove from queue' });
  }
});

// Get available instructors for subject
router.get('/instructors/:subject', (req, res) => {
  try {
    const { subject } = req.params;
    const instructors = findAvailableInstructors(subject);
    
    res.json({ success: true, instructors });
  } catch (error) {
    console.error('Get available instructors error:', error);
    res.status(500).json({ error: 'Failed to get available instructors' });
  }
});

// Instructor accepts queue item
router.post('/accept/:queueId', authenticateToken, (req, res) => {
  try {
    const queueItem = statements.getQueueItem.get(req.params.queueId);
    
    if (!queueItem) {
      return res.status(404).json({ error: 'Queue item not found or expired' });
    }

    // Check if instructor is qualified
    const instructor = statements.getUserById.get(req.user.userId);
    if (instructor.role !== 'instructor') {
      return res.status(403).json({ error: 'Only instructors can accept sessions' });
    }

    // Create session
    const sessionId = uuidv4();
    const price = calculateSessionPrice(queueItem.subject, instructor.rating, queueItem.urgency);
    
    statements.createSession.run(
      sessionId,
      queueItem.learner_id,
      req.user.userId,
      queueItem.subject,
      queueItem.topic,
      queueItem.description,
      price
    );

    // Remove from queue
    statements.removeFromQueue.run(req.params.queueId);

    const session = statements.getSessionById.get(sessionId);
    
    res.json({ 
      success: true, 
      session,
      message: 'Session accepted successfully'
    });
  } catch (error) {
    console.error('Accept session error:', error);
    res.status(500).json({ error: 'Failed to accept session' });
  }
});

// Helper functions
function findInstructorMatch(subject, maxPrice) {
  const instructors = findAvailableInstructors(subject);
  
  if (instructors.length === 0) return null;

  // Sort by rating and response time
  instructors.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.response_time - b.response_time;
  });

  // Filter by price if specified
  if (maxPrice) {
    return instructors.find(instructor => {
      const price = calculateSessionPrice(subject, instructor.rating, 'normal');
      return price <= maxPrice;
    });
  }

  return instructors[0];
}

function findAvailableInstructors(subject) {
  const onlineInstructors = statements.getOnlineInstructors.all();
  
  return onlineInstructors.filter(instructor => {
    const skills = JSON.parse(instructor.skills || '[]');
    return skills.some(skill => 
      skill.toLowerCase().includes(subject.toLowerCase()) ||
      subject.toLowerCase().includes(skill.toLowerCase())
    );
  }).map(instructor => ({
    ...instructor,
    skills: JSON.parse(instructor.skills || '[]'),
    preferences: JSON.parse(instructor.preferences || '{}')
  }));
}

function calculateSessionPrice(subject, instructorRating, urgency) {
  let basePrice = 3; // Base price per 15 minutes

  // Subject multiplier
  const subjectMultipliers = {
    'mathematics': 1.0,
    'computer science': 1.2,
    'physics': 1.1,
    'chemistry': 1.1,
    'biology': 1.0,
    'english': 0.8
  };

  const multiplier = subjectMultipliers[subject.toLowerCase()] || 1.0;
  basePrice *= multiplier;

  // Rating bonus
  if (instructorRating >= 4.5) basePrice *= 1.2;
  else if (instructorRating >= 4.0) basePrice *= 1.1;

  // Urgency multiplier
  const urgencyMultipliers = {
    'normal': 1.0,
    'urgent': 1.5,
    'emergency': 2.0
  };

  basePrice *= urgencyMultipliers[urgency] || 1.0;

  return Math.round(basePrice * 100) / 100; // Round to 2 decimal places
}

module.exports = router;