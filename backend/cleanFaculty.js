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

const cleanFaculty = async () => {
  try {
    await connectDB();
    
    // Remove invalid faculty records
    const result = await Faculty.deleteMany({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: "undefined" },
        { name: "" },
        { department: "Not assigned" }
      ]
    });
    
    console.log(`🧹 Removed ${result.deletedCount} invalid faculty records`);
    
    // Check remaining faculty
    const validFaculty = await Faculty.find();
    console.log(`✅ ${validFaculty.length} valid faculty remaining:`);
    
    validFaculty.forEach((f, i) => {
      console.log(`${i+1}. ${f.name} - ${f.department}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

cleanFaculty();