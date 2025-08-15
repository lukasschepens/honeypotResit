const express = require('express');
const database = require('../database/db');

const router = express.Router();

// GET /api/account - Get current user's account information
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user info with stats
    const user = await database.get(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT c.id) as comment_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      LEFT JOIN comments c ON u.id = c.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [userId]);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get recent posts
    const recentPosts = await database.all(`
      SELECT 
        id,
        title,
        created_at,
        updated_at
      FROM posts
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);

    // Get recent comments
    const recentComments = await database.all(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        p.title as post_title,
        p.id as post_id
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      LIMIT 5
    `, [userId]);

    // Get uploaded files
    const uploadedFiles = await database.all(`
      SELECT 
        id,
        original_name,
        mimetype,
        size,
        created_at
      FROM files
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
        stats: {
          post_count: user.post_count || 0,
          comment_count: user.comment_count || 0,
          uploaded_files: uploadedFiles.length
        }
      },
      recent_activity: {
        posts: recentPosts,
        comments: recentComments,
        files: uploadedFiles
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/account/posts - Get all user's posts
router.get('/posts', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = await database.all(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at,
        p.updated_at,
        COUNT(c.id) as comment_count
      FROM posts p
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    const totalCount = await database.get(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
      [userId]
    );

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/account/comments - Get all user's comments
router.get('/comments', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const comments = await database.all(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        c.post_id,
        p.title as post_title
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    const totalCount = await database.get(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ?',
      [userId]
    );

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/account/files - Get all user's uploaded files
router.get('/files', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const files = await database.all(`
      SELECT 
        id,
        filename,
        original_name,
        mimetype,
        size,
        created_at
      FROM files
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    const totalCount = await database.get(
      'SELECT COUNT(*) as count FROM files WHERE user_id = ?',
      [userId]
    );

    // Calculate total storage used
    const storageUsed = await database.get(
      'SELECT SUM(size) as total_size FROM files WHERE user_id = ?',
      [userId]
    );

    res.json({
      files,
      storage: {
        used_bytes: storageUsed.total_size || 0,
        used_mb: Math.round((storageUsed.total_size || 0) / 1024 / 1024 * 100) / 100
      },
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/account - Delete user account
router.delete('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: 'Password is required to delete account',
        code: 'PASSWORD_REQUIRED'
      });
    }

    // Verify password
    const user = await database.get(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        error: 'Invalid password',
        code: 'INVALID_PASSWORD'
      });
    }

    // Delete user (cascade will handle related records)
    await database.run('DELETE FROM users WHERE id = ?', [userId]);

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
