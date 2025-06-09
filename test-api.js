// Test script for API endpoints
const baseUrl = 'http://localhost:3000';

async function testAuth() {
  console.log('=== Testing Authentication ===');
  
  try {
    // First, try to login to get a token
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'rodrigo.anst@gmail.com',
        password: 'your-password-here' // Replace with actual password
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    
    const token = loginData.token;
    console.log('Token obtained:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    // Test /api/auth/me
    console.log('\n2. Testing /api/auth/me...');
    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const meData = await meResponse.json();
    console.log('Me response:', meData);
    
    // Test /api/users
    console.log('\n3. Testing /api/users...');
    const usersResponse = await fetch(`${baseUrl}/api/users?page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const usersData = await usersResponse.json();
    console.log('Users response status:', usersResponse.status);
    console.log('Users response:', usersData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testAuth();
}

module.exports = { testAuth };