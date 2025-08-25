const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testSimpleGemini() {
  try {
    console.log('🧪 Testing simple Gemini API call...');
    
    const API_KEY = 'AIzaSyCfvNrQLlbE-5Ubr_8H6IbglWQtlrerSLs';
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('What is an apple? Answer in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Response:', text);
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
    
    if (error.message.includes('API_KEY_HTTP_REFERRER_BLOCKED')) {
      console.log('\n🔧 SOLUTION: Go to Google Cloud Console and remove HTTP referrer restrictions from your API key');
      console.log('📍 URL: https://console.cloud.google.com/apis/credentials');
      console.log('🔑 Find your API key and set Application restrictions to "None"');
    }
  }
}

testSimpleGemini();