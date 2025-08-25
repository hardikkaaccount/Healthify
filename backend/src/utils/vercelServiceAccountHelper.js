/**
 * Helper utility for handling service account credentials in Vercel environment
 * This allows loading Firebase service account credentials from environment variables
 * instead of files when deployed to Vercel
 */

const fs = require('fs');
const path = require('path');

/**
 * Gets Firebase service account credentials either from environment variable or file
 * @returns {Object} The service account credentials as a JavaScript object
 */
function getFirebaseServiceAccount() {
  // First try to get from environment variable (for Vercel deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY environment variable:', error);
      // Fall back to file if environment variable parsing fails
    }
  }

  // Fall back to file-based approach (for local development)
  try {
    const serviceAccountPath = path.resolve(__dirname, '../config/service-account1.json');
    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    }
  } catch (error) {
    console.error('Error loading Firebase service account from file:', error);
  }

  throw new Error('Firebase service account credentials not found');
}

/**
 * Gets Vertex AI service account credentials either from environment variable or file
 * @returns {Object} The service account credentials as a JavaScript object
 */
function getVertexServiceAccount() {
  // First try to get from environment variable (for Vercel deployment)
  if (process.env.VERTEX_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_KEY);
    } catch (error) {
      console.error('Error parsing VERTEX_SERVICE_ACCOUNT_KEY environment variable:', error);
      // Fall back to file if environment variable parsing fails
    }
  }

  // Fall back to file-based approach (for local development)
  try {
    const serviceAccountPath = path.resolve(__dirname, '../config/service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    }
  } catch (error) {
    console.error('Error loading Vertex AI service account from file:', error);
  }

  throw new Error('Vertex AI service account credentials not found');
}

module.exports = {
  getFirebaseServiceAccount,
  getVertexServiceAccount
};