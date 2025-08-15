const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/db');

const router = express.Router();

// Validation rules
const commentValidation = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content must be between 1 and 1000 characters'),
  body('post_id')
    .isInt({ min: 1 })
    .withMessage('Valid post ID is required')
];

// GET /api/comments/:postId - Get comments for a specific post
router.get('/:postId', async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Check if post exists
    const post = await database.get('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND'
      });
    }

    const comments = await database.all(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        c.user_id,
        u.username as author
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
      LIMIT ? OFFSET ?
    `, [postId, limit, offset]);

    const totalCount = await database.get(
      'SELECT COUNT(*) as count FROM comments WHERE post_id = ?',
      [postId]
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

// POST /api/comments - Create new comment
router.post('/', commentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { content, post_id } = req.body;
    const userId = req.user.id;

    // Check if post exists
    const post = await database.get('SELECT id FROM posts WHERE id = ?', [post_id]);
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND'
      });
    }

    const result = await database.run(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [post_id, userId, content]
    );

    const newComment = await database.get(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        u.username as author
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.id]);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: newComment
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if comment exists and user owns it (or is admin)
    const comment = await database.get(
      'SELECT id, user_id FROM comments WHERE id = ?',
      [commentId]
    );

    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found',
        code: 'COMMENT_NOT_FOUND'
      });
    }

    if (comment.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own comments.',
        code: 'ACCESS_DENIED'
      });
    }

    await database.run('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/comments/user/:userId - Get all comments by a user
router.get('/user/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
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
        p.title as post_title,
        u.username as author
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      LEFT JOIN users u ON c.user_id = u.id
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

module.exports = router;
