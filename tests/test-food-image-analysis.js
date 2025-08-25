// Test script for food image analysis API
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

async function testFoodImageAnalysis() {
  try {
    console.log('Testing food image analysis API...');
    
    // Path to a test image file
    const imagePath = path.join(process.cwd(), 'test-food-image.jpg');
    
    // Check if the image file exists
    if (!fs.existsSync(imagePath)) {
      console.error('Test image file not found:', imagePath);
      return;
    }
    
    // Create form data with the image file
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('healthConditions', JSON.stringify(['diabetes', 'hypertension']));
    
    // Test the food image analysis endpoint
    const response = await axios.post('http://localhost:5000/api/test/food-analysis-image', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing food image analysis:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFoodImageAnalysis();