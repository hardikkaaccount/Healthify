const axios = require('axios');

// Test the fixed food analysis endpoints
async function testFoodAnalysis() {
  console.log('🧪 Testing Food Analysis Fix...\n');

  try {
    // Test 1: Food analysis by name
    console.log('1️⃣ Testing food analysis by name...');
    const foodAnalysisResponse = await axios.post('http://localhost:5000/api/ai/analyze-food-name', {
      foodName: 'apple',
      healthConditions: ['diabetes']
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Food analysis by name - SUCCESS!');
    console.log('📊 Response:', JSON.stringify(foodAnalysisResponse.data, null, 2));
    console.log('\n');

  } catch (error) {
    console.error('❌ Food analysis by name - FAILED:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n');
  }

  try {
    // Test 2: Multiple recipe generation
    console.log('2️⃣ Testing multiple recipe generation...');
    const recipeResponse = await axios.post('http://localhost:5000/api/ai/generate-multiple-recipes', {
      ingredients: 'chicken, broccoli, rice',
      healthConditions: ['diabetes'],
      dietType: 'non-vegetarian'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ Recipe generation - SUCCESS!');
    console.log('📊 Response:', JSON.stringify(recipeResponse.data, null, 2));
    console.log('\n');

  } catch (error) {
    console.error('❌ Recipe generation - FAILED:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n');
  }

  console.log('🏁 Test completed!');
}

// Run the test
testFoodAnalysis();