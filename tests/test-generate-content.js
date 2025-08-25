// Test script for generate-content API
import axios from 'axios';

async function testGenerateContent() {
  try {
    console.log('Testing generate-content API...');
    
    // Test the generate-content endpoint
    const response = await axios.post('http://localhost:5000/api/test/generate-content', {
      prompt: 'Explain the benefits of a balanced diet in 3 bullet points',
      model: 'gemini-1.5-flash'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing generate-content:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGenerateContent();