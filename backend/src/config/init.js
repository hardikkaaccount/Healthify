const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');
const { getFirebaseServiceAccount, getVertexServiceAccount } = require('../utils/vercelServiceAccountHelper');
require('dotenv').config();

// --- Firebase setup ---
try {
  // Get Firebase service account credentials from environment variable or file
  const firebaseServiceAccount = getFirebaseServiceAccount();
  
  admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'rainscare-58fdb',
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  process.exit(1);
}

// --- Vertex AI setup ---
let vertexAI;
try {
  // Get Vertex AI service account credentials from environment variable or file
  const vertexServiceAccount = getVertexServiceAccount();
  
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
  console.log('✅ Vertex AI initialized');
} catch (error) {
  console.error('❌ Vertex AI initialization failed:', error.message);
  process.exit(1);
}

module.exports = { admin, vertexAI };
