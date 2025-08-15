const jwt = require('jsonwebtoken');
const database = require('../database/db');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No valid token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await database.get(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      if (!user) {
        return res.status(401).json({
          error: 'Invalid token. User not found.',
          code: 'USER_NOT_FOUND'
        });
      }
      
      // Add user info to request object
      req.user = user;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        error: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      error: 'Access denied. Admin privileges required.',
      code: 'ADMIN_REQUIRED'
    });
  }
};

// Optional auth middleware (doesn't reject if no token)
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await database.get(
          'SELECT id, username, email, role FROM users WHERE id = ?',
          [decoded.userId]
        );
        
        if (user) {
          req.user = user;
        }
      } catch (jwtError) {
        // Ignore JWT errors in optional auth
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware
};
