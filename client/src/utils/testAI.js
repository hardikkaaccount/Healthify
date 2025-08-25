// Simple test to verify AI integration
import { analyzeFoodByName } from '../services/geminiService';

export const testAIIntegration = async () => {
  try {
    console.log('Testing AI integration via backend...');
    console.log('Backend API URL:', process.env.REACT_APP_API_URL);
    
    if (!process.env.REACT_APP_API_URL) {
      console.error('Backend API URL not found in environment variables');
      return false;
    }
    
    // Test with simple food analysis
    const result = await analyzeFoodByName('apple', []);
    console.log('AI test result:', result);
    
    return true;
  } catch (error) {
    console.error('AI integration test failed:', error);
    return false;
  }
};