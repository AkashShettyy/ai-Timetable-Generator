# AI Timetable Generator - Setup Guide

## 🚀 Quick Setup

### 1. Setup Sample Faculties
```bash
# Run this to create sample faculties with availability schedules
setup-faculties.bat
```

### 2. Start Development Servers
```bash
# Start both frontend and backend
start-dev.bat
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5173/admin/dashboard

## 📋 Features Implemented

### ✅ Faculty Management
- **Sample Faculties Created**: 5 faculties with different expertise areas
- **Availability Schedules**: Each faculty has specific time slots available
- **Admin Verification**: Faculties are pre-approved for demo purposes

### ✅ AI Timetable Generation
- **Smart Matching**: Matches faculty expertise with course requirements
- **Availability Check**: Considers faculty availability when scheduling
- **Conflict Resolution**: Prevents double-booking of faculty/rooms
- **Auto-Generation**: Timetable generates automatically when student registers

### ✅ Student Registration (1-8 Semesters)
- **Extended Semesters**: Now supports semesters 1-8 (was limited to 5)
- **Activity Logic**: 
  - Semesters 1-6: Can add **Projects**
  - Semesters 7-8: Can add **Internships**

## 🧪 Testing the System

### 1. Admin Login
```
Email: admin@university.edu
Password: admin123
```

### 2. Test Faculty Management
1. Go to Admin Dashboard → Faculty Management
2. View the 5 sample faculties created
3. Click "Generate AI Timetable" to test timetable generation

### 3. Test Student Registration & Timetable
1. Create a student account
2. Register as student (select semester 1-8)
3. Choose major/minor courses
4. Click Register → Timetable auto-generates
5. Go to "My Timetable" tab to view generated schedule

### 4. Test Activity Section
1. **For Semesters 1-6**: Add projects with GitHub links
2. **For Semesters 7-8**: Add internships with company details

## 📊 Sample Faculty Data

| Name | Department | Expertise | Available Days |
|------|------------|-----------|----------------|
| Dr. Sarah Johnson | Computer Science | Data Structures, Algorithms | Mon-Fri |
| Prof. Michael Chen | Computer Science | Database, Web Dev, ML | Mon-Fri |
| Dr. Emily Rodriguez | Mathematics | Calculus, Statistics | Mon-Fri |
| Prof. David Kumar | Electronics | Digital Electronics | Mon-Fri |
| Dr. Lisa Thompson | Physics | Physics I & II | Mon-Fri |

## 🤖 AI Timetable Algorithm

### Smart Features:
1. **Expertise Matching**: Matches faculty expertise with course titles
2. **Availability Checking**: Only schedules during faculty available hours
3. **Conflict Prevention**: Prevents scheduling conflicts
4. **Fallback Logic**: Assigns random slots if no perfect match found

### Example Logic:
```javascript
// If course is "Data Structures" → matches Dr. Sarah Johnson
// If Dr. Sarah is available Mon 9-10 AM → schedules there
// If slot taken → finds next available slot
```

## 🔧 Troubleshooting

### Faculty Not Showing?
```bash
# Re-run faculty setup
cd backend
node seedFaculties.js
```

### Timetable Not Generating?
1. Ensure faculties exist in database
2. Check if courses are uploaded
3. Verify student has selected courses
4. Check backend logs for errors

### Network Errors?
1. Ensure both servers are running
2. Check CORS configuration
3. Verify API endpoints match

## 📁 Key Files Modified

### Backend:
- `models/Faculty.js` - Updated with availability structure
- `models/Student.js` - Extended semester limit to 8
- `controllers/timetableController.js` - AI generation logic
- `controllers/studentController.js` - Auto-timetable trigger
- `seedFaculties.js` - Sample faculty data

### Frontend:
- `components/ActivitySection.jsx` - Fixed API endpoints & semester logic
- `pages/AdminPage.jsx` - Dashboard with navigation
- `pages/AdminFacultyManage.jsx` - Faculty management interface
- `App.jsx` - New admin routes

## 🎯 Next Steps

1. **Run Setup**: Execute `setup-faculties.bat`
2. **Start Servers**: Execute `start-dev.bat`
3. **Test Admin**: Login and view faculties
4. **Test Student**: Register and check timetable generation
5. **Test Activities**: Add projects/internships based on semester