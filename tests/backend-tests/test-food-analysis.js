const axios = require('axios');

// Test food analysis by name
async function testFoodAnalysis() {
  try {
    console.log('🧪 Testing food analysis by name...');
    
    const response = await axios.post('http://localhost:5000/api/test/food-analysis', {
      foodName: 'apple',
      healthConditions: ['diabetes']
    });

    console.log('✅ Food analysis test successful!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Food analysis test failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run the test
testFoodAnalysis();