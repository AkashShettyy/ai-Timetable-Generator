import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './models/Faculty.js';

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

const checkFaculty = async () => {
  try {
    await connectDB();
    
    const faculty = await Faculty.find();
    console.log(`📊 Found ${faculty.length} faculty members:`);
    
    faculty.forEach((f, i) => {
      console.log(`${i+1}. Name: "${f.name}" | Department: "${f.department}" | Expertise: [${f.expertise?.join(', ')}]`);
      console.log(`   Availability:`, f.availability);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkFaculty();