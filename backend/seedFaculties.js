import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './models/Faculty.js';
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

const sampleFaculties = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    facultyId: "FAC001",
    department: "Computer Science",
    expertise: ["Data Structures", "Algorithms", "Programming", "Software Engineering"],
    availability: {
      monday: ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
      tuesday: ["09:00-10:00", "11:00-12:00", "15:00-16:00"],
      wednesday: ["10:00-11:00", "13:00-14:00", "14:00-15:00"],
      thursday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"],
      friday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"]
    }
  },
  {
    name: "Prof. Michael Chen",
    email: "michael.chen@university.edu",
    facultyId: "FAC002",
    department: "Computer Science",
    expertise: ["Database Systems", "Web Development", "Machine Learning"],
    availability: {
      monday: ["10:00-11:00", "11:00-12:00", "15:00-16:00"],
      tuesday: ["09:00-10:00", "13:00-14:00", "14:00-15:00"],
      wednesday: ["09:00-10:00", "11:00-12:00", "15:00-16:00"],
      thursday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
      friday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"]
    }
  },
  {
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@university.edu",
    facultyId: "FAC003",
    department: "Mathematics",
    expertise: ["Calculus", "Linear Algebra", "Statistics", "Discrete Mathematics"],
    availability: {
      monday: ["09:00-10:00", "13:00-14:00", "15:00-16:00"],
      tuesday: ["10:00-11:00", "11:00-12:00", "14:00-15:00"],
      wednesday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"],
      thursday: ["09:00-10:00", "11:00-12:00", "15:00-16:00"],
      friday: ["10:00-11:00", "13:00-14:00", "14:00-15:00"]
    }
  },
  {
    name: "Prof. David Kumar",
    email: "david.kumar@university.edu",
    facultyId: "FAC004",
    department: "Electronics",
    expertise: ["Digital Electronics", "Microprocessors", "Communication Systems"],
    availability: {
      monday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
      tuesday: ["09:00-10:00", "10:00-11:00", "13:00-14:00"],
      wednesday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
      thursday: ["10:00-11:00", "13:00-14:00", "14:00-15:00"],
      friday: ["09:00-10:00", "11:00-12:00", "15:00-16:00"]
    }
  },
  {
    name: "Dr. Lisa Thompson",
    email: "lisa.thompson@university.edu",
    facultyId: "FAC005",
    department: "Physics",
    expertise: ["Physics I", "Physics II", "Quantum Mechanics", "Thermodynamics"],
    availability: {
      monday: ["10:00-11:00", "11:00-12:00", "13:00-14:00"],
      tuesday: ["09:00-10:00", "14:00-15:00", "15:00-16:00"],
      wednesday: ["09:00-10:00", "10:00-11:00", "15:00-16:00"],
      thursday: ["11:00-12:00", "13:00-14:00", "15:00-16:00"],
      friday: ["09:00-10:00", "13:00-14:00", "14:00-15:00"]
    }
  }
];

const seedFaculties = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Seeding faculties...');
    
    for (const facultyData of sampleFaculties) {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: facultyData.email });
        
        if (!user) {
          // Create user account for faculty
          const hashedPassword = await bcrypt.hash('faculty123', 10);
          
          user = await User.create({
            name: facultyData.name,
            email: facultyData.email,
            password: hashedPassword,
            role: 'faculty',
            facultyId: facultyData.facultyId,
            isApproved: true // Pre-approve for demo
          });
        }
        
        // Check if faculty profile exists
        const existingFaculty = await Faculty.findOne({ user_id: user._id });
        
        if (!existingFaculty) {
          // Create faculty profile
          await Faculty.create({
            user_id: user._id,
            name: facultyData.name,
            department: facultyData.department,
            expertise: facultyData.expertise,
            availability: facultyData.availability,
            max_weekly_hours: 20
          });
          
          console.log(`✅ Created faculty: ${facultyData.name}`);
        } else {
          console.log(`⚠️ Faculty already exists: ${facultyData.name}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create ${facultyData.name}:`, error.message);
      }
    }
    
    console.log('🎉 Faculty seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedFaculties();