/**
 * Helper utility for handling service account credentials.
 * This version is simplified to prioritize loading from a file for testing purposes.
 */

const fs = require('fs');
const path = require('path');

/**
 * Gets Firebase service account credentials from file.
 * @returns {Object} The service account credentials as a JavaScript object
 */
function getFirebaseServiceAccount() {
  try {
    // This path is relative to the utils directory
    const serviceAccountPath = path.resolve(__dirname, '../config/service-account1.json');
    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    }
  } catch (error) {
    console.error('Error loading Firebase service account from file:', error);
  }

  throw new Error('Firebase service account credentials file not found at backend/src/config/service-account1.json');
}

/**
 * Gets Vertex AI service account credentials from file.
 * @returns {Object} The service account credentials as a JavaScript object
 */
function getVertexServiceAccount() {
  try {
    // This path is relative to the utils directory
    const serviceAccountPath = path.resolve(__dirname, '../config/service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    }
  } catch (error) {
    console.error('Error loading Vertex AI service account from file:', error);
  }

  throw new Error('Vertex AI service account credentials file not found at backend/src/config/service-account.json');
}

module.exports = {
  getFirebaseServiceAccount,
  getVertexServiceAccount
};