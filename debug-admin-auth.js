// Debug script to test admin authentication
// Run this in the browser console to see the authentication flow

console.log('=== DEBUGGING ADMIN AUTHENTICATION ===');

// Check localStorage token
const token = localStorage.getItem('auth_token');
console.log('1. Token in localStorage:', token ? 'Present' : 'Missing');
if (token) {
  console.log('   Token preview:', token.substring(0, 20) + '...');
}

// Test /api/auth/me endpoint directly
async function testAuthMe() {
  console.log('\n2. Testing /api/auth/me endpoint:');
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('   Response status:', response.status);
    console.log('   Response ok:', response.ok);
    
    if (response.ok) {
      const user = await response.json();
      console.log('   User data:', user);
      console.log('   User role:', user.role);
      console.log('   User role type:', typeof user.role);
      console.log('   Is SUPERUSER?:', user.role === 'SUPERUSER');
    } else {
      const error = await response.text();
      console.log('   Error response:', error);
    }
  } catch (error) {
    console.log('   Fetch error:', error);
  }
}

// Check AuthContext state if available
function checkAuthContext() {
  console.log('\n3. Checking AuthContext state (if available):');
  
  // Try to access React DevTools or context
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('   React detected, but AuthContext state not directly accessible');
    console.log('   Check React DevTools Components tab for AuthProvider state');
  }
  
  // Look for auth-related global variables
  const globals = Object.keys(window).filter(key => 
    key.toLowerCase().includes('auth') || 
    key.toLowerCase().includes('user')
  );
  console.log('   Auth-related globals:', globals);
}

// Check for timing issues
function checkTiming() {
  console.log('\n4. Checking for timing issues:');
  console.log('   Document ready state:', document.readyState);
  console.log('   Current URL:', window.location.href);
  console.log('   Page load time since navigation:', performance.now());
}

// Run all tests
async function runDebug() {
  await testAuthMe();
  checkAuthContext();
  checkTiming();
  
  console.log('\n=== DEBUG COMPLETE ===');
  console.log('Check the console logs above for any issues.');
  console.log('Also check the Network tab for /api/auth/me requests.');
}

// Execute if token exists
if (token) {
  runDebug();
} else {
  console.log('No auth token found. Please log in first.');
}