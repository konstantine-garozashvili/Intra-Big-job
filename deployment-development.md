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
   - Set root folder to `/bigprj`
   - SSL certificates generated and enabled for both domains

## Database Configuration

1. Created MySQL database on OVH hosting:
   - Database name: `konstax_bigprjg`
   - Database user: `konstax_bigprjg`
   - Database host: `konstaxglobal.mysql.db`
   - Database server: MySQL 8.0

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
   - Webhook URL: `https://webhooks-webhosting.eu.ovhapis.com/1.0/vcs/git ...`
   - Status: Active for both domains

## Deployment Workflow

The deployment is now set up with the following workflow:

1. Development occurs in the local environment
2. Changes are pushed to the GitHub repository's master branch
3. GitHub sends a webhook notification to OVH
4. OVH automatically pulls the latest changes from GitHub
5. The website is updated with the new code

## Configuration Files

We should configure .htaccess for proper routing.

For production, the server uses the `.env.dev` file which automatically sets the production database and other settings.

## Access Information

- Website URL: `https://bigproject-development.konstantine.fr`
- Control Panel: OVH Hosting Manager
- Repository: `https://github.com/konstantine-garozashvili/Intra-Big-job`
- Database phpMyAdmin: Via OVH Hosting Control Panel > Databases

