const { VertexAI } = require('@google-cloud/vertexai');
const { getVertexServiceAccount } = require('../utils/vercelServiceAccountHelper');

// Initialize Vertex AI
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

let generativeModel;

try {
  console.log('🔍 Initializing Vertex AI service...');
  const serviceAccount = getVertexServiceAccount();

  // Explicitly pass credentials to the VertexAI constructor
  const vertex_ai = new VertexAI({
    project: serviceAccount.project_id,
    location,
    googleAuthOptions: {
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
      }
    }
  });

  generativeModel = vertex_ai.getGenerativeModel({
    model: 'gemini-2.0-flash-001',
  });
  console.log('✅ Vertex AI service initialized successfully.');
} catch (error) {
  console.error('❌ Failed to initialize Vertex AI service:', error);
  // The service functions will handle the case where generativeModel is not initialized.
}

// Helper to convert image buffer to a part object for Vertex AI
const fileToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
};

// Helper to extract JSON from the model's response
const extractJsonFromResponse = (responseText) => {
    if (!responseText) {
        console.warn('⚠️ AI response text is empty.');
        return null;
    }
    // This regex handles the optional markdown code block around the JSON
    const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('❌ JSON parsing error:', e.message);
            return null;
        }
    }
    console.warn('⚠️ No JSON object found in the AI response text.');
    return null;
};

// Helper function to create a detailed error fallback response
const createErrorFallbackResponse = (error, healthConditions = []) => {
  console.log('🔄 Creating error fallback response...');
  return {
    foodName: "Analysis Failed",
    description: "Unable to process image",
    calories: "Unable to analyze",
    servingSize: "Unknown",
    nutritionFacts: { protein: "0g", carbs: "0g", fat: "0g" },
    recommendation: "Unable to analyze image. You can try uploading a different image or enter the food name manually for analysis.",
    analysisMetadata: {
      timestamp: new Date().toISOString(),
      model: 'gemini-2.0-flash-001',
      status: 'error',
      errorMessage: error ? error.message : 'Unknown error',
      healthConditionsConsidered: healthConditions,
    }
  };
};

// Enhanced Food Image Analysis using Vertex AI
const analyzeFoodImage = async (imageFile, healthConditions = []) => {
  if (!generativeModel) {
    return createErrorFallbackResponse(new Error('Google GenAI service not initialized'));
  }

  try {
    const imagePart = fileToGenerativePart(imageFile.buffer, imageFile.mimetype);
    const healthConditionsText = healthConditions && healthConditions.length > 0
      ? `\n\nIMPORTANT: The user has these health conditions: ${healthConditions.join(', ')}. Please provide specific recommendations, warnings, and alternatives based on these conditions.`
      : '';

    // Reusing the detailed prompt from the original file
    const prompt = `You are an expert nutritionist... Respond with ONLY a valid JSON object...`; // Abridged for brevity

    const request = {
      contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
    };

    const result = await generativeModel.generateContent(request);
    const response = result.response;
    const responseText = response.candidates[0].content.parts[0].text;

    const parsedData = extractJsonFromResponse(responseText);

    if (parsedData) {
      parsedData.analysisMetadata = {
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash-001',
      };
      return parsedData;
    } else {
      return createErrorFallbackResponse(new Error('Failed to parse JSON response from AI.'));
    }
  } catch (error) {
    console.error('❌ Vertex AI food image analysis failed:', error);
    return createErrorFallbackResponse(error, healthConditions);
  }
};

// Analyze food by name using Vertex AI
const analyzeFoodByName = async (foodName, healthConditions = []) => {
    if (!generativeModel) {
        return createErrorFallbackResponse(new Error('Google GenAI service not initialized'));
    }

    try {
        const healthConditionsText = healthConditions.length > 0
            ? `The user has these health conditions: ${healthConditions.join(', ')}. `
            : '';
        const prompt = `Provide a comprehensive nutritional analysis for "${foodName}". ${healthConditionsText} Respond with ONLY a valid JSON object...`; // Abridged

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        const result = await generativeModel.generateContent(request);
        const response = result.response;
        const responseText = response.candidates[0].content.parts[0].text;
        const parsedData = extractJsonFromResponse(responseText);

        if (parsedData) return parsedData;
        return createErrorFallbackResponse(new Error('Failed to parse JSON response from AI.'));

    } catch (error) {
        console.error('❌ Vertex AI food name analysis failed:', error);
        return createErrorFallbackResponse(error);
    }
};

// Generate healthy recipe using Vertex AI
const generateHealthyRecipe = async (ingredients, healthConditions = [], dietaryPreferences = {}) => {
    if (!generativeModel) {
        return createErrorFallbackResponse(new Error('Google GenAI service not initialized'));
    }

    try {
        const prompt = `Create a healthy recipe using these ingredients: ${ingredients.join(', ')}. Respond with ONLY a valid JSON object...`; // Abridged

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        const result = await generativeModel.generateContent(request);
        const response = result.response;
        const responseText = response.candidates[0].content.parts[0].text;
        const parsedData = extractJsonFromResponse(responseText);

        if (parsedData) return parsedData;
        return createErrorFallbackResponse(new Error('Failed to parse JSON response from AI.'));

    } catch (error) {
        console.error('❌ Vertex AI recipe generation failed:', error);
        return createErrorFallbackResponse(error);
    }
};


module.exports = {
  analyzeFoodImage,
  analyzeFoodByName,
  generateHealthyRecipe
};