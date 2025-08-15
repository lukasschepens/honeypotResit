const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'access.log');

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // Log basic request info
  const logEntry = {
    timestamp,
    method,
    url,
    ip,
    userAgent,
    body: method === 'POST' || method === 'PUT' ? req.body : undefined
  };

  // Write to log file
  fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${timestamp} - ${method} ${url} - ${ip}`);
  }

  next();
};

module.exports = logger;
