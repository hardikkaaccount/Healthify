const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Vertex AI.
// When credentials are not explicitly provided, the library will default to
// Application Default Credentials (ADC). ADC will look for the file path
// specified in the GOOGLE_APPLICATION_CREDENTIALS environment variable.
const project = process.env.GOOGLE_CLOUD_PROJECT || 'rainscare-58fdb';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

let generativeModel;

try {
  console.log('🔍 Initializing Vertex AI service (file-based auth test)...');
  const vertex_ai = new VertexAI({ project, location });

  generativeModel = vertex_ai.getGenerativeModel({
    model: 'gemini-1.5-flash-001',
  });
  console.log('✅ Vertex AI service initialized.');
} catch (error) {
  console.error('❌ Failed to initialize Vertex AI service:', error);
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
        return null;
    }
    const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*\})/);
    if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[2];
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return null;
        }
    }
    return null;
};

// Helper function to create a detailed error fallback response
const createErrorFallbackResponse = (error) => {
  return {
    foodName: "Analysis Failed",
    description: "Unable to process image",
    analysisMetadata: {
      status: 'error',
      errorMessage: error ? error.message : 'Unknown error',
    }
  };
};

const analyzeFoodImage = async (imageFile, healthConditions = []) => {
  if (!generativeModel) {
    return createErrorFallbackResponse(new Error('Vertex AI service not initialized. Check server logs.'));
  }

  try {
    const imagePart = fileToGenerativePart(imageFile.buffer, imageFile.mimetype);
    const healthConditionsText = healthConditions && healthConditions.length > 0
      ? `\n\nIMPORTANT: The user has these health conditions: ${healthConditions.join(', ')}.`
      : '';
    const prompt = `You are an expert nutritionist... Respond with ONLY a valid JSON object...`; // Abridged

    const request = {
      contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
    };

    const result = await generativeModel.generateContent(request);
    const response = result.response;
    const responseText = response.candidates[0].content.parts[0].text;
    const parsedData = extractJsonFromResponse(responseText);

    if (parsedData) {
      return parsedData;
    } else {
      return createErrorFallbackResponse(new Error('Failed to parse JSON response from AI.'));
    }
  } catch (error) {
    console.error('❌ Vertex AI food image analysis failed:', error);
    return createErrorFallbackResponse(error);
  }
};

const analyzeFoodByName = async (foodName, healthConditions = []) => {
    if (!generativeModel) {
        return createErrorFallbackResponse(new Error('Vertex AI service not initialized.'));
    }
    try {
        const prompt = `Provide a comprehensive nutritional analysis for "${foodName}". Respond with ONLY a valid JSON object...`; // Abridged
        const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        const result = await generativeModel.generateContent(request);
        const responseText = result.response.candidates[0].content.parts[0].text;
        const parsedData = extractJsonFromResponse(responseText);
        if (parsedData) return parsedData;
        return createErrorFallbackResponse(new Error('Failed to parse JSON response from AI.'));
    } catch (error) {
        console.error('❌ Vertex AI food name analysis failed:', error);
        return createErrorFallbackResponse(error);
    }
};

const generateHealthyRecipe = async (ingredients, healthConditions = [], dietaryPreferences = {}) => {
    if (!generativeModel) {
        return createErrorFallbackResponse(new Error('Vertex AI service not initialized.'));
    }
    try {
        const prompt = `Create a healthy recipe using these ingredients: ${ingredients.join(', ')}. Respond with ONLY a valid JSON object...`; // Abridged
        const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        const result = await generativeModel.generateContent(request);
        const responseText = result.response.candidates[0].content.parts[0].text;
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