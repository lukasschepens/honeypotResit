const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/db');

const router = express.Router();

// Validation rules for post editing
const editPostValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters')
];

// Validation rules for comment editing
const editCommentValidation = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content must be between 1 and 1000 characters')
];

// Validation rules for account editing
const editAccountValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('currentPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Current password is required when changing password'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// PUT /api/edit/post/:id - Edit a post
router.put('/post/:id', editPostValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const postId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { title, content } = req.body;

    // Check if post exists and user owns it (or is admin)
    const post = await database.get(
      'SELECT id, user_id, title, content FROM posts WHERE id = ?',
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
        error: 'Access denied. You can only edit your own posts.',
        code: 'ACCESS_DENIED'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }

    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(postId);

    await database.run(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated post
    const updatedPost = await database.get(`
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
    `, [postId]);

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/edit/comment/:id - Edit a comment
router.put('/comment/:id', editCommentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const commentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { content } = req.body;

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
        error: 'Access denied. You can only edit your own comments.',
        code: 'ACCESS_DENIED'
      });
    }

    await database.run(
      'UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [content, commentId]
    );

    // Get updated comment
    const updatedComment = await database.get(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        u.username as author
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [commentId]);

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/edit/account - Edit user account
router.put('/account', editAccountValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { email, currentPassword, newPassword } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await database.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUser) {
        return res.status(409).json({
          error: 'Email already in use',
          code: 'EMAIL_EXISTS'
        });
      }

      updates.push('email = ?');
      values.push(email);
    }

    if (newPassword && currentPassword) {
      // Verify current password
      const user = await database.get(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      const bcrypt = require('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      updates.push('password = ?');
      values.push(hashedNewPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);

    await database.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user info (without password)
    const updatedUser = await database.get(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Account updated successfully',
      user: updatedUser
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
