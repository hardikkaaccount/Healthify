// Test Vertex AI image analysis directly
const fs = require('fs');
const path = require('path');
const vertexAIService = require('./backend/src/services/vertexAIService');

async function testVertexAIImageAnalysis() {
  try {
    console.log('🧪 Testing Vertex AI image analysis directly...');
    
    // Check if test image exists
    const imagePath = path.join(__dirname, 'test-food-image.jpg');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Test image not found:', imagePath);
      return;
    }
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const imageFile = {
      buffer: imageBuffer,
      mimetype: 'image/jpeg',
      originalname: 'test-food-image.jpg',
      size: imageBuffer.length
    };
    
    console.log('📁 Image file info:', {
      size: imageFile.size,
      mimetype: imageFile.mimetype
    });
    
    // Test with health conditions
    const healthConditions = ['diabetes', 'hypertension'];
    
    console.log('🔄 Calling Vertex AI analyzeFoodImage...');
    const result = await vertexAIService.analyzeFoodImage(imageFile, healthConditions);
    
    console.log('✅ Analysis result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing Vertex AI:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
}

testVertexAIImageAnalysis();