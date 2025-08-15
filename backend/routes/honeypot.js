const express = require('express');
const fs = require('fs');
const path = require('path');
const database = require('../database/db');

const router = express.Router();

// Middleware to log honeypot access
const logHoneypotAccess = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const endpoint = req.originalUrl;
    const method = req.method;
    let payload = null;

    // Capture request payload
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      payload = JSON.stringify(req.body);
    }

    // Log to database
    await database.run(`
      INSERT INTO honeypot_logs (ip_address, user_agent, endpoint, method, payload)
      VALUES (?, ?, ?, ?, ?)
    `, [ip, userAgent, endpoint, method, payload]);

    // Log to file for additional monitoring
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip_address: ip,
      user_agent: userAgent,
      endpoint,
      method,
      payload,
      headers: req.headers,
      query: req.query
    };

    const logDir = path.join(__dirname, '../logs');
    const honeypotLogFile = path.join(logDir, 'honeypot.log');
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(honeypotLogFile, JSON.stringify(logEntry) + '\n');

    console.log(`🍯 Honeypot accessed: ${method} ${endpoint} from ${ip}`);
    
  } catch (error) {
    console.error('Error logging honeypot access:', error);
  }
  
  next();
};

// Apply logging middleware to all honeypot routes
router.use(logHoneypotAccess);

// GET /api/honeypot - Main honeypot landing page
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Administrative Panel',
    version: '2.1.0',
    status: 'online',
    features: [
      'User Management',
      'System Configuration',
      'Database Administration',
      'File Management',
      'Security Settings'
    ],
    endpoints: {
      admin: '/api/honeypot/admin',
      config: '/api/honeypot/config',
      database: '/api/honeypot/database',
      files: '/api/honeypot/files',
      users: '/api/honeypot/users',
      backup: '/api/honeypot/backup',
      logs: '/api/honeypot/logs'
    }
  });
});

// GET /api/honeypot/admin - Fake admin panel
router.get('/admin', (req, res) => {
  res.json({
    title: 'Administrator Dashboard',
    authenticated: false,
    message: 'Please provide admin credentials',
    login_url: '/api/honeypot/admin/login',
    version: '1.8.3',
    last_login: '2024-08-15T10:30:00Z',
    system_stats: {
      uptime: '45 days, 12 hours',
      cpu_usage: '23%',
      memory_usage: '67%',
      disk_usage: '89%',
      active_users: 1247
    }
  });
});

// POST /api/honeypot/admin/login - Fake admin login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Always return "invalid credentials" but log the attempt
  setTimeout(() => {
    res.status(401).json({
      error: 'Invalid administrator credentials',
      code: 'AUTH_FAILED',
      message: 'Please check your username and password',
      attempt_count: Math.floor(Math.random() * 5) + 1,
      lockout_time: '5 minutes'
    });
  }, 1000 + Math.random() * 2000); // Random delay to seem more realistic
});

// GET /api/honeypot/config - Fake configuration endpoint
router.get('/config', (req, res) => {
  res.json({
    system_config: {
      database_host: 'db.internal.company.com',
      database_name: 'production_db',
      redis_host: 'redis.internal.company.com',
      smtp_server: 'mail.company.com',
      api_keys: {
        stripe: 'sk_live_***************',
        aws: 'AKIA***************',
        google: 'AIza***************'
      },
      security: {
        ssl_enabled: true,
        firewall_status: 'active',
        backup_encryption: true
      }
    },
    message: 'Configuration loaded successfully'
  });
});

// GET /api/honeypot/database - Fake database endpoint
router.get('/database', (req, res) => {
  res.json({
    databases: [
      {
        name: 'users_db',
        size: '2.4 GB',
        tables: 15,
        last_backup: '2024-08-14T02:00:00Z'
      },
      {
        name: 'financial_db',
        size: '890 MB',
        tables: 8,
        last_backup: '2024-08-14T02:15:00Z'
      },
      {
        name: 'logs_db',
        size: '15.2 GB',
        tables: 3,
        last_backup: '2024-08-14T02:30:00Z'
      }
    ],
    connection_string: 'mysql://admin:***@localhost:3306/',
    status: 'connected'
  });
});

// GET /api/honeypot/users - Fake user management
router.get('/users', (req, res) => {
  res.json({
    users: [
      {
        id: 1,
        username: 'admin',
        email: 'admin@company.com',
        role: 'administrator',
        last_login: '2024-08-15T09:45:00Z',
        status: 'active'
      },
      {
        id: 2,
        username: 'john.doe',
        email: 'john.doe@company.com',
        role: 'manager',
        last_login: '2024-08-15T08:30:00Z',
        status: 'active'
      },
      {
        id: 3,
        username: 'jane.smith',
        email: 'jane.smith@company.com',
        role: 'user',
        last_login: '2024-08-14T16:20:00Z',
        status: 'active'
      }
    ],
    total_users: 1247,
    active_sessions: 23
  });
});

// GET /api/honeypot/files - Fake file management
router.get('/files', (req, res) => {
  res.json({
    files: [
      {
        name: 'customer_data.xlsx',
        size: '45.2 MB',
        modified: '2024-08-14T14:30:00Z',
        path: '/secure/customer_data.xlsx'
      },
      {
        name: 'financial_report_q2.pdf',
        size: '12.8 MB',
        modified: '2024-08-13T11:15:00Z',
        path: '/reports/financial_report_q2.pdf'
      },
      {
        name: 'employee_salaries.csv',
        size: '2.1 MB',
        modified: '2024-08-12T09:45:00Z',
        path: '/hr/employee_salaries.csv'
      }
    ],
    total_size: '2.4 TB',
    available_space: '890 GB'
  });
});

// GET /api/honeypot/backup - Fake backup system
router.get('/backup', (req, res) => {
  res.json({
    last_backup: '2024-08-14T02:00:00Z',
    backup_location: 's3://company-backups/prod/',
    backup_size: '45.2 GB',
    status: 'completed',
    next_backup: '2024-08-15T02:00:00Z',
    retention_policy: '30 days',
    backup_files: [
      'db_backup_20240814.sql.gz',
      'files_backup_20240814.tar.gz',
      'config_backup_20240814.json'
    ]
  });
});

// GET /api/honeypot/logs - Fake log viewer
router.get('/logs', (req, res) => {
  res.json({
    log_files: [
      {
        name: 'access.log',
        size: '150 MB',
        lines: 250000,
        last_modified: '2024-08-15T10:45:00Z'
      },
      {
        name: 'error.log',
        size: '25 MB',
        lines: 15000,
        last_modified: '2024-08-15T10:30:00Z'
      },
      {
        name: 'security.log',
        size: '89 MB',
        lines: 45000,
        last_modified: '2024-08-15T10:40:00Z'
      }
    ],
    recent_entries: [
      '2024-08-15T10:45:32 INFO User login successful: admin',
      '2024-08-15T10:44:15 WARN Failed login attempt from 192.168.1.100',
      '2024-08-15T10:43:22 INFO Database backup completed',
      '2024-08-15T10:42:10 ERROR SSL certificate expires in 7 days'
    ]
  });
});

// POST endpoints that might attract attackers
router.post('/admin/reset', (req, res) => {
  setTimeout(() => {
    res.status(403).json({
      error: 'Insufficient privileges',
      code: 'ACCESS_DENIED',
      message: 'Administrator privileges required for system reset'
    });
  }, 2000);
});

router.post('/database/query', (req, res) => {
  setTimeout(() => {
    res.status(401).json({
      error: 'Database access denied',
      code: 'DB_AUTH_REQUIRED',
      message: 'Please authenticate with database credentials'
    });
  }, 1500);
});

router.post('/files/download', (req, res) => {
  const { filename } = req.body;
  setTimeout(() => {
    res.status(404).json({
      error: 'File not found',
      code: 'FILE_NOT_FOUND',
      message: `File '${filename}' does not exist or access denied`,
      suggestion: 'Check file path and permissions'
    });
  }, 1000);
});

// Catch-all for any other honeypot endpoints
router.all('/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    message: 'The requested administrative endpoint does not exist',
    available_endpoints: [
      '/api/honeypot/admin',
      '/api/honeypot/config',
      '/api/honeypot/database',
      '/api/honeypot/users',
      '/api/honeypot/files',
      '/api/honeypot/backup',
      '/api/honeypot/logs'
    ]
  });
});

module.exports = router;
