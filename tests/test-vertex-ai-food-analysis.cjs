const fs = require('fs');
const path = require('path');

// Test Vertex AI food analysis
async function testVertexAIFoodAnalysis() {
  try {
    console.log('🧪 Testing Vertex AI Food Analysis...');
    
    // Import the service
    const vertexAIService = require('./backend/src/services/vertexAIService');
    
    // Test food name analysis
    console.log('\n📝 Testing food name analysis...');
    const foodNameResult = await vertexAIService.analyzeFoodByName('banana', ['diabetes']);
    console.log('✅ Food name analysis result:', JSON.stringify(foodNameResult, null, 2));
    
    // Test image analysis if test image exists
    const testImagePath = path.join(__dirname, 'test-food-image.jpg');
    if (fs.existsSync(testImagePath)) {
      console.log('\n📸 Testing image analysis...');
      const imageBuffer = fs.readFileSync(testImagePath);
      const imageFile = {
        buffer: imageBuffer,
        mimetype: 'image/jpeg',
        originalname: 'test-food-image.jpg',
        size: imageBuffer.length
      };
      
      const imageResult = await vertexAIService.analyzeFoodImage(imageFile, ['diabetes']);
      console.log('✅ Image analysis result:', JSON.stringify(imageResult, null, 2));
    } else {
      console.log('⚠️ Test image not found, skipping image analysis test');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
  }
}

// Run the test
testVertexAIFoodAnalysis();