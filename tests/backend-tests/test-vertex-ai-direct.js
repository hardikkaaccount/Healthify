const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');

async function testVertexAIDirect() {
  try {
    console.log('🧪 Testing Vertex AI directly...');
    
    // Set up authentication using service account file
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'config/service-account.json');
    
    const vertexAI = new VertexAI({
      project: 'rainscare',
      location: 'us-central1',
    });

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    console.log('🔄 Sending request to Vertex AI Gemini...');
    
    const prompt = `
    Analyze the food "apple" and provide a JSON response with the following structure:
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

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    console.log('✅ Vertex AI response received!');
    console.log('📝 Response:', text);
    
  } catch (error) {
    console.error('❌ Direct Vertex AI test failed:');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
  }
}

testVertexAIDirect();