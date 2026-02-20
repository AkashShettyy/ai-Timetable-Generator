# Troubleshooting Network Errors in Student Dashboard

## Issues Fixed

### 1. API Endpoint Mismatches
**Problem**: Frontend was calling incorrect API endpoints
- ❌ `/students/add-project` → ✅ `/students/projects`
- ❌ `/students/project/:id` → ✅ `/students/projects/:projectId`
- ❌ `/students/add-internship` → ✅ `/students/internships`

### 2. CORS Configuration
**Problem**: Cross-origin requests were being blocked
**Solution**: Added proper CORS configuration in `backend/server.js`

### 3. Response Format Issues
**Problem**: Frontend expected specific response format
**Solution**: Updated backend controllers to return proper data structure

## How to Test

### 1. Start Both Servers
```bash
# Option 1: Use the batch script
start-dev.bat

# Option 2: Manual start
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Check Server Status
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### 3. Test the Activity Section
1. Login as a student
2. Complete student registration
3. Go to Activity tab
4. Try adding a project or internship

## Common Issues & Solutions

### Network Error: "Unable to connect to server"
**Cause**: Backend server is not running
**Solution**: 
1. Check if backend is running on port 5000
2. Restart backend: `cd backend && npm start`

### "Student profile not found" Error
**Cause**: User hasn't completed student registration
**Solution**: 
1. Go to "Register as Student" tab
2. Complete the registration form
3. Return to Activity tab

### CORS Errors in Browser Console
**Cause**: Frontend and backend on different origins
**Solution**: 
1. Ensure backend CORS is configured for localhost:5173
2. Check browser developer tools for specific CORS errors

### Authentication Errors
**Cause**: Invalid or expired JWT token
**Solution**:
1. Logout and login again
2. Check if token exists in localStorage
3. Verify JWT_SECRET in backend .env file

## Debug Steps

### 1. Check Browser Developer Tools
- Open F12 → Network tab
- Look for failed requests (red entries)
- Check request/response details

### 2. Check Backend Logs
- Look for request logs in backend terminal
- Check for error messages

### 3. Verify Environment Variables
**Frontend (.env)**:
```
VITE_API_BASE=http://localhost:5000/api
```

**Backend (.env)**:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Testing Endpoints

Use the test script to verify endpoints:
```bash
cd backend
node test-endpoints.js
```

## Contact
If issues persist, check:
1. MongoDB connection
2. All dependencies installed (`npm install`)
3. Correct Node.js version (14+)