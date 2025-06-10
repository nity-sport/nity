// Test API endpoint directly
async function testAPI() {
  try {
    console.log('🔗 Testing SportCenter API...');
    
    const response = await fetch('http://localhost:3001/api/sportcenter?public=true');
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (\!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success\! Data structure:', {
      hasData: \!\!data,
      isArray: Array.isArray(data),
      hasSportCenters: \!\!data.sportCenters,
      sportCentersCount: data.sportCenters ? data.sportCenters.length : 'N/A',
      dataKeys: Object.keys(data)
    });
    
    if (data.sportCenters && data.sportCenters.length > 0) {
      console.log('🏟️ First SportCenter:', {
        name: data.sportCenters[0].name,
        id: data.sportCenters[0]._id
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
EOF < /dev/null
