const vertexAIService = require('./src/services/vertexAIService');

async function testVertexAI() {
  console.log('🧪 Testing Vertex AI Food Analysis in Detail...\n');

  try {
    console.log('1️⃣ Testing food analysis by name...');
    const result = await vertexAIService.analyzeFoodByName('apple', ['diabetes']);
    
    console.log('✅ Food analysis completed!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Food analysis failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testVertexAI();