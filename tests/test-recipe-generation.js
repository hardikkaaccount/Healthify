// Test script for recipe generation API
import axios from 'axios';

async function testRecipeGeneration() {
  try {
    console.log('Testing recipe generation API...');
    
    // Test the recipe generation endpoint
    const response = await axios.post('http://localhost:5000/api/test/recipe-generation', {
      ingredients: 'chicken, broccoli, rice',
      healthConditions: ['diabetes', 'hypertension'],
      dietType: 'non-vegetarian'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing recipe generation:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testRecipeGeneration();