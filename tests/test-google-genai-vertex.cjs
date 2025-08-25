const vertexAIService = require('./backend/src/services/vertexAIGenAIService');
const fs = require('fs');
const path = require('path');

async function testGoogleGenAIVertex() {
  console.log('🧪 Testing Google GenAI with Vertex AI...');

  try {
    // Test 1: Food name analysis
    console.log('\n📝 Testing food name analysis...');
    const foodNameResult = await vertexAIService.analyzeFoodByName('banana', ['diabetes']);
    console.log('✅ Food name analysis result:', JSON.stringify(foodNameResult, null, 2));

    // Test 2: Image analysis (if test image exists)
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

    // Test 3: Recipe generation
    console.log('\n👨‍🍳 Testing recipe generation...');
    const recipeResult = await vertexAIService.generateHealthyRecipe(
      ['chicken breast', 'broccoli', 'brown rice'], 
      ['diabetes'], 
      { vegetarian: false, lowSodium: true }
    );
    console.log('✅ Recipe generation result:', JSON.stringify(recipeResult, null, 2));

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
  }
}

testGoogleGenAIVertex();