// Test script for food analysis by name API
import axios from 'axios';

async function testFoodAnalysisByName() {
  try {
    console.log('Testing food analysis by name API...');
    
    // Test the public test endpoint for food analysis
    const response = await axios.post('http://localhost:5000/api/test/food-analysis', {
      foodName: 'banana',
      healthConditions: ['diabetes', 'hypertension']
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing food analysis by name:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFoodAnalysisByName();