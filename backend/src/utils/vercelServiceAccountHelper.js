/**
 * Helper utility for handling service account credentials in Vercel environment
 */

const fs = require('fs');
const path = require('path');

/**
 * Parses a service account key from an environment variable,
 * correctly handling newline characters in the private key.
 * @param {string} key The environment variable string.
 * @returns {Object} The parsed service account object.
 */
function parseServiceAccountKey(key) {
  if (!key) return null;
  try {
    // This handles keys where newlines are escaped (e.g., in a .env file)
    const safeKey = key.replace(/\\n/g, "\\n");
    return JSON.parse(safeKey);
  } catch (error) {
    // This handles keys where newlines are literal (e.g., from Vercel's UI)
    try {
        const safeKey2 = key.replace(/\n/g, "\\n");
        return JSON.parse(safeKey2);
    } catch (e) {
        console.error('Error parsing service account key from environment variable:', e);
        return null;
    }
  }
}

/**
 * Gets Firebase service account credentials either from environment variable or file
 * @returns {Object} The service account credentials as a JavaScript object
 */
function getFirebaseServiceAccount() {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    const parsedKey = parseServiceAccountKey(envKey);
    if (parsedKey) return parsedKey;
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

  throw new Error('Firebase service account credentials not found or invalid');
}

/**
 * Gets Vertex AI service account credentials either from environment variable or file
 * @returns {Object} The service account credentials as a JavaScript object
 */
function getVertexServiceAccount() {
  const envKey = process.env.VERTEX_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    const parsedKey = parseServiceAccountKey(envKey);
    if (parsedKey) return parsedKey;
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

  throw new Error('Vertex AI service account credentials not found or invalid');
}

module.exports = {
  getFirebaseServiceAccount,
  getVertexServiceAccount
};