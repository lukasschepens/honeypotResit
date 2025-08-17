# Web Security Honeypot Project

## Overview

This is my implementation for the Web Security resit evaluation. It's a web application with a honeypot system that includes all the required endpoints and security features.

## What this project includes

- Node.js backend API with 7 endpoints (Login, Post, Comment, Edit, Account, Upload, WebHoneypot)
- React frontend for the user interface  
- SQLite database for storing data
- JWT authentication system
- Honeypot system with fake admin interfaces

## Setup Instructions

### Prerequisites

You need these installed on your Debian server:
- Node.js (version 18 or newer)
- npm
- nginx
- git

### 1. Install Node.js and npm

```bash
# Update system
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Check versions
node --version
npm --version
```

### 2. Install nginx

```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Clone and setup the project

```bash
# Clone to web directory
cd /var/www
sudo git clone <your-repo-url> honeypotResit
sudo chown -R $USER:$USER /var/www/honeypotResit

# Setup backend
cd /var/www/honeypotResit/backend
npm install

# Setup frontend  
cd /var/www/honeypotResit/frontend
npm install
npm run build
```
### 4. Configure nginx

Create `/etc/nginx/conf.d/default.conf`:

For the default.conf look at the file uploaded in this repo.

Test and reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Setup PM2 for backend process management

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /var/www/honeypotResit/backend
pm2 start server.js --name "honeypot-api"

# Save PM2 config
pm2 save

# Setup auto-start on boot
pm2 startup
# Follow the command it gives you
```

### 6. Setup hosts file (for local testing)

On your host computer, edit the hosts file:

**Windows**: `C:\Windows\System32\drivers\etc\hosts`
**Linux/Mac**: `/etc/hosts`

Add this line:
```
YOUR_SERVER_IP    your-domain-name
```

## Project Structure

```
honeypotResit/
├── backend/           # Node.js API server
│   ├── routes/       # API endpoints
│   ├── middleware/   # Authentication, logging
│   ├── database/     # SQLite database setup
│   ├── server.js     # Main server file
│   └── package.json
├── frontend/          # React application
│   ├── src/          # React components and pages
│   ├── dist/         # Built frontend (after npm run build)
│   └── package.json
└── README.md
```

## API Endpoints

All endpoints return JSON only (no HTML).

### 1. Login - `/api/auth/login`
- POST request
- Login with username/password
- Returns JWT token

### 2. Post - `/api/posts`  
- GET: List all posts
- POST: Create new post (requires authentication)

### 3. Comment - `/api/comments`
- GET `/api/comments/:postId`: Get comments for a post
- POST: Create comment (requires authentication)

### 4. Edit - `/api/edit/account`
- PUT: Update account info (requires authentication)

### 5. Account - `/api/account`
- GET: Show user account info and stats (requires authentication)

### 6. Upload - `/api/upload`
- POST: Upload file (requires authentication)
- GET: List user's files

### 7. WebHoneypot - `/api/honeypot/*`
Multiple fake admin endpoints:
- `/api/honeypot` - Main admin interface
- `/api/honeypot/admin` - Admin dashboard  
- `/api/honeypot/config` - Fake config access
- `/api/honeypot/database` - Fake database access
- And more...

## Default Login Credentials

**Admin user:**
- Username: `admin`  
- Password: `admin123`

**Demo user:**
- Username: `demo`
- Password: `demo123`

## Security Features

- JWT authentication for protected endpoints
- Password hashing with bcrypt
- Input validation 
- Rate limiting (100 requests per 15 minutes)
- Security headers
- File upload restrictions
- SQL injection protection

## Honeypot System

The honeypot includes fake administrative interfaces that look real but are designed to attract attackers. All interactions with honeypot endpoints are logged. The system includes:

- Fake admin login pages
- Fake database access
- Fake configuration files
- Fake user management
- Realistic error messages
- Fake sensitive data (API keys, etc.)

## Common Issues and Solutions

**Backend won't start:**
- Check if port 3001 is free: `sudo netstat -tulpn | grep :3001`
- Check PM2 logs: `pm2 logs honeypot-api`

**Frontend shows 404:**
- Make sure you ran `npm run build` in frontend directory
- Check nginx configuration
- Verify nginx is running: `sudo systemctl status nginx`

**API calls fail:**
- Check if backend is running: `curl http://localhost:3001/api/health`
- Verify nginx proxy is working

**You get 500 codes whith post request**
- Make sure the database isn't readonly (took waaaay to long to figure this out)

## Testing the Setup

1. Visit your domain in browser
2. Register/login with demo account
3. Try creating posts and comments
4. Test file upload
5. Check honeypot endpoints like `/api/honeypot/admin`

## Notes

This project was built for the honeypot course resit exam. 


# All the config files for the nginx webserver and the elk are also uploaded in this repo so I won't copy them here.

## Screenshot of my kibana dashboard

<img width="1960" height="1059" alt="image" src="https://github.com/user-attachments/assets/97b3176c-ffe3-465d-a8c1-9fddb8736992" />


Here you can see some visualizations for the webserver

1st of you have a count of all the records. next to that is a bar chart that shows the top 5 ip's with the most records (there are only 3 bars because I only created records with 3 ip addresses).
After that there's a pie chart of what gets accessed the most on the webpage, here you can see that the second most accessed thing is the /favicon.ico. 
Then after that there's another barchart that shows which http request gets requested the most. Next to that one is a pie chart that shows the ip addresses that visited the webserver.
Then there's a line chart that shows when the most records where made. Then a bar chart with the http response codes.
Last but not least theres a table that shows which ip address requested the honeypot parts of the website.

# Then the final part of the task... The log file

In the log file that you guys gave me we had to search for an attack. Pretty quickly you could notice that there was a sql injection. Why you may ask.
Because when I enter this command grep -c 'sqlmap' ~/Downloads/access.log (this counts how many times sqlmap apears in this log file) it says 142.
So that means that 142 of the requests where made by sqlmap, which is a popular pentesting tool/
