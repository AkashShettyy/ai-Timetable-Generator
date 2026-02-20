# 🧠 AI Timetable Generator

Smart university timetable generation system with real-time faculty availability synchronization and intelligent conflict detection.

---

## 🚀 Features

### 🤖 AI-Powered Timetable Generation

- Intelligent course scheduling
- Faculty expertise-based assignment
- Availability-aware timetable creation
- Load balancing across faculty members

### 🔄 Real-Time Faculty Sync

- Sync between **"Update Your Activity"** and **"My Teaching Schedule"**
- Automatic conflict detection
- Visual conflict indicators
- Admin alerts for scheduling conflicts

### 🔐 Secure Role-Based Access

- Admin Dashboard
- Faculty Dashboard
- Student Dashboard
- JWT-based authentication
- Bcrypt password hashing

---

## 🛠️ Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt

### Frontend

- React.js (Vite)
- Tailwind CSS
- Axios
- React Router DOM

---

## ⚡ Quick Start Guide

### Prerequisites

- Node.js (v16+)
- MongoDB running locally
- Git

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AkashShettyy/ai-Timetable-Generator.git
cd ai-Timetable-Generator
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the **backend** folder:

```bash
MONGO_URI=mongodb://localhost:27017/timetable
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=3001
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@university.edu
```

---

### 3️⃣ Database Setup

```bash
node createAdmin.js
node quickSetup.js
```

---

### 4️⃣ Start Backend Server

```bash
npm run dev
```

Backend runs at:

```
http://localhost:3001
```

---

### 5️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔐 Demo Login Credentials

### 👨‍💼 Admin

Email: `admin@university.edu`  
Password: `admin123`

### 👩‍🏫 Faculty

Email: `sarah.johnson@university.edu`  
Password: `admin123`

---

## 🧪 Test Faculty Sync Feature

1. Login as Faculty
2. Go to Faculty Dashboard
3. Update availability (mark time slots unavailable)
4. Click **Update Availability**
5. Check **My Teaching Schedule**
6. Observe real-time sync and conflict warnings

---

## 🌐 Access Points

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Admin Dashboard: http://localhost:5173/admin/dashboard
- Faculty Dashboard: http://localhost:5173/faculty/dashboard

---

## 🎯 Core System Capabilities

- AI-driven timetable generation
- Faculty-course expertise matching
- Real-time availability synchronization
- Automatic conflict detection
- Room and faculty clash prevention
- Load-balanced scheduling
- Secure authentication system

---

## 📌 Future Enhancements

- Email conflict notifications
- Google Calendar integration
- Cloud deployment support
- Advanced analytics dashboard

---

## 👨‍💻 Author

**Akash N**  
Software Developer Apprentice  
Full Stack Developer

GitHub: https://github.com/AkashShettyy
