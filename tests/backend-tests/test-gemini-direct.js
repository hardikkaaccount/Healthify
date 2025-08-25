const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiDirect() {
  try {
    console.log('🧪 Testing Gemini API directly...');
    
    const API_KEY = 'AIzaSyCfvNrQLlbE-5Ubr_8H6IbglWQtlrerSLs';
    console.log('🔑 Using API Key:', API_KEY.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze the food "apple" and provide a JSON response with the following structure:
    {
      "foodName": "apple",
      "calories": "52 per 100g",
      "nutritionFacts": {
        "protein": "0.3g",
        "carbs": "14g",
        "fat": "0.2g",
        "fiber": "2.4g",
        "sugar": "10g",
        "sodium": "1mg"
      },
      "healthScore": 9,
      "isHealthy": true,
      "recommendation": "Excellent choice for a healthy snack"
    }`;
    
    console.log('🔄 Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Response received!');
    console.log('📝 Response:', text);
    
  } catch (error) {
    console.error('❌ Direct Gemini test failed:');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
  }
}

testGeminiDirect();