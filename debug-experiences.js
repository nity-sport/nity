// Debug script for experiences API
const fetch = require('node-fetch');

async function testExperiencesAPI() {
  try {
    console.log('Testing experiences API...');
    
    // Test the API endpoint directly
    const response = await fetch('http://localhost:3000/api/experiences');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('Number of experiences returned:', data.data.length);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

// Also test with authentication
async function testWithAuth() {
  try {
    console.log('\nTesting with authentication...');
    
    // You would need to replace this with a real token
    const token = 'your-auth-token-here';
    
    const response = await fetch('http://localhost:3000/api/experiences', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('Authenticated API Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing authenticated API:', error.message);
  }
}

// Run tests
testExperiencesAPI();