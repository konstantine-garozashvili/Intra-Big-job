# Deployment Setup for Intra-Big-Job Project

## Overview

This document summarizes the deployment setup for the Intra-Big-Job project using OVH hosting with automatic Git deployment.

## Domain Configuration

1. Created subdomain: `bigproject-development.konstantine.fr`
2. Added DNS records:
   - TXT record for `ovhcontrol.konstantine.fr` with value `3jsyD5XrGKJnkxH7AsD8eQ`
   - A record for `bigproject-development.konstantine.fr` pointing to `54.36.91.62`
   - A record for `www.bigproject-development.konstantine.fr` pointing to `54.36.91.62`
   - AAAA record for `bigproject-development.konstantine.fr` pointing to `2001:41d0:301::27`
   - AAAA record for `www.bigproject-development.konstantine.fr` pointing to `2001:41d0:301::27`

## Web Hosting Setup

1. Created hosting directories:
   - Added subdomain to OVH hosting
   - Set root folder to `/bigprjdev`
   - SSL certificates generated and enabled for both domains
   - OVH datacenter: eu-west-gra

## Database Configuration

1. Created MySQL database on OVH hosting:
   - Database name: `konstaxbigprjdev`
   - Database user: `konstaxbigprjdev`
   - Database host: `konstaxbigprjdev.mysql.db`
   - Database password: `Weaver0311`
   - Database server: MySQL v8.0

## Environment Configuration

The project uses environment-specific configuration files to manage different settings for local development and production:

1. `.env` - Default configuration for local Docker development
   - Contains development database settings (Docker container)
   - Local CORS settings
   - Local frontend URL

2. `.env.dev` - Production configuration for OVH deployment
   - Contains OVH database connection settings
   - Production CORS settings for the domain
   - Production frontend URL

Symfony automatically loads the appropriate configuration based on the environment:
- For local Docker: Uses `.env` with `APP_ENV=dev`
- For OVH hosting: Uses `.env.dev` with `APP_ENV=prod`

## Git Integration

1. Configured Git deployment:
   - Repository: `https://github.com/konstantine-garozashvili/Intra-Big-job.git`
   - Branch: `master`
   - Root folder: `bigprjdev`
   - Webhook URL: `https://webhooks-webhosting.eu.ovhapis.com/1.0/vcs/github/push/eyJhbGciOiJFZERTQSIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJ2ZXJzaW9uIjoxLCJuYW1lIjoia29uc3RheC5jbHVzdGVyMDI3Lmhvc3Rpbmcub3ZoLm5ldCIsInBhdGgiOiJiaWdwcmpkZXYiLCJjb3VudGVyIjowLCJzdWIiOiJnaXRodWIvZ2sxNjUxMjgtb3ZoIiwiZXhwIjoyNTI0NjA3OTk5LCJqdGkiOiI3OTg2ZjI4MWRhMDMxMWY4MzYwOTZjMmQzNzIzZmQ1ZTk5MTRkOTAyIn0.qnYsHhBjObkuRAF7_ypHFtG8eSQwunXiVZEAVO-tF-7c-fwW_7vFoXlEKthejmfZZ3mJsqXIwGbwzFPvHbvWCg`
   - Status: Active for both domains

## Deployment Workflow

The deployment is now set up with the following workflow:

1. Development occurs in the local environment
2. Changes are pushed to the GitHub repository's master branch
3. GitHub sends a webhook notification to OVH
4. OVH automatically pulls the latest changes from GitHub
5. The website is updated with the new code

## Configuration Files

### .htaccess Configuration

The project includes two important .htaccess files for OVH hosting:

1. **Root .htaccess** (/.htaccess)
   - Handles proper routing to the Symfony app
   - Redirects requests to the backend/public/index.php file
   - Sets PHP configuration for the entire site
   - Adds compression and caching rules

2. **Backend API .htaccess** (/backend/public/.htaccess-ovh)
   - Special configuration for the API
   - Handles CORS headers specifically for the production domain
   - Configures PHP settings optimized for API operation

**Important:** When deploying to OVH, make sure that:
1. The root .htaccess is placed in the root directory of your hosting
2. Rename /backend/public/.htaccess-ovh to /backend/public/.htaccess on the server

These .htaccess files ensure proper routing between frontend and backend components.

## Access Information

- Website URL: `https://bigproject-development.konstantine.fr`
- Control Panel: OVH Hosting Manager
- Repository: `https://github.com/konstantine-garozashvili/Intra-Big-job`

### SSH/FTP Access
- FTP server: `ftp.cluster027.hosting.ovh.net`
- SSH server: `ssh.cluster027.hosting.ovh.net`
- Username: `konstax`
- SSH/FTP password: `Weaver03111995`
- Home directory: `/home/konstax`
- FTP port: 21
- SFTP port: 22
- SSH port: 22

### Database Access
- Database name: `konstaxbigprjdev`
- Database user: `konstaxbigprjdev`
- Database password: `Weaver0311`
- Server address: `konstaxbigprjdev.mysql.db`
- Database phpMyAdmin: Via OVH Hosting Control Panel > Databases

