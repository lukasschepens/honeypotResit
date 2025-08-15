# Web Security resit evaluation

## Overview
This document describes the individual setup for the resit evaluation of the course Web Security & Honeypot. Read this document carefully for the assignment requirements, deliverables and rules.

## Assignment
### Part 1: Web environment
Setup an NGINX web environment with the following requirements:
1. Use the latest NGINX version at least `version 1.26.2`
2. Create an **API** environment with the following requirements
   1. There is no HTML/CSS/JS - only returning JSON payloads
   2. The used framework or code language if by own preference
   3. Endpoints:
      1. Login
      2. Post
      3. Comment
      4. Edit
      5. Account
      6. Upload
      7. WebHoneypot
3. Secure the environment with the best practices from the course, for example authentication on the API
4. The environment is maintained on the git repositories with an extensive README

Info about the endpoints:
1. Login: login to the environment with known credentials
2. Post: create posts on the environment, this can be text messages
3. Comment: create comments on the environment, this can be reactions to the posts
4. Edit: edit the post,comments or account
5. Account: show all account information
6. Upload: upload a file to the environment
7. WebHoneypot: this is a Honeypot environment to distract attackers from the actual web environment. This is the main part of the environment and that needs to show in size and complexity

Everything about the environment must be well documented in the README file, with reasoning and tutorials on how to setup the environment.

### Part 2: Monitoring
Setup a second server with an Elastic Stack monitoring environment. This environment has the best practices applied from the course.

### Part 3: Pentest
Pentest the environment so generate logs with payloads in the monitoring environment.

### Part 4: Analyze logfile
Find the attack on the given logfile on LEHO in the Elastic Stack.

## Evaluation
Evaluation is based on 2 parts.
50% - setup environment
50% - oral examination

## Deadlines
- The deadline is on 17th august 23:59 - commit on gitlab the README with screenshots, the document for part 4, the code and all modified configuration files.
- Oral examination is during the exam period timing to be announced