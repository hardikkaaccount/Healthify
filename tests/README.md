# Healthify Test Suite

This folder contains all test files for the Healthify application, organized for better project structure.

## 📁 Folder Structure

```
tests/
├── backend-tests/          # Backend-specific test files
├── test-*.js              # Main test files (JavaScript)
├── test-*.cjs             # CommonJS test files
├── run-*test*.bat         # Windows batch test runners
├── run-*test*.ps1         # PowerShell test runners
├── test-food-image.jpg    # Test image for food analysis
└── README.md              # This file
```

## 🧪 Test Categories

### AI & Machine Learning Tests
- `test-gemini-pro.js` - Tests Gemini Pro model functionality
- `test-gemini-flash.js` - Tests Gemini Flash model functionality
- `test-vertex-ai-*.js/.cjs` - Tests Vertex AI integration
- `test-google-genai-vertex.cjs` - Tests Google GenAI with Vertex AI

### Food Analysis Tests
- `test-food-analysis.js` - Basic food analysis functionality
- `test-food-analysis-by-name.js` - Food analysis by name input
- `test-food-analysis-comprehensive.js` - Comprehensive food analysis
- `test-food-analysis-fix.js` - Food analysis bug fixes
- `test-food-image-analysis.js` - Image-based food analysis
- `test-foodimages-*.js` - Food image processing tests

### Image Processing Tests
- `test-image-upload.js` - Image upload functionality
- `test-image-upload-api.js/.cjs` - Image upload API tests
- `test-user-image-upload.cjs` - User image upload tests
- `test-food-image.jpg` - Sample test image

### Recipe & Content Generation Tests
- `test-recipe-generation.js` - Recipe generation functionality
- `test-generate-content.js` - General content generation
- `test-available-models.js` - Available AI models testing

### Backend Tests (`backend-tests/`)
- `test-food-analysis.js` - Backend food analysis
- `test-gemini-direct.js` - Direct Gemini API integration
- `test-image-upload.js` - Backend image upload
- `test-simple-gemini.js` - Simple Gemini functionality
- `test-vertex-ai-detailed.js` - Detailed Vertex AI tests
- `test-vertex-ai-direct.js` - Direct Vertex AI integration

### Test Runners
- `run-gemini-test.bat/.ps1` - Gemini test runners
- `run-food-image-tests.bat/.ps1` - Food image test runners

### Utilities
- `download-test-image.js` - Downloads test images for testing

## 🚀 Running Tests

### Individual Tests
```bash
# Run a specific test
node tests/test-food-analysis.js

# Run backend tests
node tests/backend-tests/test-food-analysis.js
```

### Using Test Runners
```bash
# Windows Command Prompt
tests\run-gemini-test.bat
tests\run-food-image-tests.bat

# PowerShell
.\tests\run-gemini-test.ps1
.\tests\run-food-image-tests.ps1
```

### From Project Root
```bash
# Run all tests (if npm test is configured)
npm test

# Run specific test categories
npm run test:frontend
npm run test:backend
```

## 📋 Test Requirements

### Environment Variables
Make sure these are set in your `.env` files:
- `GEMINI_API_KEY` - For Gemini AI tests
- `GOOGLE_CLOUD_PROJECT` - For Vertex AI tests
- `GOOGLE_APPLICATION_CREDENTIALS` - Service account path
- `FIREBASE_PROJECT_ID` - Firebase project ID

### Dependencies
- Node.js (v16+)
- All project dependencies installed (`npm install`)
- Valid API keys and credentials
- Test image files in place

## 🔧 Test Configuration

### AI Model Testing
- Tests use both Gemini Pro and Flash models
- Vertex AI integration with Google Cloud
- Multiple model configurations for different use cases

### Image Testing
- Uses `test-food-image.jpg` as sample image
- Tests various image formats and sizes
- Validates image upload and processing

### API Testing
- Tests REST API endpoints
- Validates request/response formats
- Checks error handling and edge cases

## 📊 Test Coverage

The test suite covers:
- ✅ AI model integration (Gemini, Vertex AI)
- ✅ Food analysis (text and image-based)
- ✅ Image upload and processing
- ✅ Recipe generation
- ✅ API endpoints
- ✅ Error handling
- ✅ Edge cases and validation

## 🐛 Troubleshooting

### Common Issues
1. **API Key Errors**: Ensure all API keys are valid and properly set
2. **Image Not Found**: Check if `test-food-image.jpg` exists
3. **Network Errors**: Verify internet connection for API calls
4. **Permission Errors**: Ensure proper file permissions

### Debug Mode
Add `DEBUG=true` environment variable for verbose logging:
```bash
DEBUG=true node tests/test-food-analysis.js
```

## 📝 Adding New Tests

1. Create test file in appropriate category
2. Follow naming convention: `test-[feature-name].js`
3. Include proper error handling and assertions
4. Update this README with test description
5. Add to relevant test runner if needed

---

**Note**: All tests have been moved from the root directory and backend folder to maintain a clean project structure.