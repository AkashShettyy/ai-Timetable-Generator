# AI Timetable Generator

Smart university timetable generation system with real-time faculty availability sync.

## 🚀 Features

- **AI-Powered Timetable Generation** - Intelligent course scheduling with faculty expertise matching
- **Faculty Availability Sync** - Real-time sync between "Update Your Activity" and "My Teaching Schedule"
- **Conflict Detection** - Automatic detection of scheduling conflicts
- **Clean Table Display** - Professional timetable visualization
- **Role-Based Access** - Admin, Faculty, and Student dashboards

## 🛠️ Tech Stack

**Backend:**

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt password hashing

**Frontend:**

- React.js + Vite
- Tailwind CSS
- Axios for API calls
- React Router DOM

## ⚡ Quick Start

### Prerequisites

- Node.js (v16+)
- MongoDB running locally
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/AkashShettyy/ai-Timetable-Generator.git
cd ai-Timetable-Generator
```

2. **Setup Backend**

````bash
cd backend
npm install

3. **Create .env file in backend folder**
```bash
MONGO_URI=mongodb://localhost:27017/timetable
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=3001
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@university.edu

4. **Setup Database**
```bash
node createAdmin.js
node quickSetup.js

5. **Start Backend Server**
```bash
npm run dev

6. **Setup Frontend**
```bash
cd ../frontend
npm install
npm run dev

7. **Login Credentials**
```bash
- Admin: admin@university.edu / admin123
- Faculty: sarah.johnson@university.edu / admin123
````
