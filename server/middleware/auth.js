const jwt = require('jsonwebtoken');
const { statements } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

// Generate access token (15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token (7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify access token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + req.user?.userId;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userAttempts = attempts.get(key);
    
    if (now > userAttempts.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      return res.status(429).json({ 
        error: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
      });
    }

    userAttempts.count++;
    next();
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  verifyRefreshToken,
  requireRole,
  sensitiveOperationLimit
};