const express = require('express');
const { statements } = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get user profile
router.get('/profile/:userId', authenticateToken, (req, res) => {
  try {
    const user = statements.getUserById.get(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userResponse = {
      ...user,
      skills: JSON.parse(user.skills || '[]'),
      preferences: JSON.parse(user.preferences || '{}')
    };

    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, avatar, university, department, year, skills, bio, preferences } = req.body;

    statements.updateUser.run(
      name,
      avatar,
      university,
      department,
      year,
      JSON.stringify(skills || []),
      bio,
      JSON.stringify(preferences || {}),
      req.user.userId
    );

    const updatedUser = statements.getUserById.get(req.user.userId);
    const userResponse = {
      ...updatedUser,
      skills: JSON.parse(updatedUser.skills || '[]'),
      preferences: JSON.parse(updatedUser.preferences || '{}')
    };

    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get online instructors
router.get('/instructors/online', (req, res) => {
  try {
    const { subject } = req.query;
    let instructors = statements.getOnlineInstructors.all();

    // Filter by subject if provided
    if (subject) {
      instructors = instructors.filter(instructor => {
        const skills = JSON.parse(instructor.skills || '[]');
        return skills.some(skill => 
          skill.toLowerCase().includes(subject.toLowerCase())
        );
      });
    }

    const instructorsResponse = instructors.map(instructor => ({
      ...instructor,
      skills: JSON.parse(instructor.skills || '[]'),
      preferences: JSON.parse(instructor.preferences || '{}')
    }));

    res.json({ success: true, instructors: instructorsResponse });
  } catch (error) {
    console.error('Get online instructors error:', error);
    res.status(500).json({ error: 'Failed to get online instructors' });
  }
});

// Get instructor leaderboard
router.get('/instructors/leaderboard', (req, res) => {
  try {
    const instructors = statements.db.prepare(`
      SELECT u.*, 
             COUNT(s.id) as session_count,
             AVG(s.rating) as avg_rating,
             SUM(s.price) as total_earnings
      FROM users u
      LEFT JOIN sessions s ON u.id = s.instructor_id AND s.status = 'completed'
      WHERE u.role = 'instructor'
      GROUP BY u.id
      ORDER BY avg_rating DESC, session_count DESC
      LIMIT 50
    `).all();

    const leaderboard = instructors.map(instructor => ({
      ...instructor,
      skills: JSON.parse(instructor.skills || '[]'),
      preferences: JSON.parse(instructor.preferences || '{}'),
      avg_rating: instructor.avg_rating || 0,
      total_earnings: instructor.total_earnings || 0
    }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

module.exports = router;