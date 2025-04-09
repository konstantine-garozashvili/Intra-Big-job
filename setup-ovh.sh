#!/bin/bash
# OVH Deployment Setup Script for Intra-Big-Job Project

echo "Starting OVH deployment setup..."
echo "--------------------------------"

# Ensure we're in the right directory
cd /home/konstax/bigprjdev

# If this is a fresh deployment, set up Git
if [ ! -d ".git" ]; then
  echo "Setting up Git repository..."
  git init
  git remote add origin https://github.com/konstantine-garozashvili/Intra-Big-job.git
  git fetch origin
  git reset --hard origin/master
else
  echo "Git repository already initialized. Pulling latest changes..."
  git fetch origin
  git reset --hard origin/master
fi

# Ensure proper .htaccess configuration
echo "Setting up .htaccess files..."
if [ -f "backend/public/.htaccess-ovh" ]; then
  cp backend/public/.htaccess-ovh backend/public/.htaccess
  echo "Backend .htaccess configured."
else
  echo "Warning: backend/public/.htaccess-ovh not found!"
fi

# Remove .env.local if it exists (should only be used in development)
if [ -f "backend/.env.local" ]; then
  echo "Removing development .env.local file..."
  rm backend/.env.local
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
composer install --no-dev --optimize-autoloader

# Clear Symfony cache
echo "Clearing Symfony cache..."
php bin/console cache:clear --env=prod

# Generate JWT keys if needed
if [ ! -f "config/jwt/private.pem" ]; then
  echo "Generating JWT keys..."
  mkdir -p config/jwt
  php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction
fi

# Set proper permissions
echo "Setting permissions..."
chmod -R 777 var
chmod -R 777 config/jwt

# Install frontend dependencies and build
echo "Installing frontend dependencies and building..."
cd ../frontend
npm install
echo "Building frontend in production mode..."
NODE_ENV=production npm run build

# Create a simple index.html in the root that redirects to the application
echo "Creating index.html redirect in the root directory..."
cat > ../index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0;URL='frontend/dist/'" />
</head>
<body>
  <p>Redirecting to application...</p>
</body>
</html>
EOF

echo "--------------------------------"
echo "OVH deployment setup completed."
echo "You can now access your site at: https://bigproject-development.konstantine.fr"