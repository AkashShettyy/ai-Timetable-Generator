import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';

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

const semesterCourses = {
  1: {
    major: [
      { code: 'CS101', title: 'Programming Fundamentals', credits: 4, category: 'major', semester: 1 },
      { code: 'CS102', title: 'Computer Fundamentals', credits: 3, category: 'major', semester: 1 },
      { code: 'CS103', title: 'Digital Logic Design', credits: 4, category: 'major', semester: 1 }
    ],
    minor: [
      { code: 'MATH101', title: 'Calculus I', credits: 4, category: 'minor', semester: 1 },
      { code: 'MATH102', title: 'Linear Algebra', credits: 3, category: 'minor', semester: 1 },
      { code: 'PHYS101', title: 'Physics I', credits: 4, category: 'minor', semester: 1 }
    ],
    optional: [
      { code: 'ENG101', title: 'Technical English', credits: 2, category: 'optional', semester: 1 },
      { code: 'COMM101', title: 'Communication Skills', credits: 2, category: 'optional', semester: 1 },
      { code: 'PHIL101', title: 'Logic and Reasoning', credits: 2, category: 'optional', semester: 1 }
    ]
  },
  2: {
    major: [
      { code: 'CS201', title: 'Object Oriented Programming', credits: 4, category: 'major', semester: 2 },
      { code: 'CS202', title: 'Data Structures', credits: 4, category: 'major', semester: 2 },
      { code: 'CS203', title: 'Computer Organization', credits: 3, category: 'major', semester: 2 }
    ],
    minor: [
      { code: 'MATH201', title: 'Calculus II', credits: 4, category: 'minor', semester: 2 },
      { code: 'MATH202', title: 'Discrete Mathematics', credits: 3, category: 'minor', semester: 2 },
      { code: 'STAT201', title: 'Statistics', credits: 3, category: 'minor', semester: 2 }
    ],
    optional: [
      { code: 'MGMT201', title: 'Business Management', credits: 2, category: 'optional', semester: 2 },
      { code: 'PSYC201', title: 'Psychology', credits: 2, category: 'optional', semester: 2 },
      { code: 'ECO201', title: 'Economics', credits: 2, category: 'optional', semester: 2 }
    ]
  },
  3: {
    major: [
      { code: 'CS301', title: 'Algorithms', credits: 4, category: 'major', semester: 3 },
      { code: 'CS302', title: 'Database Systems', credits: 4, category: 'major', semester: 3 },
      { code: 'CS303', title: 'Operating Systems', credits: 4, category: 'major', semester: 3 }
    ],
    minor: [
      { code: 'MATH301', title: 'Probability Theory', credits: 3, category: 'minor', semester: 3 },
      { code: 'ELEC301', title: 'Electronics', credits: 4, category: 'minor', semester: 3 },
      { code: 'PHYS301', title: 'Physics II', credits: 3, category: 'minor', semester: 3 }
    ],
    optional: [
      { code: 'ART301', title: 'Digital Arts', credits: 2, category: 'optional', semester: 3 },
      { code: 'MUS301', title: 'Music Theory', credits: 2, category: 'optional', semester: 3 },
      { code: 'HIST301', title: 'History of Computing', credits: 2, category: 'optional', semester: 3 }
    ]
  },
  4: {
    major: [
      { code: 'CS401', title: 'Software Engineering', credits: 4, category: 'major', semester: 4 },
      { code: 'CS402', title: 'Computer Networks', credits: 4, category: 'major', semester: 4 },
      { code: 'CS403', title: 'Web Development', credits: 3, category: 'major', semester: 4 }
    ],
    minor: [
      { code: 'MATH401', title: 'Numerical Methods', credits: 3, category: 'minor', semester: 4 },
      { code: 'MGMT401', title: 'Project Management', credits: 3, category: 'minor', semester: 4 },
      { code: 'ELEC401', title: 'Digital Signal Processing', credits: 4, category: 'minor', semester: 4 }
    ],
    optional: [
      { code: 'LANG401', title: 'Foreign Language', credits: 2, category: 'optional', semester: 4 },
      { code: 'ENTR401', title: 'Entrepreneurship', credits: 2, category: 'optional', semester: 4 },
      { code: 'ENV401', title: 'Environmental Science', credits: 2, category: 'optional', semester: 4 }
    ]
  },
  5: {
    major: [
      { code: 'CS501', title: 'Machine Learning', credits: 4, category: 'major', semester: 5 },
      { code: 'CS502', title: 'Compiler Design', credits: 4, category: 'major', semester: 5 },
      { code: 'CS503', title: 'Computer Graphics', credits: 3, category: 'major', semester: 5 }
    ],
    minor: [
      { code: 'AI501', title: 'Artificial Intelligence', credits: 4, category: 'minor', semester: 5 },
      { code: 'CYBER501', title: 'Cybersecurity', credits: 3, category: 'minor', semester: 5 },
      { code: 'DATA501', title: 'Data Mining', credits: 3, category: 'minor', semester: 5 }
    ],
    optional: [
      { code: 'GAME501', title: 'Game Development', credits: 2, category: 'optional', semester: 5 },
      { code: 'MOBILE501', title: 'Mobile App Development', credits: 2, category: 'optional', semester: 5 },
      { code: 'CLOUD501', title: 'Cloud Computing', credits: 2, category: 'optional', semester: 5 }
    ]
  },
  6: {
    major: [
      { code: 'CS601', title: 'Advanced Algorithms', credits: 4, category: 'major', semester: 6 },
      { code: 'CS602', title: 'Distributed Systems', credits: 4, category: 'major', semester: 6 },
      { code: 'CS603', title: 'Human Computer Interaction', credits: 3, category: 'major', semester: 6 }
    ],
    minor: [
      { code: 'BLOCK601', title: 'Blockchain Technology', credits: 3, category: 'minor', semester: 6 },
      { code: 'IOT601', title: 'Internet of Things', credits: 3, category: 'minor', semester: 6 },
      { code: 'ROBOT601', title: 'Robotics', credits: 4, category: 'minor', semester: 6 }
    ],
    optional: [
      { code: 'RESEARCH601', title: 'Research Methodology', credits: 2, category: 'optional', semester: 6 },
      { code: 'ETHICS601', title: 'Computer Ethics', credits: 2, category: 'optional', semester: 6 },
      { code: 'INNOV601', title: 'Innovation Management', credits: 2, category: 'optional', semester: 6 }
    ]
  },
  7: {
    major: [
      { code: 'CS701', title: 'Advanced Machine Learning', credits: 4, category: 'major', semester: 7 },
      { code: 'CS702', title: 'Software Architecture', credits: 4, category: 'major', semester: 7 },
      { code: 'CS703', title: 'Advanced Database Systems', credits: 4, category: 'major', semester: 7 }
    ],
    minor: [
      { code: 'QUANTUM701', title: 'Quantum Computing', credits: 3, category: 'minor', semester: 7 },
      { code: 'BIG701', title: 'Big Data Analytics', credits: 4, category: 'minor', semester: 7 },
      { code: 'NLP701', title: 'Natural Language Processing', credits: 3, category: 'minor', semester: 7 }
    ],
    optional: [
      { code: 'STARTUP701', title: 'Startup Development', credits: 2, category: 'optional', semester: 7 },
      { code: 'PATENT701', title: 'Patent and IP Law', credits: 2, category: 'optional', semester: 7 },
      { code: 'LEAD701', title: 'Leadership Skills', credits: 2, category: 'optional', semester: 7 }
    ]
  },
  8: {
    major: [
      { code: 'CS801', title: 'Capstone Project I', credits: 6, category: 'major', semester: 8 },
      { code: 'CS802', title: 'Advanced Software Engineering', credits: 4, category: 'major', semester: 8 },
      { code: 'CS803', title: 'Emerging Technologies', credits: 3, category: 'major', semester: 8 }
    ],
    minor: [
      { code: 'THESIS801', title: 'Thesis Writing', credits: 4, category: 'minor', semester: 8 },
      { code: 'INDUSTRY801', title: 'Industry Collaboration', credits: 3, category: 'minor', semester: 8 },
      { code: 'SEMINAR801', title: 'Technical Seminar', credits: 2, category: 'minor', semester: 8 }
    ],
    optional: [
      { code: 'CAREER801', title: 'Career Development', credits: 2, category: 'optional', semester: 8 },
      { code: 'NETWORK801', title: 'Professional Networking', credits: 2, category: 'optional', semester: 8 },
      { code: 'FUTURE801', title: 'Future of Technology', credits: 2, category: 'optional', semester: 8 }
    ]
  }
};

const seedSemesterCourses = async () => {
  try {
    await connectDB();
    
    console.log('🗑️ Clearing existing courses...');
    await Course.deleteMany({});
    
    console.log('📚 Seeding semester-wise courses...');
    
    for (let semester = 1; semester <= 8; semester++) {
      const courses = semesterCourses[semester];
      
      // Add major courses
      for (const course of courses.major) {
        await Course.create(course);
        console.log(`✅ Sem ${semester} Major: ${course.code} - ${course.title}`);
      }
      
      // Add minor courses
      for (const course of courses.minor) {
        await Course.create(course);
        console.log(`✅ Sem ${semester} Minor: ${course.code} - ${course.title}`);
      }
      
      // Add optional courses
      for (const course of courses.optional) {
        await Course.create(course);
        console.log(`✅ Sem ${semester} Optional: ${course.code} - ${course.title}`);
      }
      
      console.log(`📖 Semester ${semester} completed\n`);
    }
    
    const totalCourses = await Course.countDocuments();
    console.log(`🎉 Successfully created ${totalCourses} courses across 8 semesters!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedSemesterCourses();