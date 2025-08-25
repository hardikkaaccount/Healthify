const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const { getVertexServiceAccount } = require('../utils/vercelServiceAccountHelper');

// Initialize Google GenAI with Vertex AI
let genAI;
let textModel;
let imageModel;

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'rainscare-58fdb';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

try {
  console.log('🔍 Initializing Google GenAI with Vertex AI...');
  
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

  console.log('✅ Google GenAI with Vertex AI initialized successfully');
  console.log('🍎 Food Analysis Model (Text): gemini-2.0-flash-exp (latest experimental model)');
  console.log('📸 Image Analysis Model: gemini-2.0-flash-exp (advanced multimodal analysis)');
  console.log('🏢 Project:', projectId);
  console.log('📍 Location:', location);

} catch (error) {
  console.error('❌ Failed to initialize Google GenAI:', error);
  console.error('❌ Make sure service account file exists and has proper permissions');
}

// Convert buffer to base64 data URL for GenAI
const bufferToDataUrl = (buffer, mimeType) => {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
};

// Enhanced Food Image Analysis using Google GenAI with Vertex AI
const analyzeFoodImage = async (imageFile, healthConditions = []) => {
  try {
    // Validation checks
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

    console.log('🔄 Starting enhanced food image analysis with Gemini 2.0 Flash...');
    console.log('📁 Image details:', {
      filename: imageFile.originalname || 'unknown',
      mimetype: imageFile.mimetype,
      size: `${(imageFile.size / 1024).toFixed(2)} KB`,
      dimensions: imageFile.dimensions || 'unknown'
    });

    // Process health conditions
    const healthConditionsText = healthConditions && healthConditions.length > 0 
      ? `\n\nIMPORTANT: The user has these health conditions: ${healthConditions.join(', ')}. Please provide specific recommendations, warnings, and alternatives based on these conditions.`
      : '';

    // Enhanced prompt for better analysis
    const analysisPrompt = `You are an expert nutritionist and food scientist with advanced knowledge in dietary analysis and health recommendations. 

Analyze the food item(s) in this image with precision and provide comprehensive nutritional and health information.

${healthConditionsText}

ANALYSIS REQUIREMENTS:
1. Identify ALL food items visible in the image
2. Estimate portion sizes accurately
3. Provide precise nutritional data per serving
4. Give health-specific recommendations
5. Include preparation method analysis if visible
6. Consider food combinations and their effects

Respond with ONLY a valid JSON object in this EXACT format:

{
  "foodName": "Detailed name of the primary food item(s) with preparation method",
  "description": "Brief description of what you see in the image",
  "calories": "Total calories per serving with unit (e.g., '320 calories per serving')",
  "servingSize": "Estimated serving size based on image (e.g., '1 medium portion (150g)')",
  "nutritionFacts": {
    "protein": "Protein content with unit (e.g., '25g')",
    "carbs": "Total carbohydrates with unit (e.g., '45g')",
    "fat": "Total fat content with unit (e.g., '12g')",
    "saturatedFat": "Saturated fat with unit (e.g., '3g')",
    "fiber": "Dietary fiber with unit (e.g., '8g')",
    "sugar": "Total sugars with unit (e.g., '6g')",
    "sodium": "Sodium content with unit (e.g., '450mg')",
    "cholesterol": "Cholesterol with unit (e.g., '65mg')",
    "vitaminC": "Vitamin C content if significant (e.g., '15mg')",
    "calcium": "Calcium content if significant (e.g., '120mg')",
    "iron": "Iron content if significant (e.g., '2.5mg')"
  },
  "macroBreakdown": {
    "proteinPercent": "Percentage of calories from protein",
    "carbsPercent": "Percentage of calories from carbs", 
    "fatPercent": "Percentage of calories from fat"
  },
  "healthScore": 8.5,
  "isHealthy": true,
  "glycemicIndex": "Low/Medium/High - estimated glycemic impact",
  "preparationMethod": "How the food appears to be prepared (e.g., 'Grilled', 'Steamed', 'Fried')",
  "ingredients": ["List of visible or likely ingredients"],
  "recommendation": "Detailed, personalized recommendation based on health conditions and nutritional profile",
  "healthWarnings": ["Specific warnings based on health conditions and food content"],
  "healthBenefits": ["Detailed list of health benefits this food provides"],
  "suitableFor": ["Health conditions or goals this food supports"],
  "avoidIf": ["Health conditions that should limit or avoid this food"],
  "alternatives": ["Healthier alternatives or modifications"],
  "bestTimeToEat": "Optimal timing for consumption based on nutritional profile",
  "portionControl": "Specific portion control advice with measurements",
  "cookingTips": ["Tips to make this food healthier if applicable"],
  "pairingAdvice": "Foods to pair with for better nutrition or blood sugar control",
  "allergenInfo": ["Common allergens that may be present"],
  "storageAdvice": "How to store leftovers if applicable"
}

CRITICAL INSTRUCTIONS:
- Be extremely accurate with nutritional data
- Provide specific, actionable health advice
- Consider the visual preparation method
- Account for hidden ingredients (oils, seasonings, etc.)
- Give precise portion measurements
- Include relevant micronutrients
- Respond with ONLY the JSON object, no additional text`;

    console.log('🧠 Sending enhanced analysis request to Gemini 2.0 Flash...');
    
    // Make API call with enhanced configuration
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        analysisPrompt,
        {
          inlineData: {
            data: imageFile.buffer.toString('base64'),
            mimeType: imageFile.mimetype,
          },
        }
      ],
      generationConfig: {
        maxOutputTokens: 3072, // Increased for more detailed analysis
        temperature: 0.2, // Slightly higher for more nuanced responses
        topP: 0.9,
        topK: 50,
        candidateCount: 1,
      },
    });

    const responseText = response.text;
    console.log('📝 Analysis response received:', responseText.substring(0, 300) + '...');

    // Enhanced JSON extraction with multiple patterns
    let parsedData = null;
    
    // Try different JSON extraction patterns
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/,
      /```\s*(\{[\s\S]*?\})\s*```/,
      /(\{[\s\S]*\})/
    ];

    for (const pattern of jsonPatterns) {
      const match = responseText.match(pattern);
      if (match) {
        try {
          parsedData = JSON.parse(match[1]);
          console.log('✅ JSON successfully parsed with pattern:', pattern.source);
          break;
        } catch (parseError) {
          console.warn('⚠️ JSON parse failed for pattern:', pattern.source);
          continue;
        }
      }
    }

    // Validate and enhance the parsed data
    if (parsedData && validateFoodAnalysisData(parsedData)) {
      // Add metadata
      parsedData.analysisMetadata = {
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash-exp',
        imageSize: imageFile.size,
        processingTime: Date.now(),
        healthConditionsConsidered: healthConditions
      };

      console.log('✅ Enhanced food analysis completed successfully');
      console.log('🍎 Identified food:', parsedData.foodName);
      console.log('📊 Health score:', parsedData.healthScore);
      
      return parsedData;
    }

    // If parsing failed, try to extract basic info
    console.warn('⚠️ Full JSON parsing failed, attempting basic extraction...');
    return createFallbackResponse(responseText, healthConditions);

  } catch (error) {
    console.error('❌ Enhanced food image analysis failed:', error);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    
    // Return enhanced fallback response
    return createErrorFallbackResponse(error, healthConditions);
  }
};

// Helper function to validate food analysis data
const validateFoodAnalysisData = (data) => {
  const requiredFields = ['foodName', 'calories', 'nutritionFacts'];
  const hasRequiredFields = requiredFields.every(field => data[field]);
  
  if (!hasRequiredFields) {
    console.warn('⚠️ Missing required fields in analysis data');
    return false;
  }

  const requiredNutritionFields = ['protein', 'carbs', 'fat'];
  const hasNutritionData = requiredNutritionFields.every(field => data.nutritionFacts[field]);
  
  if (!hasNutritionData) {
    console.warn('⚠️ Missing required nutrition fields');
    return false;
  }

  return true;
};

// Helper function to create fallback response from partial data
const createFallbackResponse = (responseText, healthConditions) => {
  console.log('🔄 Creating fallback response from partial data...');
  
  // Try to extract food name from response
  let foodName = "Unidentified Food Item";
  const foodNameMatch = responseText.match(/food[^:]*:\s*["']([^"']+)["']/i);
  if (foodNameMatch) {
    foodName = foodNameMatch[1];
  }

  return {
    foodName: foodName,
    description: "Analysis partially completed",
    calories: "Unable to determine exact calories",
    servingSize: "1 serving",
    nutritionFacts: {
      protein: "Data unavailable",
      carbs: "Data unavailable", 
      fat: "Data unavailable",
      saturatedFat: "Data unavailable",
      fiber: "Data unavailable",
      sugar: "Data unavailable",
      sodium: "Data unavailable",
      cholesterol: "Data unavailable"
    },
    macroBreakdown: {
      proteinPercent: "Unknown",
      carbsPercent: "Unknown",
      fatPercent: "Unknown"
    },
    healthScore: 5,
    isHealthy: true,
    glycemicIndex: "Unknown",
    preparationMethod: "Unable to determine",
    ingredients: ["Unable to identify"],
    recommendation: "Image analysis was partially successful. For accurate nutritional information, please try uploading a clearer image or enter the food name manually.",
    healthWarnings: ["Analysis incomplete - consult nutrition labels"],
    healthBenefits: ["Unable to determine from image"],
    suitableFor: ["General consumption"],
    avoidIf: ["Unknown allergens may be present"],
    alternatives: ["Consider entering food name manually for better analysis"],
    bestTimeToEat: "Anytime",
    portionControl: "Follow standard portion guidelines",
    cookingTips: ["Unable to provide specific tips"],
    pairingAdvice: "Pair with vegetables for balanced nutrition",
    allergenInfo: ["Unknown - check ingredients"],
    storageAdvice: "Follow standard food safety guidelines",
    analysisMetadata: {
      timestamp: new Date().toISOString(),
      model: 'gemini-2.0-flash-exp',
      status: 'partial_analysis',
      healthConditionsConsidered: healthConditions
    }
  };
};

// Helper function to create error fallback response
const createErrorFallbackResponse = (error, healthConditions) => {
  console.log('🔄 Creating error fallback response...');
  
  let errorMessage = "Unable to analyze image";
  let errorType = "general_error";

  if (error.message.includes('format')) {
    errorMessage = "Unsupported image format. Please use JPEG, PNG, or WebP.";
    errorType = "format_error";
  } else if (error.message.includes('size')) {
    errorMessage = "Image too large. Please use an image smaller than 10MB.";
    errorType = "size_error";
  } else if (error.message.includes('network') || error.message.includes('timeout')) {
    errorMessage = "Network error. Please check your connection and try again.";
    errorType = "network_error";
  }

  return {
    foodName: "Analysis Failed",
    description: "Unable to process image",
    calories: "Unable to analyze",
    servingSize: "Unknown",
    nutritionFacts: {
      protein: "0g",
      carbs: "0g",
      fat: "0g",
      saturatedFat: "0g",
      fiber: "0g",
      sugar: "0g",
      sodium: "0mg",
      cholesterol: "0mg"
    },
    macroBreakdown: {
      proteinPercent: "0%",
      carbsPercent: "0%",
      fatPercent: "0%"
    },
    healthScore: 0,
    isHealthy: false,
    glycemicIndex: "Unknown",
    preparationMethod: "Unknown",
    ingredients: ["Unable to identify"],
    recommendation: errorMessage + " You can try uploading a different image or enter the food name manually for analysis.",
    healthWarnings: ["Image analysis failed", "Verify food safety independently"],
    healthBenefits: [],
    suitableFor: [],
    avoidIf: ["Unknown ingredients - exercise caution"],
    alternatives: ["Enter food name manually", "Upload a clearer image"],
    bestTimeToEat: "Unknown",
    portionControl: "Follow standard portion guidelines",
    cookingTips: [],
    pairingAdvice: "Unable to provide recommendations",
    allergenInfo: ["Unknown allergens may be present"],
    storageAdvice: "Follow standard food safety guidelines",
    analysisMetadata: {
      timestamp: new Date().toISOString(),
      model: 'gemini-2.0-flash-exp',
      status: 'error',
      errorType: errorType,
      errorMessage: error.message,
      healthConditionsConsidered: healthConditions
    }
  };
};

// Analyze food by name using Google GenAI with Vertex AI
const analyzeFoodByName = async (foodName, healthConditions = []) => {
  try {
    if (!genAI) {
      throw new Error('Google GenAI not initialized');
    }

    console.log('🔄 Analyzing food by name with Google GenAI Vertex AI (Gemini 2.0 Flash)...');
    console.log('🍎 Food name:', foodName);
    console.log('🏥 Health conditions:', healthConditions);

    const healthConditionsText = healthConditions.length > 0 
      ? `The user has these health conditions: ${healthConditions.join(', ')}. `
      : '';

    const prompt = `
    You are a professional nutritionist and food expert. Analyze the food "${foodName}" and provide detailed nutritional information.

    ${healthConditionsText}

    Please analyze the food and respond with ONLY a valid JSON object in this exact format:

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

    Be very specific about health recommendations based on the user's conditions.
    Provide accurate nutritional information and practical advice.
    `;

    console.log('🔄 Sending food name analysis request to Google GenAI (Gemini 2.0 Flash)...');
    
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
      },
    });

    const text = response.text;
    console.log('📝 Raw response from Google GenAI:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (parsedData.foodName && parsedData.calories && parsedData.nutritionFacts) {
        console.log('✅ Valid food analysis data received');
        return parsedData;
      } else {
        console.warn('⚠️ Incomplete data received, using fallback');
      }
    } else {
      console.warn('⚠️ No JSON found in response, using fallback');
    }

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

  } catch (error) {
    console.error('❌ Error analyzing food by name with Google GenAI:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Return fallback response
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

    console.log('🔄 Generating healthy recipe with Google GenAI Vertex AI (Gemini 2.0 Flash)...');
    console.log('🥕 Ingredients:', ingredients);
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

    ${healthConditionsText}
    ${dietaryText}

    Please create a recipe and respond with ONLY a valid JSON object in this exact format:

    {
      "recipeName": "creative and appetizing recipe name",
      "description": "brief description of the dish",
      "ingredients": [
        {
          "name": "ingredient name",
          "amount": "quantity with unit",
          "notes": "any special notes or substitutions"
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
        "calories": "estimated calories per serving",
        "protein": "protein content",
        "carbs": "carbohydrate content",
        "fat": "fat content",
        "fiber": "fiber content"
      },
      "healthBenefits": ["list of health benefits"],
      "suitableFor": ["health conditions this recipe is good for"],
      "tags": ["recipe tags like 'low-sodium', 'high-protein'"],
      "tips": ["cooking tips and variations"]
    }

    Make sure the recipe is healthy and suitable for the user's health conditions.
    Be creative but practical with the ingredients provided.
    `;

    console.log('🔄 Sending recipe generation request to Google GenAI (Gemini 2.0 Flash)...');
    
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
      },
    });

    const text = response.text;
    console.log('📝 Raw response from Google GenAI:', text.substring(0, 200) + '...');

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ JSON found in response, parsing...');
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (parsedData.recipeName && parsedData.ingredients && parsedData.instructions) {
        console.log('✅ Valid recipe data received');
        return parsedData;
      } else {
        console.warn('⚠️ Incomplete recipe data received, using fallback');
      }
    } else {
      console.warn('⚠️ No JSON found in response, using fallback');
    }

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

  } catch (error) {
    console.error('❌ Error generating recipe with Google GenAI:', error);
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