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

const newAvailabilitySchedules = [
  {
    monday: ["09:00-10:00", "10:00-11:00", "14:00-15:00", "15:00-16:00"],
    tuesday: ["09:00-10:00", "11:00-12:00", "15:00-16:00", "16:00-17:00"],
    wednesday: ["10:00-11:00", "13:00-14:00", "14:00-15:00"],
    thursday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"],
    friday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
    saturday: ["09:00-10:00", "10:00-11:00", "11:00-12:00"]
  },
  {
    monday: ["10:00-11:00", "11:00-12:00", "15:00-16:00"],
    tuesday: ["09:00-10:00", "13:00-14:00", "14:00-15:00", "16:00-17:00"],
    wednesday: ["09:00-10:00", "11:00-12:00", "15:00-16:00"],
    thursday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
    friday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"],
    saturday: ["12:00-13:00", "13:00-14:00", "14:00-15:00"]
  },
  {
    monday: ["09:00-10:00", "13:00-14:00", "15:00-16:00"],
    tuesday: ["10:00-11:00", "11:00-12:00", "14:00-15:00"],
    wednesday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"],
    thursday: ["09:00-10:00", "11:00-12:00", "15:00-16:00"],
    friday: ["10:00-11:00", "13:00-14:00", "14:00-15:00"],
    saturday: ["09:00-10:00", "15:00-16:00", "16:00-17:00"]
  },
  {
    monday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
    tuesday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"],
    wednesday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
    thursday: ["10:00-11:00", "13:00-14:00", "14:00-15:00"],
    friday: ["09:00-10:00", "11:00-12:00", "15:00-16:00"],
    saturday: ["10:00-11:00", "11:00-12:00", "12:00-13:00"]
  },
  {
    monday: ["10:00-11:00", "11:00-12:00", "13:00-14:00"],
    tuesday: ["09:00-10:00", "14:00-15:00", "15:00-16:00"],
    wednesday: ["09:00-10:00", "10:00-11:00", "15:00-16:00"],
    thursday: ["11:00-12:00", "13:00-14:00", "15:00-16:00"],
    friday: ["09:00-10:00", "13:00-14:00", "14:00-15:00"],
    saturday: ["13:00-14:00", "14:00-15:00", "15:00-16:00"]
  }
];

const updateFacultyAvailability = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Updating faculty availability to Monday-Saturday...');
    
    const faculty = await Faculty.find();
    
    for (let i = 0; i < faculty.length; i++) {
      const f = faculty[i];
      const scheduleIndex = i % newAvailabilitySchedules.length;
      const newSchedule = newAvailabilitySchedules[scheduleIndex];
      
      await Faculty.findByIdAndUpdate(f._id, {
        availability: newSchedule
      });
      
      console.log(`✅ Updated ${f.name} - Now available Mon-Sat`);
    }
    
    console.log('🎉 All faculty updated with Monday-Saturday availability!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
};

updateFacultyAvailability();