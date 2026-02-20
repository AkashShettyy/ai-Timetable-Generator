import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

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

const fixUsers = async () => {
  try {
    await connectDB();
    
    // Update all users to be verified and approved
    const result = await User.updateMany(
      {},
      { 
        $set: { 
          isVerified: true, 
          isApproved: true,
          otp: null,
          otpExpires: null
        } 
      }
    );
    
    console.log(`✅ Fixed ${result.modifiedCount} users`);
    console.log('🎉 All users can now login without verification!');
    
    // Show available accounts
    const users = await User.find({}, 'name email role');
    console.log('\n📋 Available accounts:');
    users.forEach(user => {
      console.log(`${user.role}: ${user.email} / password123 or faculty123 or admin123`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
};

fixUsers();
