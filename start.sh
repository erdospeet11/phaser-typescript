#!/bin/bash

# Start the database server (Express + SQLite)
echo "Starting database server..."
node server.js &

# Wait longer for database server to initialize
sleep 5  # Increased from 2 to 5 seconds
echo "Database server started"

# Start the webpack dev server
echo "Starting webpack dev server..."
npm run dev

# The script will wait here until webpack-dev-server is terminated
wait