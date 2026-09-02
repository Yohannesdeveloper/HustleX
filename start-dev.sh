#!/bin/bash

echo "Starting HustleX Development Environment..."
echo

echo "Starting MongoDB Backend..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting React Frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup on exit
echo "Stopping servers..."
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
echo "Servers stopped."






