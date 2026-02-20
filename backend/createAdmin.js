import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
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

const createAdmin = async () => {
  try {
    await connectDB();
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@university.edu' });
    
    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      console.log('📧 Email: admin@university.edu');
      console.log('🔑 Password: admin123');
      process.exit(0);
    }
    
    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      name: 'System Administrator',
      email: 'admin@university.edu',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isApproved: true
    });
    
    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@university.edu');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Admin creation failed:', error);
    process.exit(1);
  }
};

createAdmin();
