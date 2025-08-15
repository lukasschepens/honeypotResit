# Web Security Honeypot Environment

## Overview

This project implements a comprehensive web security environment featuring a full-stack application with an integrated honeypot system for educational and security demonstration purposes. The system is designed to detect, log, and analyze potential security threats while providing a functional web platform.

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with comprehensive security middleware
- **Database**: SQLite for simplicity and portability
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, input validation

### Frontend (React/Vite)
- **Framework**: React 18 with modern hooks and functional components
- **Routing**: React Router for client-side routing
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Query for server state management
- **Forms**: React Hook Form with Yup validation

### Honeypot System
- **Purpose**: Detect and log malicious activities
- **Coverage**: Fake administrative interfaces and endpoints
- **Logging**: Comprehensive request logging with IP tracking
- **Analysis**: Real-time threat detection and behavioral analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd honeypot
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Honeypot Demo: http://localhost:3000/honeypot

### Default Accounts
- **Admin**: username: `admin`, password: `admin123`
- **Demo User**: username: `demo`, password: `demo123`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Posts Management
- `GET /api/posts` - List all posts (with pagination)
- `GET /api/posts/:id` - Get specific post with comments
- `POST /api/posts` - Create new post (authenticated)
- `DELETE /api/posts/:id` - Delete post (owner/admin only)

### Comments System
- `GET /api/comments/:postId` - Get comments for post
- `POST /api/comments` - Create comment (authenticated)
- `DELETE /api/comments/:id` - Delete comment (owner/admin only)

### Content Editing
- `PUT /api/edit/post/:id` - Edit post (owner/admin only)
- `PUT /api/edit/comment/:id` - Edit comment (owner/admin only)
- `PUT /api/edit/account` - Update account information

### Account Management
- `GET /api/account` - Get account details and statistics
- `GET /api/account/posts` - Get user's posts
- `GET /api/account/comments` - Get user's comments
- `GET /api/account/files` - Get user's uploaded files
- `DELETE /api/account` - Delete account (with password confirmation)

### File Upload System
- `POST /api/upload` - Upload files (authenticated, max 5MB, 5 files)
- `GET /api/upload` - List user's uploaded files
- `GET /api/upload/:id` - Get specific file information
- `DELETE /api/upload/:id` - Delete uploaded file
- `GET /api/upload/stats/overview` - Get upload statistics

### Honeypot Endpoints (🍯 Security Demo)
- `GET /api/honeypot` - Main honeypot interface
- `GET /api/honeypot/admin` - Fake admin dashboard
- `POST /api/honeypot/admin/login` - Fake admin login
- `GET /api/honeypot/config` - Fake system configuration
- `GET /api/honeypot/database` - Fake database management
- `GET /api/honeypot/users` - Fake user management
- `GET /api/honeypot/files` - Fake file management
- `GET /api/honeypot/backup` - Fake backup system
- `GET /api/honeypot/logs` - Fake log viewer

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt rounds of 12
- **Role-Based Access**: Admin and user roles with appropriate permissions
- **Session Management**: Token expiration and refresh mechanisms
- **Input Validation**: Comprehensive validation using express-validator and Yup

### Protection Mechanisms
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS**: Configured for development and production environments
- **Helmet**: Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **File Upload Security**: Type validation, size limits, dangerous extension blocking
- **SQL Injection Prevention**: Parameterized queries with SQLite
- **XSS Protection**: Input sanitization and output encoding

### Monitoring & Logging
- **Request Logging**: All requests logged with timestamp, IP, user agent
- **Honeypot Logging**: Specialized logging for honeypot interactions
- **Error Handling**: Comprehensive error logging and user-friendly error responses
- **Security Events**: Failed login attempts, suspicious activities logged

## 🍯 Honeypot System

### Purpose
The honeypot system is designed to:
- **Detect Threats**: Identify potential attackers and automated tools
- **Collect Intelligence**: Gather information about attack patterns and techniques
- **Distract Attackers**: Draw attention away from real administrative interfaces
- **Educational Value**: Demonstrate honeypot concepts and implementation

### Implementation Details
- **Realistic Interfaces**: Convincing fake administrative panels
- **Believable Responses**: Authentic-looking error messages and data
- **Comprehensive Logging**: Every interaction logged with full context
- **Behavioral Analysis**: Pattern recognition for identifying attack types
- **Real-time Monitoring**: Immediate alerting on suspicious activities

### Logged Information
- IP address and geolocation
- User agent and browser fingerprinting
- Request headers and payload
- Access patterns and frequency
- Attempted credentials and injection payloads

## 🔧 Configuration

### Environment Variables (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_PATH=./database.sqlite

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Security Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT=3600000

# Honeypot Settings
HONEYPOT_ENABLED=true
HONEYPOT_LOG_LEVEL=info
```

### Database Schema
The application uses SQLite with the following tables:
- **users**: User accounts and authentication
- **posts**: Blog posts and content
- **comments**: Comments on posts
- **files**: Uploaded file metadata
- **honeypot_logs**: Security event logging
- **sessions**: Active user sessions

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Frontend build
cd frontend && npm run build

# Backend production
cd backend && NODE_ENV=production npm start
```

### NGINX Configuration (Production)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Analytics

### Log Files
- `backend/logs/access.log` - General access logs
- `backend/logs/honeypot.log` - Honeypot-specific logs
- `backend/logs/error.log` - Application errors

### Metrics Collected
- Request frequency and patterns
- Failed authentication attempts
- File upload statistics
- Honeypot interaction analytics
- User behavior patterns

## 🧪 Testing

### Security Testing
1. **Authentication Testing**
   - Test JWT token validation
   - Verify password hashing
   - Check session management

2. **Authorization Testing**
   - Role-based access control
   - Resource ownership validation
   - Admin privilege escalation

3. **Input Validation Testing**
   - SQL injection attempts
   - XSS payload testing
   - File upload security

4. **Honeypot Testing**
   - Access honeypot endpoints
   - Monitor logging functionality
   - Verify threat detection

### Penetration Testing Scenarios
1. **Brute Force Attacks**: Test rate limiting and account lockout
2. **SQL Injection**: Attempt database manipulation
3. **File Upload Attacks**: Try to upload malicious files
4. **Admin Panel Discovery**: Test honeypot effectiveness
5. **Session Hijacking**: Test JWT security

## 🎓 Educational Value

### Learning Objectives
- **Web Security**: Understand common vulnerabilities and protections
- **Honeypot Technology**: Learn threat detection and deception techniques
- **Secure Development**: Implement security best practices
- **Monitoring**: Set up comprehensive logging and alerting

### Security Concepts Demonstrated
- Authentication and authorization mechanisms
- Input validation and sanitization
- Secure file handling
- Rate limiting and DoS protection
- Logging and monitoring
- Honeypot design and implementation

## 📝 Development Notes

### Security Considerations
- Never use default credentials in production
- Regularly update dependencies for security patches
- Implement proper SSL/TLS in production
- Monitor logs for suspicious activities
- Regular security audits and penetration testing

### Performance Optimization
- Database indexing for large datasets
- Image optimization for uploads
- CDN implementation for static assets
- Caching strategies for API responses

### Scalability
- Database migration to PostgreSQL for production
- Redis for session management at scale
- Load balancing for multiple instances
- Microservices architecture for larger deployments

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit pull request with detailed description

### Code Standards
- ESLint configuration for consistent code style
- Comprehensive error handling
- Input validation on all endpoints
- Documentation for new features

## 📞 Support

For questions, issues, or security concerns:
- Create an issue in the repository
- Review logs for troubleshooting
- Check security logs for honeypot interactions

## ⚠️ Disclaimer

This honeypot system is designed for educational purposes and security research. Do not deploy in production environments without proper security review and monitoring infrastructure. The developers are not responsible for any misuse or security incidents resulting from deployment of this system.

## 📄 License

This project is created for educational purposes as part of the Web Security course evaluation. All code and documentation are provided as-is for learning and demonstration purposes.

---

**Last Updated**: August 15, 2025  
**Version**: 1.0.0  
**Environment**: Development/Educational
