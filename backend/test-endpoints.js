// Quick test script to verify endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Test if server is running
async function testServer() {
  try {
    const response = await fetch('http://localhost:5000');
    const text = await response.text();
    console.log('✅ Server is running:', text);
    return true;
  } catch (error) {
    console.log('❌ Server is not running:', error.message);
    return false;
  }
}

// Test student routes
async function testStudentRoutes() {
  console.log('\n🧪 Testing Student Routes:');
  
  const routes = [
    { method: 'GET', path: '/students', desc: 'Get all students' },
    { method: 'POST', path: '/students/projects', desc: 'Add project endpoint' },
    { method: 'POST', path: '/students/internships', desc: 'Add internship endpoint' }
  ];

  for (const route of routes) {
    try {
      const response = await fetch(`${API_BASE}${route.path}`, {
        method: route.method,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 401) {
        console.log(`✅ ${route.desc}: Endpoint exists (requires auth)`);
      } else {
        console.log(`✅ ${route.desc}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${route.desc}: ${error.message}`);
    }
  }
}

async function runTests() {
  const serverRunning = await testServer();
  if (serverRunning) {
    await testStudentRoutes();
  }
}

runTests();