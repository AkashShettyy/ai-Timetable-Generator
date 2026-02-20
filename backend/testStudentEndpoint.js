import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import { generateAndSaveStudentTimetable, getStudentTimetable } from './controllers/timetableController.js';

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

const testStudentEndpoint = async () => {
  try {
    await connectDB();
    
    const courses = await Course.find();
    const testStudentId = new mongoose.Types.ObjectId();
    const testCourses = courses.slice(0, 3).map(c => c._id);
    
    console.log('🧪 Testing student timetable endpoint...');
    
    // Generate timetable
    console.log('📝 Generating timetable...');
    await generateAndSaveStudentTimetable(testStudentId, testCourses);
    
    // Mock request object
    const mockReq = {
      user: { id: testStudentId }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('✅ Timetable endpoint response:');
        console.log(JSON.stringify(data, null, 2));
      },
      status: (code) => ({
        json: (data) => {
          console.log(`❌ Error ${code}:`, data);
        }
      })
    };
    
    // Test the endpoint
    const { getStudentTimetable } = await import('./controllers/timetableController.js');
    await getStudentTimetable(mockReq, mockRes);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testStudentEndpoint();