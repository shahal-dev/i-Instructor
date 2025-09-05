const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { statements } = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register/Login with Firebase token
router.post('/firebase-auth', async (req, res) => {
  try {
    const { firebaseToken, userData } = req.body;

    // In a real implementation, you would verify the Firebase token here
    // For now, we'll create/update the user based on the provided data

    let user = statements.getUserByEmail.get(userData.email);

    if (!user) {
      // Create new user
      const userId = uuidv4();
      statements.createUser.run(
        userId,
        userData.email,
        userData.name,
        userData.avatar || null,
        userData.role || 'learner',
        userData.university || null,
        userData.department || null,
        userData.year || null,
        JSON.stringify(userData.skills || []),
        userData.bio || null,
        JSON.stringify(userData.preferences || {})
      );
      user = statements.getUserById.get(userId);
    } else {
      // Update existing user
      statements.updateUser.run(
        userData.name,
        userData.avatar || user.avatar,
        userData.university || user.university,
        userData.department || user.department,
        userData.year || user.year,
        JSON.stringify(userData.skills || JSON.parse(user.skills || '[]')),
        userData.bio || user.bio,
        JSON.stringify(userData.preferences || JSON.parse(user.preferences || '{}')),
        user.id
      );
      user = statements.getUserById.get(user.id);
    }

    // Update online status
    statements.updateUserOnlineStatus.run(true, user.id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Parse JSON fields
    const userResponse = {
      ...user,
      skills: JSON.parse(user.skills || '[]'),
      preferences: JSON.parse(user.preferences || '{}')
    };

    res.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // Update user online status
    statements.updateUserOnlineStatus.run(false, req.user.userId);
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  try {
    const user = statements.getUserById.get(req.user.userId);
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
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

module.exports = { router, authenticateToken };