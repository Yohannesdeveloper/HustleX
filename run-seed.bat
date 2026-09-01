@echo off
cd backend
node seed-data.js
node create-freelancers.js
echo Database seeded successfully!
pause
