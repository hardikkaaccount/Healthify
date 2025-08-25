const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let app;

try {
  // Check if we have a service account key file
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  } else {
    // Fallback to default credentials (for local development)
    app = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  }

  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  process.exit(1);
}

// Export Firebase services
const auth = admin.auth();
const db = admin.firestore();

// Initialize storage only if needed (optional)
let storage = null;
try {
  if (process.env.FIREBASE_STORAGE_BUCKET) {
    storage = admin.storage();
  }
} catch (error) {
  console.warn('⚠️ Firebase Storage not initialized:', error.message);
}

// Firestore settings
db.settings({
  timestampsInSnapshots: true
});

module.exports = {
  admin,
  auth,
  db,
  storage,
  app
};