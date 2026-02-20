import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Faculty from './models/Faculty.js';
import Room from './models/Room.js';
import Course from './models/Course.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const quickSetup = async () => {
  try {
    await connectDB();
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // 1. Create Admin
    await User.findOneAndUpdate(
      { email: 'admin@university.edu' },
      {
        name: 'Admin',
        email: 'admin@university.edu',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isApproved: true
      },
      { upsert: true }
    );
    
    // 2. Create Faculty
    const facultyData = [
      { name: 'Dr. Sarah Johnson', email: 'sarah@university.edu', dept: 'Computer Science', expertise: ['Programming', 'Data Structures'] },
      { name: 'Prof. Michael Chen', email: 'michael@university.edu', dept: 'Computer Science', expertise: ['Database', 'Web Development'] }
    ];
    
    for (const f of facultyData) {
      const user = await User.findOneAndUpdate(
        { email: f.email },
        {
          name: f.name,
          email: f.email,
          password: hashedPassword,
          role: 'faculty',
          isVerified: true,
          isApproved: true
        },
        { upsert: true, new: true }
      );
      
      await Faculty.findOneAndUpdate(
        { user_id: user._id },
        {
          user_id: user._id,
          name: f.name,
          department: f.dept,
          expertise: f.expertise,
          availability: {
            Monday: ['09:00-10:00', '10:00-11:00'],
            Tuesday: ['09:00-10:00', '11:00-12:00'],
            Wednesday: ['10:00-11:00', '13:00-14:00']
          }
        },
        { upsert: true }
      );
    }
    
    // 3. Create Rooms
    const rooms = [
      { name: 'Room A101', capacity: 40 },
      { name: 'Room A102', capacity: 35 },
      { name: 'Lab B201', capacity: 30 }
    ];
    
    for (const r of rooms) {
      await Room.findOneAndUpdate({ name: r.name }, r, { upsert: true });
    }
    
    // 4. Create Courses
    const courses = [
      { code: 'CS101', title: 'Programming Fundamentals', semester: 1, category: 'major', credits: 4 },
      { code: 'CS201', title: 'Data Structures', semester: 2, category: 'major', credits: 4 },
      { code: 'CS301', title: 'Database Systems', semester: 3, category: 'major', credits: 4 },
      { code: 'MATH101', title: 'Calculus I', semester: 1, category: 'minor', credits: 3 }
    ];
    
    for (const c of courses) {
      await Course.findOneAndUpdate({ code: c.code }, c, { upsert: true });
    }
    
    console.log('🎉 Quick setup completed!');
    console.log('👑 Admin: admin@university.edu / admin123');
    console.log('👨🏫 Faculty: sarah@university.edu / admin123');
    console.log('📊 Data: 2 faculty, 3 rooms, 4 courses');
    console.log('🚀 Ready for timetable generation!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

quickSetup();
