const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/db');

const router = express.Router();

// Validation rules
const postValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters')
];

// GET /api/posts - Get all posts
router.get('/', async (req, res, next) => {
  try {
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
        u.username as author,
        COUNT(c.id) as comment_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const totalCount = await database.get('SELECT COUNT(*) as count FROM posts');

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

// GET /api/posts/:id - Get specific post
router.get('/:id', async (req, res, next) => {
  try {
    const postId = req.params.id;

    const post = await database.get(`
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.created_at, 
        p.updated_at,
        p.user_id,
        u.username as author
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [postId]);

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND'
      });
    }

    // Get comments for this post
    const comments = await database.all(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        u.username as author
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json({
      post: {
        ...post,
        comments
      }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/posts - Create new post
router.post('/', postValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { title, content } = req.body;
    const userId = req.user.id;

    const result = await database.run(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      [userId, title, content]
    );

    const newPost = await database.get(`
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.created_at, 
        p.updated_at,
        u.username as author
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [result.id]);

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if post exists and user owns it (or is admin)
    const post = await database.get(
      'SELECT id, user_id FROM posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        code: 'POST_NOT_FOUND'
      });
    }

    if (post.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own posts.',
        code: 'ACCESS_DENIED'
      });
    }

    await database.run('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({
      message: 'Post deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
