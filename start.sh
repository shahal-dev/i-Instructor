#!/bin/bash

# Startup script for production deployment
echo "🚀 Starting i-Instructor application..."

# Set production environment
export NODE_ENV=production

# Create necessary directories
mkdir -p data
mkdir -p uploads/avatars
mkdir -p uploads/homework
mkdir -p uploads/session-files

# Initialize database if it doesn't exist
if [ ! -f "data/iinstructor.db" ]; then
    echo "📊 Initializing database..."
    node scripts/initDatabase.js
fi

# Start the application
echo "🌟 Starting server on port ${PORT:-3004}..."
node index.js
