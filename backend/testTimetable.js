import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Faculty from './models/Faculty.js';
import Room from './models/Room.js';
import { generateStudentTimetable } from './controllers/timetableController.js';

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

const testTimetableGeneration = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing timetable generation...');
    
    // Check data availability
    const courses = await Course.find();
    const faculty = await Faculty.find();
    const rooms = await Room.find();
    
    console.log(`📊 Data available:`);
    console.log(`   Courses: ${courses.length}`);
    console.log(`   Faculty: ${faculty.length}`);
    console.log(`   Rooms: ${rooms.length}`);
    
    if (courses.length === 0) {
      console.log('❌ No courses found. Please upload courses first.');
      process.exit(1);
    }
    
    if (faculty.length === 0) {
      console.log('❌ No faculty found. Please run faculty seeding first.');
      process.exit(1);
    }
    
    if (rooms.length === 0) {
      console.log('❌ No rooms found. Please upload rooms first.');
      process.exit(1);
    }
    
    // Test with first 3 courses
    const testCourses = courses.slice(0, 3).map(c => c._id);
    console.log(`🎯 Testing with ${testCourses.length} courses...`);
    
    const timetable = await generateStudentTimetable(testCourses);
    
    console.log('✅ Timetable generated successfully!');
    console.log(`📅 Generated ${timetable.length} sessions:`);
    
    timetable.forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.course} - ${session.faculty} - ${session.day} ${session.time} - ${session.room}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testTimetableGeneration();