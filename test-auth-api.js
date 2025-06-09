// Simple Node.js script to test the auth API response format
const fetch = require('node-fetch');

// You'll need to replace this with an actual token from localStorage
const TEST_TOKEN = 'YOUR_TOKEN_HERE';

async function testAuthAPI() {
  console.log('Testing /api/auth/me endpoint...');
  
  if (TEST_TOKEN === 'YOUR_TOKEN_HERE') {
    console.log('Please replace TEST_TOKEN with an actual token from localStorage');
    console.log('You can get it by running: localStorage.getItem("auth_token") in browser console');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const userData = await response.json();
      console.log('User data:', JSON.stringify(userData, null, 2));
      console.log('Role:', userData.role);
      console.log('Role type:', typeof userData.role);
      console.log('Role comparison with SUPERUSER:', userData.role === 'SUPERUSER');
    } else {
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('Request failed:', error.message);
  }
}

testAuthAPI();