// Complete authentication flow debugging script
// Paste this into the browser console on the admin users page

console.log('🔍 COMPREHENSIVE AUTH DEBUGGING STARTED');
console.log('=========================================');

// 1. Check current page and timing
console.log('\n📍 CURRENT STATE:');
console.log('Current URL:', window.location.href);
console.log('Document ready state:', document.readyState);
console.log('Page load time:', Math.round(performance.now()), 'ms');

// 2. Check localStorage token
console.log('\n🔑 TOKEN ANALYSIS:');
const token = localStorage.getItem('auth_token');
if (token) {
  console.log('✅ Token exists in localStorage');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Try to decode JWT payload (base64)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Token expires:', new Date(payload.exp * 1000));
    console.log('Token valid?', Date.now() < payload.exp * 1000);
  } catch (e) {
    console.log('❌ Failed to decode token:', e.message);
  }
} else {
  console.log('❌ No token found in localStorage');
}

// 3. Test API endpoint directly
async function testApiAuth() {
  console.log('\n🌐 API ENDPOINT TEST:');
  if (!token) {
    console.log('❌ Cannot test API - no token');
    return null;
  }
  
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ API returned user data:');
      console.log('User:', userData);
      console.log('Role:', userData.role);
      console.log('Role type:', typeof userData.role);
      console.log('Is SUPERUSER?:', userData.role === 'SUPERUSER');
      return userData;
    } else {
      const errorText = await response.text();
      console.log('❌ API error:', errorText);
      return null;
    }
  } catch (error) {
    console.log('❌ API request failed:', error);
    return null;
  }
}

// 4. Check React AuthContext state
function checkReactContext() {
  console.log('\n⚛️ REACT CONTEXT ANALYSIS:');
  
  // Look for React Fiber nodes to inspect AuthContext
  const reactRoot = document.querySelector('#__next');
  if (reactRoot && reactRoot._reactInternalInstance) {
    console.log('React instance found, but context inspection requires React DevTools');
  }
  
  // Check for any auth-related globals
  const authGlobals = Object.keys(window).filter(key => 
    key.toLowerCase().includes('auth') || 
    key.toLowerCase().includes('user') ||
    key.toLowerCase().includes('context')
  );
  
  if (authGlobals.length > 0) {
    console.log('Auth-related globals found:', authGlobals);
  } else {
    console.log('No auth-related globals found');
  }
}

// 5. Check for console logs from AuthContext
function checkConsoleLogs() {
  console.log('\n📝 CONSOLE LOG MONITORING:');
  console.log('Look for these patterns in the console:');
  console.log('- [Auth] checkAuthStatus - Usuário validado:');
  console.log('- [Auth] isSuperuser final value:');
  console.log('- [Admin Users] useEffect - isSuperuser:');
  console.log('- [Admin Users] Access denied - not superuser');
  
  // Override console.log temporarily to catch auth logs
  const originalConsoleLog = console.log;
  const authLogs = [];
  
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('[Auth]') || message.includes('[Admin Users]')) {
      authLogs.push({ timestamp: Date.now(), message, args });
    }
    originalConsoleLog.apply(console, args);
  };
  
  // Restore after 5 seconds
  setTimeout(() => {
    console.log = originalConsoleLog;
    if (authLogs.length > 0) {
      console.log('\n📋 CAPTURED AUTH LOGS:');
      authLogs.forEach(log => {
        console.log(`[${new Date(log.timestamp).toISOString()}]`, log.message);
      });
    } else {
      console.log('No auth logs captured in the last 5 seconds');
    }
  }, 5000);
}

// 6. Check for network requests
function monitorNetworkRequests() {
  console.log('\n🌐 NETWORK MONITORING:');
  console.log('Open Network tab and look for:');
  console.log('- /api/auth/me requests');
  console.log('- Response status and payload');
  console.log('- Authorization header');
  
  // We can't directly monitor fetch requests, but we can check for any ongoing requests
  console.log('Check Network tab for any pending /api/auth/me requests');
}

// 7. Test AuthContext hook simulation
function simulateAuthContextCheck() {
  console.log('\n🔄 SIMULATING AUTH CONTEXT LOGIC:');
  
  // Simulate the isSuperuser calculation based on the code
  return testApiAuth().then(userData => {
    if (userData) {
      console.log('\n🧮 SIMULATING FRONTEND LOGIC:');
      console.log('Step 1 - API returns user:', userData);
      console.log('Step 2 - User role:', userData.role);
      console.log('Step 3 - UserRole.SUPERUSER constant:', 'SUPERUSER');
      console.log('Step 4 - Comparison result:', userData.role === 'SUPERUSER');
      console.log('Step 5 - Expected isSuperuser value:', userData.role === 'SUPERUSER');
      
      if (userData.role === 'SUPERUSER') {
        console.log('✅ User SHOULD have admin access');
      } else {
        console.log('❌ User should NOT have admin access');
        console.log('   Current role:', userData.role);
        console.log('   Required role: SUPERUSER');
      }
    }
  });
}

// 8. Check for timing/loading issues
function checkTimingIssues() {
  console.log('\n⏰ TIMING ANALYSIS:');
  
  // Check if page is still loading
  if (document.readyState !== 'complete') {
    console.log('⚠️ Page still loading, this might cause timing issues');
  } else {
    console.log('✅ Page fully loaded');
  }
  
  // Check for any loading states in the DOM
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
  if (loadingElements.length > 0) {
    console.log('⚠️ Loading elements found:', loadingElements.length);
  } else {
    console.log('✅ No loading elements found');
  }
}

// Main execution
async function runCompleteDebug() {
  checkConsoleLogs();
  await simulateAuthContextCheck();
  checkReactContext();
  monitorNetworkRequests();
  checkTimingIssues();
  
  console.log('\n🎯 DEBUGGING RECOMMENDATIONS:');
  console.log('1. Check if the captured auth logs show the correct role');
  console.log('2. Verify /api/auth/me returns role: "SUPERUSER"');
  console.log('3. Look for any timing issues in component mounting');
  console.log('4. Check React DevTools AuthProvider state');
  console.log('5. Refresh the page and run this script again');
  
  console.log('\n🔍 DEBUGGING COMPLETE');
  console.log('==================');
}

// Execute
runCompleteDebug();