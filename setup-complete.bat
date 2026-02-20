@echo off
echo Setting up complete timetable system...
echo.

cd backend

echo 🏢 Setting up rooms...
node seedRooms.js

echo.
echo 👨‍🏫 Setting up faculties...
node seedFaculties.js

echo.
echo 🧪 Testing timetable generation...
node testTimetable.js

echo.
echo ✅ Setup completed! You can now:
echo 1. Start the servers with start-dev.bat
echo 2. Register students and see auto-generated timetables
echo 3. Use admin panel to manage faculties
pause