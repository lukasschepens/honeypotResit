const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const database = require('../database/db');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    // Create user-specific directory
    const userDir = path.join(uploadDir, req.user.id.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/json'
  ];

  // Dangerous file extensions to block
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.php3', '.php4', '.php5', '.phtml', '.asp', '.aspx', '.jsp'
  ];

  const extension = path.extname(file.originalname).toLowerCase();
  
  if (dangerousExtensions.includes(extension)) {
    return cb(new Error('File type not allowed for security reasons'), false);
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Max 5 files per request
  },
  fileFilter: fileFilter
});

// POST /api/upload - Upload files
router.post('/', upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        code: 'NO_FILES'
      });
    }

    const userId = req.user.id;
    const uploadedFiles = [];

    // Process each uploaded file
    for (const file of req.files) {
      try {
        // Save file info to database
        const result = await database.run(`
          INSERT INTO files (user_id, filename, original_name, mimetype, size, path)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          userId,
          file.filename,
          file.originalname,
          file.mimetype,
          file.size,
          file.path
        ]);

        uploadedFiles.push({
          id: result.id,
          filename: file.filename,
          original_name: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${userId}/${file.filename}`,
          created_at: new Date().toISOString()
        });

      } catch (dbError) {
        console.error('Database error for file:', file.filename, dbError);
        // Clean up file if database insert fails
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({
        error: 'Failed to process uploaded files',
        code: 'UPLOAD_PROCESSING_ERROR'
      });
    }

    res.status(201).json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    // Clean up any uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        code: 'FILE_TOO_LARGE',
        max_size: process.env.MAX_FILE_SIZE || 5242880
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        error: 'Too many files',
        code: 'TOO_MANY_FILES',
        max_files: 5
      });
    }

    next(error);
  }
});

// GET /api/upload - Get user's uploaded files
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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

    // Add URL to each file
    const filesWithUrls = files.map(file => ({
      ...file,
      url: `/uploads/${userId}/${file.filename}`
    }));

    res.json({
      files: filesWithUrls,
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

// GET /api/upload/:id - Get specific file info
router.get('/:id', async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    const file = await database.get(`
      SELECT 
        id,
        filename,
        original_name,
        mimetype,
        size,
        path,
        created_at
      FROM files
      WHERE id = ? AND user_id = ?
    `, [fileId, userId]);

    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        code: 'FILE_NOT_FOUND'
      });
    }

    res.json({
      file: {
        ...file,
        url: `/uploads/${userId}/${file.filename}`
      }
    });

  } catch (error) {
    next(error);
  }
});

// DELETE /api/upload/:id - Delete uploaded file
router.delete('/:id', async (req, res, next) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    // Get file info
    const file = await database.get(`
      SELECT id, filename, path FROM files
      WHERE id = ? AND user_id = ?
    `, [fileId, userId]);

    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        code: 'FILE_NOT_FOUND'
      });
    }

    // Delete file from filesystem
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (fsError) {
      console.error('Error deleting file from filesystem:', fsError);
    }

    // Delete from database
    await database.run('DELETE FROM files WHERE id = ?', [fileId]);

    res.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/upload/stats - Get upload statistics
router.get('/stats/overview', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await database.get(`
      SELECT 
        COUNT(*) as total_files,
        SUM(size) as total_size,
        AVG(size) as avg_size
      FROM files
      WHERE user_id = ?
    `, [userId]);

    const typeStats = await database.all(`
      SELECT 
        mimetype,
        COUNT(*) as count,
        SUM(size) as total_size
      FROM files
      WHERE user_id = ?
      GROUP BY mimetype
      ORDER BY count DESC
    `, [userId]);

    res.json({
      stats: {
        total_files: stats.total_files || 0,
        total_size_bytes: stats.total_size || 0,
        total_size_mb: Math.round((stats.total_size || 0) / 1024 / 1024 * 100) / 100,
        average_size_bytes: Math.round(stats.avg_size || 0),
        file_types: typeStats
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
