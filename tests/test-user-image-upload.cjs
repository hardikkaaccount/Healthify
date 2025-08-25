const fs = require('fs');
const path = require('path');

// Import the rebuilt service directly
const vertexAIService = require('./backend/src/services/vertexAIGenAIService');

async function testUserImageUpload() {
  try {
    console.log('🧪 Testing User Image Upload with Rebuilt Service...');
    
    // Check if test image exists
    const imagePath = path.join(__dirname, 'test-food-image.jpg');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Test image not found:', imagePath);
      return;
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const stats = fs.statSync(imagePath);
    
    // Create a file object similar to what multer would create
    const imageFile = {
      buffer: imageBuffer,
      mimetype: 'image/jpeg',
      originalname: 'test-food-image.jpg',
      size: stats.size
    };

    console.log('📁 Image file details:', {
      filename: imageFile.originalname,
      mimetype: imageFile.mimetype,
      size: `${(imageFile.size / 1024).toFixed(2)} KB`
    });

    // Test with health conditions (diabetes)
    const healthConditions = ['diabetes'];
    console.log('🏥 Health conditions:', healthConditions);

    console.log('🔄 Starting food image analysis...');
    const startTime = Date.now();

    // Call the rebuilt analyzeFoodImage function
    const result = await vertexAIService.analyzeFoodImage(imageFile, healthConditions);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️ Analysis completed in ${duration}ms`);
    console.log('✅ Food Image Analysis Result:');
    console.log('🍎 Food Name:', result.foodName);
    console.log('📊 Health Score:', result.healthScore);
    console.log('🔥 Calories:', result.calories);
    console.log('📏 Serving Size:', result.servingSize);
    console.log('💡 Recommendation:', result.recommendation);
    
    if (result.healthWarnings && result.healthWarnings.length > 0) {
      console.log('⚠️ Health Warnings:', result.healthWarnings);
    }
    
    if (result.analysisMetadata) {
      console.log('📊 Analysis Metadata:', result.analysisMetadata);
    }

    console.log('\n📝 Full Analysis Result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ User image upload test failed:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
  }
}

// Run the test
testUserImageUpload();