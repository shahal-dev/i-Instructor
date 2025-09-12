#!/bin/bash

# Startup script for production deployment
echo "🚀 Starting i-Instructor application..."

# Set production environment
export NODE_ENV=production

# Create necessary directories
mkdir -p server/data
mkdir -p server/uploads/avatars
mkdir -p server/uploads/homework
mkdir -p server/uploads/session-files

# Initialize database if it doesn't exist
if [ ! -f "server/data/iinstructor.db" ]; then
    echo "📊 Initializing database..."
    cd server && node scripts/initDatabase.js
    cd ..
fi

# Start the application
echo "🌟 Starting server on port ${PORT:-3004}..."
cd server && node index.js
