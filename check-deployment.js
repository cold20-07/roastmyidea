// Check if Netlify deployment is working
async function checkDeployment() {
  const netlifyUrl = 'https://roastmyidea.netlify.app';
  
  console.log('🔍 Checking Netlify deployment...\n');
  console.log('URL:', netlifyUrl);
  console.log('Waiting for deployment to complete...\n');
  
  let attempts = 0;
  const maxAttempts = 20; // 20 attempts = ~2 minutes
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      console.log(`Attempt ${attempts}/${maxAttempts}...`);
      
      // Test API endpoint
      const response = await fetch(`${netlifyUrl}/api/ideas?limit=1`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('\n✅ SUCCESS! Deployment is working!');
        console.log('Status:', response.status);
        console.log('API Response:', data);
        console.log('\n🎉 Your app is live at:', netlifyUrl);
        return;
      } else if (response.status === 404) {
        console.log('❌ Still getting 404 - deployment may still be building...');
      } else {
        console.log(`⚠️  Got status ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️  Error:', error.message);
    }
    
    // Wait 6 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 6000));
  }
  
  console.log('\n⏰ Timeout reached. Check Netlify dashboard for build status:');
  console.log('https://app.netlify.com/sites/roastmyidea/deploys');
}

checkDeployment();
