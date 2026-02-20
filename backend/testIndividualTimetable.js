import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import { generateAndSaveStudentTimetable } from './controllers/timetableController.js';

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

const testIndividualTimetables = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing individual student timetable generation...');
    
    const courses = await Course.find();
    if (courses.length === 0) {
      console.log('❌ No courses found');
      process.exit(1);
    }
    
    // Test with 2 different students
    const student1Courses = courses.slice(0, 3).map(c => c._id);
    const student2Courses = courses.slice(2, 5).map(c => c._id);
    
    console.log('👨‍🎓 Generating timetable for Student 1...');
    const timetable1 = await generateAndSaveStudentTimetable(new mongoose.Types.ObjectId(), student1Courses);
    
    console.log('👩‍🎓 Generating timetable for Student 2...');
    const timetable2 = await generateAndSaveStudentTimetable(new mongoose.Types.ObjectId(), student2Courses);
    
    console.log('\n📅 Student 1 Timetable:');
    timetable1.forEach((session, i) => {
      console.log(`   ${i+1}. ${session.course} - ${session.faculty} - ${session.day} ${session.time}`);
    });
    
    console.log('\n📅 Student 2 Timetable:');
    timetable2.forEach((session, i) => {
      console.log(`   ${i+1}. ${session.course} - ${session.faculty} - ${session.day} ${session.time}`);
    });
    
    // Check for faculty conflicts
    const conflicts = [];
    timetable1.forEach(s1 => {
      timetable2.forEach(s2 => {
        if (s1.faculty === s2.faculty && s1.day === s2.day && s1.time === s2.time) {
          conflicts.push(`${s1.faculty} - ${s1.day} ${s1.time}`);
        }
      });
    });
    
    if (conflicts.length > 0) {
      console.log('\n❌ Faculty conflicts found:');
      conflicts.forEach(conflict => console.log(`   ${conflict}`));
    } else {
      console.log('\n✅ No faculty conflicts - System working correctly!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testIndividualTimetables();