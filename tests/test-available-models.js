const { VertexAI } = require('@google-cloud/vertexai');

async function testAvailableModels() {
  console.log('🔍 Testing which Gemini models are available in your project...');
  
  const vertexAI = new VertexAI({
    project: 'rainscare',
    location: 'us-central1',
  });

  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-preview-0514',
    'gemini-1.5-pro',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro-001',
    'gemini-pro',
    'text-bison',
    'text-bison-001'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`\n🧪 Testing model: ${modelName}`);
      
      const model = vertexAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.1,
        },
      });

      // Try a simple text generation
      const result = await model.generateContent('Say "Hello" if you can hear me.');
      const response = result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName}: AVAILABLE`);
      console.log(`📝 Response: ${text.substring(0, 50)}...`);
      
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('NOT_FOUND')) {
        console.log(`❌ ${modelName}: NOT AVAILABLE (404)`);
      } else if (error.message.includes('403') || error.message.includes('PERMISSION_DENIED')) {
        console.log(`🔒 ${modelName}: NO PERMISSION (403)`);
      } else {
        console.log(`⚠️ ${modelName}: ERROR - ${error.message.substring(0, 100)}`);
      }
    }
  }
  
  console.log('\n🎉 Model availability test completed!');
}

testAvailableModels().catch(console.error);