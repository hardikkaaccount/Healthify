// Import the GoogleGenAI library
import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI client with Vertex AI configuration
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'rainscare',
  location: 'asia-south1',
  apiVersion: 'v1'
});

/**
 * Generate text using Gemini 1.5 Pro model
 */
async function generateText() {
  try {
    console.log('🤖 Connecting to Gemini 1.5 Pro model...');
    
    // Define the prompt
    const prompt = 'Explain how photosynthesis works in simple terms.';
    console.log(`📝 Prompt: "${prompt}"`);
    
    // Generate content
    console.log('⏳ Generating response...');
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt
    });
    
    console.log('\n✅ Gemini says:');
    console.log('-----------------------------------');
    console.log(response.text);
    console.log('-----------------------------------');
    
    return response.text;
  } catch (error) {
    console.error('❌ API error:', error);
    
    // More detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    throw error;
  }
}

// Execute the function
generateText()
  .then(() => console.log('✨ Done!'))
  .catch(err => console.error('💥 Failed:', err));