@echo off
echo Starting AI Timetable Development Environment...

echo.
echo 🚀 Starting Backend Server...
start "Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo.
echo 🎨 Starting Frontend Development Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo 📍 Backend: http://localhost:5000
echo 📍 Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul