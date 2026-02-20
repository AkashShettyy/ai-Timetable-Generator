import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from './models/Room.js';

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

const sampleRooms = [
  { name: "Room A101", capacity: 40, type: "Lecture Hall" },
  { name: "Room A102", capacity: 35, type: "Classroom" },
  { name: "Room B201", capacity: 30, type: "Lab" },
  { name: "Room B202", capacity: 25, type: "Classroom" },
  { name: "Room C301", capacity: 50, type: "Lecture Hall" },
  { name: "Room C302", capacity: 20, type: "Seminar Room" },
  { name: "Lab D401", capacity: 30, type: "Computer Lab" },
  { name: "Lab D402", capacity: 25, type: "Electronics Lab" }
];

const seedRooms = async () => {
  try {
    await connectDB();
    
    console.log('🏢 Seeding rooms...');
    
    // Clear existing rooms
    await Room.deleteMany({});
    
    // Create new rooms
    for (const roomData of sampleRooms) {
      await Room.create(roomData);
      console.log(`✅ Created room: ${roomData.name}`);
    }
    
    console.log('🎉 Room seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedRooms();