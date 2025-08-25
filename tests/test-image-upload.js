const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testImageUpload() {
  try {
    console.log('🧪 Testing actual image upload to your backend...');
    
    // Check if test image exists
    const testImagePath = 'test-food-image.jpg';
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️ Test image not found. The backend will still work with real images from your app.');
      return;
    }
    
    // Create form data
    const form = new FormData();
    form.append('image', fs.createReadStream(testImagePath));
    form.append('healthConditions', JSON.stringify(['diabetes']));
    
    console.log('📤 Uploading image to backend...');
    
    // Send request to your backend
    const response = await fetch('http://localhost:5000/api/ai/analyze-food-image', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Image analysis successful!');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Image analysis failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImageUpload();