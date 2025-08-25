/**
 * Helper utility for handling service account credentials in Vercel environment
 */

const fs = require('fs');
const path = require('path');

/**
 * Parses a service account key from an environment variable.
 * This function is designed to handle JSON strings that may have escaped newline
 * characters in the private key.
 * @param {string} key The environment variable string.
 * @returns {Object|null} The parsed service account object, or null if parsing fails.
 */
function parseServiceAccountKey(key) {
  if (!key) {
    return null;
  }
  try {
    // In many environments (like .env files or some CI/CD systems), newline
    // characters within the private key are escaped as '\n'.
    // JSON.parse requires these to be proper '\n' sequences within the string.
    // This replacement ensures the key is parsed correctly.
    const correctedKey = key.replace(/\\n/g, '\n');
    return JSON.parse(correctedKey);
  } catch (error) {
    console.error('Error parsing service account key from environment variable:', error);
    return null;
  }
}

/**
 * Retrieves Firebase service account credentials.
 * It prioritizes environment variables (including Base64) and falls back to a local file.
 * @returns {Object} The service account credentials.
 * @throws {Error} If credentials are not found or are invalid.
 */
function getFirebaseServiceAccount() {
  // Prefer the Base64 encoded key for robustness
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64) {
    try {
      const decodedKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64, 'base64').toString('utf-8');
      return JSON.parse(decodedKey);
    } catch (error) {
      console.error('Error parsing Base64 Firebase service account key:', error);
    }
  }

  // Fallback to the raw JSON key
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const parsedKey = parseServiceAccountKey(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    if (parsedKey) {
      return parsedKey;
    }
  }

  // Fall back to file-based approach for local development
  try {
    const serviceAccountPath = path.resolve(__dirname, '../config/service-account1.json');
    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    }
  } catch (error) {
    console.error('Error loading Firebase service account from file:', error);
  }

  throw new Error('Firebase service account credentials not found or invalid');
}

/**
 * Retrieves Vertex AI service account credentials.
 * It prioritizes environment variables (including Base64) and falls back to a local file.
 * @returns {Object} The service account credentials.
 * @throws {Error} If credentials are not found or are invalid.
 */
function getVertexServiceAccount() {
  // Prefer the Base64 encoded key for robustness
  if (process.env.VERTEX_SERVICE_ACCOUNT_KEY_B64) {
    try {
      const decodedKey = Buffer.from(process.env.VERTEX_SERVICE_ACCOUNT_KEY_B64, 'base64').toString('utf-8');
      return JSON.parse(decodedKey);
    } catch (error) {
      console.error('Error parsing Base64 Vertex AI service account key:', error);
    }
  }

  // Fallback to the raw JSON key
  if (process.env.VERTEX_SERVICE_ACCOUNT_KEY) {
    const parsedKey = parseServiceAccountKey(process.env.VERTEX_SERVICE_ACCOUNT_KEY);
    if (parsedKey) {
      return parsedKey;
    }
  }

  // Fall back to file-based approach for local development
  try {
    const serviceAccountPath = path.resolve(__dirname, '../config/service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    }
  } catch (error) {
    console.error('Error loading Vertex AI service account from file:', error);
  }

  throw new Error('Vertex AI service account credentials not found or invalid');
}

module.exports = {
  getFirebaseServiceAccount,
  getVertexServiceAccount
};
