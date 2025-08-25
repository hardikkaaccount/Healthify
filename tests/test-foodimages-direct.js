// Direct test of the vertexAIGenAIService.analyzeFoodImage function
import fs from 'fs';
import path from 'path';

// Import the service directly
const { analyzeFoodImage } = await import('./backend/src/services/vertexAIGenAIService.js');

// Configuration
const FOOD_IMAGES_DIR = path.join(process.cwd(), 'client', 'foodimages');

// Test images available
const TEST_IMAGES = [
  'anjir.jpeg',
  'download.jpeg', 
  'Photography-Kebab-Meat-Food-Wallpaper-HD-Desktop-Computer.jpg'
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get MIME type from file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

async function testImageDirect(imageName, healthConditions = []) {
  try {
    const imagePath = path.join(FOOD_IMAGES_DIR, imageName);
    
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      log(`❌ Image not found: ${imagePath}`, 'red');
      return null;
    }

    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);
    const stats = fs.statSync(imagePath);
    const imageSizeKB = (stats.size / 1024).toFixed(2);
    
    log(`\n📸 Testing image: ${imageName} (${imageSizeKB} KB)`, 'cyan');
    log(`🏥 Health conditions: ${healthConditions.length > 0 ? healthConditions.join(', ') : 'None'}`, 'blue');
    
    // Create image file object similar to multer
    const imageFile = {
      buffer: imageBuffer,
      mimetype: getMimeType(imageName),
      originalname: imageName,
      size: stats.size
    };
    
    const startTime = Date.now();
    
    // Call the service function directly
    log('🔄 Calling analyzeFoodImage service...', 'yellow');
    const analysis = await analyzeFoodImage(imageFile, healthConditions);
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    if (analysis) {
      log(`✅ Analysis successful (${processingTime}s)`, 'green');
      log(`🍎 Food: ${analysis.foodName}`, 'bright');
      log(`📊 Health Score: ${analysis.healthScore}/10`, 'yellow');
      log(`🔥 Calories: ${analysis.calories}`, 'yellow');
      log(`🥗 Healthy: ${analysis.isHealthy ? 'Yes' : 'No'}`, analysis.isHealthy ? 'green' : 'red');
      
      if (analysis.nutritionFacts) {
        log(`📈 Nutrition - Protein: ${analysis.nutritionFacts.protein}, Carbs: ${analysis.nutritionFacts.carbs}, Fat: ${analysis.nutritionFacts.fat}`, 'blue');
      }
      
      if (analysis.recommendation) {
        log(`💡 Recommendation: ${analysis.recommendation.substring(0, 150)}...`, 'magenta');
      }
      
      if (analysis.healthWarnings && analysis.healthWarnings.length > 0) {
        log(`⚠️  Warnings: ${analysis.healthWarnings.join(', ')}`, 'red');
      }
      
      if (analysis.healthBenefits && analysis.healthBenefits.length > 0) {
        log(`💚 Benefits: ${analysis.healthBenefits.slice(0, 2).join(', ')}`, 'green');
      }
      
      return {
        success: true,
        imageName,
        healthConditions,
        processingTime: parseFloat(processingTime),
        analysis,
        imageSize: stats.size
      };
    } else {
      log(`❌ Analysis returned null/undefined`, 'red');
      return {
        success: false,
        imageName,
        healthConditions,
        error: 'Analysis returned null'
      };
    }
    
  } catch (error) {
    log(`❌ Error analyzing ${imageName}: ${error.message}`, 'red');
    log(`   Stack: ${error.stack}`, 'red');
    
    return {
      success: false,
      imageName,
      healthConditions,
      error: error.message
    };
  }
}

async function testAllImagesDirect() {
  log('🚀 Starting direct food image analysis test...', 'bright');
  log(`📁 Food images directory: ${FOOD_IMAGES_DIR}`, 'blue');
  log(`🖼️  Available images: ${TEST_IMAGES.length}`, 'blue');
  
  const results = [];
  let totalTests = 0;
  let successfulTests = 0;
  let totalProcessingTime = 0;
  
  // Test each image
  for (const imageName of TEST_IMAGES) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`🖼️  TESTING IMAGE: ${imageName}`, 'bright');
    log(`${'='.repeat(60)}`, 'cyan');
    
    // Test with no health conditions first
    const result1 = await testImageDirect(imageName, []);
    if (result1) {
      results.push(result1);
      totalTests++;
      if (result1.success) {
        successfulTests++;
        totalProcessingTime += result1.processingTime;
      }
    }
    
    // Test with diabetes condition
    const result2 = await testImageDirect(imageName, ['diabetes']);
    if (result2) {
      results.push(result2);
      totalTests++;
      if (result2.success) {
        successfulTests++;
        totalProcessingTime += result2.processingTime;
      }
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Test summary
  log(`\n${'='.repeat(60)}`, 'green');
  log('📊 DIRECT TEST SUMMARY', 'bright');
  log(`${'='.repeat(60)}`, 'green');
  
  log(`📈 Total tests: ${totalTests}`, 'blue');
  log(`✅ Successful: ${successfulTests}`, 'green');
  log(`❌ Failed: ${totalTests - successfulTests}`, 'red');
  log(`📊 Success rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`, 'yellow');
  
  if (successfulTests > 0) {
    log(`⏱️  Average processing time: ${(totalProcessingTime / successfulTests).toFixed(2)}s`, 'blue');
  }
  
  // Detailed results
  log('\n📋 DETAILED RESULTS:', 'bright');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const healthCondText = result.healthConditions.length > 0 ? ` (${result.healthConditions.join(', ')})` : ' (No conditions)';
    log(`${index + 1}. ${status} ${result.imageName}${healthCondText}`, result.success ? 'green' : 'red');
    
    if (result.success && result.analysis) {
      log(`   🍎 ${result.analysis.foodName}`, 'blue');
      log(`   📊 Score: ${result.analysis.healthScore}/10, Calories: ${result.analysis.calories}`, 'blue');
    } else if (result.error) {
      log(`   ❌ ${result.error}`, 'red');
    }
  });
  
  // Save detailed results to file
  const resultsFile = path.join(process.cwd(), 'food-image-direct-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    testType: 'direct_service_test',
    summary: {
      totalTests,
      successfulTests,
      failedTests: totalTests - successfulTests,
      successRate: ((successfulTests / totalTests) * 100).toFixed(1) + '%',
      averageProcessingTime: successfulTests > 0 ? (totalProcessingTime / successfulTests).toFixed(2) + 's' : 'N/A'
    },
    results
  }, null, 2));
  
  log(`\n💾 Detailed results saved to: ${resultsFile}`, 'green');
  log('\n🎉 Direct food image analysis testing completed!', 'bright');
}

// Test specific image with full output
async function testSpecificImageDirect(imageName, healthConditions = []) {
  log(`🔍 Testing specific image directly: ${imageName}`, 'bright');
  
  const result = await testImageDirect(imageName, healthConditions);
  
  if (result && result.success) {
    log('\n📋 FULL ANALYSIS RESULT:', 'bright');
    console.log(JSON.stringify(result.analysis, null, 2));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Test specific image
    const imageName = args[0];
    const healthConditions = args.slice(1);
    await testSpecificImageDirect(imageName, healthConditions);
  } else {
    // Test all images
    await testAllImagesDirect();
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

main().catch(error => {
  log(`❌ Test failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});