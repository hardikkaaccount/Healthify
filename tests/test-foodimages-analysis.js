// Comprehensive test script for food image analysis using all available food images
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const FOOD_IMAGES_DIR = path.join(process.cwd(), 'client', 'foodimages');

// Test images available
const TEST_IMAGES = [
  'anjir.jpeg',
  'download.jpeg', 
  'Photography-Kebab-Meat-Food-Wallpaper-HD-Desktop-Computer.jpg'
];

// Different health conditions to test with
const TEST_HEALTH_CONDITIONS = [
  [], // No health conditions
  ['diabetes'],
  ['hypertension'],
  ['diabetes', 'hypertension'],
  ['heart disease', 'obesity'],
  ['gluten intolerance', 'lactose intolerance']
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

async function testSingleImage(imageName, healthConditions = []) {
  try {
    const imagePath = path.join(FOOD_IMAGES_DIR, imageName);
    
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      log(`❌ Image not found: ${imagePath}`, 'red');
      return null;
    }

    // Get image stats
    const stats = fs.statSync(imagePath);
    const imageSizeKB = (stats.size / 1024).toFixed(2);
    
    log(`\n📸 Testing image: ${imageName} (${imageSizeKB} KB)`, 'cyan');
    log(`🏥 Health conditions: ${healthConditions.length > 0 ? healthConditions.join(', ') : 'None'}`, 'blue');
    
    // Create form data
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    if (healthConditions.length > 0) {
      formData.append('healthConditions', JSON.stringify(healthConditions));
    }
    
    const startTime = Date.now();
    
    // Make API request
    const response = await axios.post(`${API_BASE_URL}/api/ai/analyze-food-image`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 60000 // 60 second timeout
    });
    
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);
    
    if (response.status === 200 && response.data.success) {
      const analysis = response.data.data;
      
      log(`✅ Analysis successful (${processingTime}s)`, 'green');
      log(`🍎 Food: ${analysis.foodName}`, 'bright');
      log(`📊 Health Score: ${analysis.healthScore}/10`, 'yellow');
      log(`🔥 Calories: ${analysis.calories}`, 'yellow');
      log(`🥗 Healthy: ${analysis.isHealthy ? 'Yes' : 'No'}`, analysis.isHealthy ? 'green' : 'red');
      
      if (analysis.nutritionFacts) {
        log(`📈 Nutrition - Protein: ${analysis.nutritionFacts.protein}, Carbs: ${analysis.nutritionFacts.carbs}, Fat: ${analysis.nutritionFacts.fat}`, 'blue');
      }
      
      if (analysis.recommendation) {
        log(`💡 Recommendation: ${analysis.recommendation.substring(0, 100)}...`, 'magenta');
      }
      
      if (analysis.healthWarnings && analysis.healthWarnings.length > 0) {
        log(`⚠️  Warnings: ${analysis.healthWarnings.join(', ')}`, 'red');
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
      log(`❌ Analysis failed: ${response.data.message || 'Unknown error'}`, 'red');
      return {
        success: false,
        imageName,
        healthConditions,
        error: response.data.message || 'Unknown error'
      };
    }
    
  } catch (error) {
    log(`❌ Error analyzing ${imageName}: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    
    return {
      success: false,
      imageName,
      healthConditions,
      error: error.message
    };
  }
}

async function testAllImages() {
  log('🚀 Starting comprehensive food image analysis test...', 'bright');
  log(`📁 Food images directory: ${FOOD_IMAGES_DIR}`, 'blue');
  log(`🖼️  Available images: ${TEST_IMAGES.length}`, 'blue');
  log(`🏥 Health condition sets: ${TEST_HEALTH_CONDITIONS.length}`, 'blue');
  
  // Check if backend is running
  try {
    await axios.get(`${API_BASE_URL}/api/health`);
    log('✅ Backend server is running', 'green');
  } catch (error) {
    log('❌ Backend server is not running. Please start the backend first.', 'red');
    log('   Run: npm run dev (in backend directory)', 'yellow');
    return;
  }
  
  const results = [];
  let totalTests = 0;
  let successfulTests = 0;
  let totalProcessingTime = 0;
  
  // Test each image with different health conditions
  for (const imageName of TEST_IMAGES) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`🖼️  TESTING IMAGE: ${imageName}`, 'bright');
    log(`${'='.repeat(60)}`, 'cyan');
    
    // Test with first few health condition sets (to avoid too many requests)
    for (let i = 0; i < Math.min(3, TEST_HEALTH_CONDITIONS.length); i++) {
      const healthConditions = TEST_HEALTH_CONDITIONS[i];
      const result = await testSingleImage(imageName, healthConditions);
      
      if (result) {
        results.push(result);
        totalTests++;
        
        if (result.success) {
          successfulTests++;
          totalProcessingTime += result.processingTime;
        }
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Test summary
  log(`\n${'='.repeat(60)}`, 'green');
  log('📊 TEST SUMMARY', 'bright');
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
  const resultsFile = path.join(process.cwd(), 'food-image-analysis-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
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
  log('\n🎉 Food image analysis testing completed!', 'bright');
}

// Test individual image function
async function testSpecificImage(imageName, healthConditions = []) {
  log(`🔍 Testing specific image: ${imageName}`, 'bright');
  
  try {
    await axios.get(`${API_BASE_URL}/api/health`);
  } catch (error) {
    log('❌ Backend server is not running. Please start the backend first.', 'red');
    return;
  }
  
  const result = await testSingleImage(imageName, healthConditions);
  
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
    await testSpecificImage(imageName, healthConditions);
  } else {
    // Test all images
    await testAllImages();
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

main().catch(error => {
  log(`❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});