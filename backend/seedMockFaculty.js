import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './models/Faculty.js';
import User from './models/User.js';
import Course from './models/Course.js';
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

const mockFaculty = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    facultyId: "FAC001",
    department: "Computer Science",
    canTeach: ["Programming Fundamentals", "Data Structures", "Algorithms", "Software Engineering"],
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
    canTeach: ["Database Systems", "Web Development", "Machine Learning", "Advanced Database Systems"],
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
    canTeach: ["Calculus I", "Calculus II", "Linear Algebra", "Discrete Mathematics"],
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
    canTeach: ["Digital Logic Design", "Electronics", "Digital Signal Processing", "Computer Organization"],
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
    canTeach: ["Physics I", "Physics II", "Quantum Computing", "Numerical Methods"],
    availability: {
      monday: ["10:00-11:00", "11:00-12:00", "13:00-14:00"],
      tuesday: ["09:00-10:00", "14:00-15:00", "15:00-16:00"],
      wednesday: ["09:00-10:00", "10:00-11:00", "15:00-16:00"],
      thursday: ["11:00-12:00", "13:00-14:00", "15:00-16:00"],
      friday: ["09:00-10:00", "13:00-14:00", "14:00-15:00"]
    }
  },
  {
    name: "Prof. James Wilson",
    email: "james.wilson@university.edu",
    facultyId: "FAC006",
    department: "Computer Science",
    canTeach: ["Operating Systems", "Computer Networks", "Distributed Systems", "Cybersecurity"],
    availability: {
      monday: ["09:00-10:00", "14:00-15:00"],
      tuesday: ["10:00-11:00", "13:00-14:00", "15:00-16:00"],
      wednesday: ["11:00-12:00", "14:00-15:00"],
      thursday: ["09:00-10:00", "10:00-11:00", "15:00-16:00"],
      friday: ["11:00-12:00", "13:00-14:00"]
    }
  },
  {
    name: "Dr. Maria Garcia",
    email: "maria.garcia@university.edu",
    facultyId: "FAC007",
    department: "Computer Science",
    canTeach: ["Artificial Intelligence", "Advanced Machine Learning", "Natural Language Processing", "Data Mining"],
    availability: {
      monday: ["10:00-11:00", "15:00-16:00"],
      tuesday: ["09:00-10:00", "11:00-12:00", "14:00-15:00"],
      wednesday: ["10:00-11:00", "13:00-14:00"],
      thursday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
      friday: ["09:00-10:00", "10:00-11:00"]
    }
  },
  {
    name: "Prof. Robert Brown",
    email: "robert.brown@university.edu",
    facultyId: "FAC008",
    department: "Mathematics",
    canTeach: ["Statistics", "Probability Theory", "Big Data Analytics", "Numerical Methods"],
    availability: {
      monday: ["11:00-12:00", "13:00-14:00"],
      tuesday: ["10:00-11:00", "15:00-16:00"],
      wednesday: ["09:00-10:00", "14:00-15:00", "15:00-16:00"],
      thursday: ["10:00-11:00", "13:00-14:00"],
      friday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"]
    }
  },
  {
    name: "Dr. Jennifer Lee",
    email: "jennifer.lee@university.edu",
    facultyId: "FAC009",
    department: "Computer Science",
    canTeach: ["Computer Graphics", "Human Computer Interaction", "Game Development", "Mobile App Development"],
    availability: {
      monday: ["09:00-10:00", "10:00-11:00"],
      tuesday: ["11:00-12:00", "13:00-14:00", "14:00-15:00"],
      wednesday: ["10:00-11:00", "15:00-16:00"],
      thursday: ["09:00-10:00", "14:00-15:00"],
      friday: ["10:00-11:00", "11:00-12:00", "13:00-14:00"]
    }
  },
  {
    name: "Prof. Ahmed Hassan",
    email: "ahmed.hassan@university.edu",
    facultyId: "FAC010",
    department: "Computer Science",
    canTeach: ["Compiler Design", "Software Architecture", "Advanced Software Engineering", "Emerging Technologies"],
    availability: {
      monday: ["13:00-14:00", "14:00-15:00"],
      tuesday: ["09:00-10:00", "10:00-11:00"],
      wednesday: ["11:00-12:00", "13:00-14:00"],
      thursday: ["11:00-12:00", "15:00-16:00"],
      friday: ["09:00-10:00", "14:00-15:00", "15:00-16:00"]
    }
  },
  {
    name: "Dr. Rachel Green",
    email: "rachel.green@university.edu",
    facultyId: "FAC011",
    department: "Management",
    canTeach: ["Project Management", "Business Management", "Entrepreneurship", "Innovation Management"],
    availability: {
      monday: ["10:00-11:00", "11:00-12:00", "15:00-16:00"],
      tuesday: ["13:00-14:00", "15:00-16:00"],
      wednesday: ["09:00-10:00", "14:00-15:00"],
      thursday: ["10:00-11:00", "13:00-14:00"],
      friday: ["11:00-12:00", "13:00-14:00"]
    }
  },
  {
    name: "Prof. Kevin Zhang",
    email: "kevin.zhang@university.edu",
    facultyId: "FAC012",
    department: "Computer Science",
    canTeach: ["Blockchain Technology", "Internet of Things", "Cloud Computing", "Advanced Algorithms"],
    availability: {
      monday: ["09:00-10:00", "14:00-15:00", "15:00-16:00"],
      tuesday: ["11:00-12:00", "14:00-15:00"],
      wednesday: ["10:00-11:00", "11:00-12:00"],
      thursday: ["09:00-10:00", "13:00-14:00"],
      friday: ["10:00-11:00", "15:00-16:00"]
    }
  },
  {
    name: "Dr. Susan Miller",
    email: "susan.miller@university.edu",
    facultyId: "FAC013",
    department: "Engineering",
    canTeach: ["Robotics", "Digital Signal Processing", "Computer Organization", "Electronics"],
    availability: {
      monday: ["11:00-12:00", "13:00-14:00"],
      tuesday: ["09:00-10:00", "10:00-11:00", "15:00-16:00"],
      wednesday: ["13:00-14:00", "15:00-16:00"],
      thursday: ["11:00-12:00", "14:00-15:00"],
      friday: ["09:00-10:00", "13:00-14:00", "14:00-15:00"]
    }
  },
  {
    name: "Prof. Daniel Kim",
    email: "daniel.kim@university.edu",
    facultyId: "FAC014",
    department: "Liberal Arts",
    canTeach: ["Technical English", "Communication Skills", "Foreign Language", "Research Methodology"],
    availability: {
      monday: ["10:00-11:00", "15:00-16:00"],
      tuesday: ["09:00-10:00", "13:00-14:00"],
      wednesday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
      thursday: ["10:00-11:00", "11:00-12:00"],
      friday: ["13:00-14:00", "15:00-16:00"]
    }
  },
  {
    name: "Dr. Patricia White",
    email: "patricia.white@university.edu",
    facultyId: "FAC015",
    department: "Computer Science",
    canTeach: ["Computer Fundamentals", "Object Oriented Programming", "Web Development", "Capstone Project I"],
    availability: {
      monday: ["09:00-10:00", "11:00-12:00"],
      tuesday: ["10:00-11:00", "14:00-15:00", "15:00-16:00"],
      wednesday: ["09:00-10:00", "13:00-14:00"],
      thursday: ["10:00-11:00", "15:00-16:00"],
      friday: ["11:00-12:00", "14:00-15:00"]
    }
  },
  {
    name: "Prof. Thomas Anderson",
    email: "thomas.anderson@university.edu",
    facultyId: "FAC016",
    department: "Interdisciplinary",
    canTeach: ["Logic and Reasoning", "Computer Ethics", "Environmental Science", "Career Development"],
    availability: {
      monday: ["13:00-14:00", "15:00-16:00"],
      tuesday: ["11:00-12:00", "13:00-14:00"],
      wednesday: ["10:00-11:00", "14:00-15:00"],
      thursday: ["09:00-10:00", "14:00-15:00"],
      friday: ["10:00-11:00", "11:00-12:00"]
    }
  },
  {
    name: "Dr. Linda Davis",
    email: "linda.davis@university.edu",
    facultyId: "FAC017",
    department: "Social Sciences",
    canTeach: ["Psychology", "Economics", "Leadership Skills", "Professional Networking"],
    availability: {
      monday: ["10:00-11:00", "14:00-15:00"],
      tuesday: ["09:00-10:00", "15:00-16:00"],
      wednesday: ["11:00-12:00", "13:00-14:00", "15:00-16:00"],
      thursday: ["10:00-11:00", "13:00-14:00"],
      friday: ["09:00-10:00", "14:00-15:00"]
    }
  },
  {
    name: "Prof. Mark Johnson",
    email: "mark.johnson@university.edu",
    facultyId: "FAC018",
    department: "Specialized",
    canTeach: ["Thesis Writing", "Industry Collaboration", "Technical Seminar", "Future of Technology"],
    availability: {
      monday: ["11:00-12:00", "15:00-16:00"],
      tuesday: ["10:00-11:00", "14:00-15:00"],
      wednesday: ["09:00-10:00", "13:00-14:00"],
      thursday: ["11:00-12:00", "14:00-15:00", "15:00-16:00"],
      friday: ["10:00-11:00", "13:00-14:00"]
    }
  }
];

const seedMockFaculty = async () => {
  try {
    await connectDB();
    
    console.log('🗑️ Clearing existing mock faculty...');
    await Faculty.deleteMany({ name: { $in: mockFaculty.map(f => f.name) } });
    await User.deleteMany({ email: { $in: mockFaculty.map(f => f.email) } });
    
    console.log('👨‍🏫 Seeding mock faculty...');
    
    for (const facultyData of mockFaculty) {
      try {
        // Create user account
        const hashedPassword = await bcrypt.hash('faculty123', 10);
        
        const user = await User.create({
          name: facultyData.name,
          email: facultyData.email,
          password: hashedPassword,
          role: 'faculty',
          facultyId: facultyData.facultyId,
          isApproved: true // Pre-approved mock data
        });
        
        // Create faculty profile
        await Faculty.create({
          user_id: user._id,
          name: facultyData.name,
          department: facultyData.department,
          expertise: facultyData.canTeach,
          availability: facultyData.availability,
          max_weekly_hours: 20
        });
        
        console.log(`✅ Created: ${facultyData.name} - ${facultyData.canTeach.join(', ')}`);
      } catch (error) {
        console.log(`❌ Failed to create ${facultyData.name}:`, error.message);
      }
    }
    
    const totalFaculty = await Faculty.countDocuments();
    console.log(`🎉 Successfully created ${totalFaculty} faculty members!`);
    
    // Show distribution
    console.log('\n📊 Faculty Distribution by Department:');
    const departments = await Faculty.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    departments.forEach(dept => {
      console.log(`  ${dept._id}: ${dept.count} faculty`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedMockFaculty();