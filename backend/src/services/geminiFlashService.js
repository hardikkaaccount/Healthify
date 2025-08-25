const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const { getVertexServiceAccount } = require('../utils/vercelServiceAccountHelper');

// Use your existing API key but with dedicated Gemini 1.5 Flash models
const GEMINI_API_KEY = process.env.GEMINI_FOOD_ANALYSIS_API_KEY || process.env.GEMINI_API_KEY;

let genAI;
let foodAnalysisModel;
let recipeGenerationModel;

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'rainscare-58fdb';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

try {
  console.log('🔍 Initializing Google GenAI with Vertex AI for Gemini Flash Service...');
  
  // Get Vertex AI service account credentials from environment variable or file
  const vertexServiceAccount = getVertexServiceAccount();
  
  console.log('🏢 Project ID:', projectId);
  console.log('📍 Location:', location);
  
  genAI = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
    credentials: {
      client_email: vertexServiceAccount.client_email,
      private_key: vertexServiceAccount.private_key.replace(/\\n/g, '\n'),
    }
  });

  console.log('✅ Google GenAI with Vertex AI initialized successfully for Gemini Flash Service');
  console.log('🍎 Food Analysis Model (Text): gemini-1.5-flash (optimized for nutrition)');
  console.log('👨‍🍳 Recipe Generation Model: gemini-1.5-flash (optimized for creativity)');
  console.log('🏢 Project:', projectId);
  console.log('📍 Location:', location);

} catch (error) {
  console.error('❌ Failed to initialize Google GenAI with Vertex AI:', error);
  console.error('❌ Error details:', error.message);
}

// Convert buffer to base64 data URL for GenAI
const bufferToDataUrl = (buffer, mimeType) => {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
};

// Analyze food image using Google GenAI with Vertex AI
const analyzeFoodImage = async (imageFile, healthConditions = []) => {
  try {
    if (!genAI) {
      throw new Error('Google GenAI service not initialized');
    }

    if (!imageFile || !imageFile.buffer) {
      throw new Error('Invalid image file provided');
    }

    // Supported image formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(imageFile.mimetype)) {
      throw new Error(`Unsupported image format: ${imageFile.mimetype}. Supported formats: ${supportedFormats.join(', ')}`);
    }

    // Image size validation (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      throw new Error(`Image too large: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 10MB`);
    }

    console.log('🔄 Analyzing food image with Google GenAI (Gemini 1.5 Flash)...');
    console.log('📁 Image info:', {
      mimetype: imageFile.mimetype,
      size: imageFile.size,
      originalname: imageFile.originalname
    });

    const healthConditionsText = healthConditions.length > 0 
      ? `The user has these health conditions: ${healthConditions.join(', ')}. `
      : '';

    const prompt = `
    You are a professional nutritionist and food expert. Analyze this food image and provide detailed nutritional information.

    ${healthConditionsText}

    Please analyze the food in the image and respond with ONLY a valid JSON object in this exact format:

    {
      "foodName": "specific name of the food item",
      "calories": "calories per serving (e.g., '250 per serving')",
      "nutritionFacts": {
        "protein": "protein content with unit (e.g., '15g')",
        "carbs": "carbohydrate content with unit (e.g., '30g')",
        "fat": "fat content with unit (e.g., '8g')",
        "fiber": "fiber content with unit (e.g., '5g')",
        "sugar": "sugar content with unit (e.g., '12g')",
        "sodium": "sodium content with unit (e.g., '200mg')"
      },
      "servingSize": "typical serving size (e.g., '1 cup', '100g')",
      "healthScore": 8,
      "isHealthy": true,
      "recommendation": "detailed recommendation based on health conditions",
      "healthWarnings": ["any warnings based on health conditions"],
      "healthBenefits": ["list of health benefits"],
      "suitableFor": ["health conditions this food is good for"],
      "avoidIf": ["health conditions that should avoid this food"],
      "alternatives": ["healthier alternatives if needed"],
      "bestTimeToEat": "best time to consume (e.g., 'Morning', 'Post-workout')",
      "portionControl": "portion control advice"
    }

    Be very specific about health recommendations based on the user's conditions.
    Provide accurate nutritional information and practical advice.
    `;

    console.log('🔄 Sending request to Google GenAI (Gemini 1.5 Flash)...');
    
    // Make API call with enhanced configuration
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: imageFile.buffer.toString('base64'),
            mimeType: imageFile.mimetype,
          },
        }
      ],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.3, // Lower temperature for more consistent food analysis
        topP: 0.8,
        topK: 40,
        candidateCount: 1,
      },
    });

    const responseText = response.text;
    console.log('📝 Raw response from Google GenAI:', responseText.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed food analysis data');
      return parsedData;
    } else {
      console.error('❌ No JSON found in response. Full response:', responseText);
      throw new Error('Invalid response format from Google GenAI (Gemini 1.5 Flash)');
    }

  } catch (error) {
    console.error('❌ Error analyzing food image with Google GenAI (Gemini 1.5 Flash):', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Fallback response
    return {
      foodName: "Food Item",
      calories: "Unable to analyze",
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
      isHealthy: true,
      recommendation: "Unable to analyze image. Please try uploading a clearer photo.",
      healthWarnings: ["Image analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      bestTimeToEat: "Anytime",
      portionControl: "Moderate portions"
    };
  }
};

// Analyze food by name using Google GenAI with Vertex AI
const analyzeFoodByName = async (foodName, healthConditions = []) => {
  try {
    if (!genAI) {
      throw new Error('Google GenAI not initialized');
    }

    console.log('🔄 Analyzing food by name with Google GenAI (Gemini 1.5 Flash)...');
    console.log('🍎 Food name:', foodName);
    console.log('🏥 Health conditions:', healthConditions);

    const healthConditionsText = healthConditions.length > 0 
      ? `The user has these health conditions: ${healthConditions.join(', ')}. `
      : '';

    const prompt = `
    You are a professional nutritionist and food expert. Analyze the food "${foodName}" and provide detailed nutritional information.

    ${healthConditionsText}

    Please analyze "${foodName}" and respond with ONLY a valid JSON object in this exact format:

    {
      "foodName": "${foodName}",
      "calories": "calories per serving (e.g., '250 per serving')",
      "nutritionFacts": {
        "protein": "protein content with unit (e.g., '15g')",
        "carbs": "carbohydrate content with unit (e.g., '30g')",
        "fat": "fat content with unit (e.g., '8g')",
        "fiber": "fiber content with unit (e.g., '5g')",
        "sugar": "sugar content with unit (e.g., '12g')",
        "sodium": "sodium content with unit (e.g., '200mg')"
      },
      "servingSize": "typical serving size (e.g., '1 cup', '100g')",
      "healthScore": 8,
      "isHealthy": true,
      "recommendation": "detailed recommendation based on health conditions",
      "healthWarnings": ["any warnings based on health conditions"],
      "healthBenefits": ["list of health benefits"],
      "suitableFor": ["health conditions this food is good for"],
      "avoidIf": ["health conditions that should avoid this food"],
      "alternatives": ["healthier alternatives if needed"],
      "bestTimeToEat": "best time to consume (e.g., 'Morning', 'Post-workout')",
      "portionControl": "portion control advice"
    }

    Consider the user's health conditions and provide specific advice.
    `;

    console.log('🔄 Sending food name analysis request to Google GenAI (Gemini 1.5 Flash)...');
    
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.3, // Lower temperature for more consistent food analysis
        topP: 0.8,
        topK: 40,
        candidateCount: 1
      },
    });

    const text = response.text;
    console.log('📝 Raw response from Google GenAI:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed food name analysis data');
      return parsedData;
    } else {
      console.error('❌ No JSON found in response. Full response:', text);
      throw new Error('Invalid response format from Google GenAI (Gemini 1.5 Flash)');
    }

  } catch (error) {
    console.error('❌ Error analyzing food by name with Google GenAI (Gemini 1.5 Flash):', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Fallback response
    return {
      foodName: foodName,
      calories: "Unable to analyze",
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
      isHealthy: true,
      recommendation: "Unable to analyze food. Please try again.",
      healthWarnings: ["Analysis failed"],
      healthBenefits: [],
      suitableFor: [],
      avoidIf: [],
      alternatives: [],
      bestTimeToEat: "Anytime",
      portionControl: "Moderate portions"
    };
  }
};

// Generate healthy recipe using Google GenAI with Vertex AI
const generateHealthyRecipe = async (ingredients, healthConditions = [], dietaryPreferences = {}) => {
  try {
    if (!genAI) {
      throw new Error('Google GenAI not initialized');
    }

    console.log('🔄 Generating healthy recipe with Google GenAI (Gemini 1.5 Flash)...');
    console.log('🥘 Ingredients:', ingredients);
    console.log('🏥 Health conditions:', healthConditions);
    console.log('🍽️ Dietary preferences:', dietaryPreferences);

    const healthConditionsText = healthConditions.length > 0 
      ? `The user has these health conditions: ${healthConditions.join(', ')}. `
      : '';

    const dietaryText = Object.keys(dietaryPreferences).length > 0 
      ? `Dietary preferences: ${JSON.stringify(dietaryPreferences)}. `
      : '';

    const prompt = `
    You are a professional chef and nutritionist. Create a healthy recipe using these ingredients: ${ingredients.join(', ')}.

    ${healthConditionsText}${dietaryText}

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

    Make the recipe healthy, delicious, and suitable for the user's health conditions.
    `;

    console.log('🔄 Sending recipe generation request to Google GenAI (Gemini 1.5 Flash)...');
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.7, // Higher temperature for more creative recipes
        topP: 0.9,
        topK: 50,
        candidateCount: 1
      },
    });

    const text = response.text;
    console.log('📝 Raw response from Google GenAI:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      console.log('✅ Successfully parsed recipe data');
      return parsedData;
    } else {
      console.error('❌ No JSON found in response. Full response:', text);
      throw new Error('Invalid response format from Google GenAI (Gemini 1.5 Flash)');
    }

  } catch (error) {
    console.error('❌ Error generating recipe with Google GenAI (Gemini 1.5 Flash):', error);
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
  generateHealthyRecipe
};