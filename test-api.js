// Comprehensive API test
async function testAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing RoastMyIdea API...\n');
  
  // Test 1: GET /api/ideas
  console.log('Test 1: GET /api/ideas');
  try {
    const response = await fetch(`${baseUrl}/api/ideas?limit=5`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✓ Status:', response.status);
      console.log('✓ Got', data.ideas?.length || 0, 'ideas');
      console.log('✓ First idea snippet:', data.ideas?.[0]?.ideaSnippet?.substring(0, 50) + '...\n');
    } else {
      console.log('✗ Failed:', response.status, data);
    }
  } catch (error) {
    console.log('✗ Error:', error.message, '\n');
  }
  
  // Test 2: POST /api/roast with short idea (should fail)
  console.log('Test 2: POST /api/roast (too short - should fail)');
  try {
    const response = await fetch(`${baseUrl}/api/roast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: 'Short idea' })
    });
    const data = await response.json();
    
    if (response.status === 400) {
      console.log('✓ Correctly rejected short idea');
      console.log('✓ Error message:', data.error, '\n');
    } else {
      console.log('✗ Should have rejected but got:', response.status, '\n');
    }
  } catch (error) {
    console.log('✗ Error:', error.message, '\n');
  }
  
  // Test 3: POST /api/roast with valid idea
  console.log('Test 3: POST /api/roast (valid idea)');
  const testIdea = 'An app that uses AI to automatically generate personalized workout plans based on your fitness goals, available equipment, and schedule. It tracks your progress and adjusts the plan in real-time.';
  
  try {
    console.log('Submitting idea:', testIdea.substring(0, 80) + '...');
    console.log('⏳ Waiting for AI response (this may take 10-20 seconds)...');
    
    const startTime = Date.now();
    const response = await fetch(`${baseUrl}/api/roast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea: testIdea })
    });
    const data = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (response.ok) {
      console.log(`✓ Status: ${response.status} (took ${duration}s)`);
      console.log('✓ Got roast ID:', data.id);
      console.log('✓ Roast preview:', data.roast?.substring(0, 100) + '...');
      console.log('✓ Number of problems:', data.problems?.length);
      console.log('✓ First problem:', data.problems?.[0]?.problem?.substring(0, 60) + '...\n');
      
      // Test 4: GET /api/roast/:id
      console.log('Test 4: GET /api/roast/:id');
      const roastResponse = await fetch(`${baseUrl}/api/roast/${data.id}`);
      const roastData = await roastResponse.json();
      
      if (roastResponse.ok) {
        console.log('✓ Successfully retrieved roast by ID');
        console.log('✓ Roast matches:', roastData.roast === data.roast, '\n');
      } else {
        console.log('✗ Failed to retrieve roast:', roastResponse.status, '\n');
      }
    } else {
      console.log('✗ Failed:', response.status);
      console.log('✗ Error:', data.error || data, '\n');
    }
  } catch (error) {
    console.log('✗ Error:', error.message, '\n');
  }
  
  console.log('🎉 API tests complete!');
}

// Run tests
testAPI().catch(console.error);
