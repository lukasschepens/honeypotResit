const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500,
    code: 'INTERNAL_ERROR'
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation Error',
      status: 400,
      code: 'VALIDATION_ERROR',
      details: Object.values(err.errors).map(e => e.message)
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
      code: 'INVALID_TOKEN'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401,
      code: 'TOKEN_EXPIRED'
    };
  }

  // SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error = {
      message: 'Resource already exists',
      status: 409,
      code: 'DUPLICATE_RESOURCE'
    };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: 'File too large',
      status: 413,
      code: 'FILE_TOO_LARGE'
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = {
      message: 'Too many files',
      status: 413,
      code: 'TOO_MANY_FILES'
    };
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    code: error.code,
    details: error.details,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

module.exports = errorHandler;
