const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');

async function testImageUploadAPI() {
  try {
    console.log('🧪 Testing Image Upload API Endpoint...');
    
    // Check if test image exists
    const imagePath = path.join(__dirname, 'test-food-image.jpg');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Test image not found:', imagePath);
      return;
    }

    // Create form data
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    form.append('healthConditions', JSON.stringify(['diabetes']));

    console.log('📤 Sending request to /api/ai/analyze-food-image...');
    console.log('📁 Image path:', imagePath);
    console.log('🏥 Health conditions: ["diabetes"]');

    // Make request to the API
    const response = await axios.post('http://localhost:5000/api/ai/analyze-food-image', form, {
      headers: {
        ...form.getHeaders(),
        // Note: In real app, you'd need proper authentication
        // For testing, we'll skip auth or use a test token
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('✅ API Response received!');
    console.log('📊 Status:', response.status);
    console.log('📝 Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    } else if (error.request) {
      console.error('📡 No response received');
    } else {
      console.error('🔧 Request setup error:', error.message);
    }
  }
}

// Run the test
testImageUploadAPI();