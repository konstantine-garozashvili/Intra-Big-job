#!/bin/bash

# Build script for Intra-Big-job project

echo "Starting build process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend for production
echo "Building frontend for production..."
npm run build

echo "Build process completed!"
echo "The built files will be automatically deployed to production when you push to the repository." 