const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../backend/.env') });

function setupCredentials() {
  const key = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
  if (!key) {
    console.error('VERTEX_SERVICE_ACCOUNT_KEY not found in environment variables.');
    process.exit(1);
  }

  try {
    // In .env, the JSON string might not be perfectly formatted.
    // Let's try to make it parsable.
    const parsableKey = key.replace(/\n/g, "\\n");
    const serviceAccount = JSON.parse(parsableKey);
    const configDir = path.resolve(__dirname, '../../backend/config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const filePath = path.join(configDir, 'service-account.json');
    fs.writeFileSync(filePath, JSON.stringify(serviceAccount, null, 2));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;
    console.log(`✅ Credentials written to ${filePath}`);
  } catch (error) {
    // If the first parse fails, try parsing without the replace
    try {
        const serviceAccount = JSON.parse(key);
        const configDir = path.resolve(__dirname, '../../backend/config');
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }
        const filePath = path.join(configDir, 'service-account.json');
        fs.writeFileSync(filePath, JSON.stringify(serviceAccount, null, 2));
        process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;
        console.log(`✅ Credentials written to ${filePath}`);
    } catch (e) {
        console.error('❌ Failed to parse or write service account key:', e);
        process.exit(1);
    }
  }
}

async function runTest() {
  setupCredentials();
  const vertexAIService = require('../../backend/src/services/vertexAIGenAIService');
  console.log('🧪 Running Vertex AI test...');
  try {
    const foodName = 'one banana';
    const healthConditions = ['diabetes'];
    console.log(`Analyzing food: ${foodName}`);
    const result = await vertexAIService.analyzeFoodByName(foodName, healthConditions);
    console.log('✅ Test completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTest();
