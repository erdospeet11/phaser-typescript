#!/bin/bash

#start the database server (Express + SQLite)
echo "Starting database server..."
node server.js &

#wait for database server
sleep 5
echo "Database server started"

#start the dev server
echo "Starting dev server..."
npm run dev

#wait until dev-server is terminated
wait