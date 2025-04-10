# OVH Deployment Guide

This guide explains how to deploy the Intra-Big-Job project on OVH hosting.

## Initial Setup

1. Connect to your OVH hosting via SSH:
   ```bash
   ssh konstax@ssh.cluster027.hosting.ovh.net -p 22
   # Password: Weaver03111995
   ```

2. Navigate to your deployment directory:
   ```bash
   cd ~/bigprjdev
   ```

3. Download the setup script:
   ```bash
   curl -O https://raw.githubusercontent.com/konstantine-garozashvili/Intra-Big-job/master/setup-ovh.sh
   chmod +x setup-ovh.sh
   ```

4. Run the setup script:
   ```bash
   ./setup-ovh.sh
   ```
   
   This script will:
   - Initialize or update the Git repository
   - Set up the proper .htaccess configuration
   - Remove any development-specific .env.local file
   - Install backend dependencies
   - Clear Symfony cache
   - Generate JWT keys if needed
   - Install frontend dependencies and build the frontend

## Manual Deployment Steps

If you prefer to perform the steps manually or if the script encounters issues:

1. Set up Git and pull the latest changes:
   ```bash
   git init
   git remote add origin https://github.com/konstantine-garozashvili/Intra-Big-job.git
   git fetch origin
   git reset --hard origin/master
   ```

2. Configure .htaccess:
   ```bash
   cp backend/public/.htaccess-ovh backend/public/.htaccess
   ```

3. Remove development configuration:
   ```bash
   rm -f backend/.env.local
   ```

4. Install backend dependencies:
   ```bash
   cd backend
   composer install --no-dev --optimize-autoloader
   php bin/console cache:clear --env=prod
   ```

5. Generate JWT keys:
   ```bash
   mkdir -p config/jwt
   php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction
   ```

6. Build the frontend:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

## Troubleshooting

If you encounter issues:

1. Check permissions:
   ```bash
   chmod -R 755 .
   chmod -R 777 backend/var
   chmod -R 777 backend/config/jwt
   ```

2. Verify the database connection:
   ```bash
   php backend/bin/console doctrine:schema:validate
   ```

3. Check the Apache error logs:
   ```bash
   tail -f ~/logs/apache/error.log
   ```

## Database Access

- Database name: `konstaxbigprjdev`
- Database user: `konstaxbigprjdev`
- Database password: `Weaver0311`
- Server address: `konstaxbigprjdev.mysql.db`

## Important Note on Environment Configuration

The project uses `.env.dev` with `APP_ENV=prod` for OVH production settings. Make sure this file exists and has the correct database connection string:

```
DATABASE_URL="mysql://konstaxbigprjdev:Weaver0311@konstaxbigprjdev.mysql.db:3306/konstaxbigprjdev?serverVersion=8.0&charset=utf8mb4"
``` 