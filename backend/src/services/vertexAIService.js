const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
const { getVertexServiceAccount } = require('../utils/vercelServiceAccountHelper');

// Initialize Vertex AI with service account
let vertexAI;
let foodAnalysisModel;
let imageAnalysisModel;
let recipeGenerationModel;

try {
  console.log('🔍 Initializing Vertex AI with Service Account...');
  
  // Get Vertex AI service account credentials from environment variable or file
  const vertexServiceAccount = getVertexServiceAccount();
  
  console.log('🏢 Project ID:', process.env.GOOGLE_CLOUD_PROJECT || 'rainscare-58fdb');
  console.log('📍 Location:', process.env.GOOGLE_CLOUD_LOCATION || 'us-central1');
  
  vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT || 'rainscare-58fdb',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    googleAuthOptions: {
      credentials: {
        client_email: vertexServiceAccount.client_email,
        private_key: vertexServiceAccount.private_key.replace(/\\n/g, '\n'),
      },
    },
  });

  // Food Analysis Model (Text) - Using gemini-1.5-flash for fast text analysis
  foodAnalysisModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.3, // Lower temperature for more consistent food analysis
      topP: 0.8,
      topK: 40,
    },
  });

  // Image Analysis Model - Using gemini-1.5-pro for better image understanding
  imageAnalysisModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.3, // Lower temperature for consistent image analysis
      topP: 0.8,
      topK: 40,
    },
  });

  // Recipe Generation Model - Using gemini-1.5-flash for fast recipe generation
  recipeGenerationModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      maxOutputTokens: 1500,
      temperature: 0.7, // Higher temperature for more creative recipes
      topP: 0.9,
      topK: 50,
    },
  });

  console.log('✅ Vertex AI initialized successfully');
  console.log('🍎 Food Analysis Model (Text): gemini-1.5-flash (fast text analysis)');
  console.log('📸 Image Analysis Model: gemini-1.5-pro (better image understanding)');
  console.log('👨‍🍳 Recipe Generation Model: gemini-1.5-flash (fast recipe generation)');
  console.log('🏢 Project: rainscare');
  console.log('📍 Location: us-central1');

} catch (error) {
  console.error('❌ Failed to initialize Vertex AI:', error);
  console.error('❌ Make sure service account file exists and has proper permissions');
}

// Convert buffer to generative part for Vertex AI
const bufferToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: mimeType,
    },
  };
};

// Analyze food image using Vertex AI Gemini
const analyzeFoodImage = async (imageFile, healthConditions = []) => {
  try {
    if (!imageAnalysisModel) {
      throw new Error('Image Analysis model not initialized');
    }

    console.log('🔄 Analyzing food image with Vertex AI Gemini 1.5 Pro...');
    console.log('📁 Image info:', {
      mimetype: imageFile.mimetype,
      size: imageFile.size,
      originalname: imageFile.originalname
    });

    const imagePart = bufferToGenerativePart(imageFile.buffer, imageFile.mimetype);
    
    const healthConditionsText = healthConditions.length > 0 
      ? `The user has these health conditions: ${healthConditions.join(', ')}. `
      : '';

    const prompt = `
    You are a professional nutritionist and food expert. Analyze this food image and provide detailed nutritional information.

    ${healthConditionsText}

    Please analyze the food in the image and respond with ONLY a valid JSON object in this exact format. Do not include any text before or after the JSON object.

    {
      "foodName": "specific name of the food item",
      "calories": 250,
      "nutritionFacts": {
        "protein": "15g",
        "carbs": "30g",
        "fat": "8g",
        "fiber": "5g",
        "sugar": "12g",
        "sodium": "200mg"
      },
      "servingSize": "1 cup",
      "healthScore": 8,
      "isHealthy": true,
      "recommendation": "detailed recommendation based on health conditions",
      "healthWarnings": ["any warnings based on health conditions"],
      "healthBenefits": ["list of health benefits"],
      "suitableFor": ["health conditions this food is good for"],
      "avoidIf": ["health conditions that should avoid this food"],
      "alternatives": ["healthier alternatives if needed"],
      "bestTimeToEat": "Morning",
      "portionControl": "portion control advice",
      "preparation": "How this food appears to be prepared",
      "ingredients": ["Likely ingredients visible"]
    }

    Be very specific about health recommendations based on the user's conditions.
    Provide accurate nutritional information and practical advice. The "calories" field must be a number.
    `;

    console.log('🔄 Sending request to Vertex AI Gemini Pro...');
    const result = await imageAnalysisModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            imagePart
          ],
        },
      ],
    });

    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    console.log('📝 Raw response from Vertex AI:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed food analysis data');
      return parsedData;
    } else {
      console.error('❌ No JSON found in response. Full response:', text);
      throw new Error('Invalid response format from Vertex AI Gemini');
    }

  } catch (error) {
    console.error('❌ Error analyzing food image with Vertex AI:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Fallback response
    return {
      foodName: "Food Item",
      calories: 0,
      nutritionFacts: {
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        fiber: "0g",
        sugar: "0g",
        sodium: "0mg"
      },
      servingSize: "1 serving",
      healthScore: 5,
      isHealthy: false,
      recommendation: "Unable to analyze image. Please try uploading a clearer photo.",
      healthWarnings: ["Image analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      bestTimeToEat: "Anytime",
      portionControl: "Moderate portions",
      preparation: "Unknown",
      ingredients: []
    };
  }
};

// Analyze food by name using Vertex AI Gemini
const analyzeFoodByName = async (foodName, healthConditions = []) => {
  try {
    if (!foodAnalysisModel) {
      throw new Error('Food Analysis model not initialized');
    }

    console.log(`🔄 Analyzing food by name "${foodName}" with Vertex AI Gemini 1.5 Flash...`);

    const healthConditionsText = healthConditions.length > 0
      ? `The user has these health conditions: ${healthConditions.join(', ')}. `
      : '';

    const prompt = `
    You are a professional nutritionist and food expert. Analyze the food named "${foodName}" and provide detailed nutritional information.

    ${healthConditionsText}

    Please respond with ONLY a valid JSON object in this exact format. Do not include any text before or after the JSON object.

    {
      "foodName": "${foodName}",
      "calories": 250,
      "nutritionFacts": {
        "protein": "15g",
        "carbs": "30g",
        "fat": "8g",
        "fiber": "5g",
        "sugar": "12g",
        "sodium": "200mg"
      },
      "servingSize": "1 cup",
      "healthScore": 8,
      "isHealthy": true,
      "recommendation": "detailed recommendation based on health conditions",
      "healthWarnings": ["any warnings based on health conditions"],
      "healthBenefits": ["list of health benefits"],
      "suitableFor": ["health conditions this food is good for"],
      "avoidIf": ["health conditions that should avoid this food"],
      "alternatives": ["healthier alternatives if needed"],
      "bestTimeToEat": "Morning",
      "portionControl": "portion control advice",
      "preparation": "Common preparation methods",
      "ingredients": ["Typical ingredients"]
    }

    Be very specific about health recommendations based on the user's conditions.
    Provide accurate nutritional information and practical advice. The "calories" field must be a number.
    `;

    console.log('🔄 Sending request to Vertex AI Gemini Flash...');
    const result = await foodAnalysisModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    console.log('📝 Raw response from Vertex AI:', text.substring(0, 200) + '...');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed food analysis data');
      return parsedData;
    } else {
      console.error('❌ No JSON found in response. Full response:', text);
      throw new Error('Invalid response format from Vertex AI Gemini');
    }

  } catch (error) {
    console.error(`❌ Error analyzing food by name "${foodName}" with Vertex AI:`, error);
    
    // Fallback response
    return {
      foodName: foodName,
      calories: 0,
      nutritionFacts: {
        protein: "0g",
        carbs: "0g",
        fat: "0g",
        fiber: "0g",
        sugar: "0g",
        sodium: "0mg"
      },
      servingSize: "1 serving",
      healthScore: 5,
      isHealthy: false,
      recommendation: "Unable to analyze food by name. Please try again.",
      healthWarnings: ["Analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      bestTimeToEat: "Anytime",
      portionControl: "Moderate portions",
      preparation: "Unknown",
      ingredients: []
    };
  }
};

// Generate a recipe using Vertex AI Gemini
const generateRecipe = async (ingredients, healthConditions = [], preferences = []) => {
  try {
    if (!recipeGenerationModel) {
      throw new Error('Recipe Generation model not initialized');
    }

    console.log('🔄 Generating recipe with Vertex AI Gemini 1.5 Flash...');
    console.log('🥘 Ingredients:', ingredients);
    console.log('🏥 Health conditions:', healthConditions);
    console.log('🍽️ Preferences:', preferences);

    const healthConditionsText = healthConditions.length > 0 
      ? `The user has these health conditions: ${healthConditions.join(', ')}. `
      : '';

    const preferencesText = preferences.length > 0 
      ? `User preferences: ${preferences.join(', ')}. `
      : '';

    const prompt = `
    You are a professional chef and nutritionist. Create a recipe using these ingredients: ${ingredients.join(', ')}.

    ${healthConditionsText}${preferencesText}

    Please create a recipe and respond with ONLY a valid JSON object in this exact format:

    {
      "recipeName": "creative and appealing recipe name",
      "description": "brief description of the dish",
      "ingredients": [
        {
          "name": "ingredient name",
          "amount": "quantity with unit",
          "notes": "optional preparation notes"
        }
      ],
      "instructions": [
        "step 1 instruction",
        "step 2 instruction"
      ],
      "cookingTime": "total cooking time",
      "prepTime": "preparation time",
      "servings": 4,
      "difficulty": "Easy/Medium/Hard",
      "nutritionInfo": {
        "calories": "per serving",
        "protein": "grams",
        "carbs": "grams",
        "fat": "grams",
        "fiber": "grams"
      },
      "healthBenefits": ["list of health benefits"],
      "suitableFor": ["health conditions this recipe is good for"],
      "tags": ["healthy", "quick", "vegetarian"],
      "tips": ["cooking tips and variations"]
    }

    Make the recipe healthy, delicious, and suitable for the user's health conditions and preferences.
    `;

    console.log('🔄 Sending recipe generation request to Vertex AI Gemini...');
    const result = await recipeGenerationModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    console.log('📝 Raw response from Vertex AI:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed recipe data');
      return parsedData;
    } else {
      console.error('❌ No JSON found in response. Full response:', text);
      throw new Error('Invalid response format from Vertex AI Gemini');
    }

  } catch (error) {
    console.error('❌ Error generating recipe with Vertex AI:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Fallback response
    return {
      recipeName: "Simple Healthy Recipe",
      description: "A nutritious meal made with available ingredients",
      ingredients: ingredients.map(ing => ({
        name: ing,
        amount: "as needed",
        notes: ""
      })),
      instructions: [
        "Prepare all ingredients",
        "Cook according to your preference",
        "Season to taste",
        "Serve hot"
      ],
      cookingTime: "30 minutes",
      prepTime: "15 minutes",
      servings: 4,
      difficulty: "Easy",
      nutritionInfo: {
        calories: "Varies",
        protein: "Varies",
        carbs: "Varies",
        fat: "Varies",
        fiber: "Varies"
      },
      healthBenefits: ["Nutritious ingredients"],
      suitableFor: ["General health"],
      tags: ["healthy"],
      tips: ["Adjust seasoning to taste"]
    };
  }
};

module.exports = {
  analyzeFoodImage,
  analyzeFoodByName,
  generateRecipe
};