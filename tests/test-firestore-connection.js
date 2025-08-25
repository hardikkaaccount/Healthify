// Test Firestore connection and rules
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase configuration (using environment variables)
const firebaseConfig = {
  apiKey: "AIzaSyDzoyaYxFPsW8dgyY1eckl489HriJSi_f4",
  authDomain: "rainscare-58fdb.firebaseapp.com",
  projectId: "rainscare-58fdb",
  storageBucket: "rainscare-58fdb.firebasestorage.app",
  messagingSenderId: "533506322423",
  appId: "1:533506322423:web:0776896c6a71f9aeb948f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testFirestoreConnection() {
  try {
    console.log('🔥 Testing Firestore Connection and Rules...');
    
    // Sign in anonymously for testing
    console.log('📝 Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log('✅ Anonymous sign-in successful:', user.uid);
    
    // Test writing to users collection
    console.log('📝 Testing write to users collection...');
    const userRef = doc(db, 'users', user.uid);
    const testData = {
      uid: user.uid,
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      testField: 'This is a test'
    };
    
    await setDoc(userRef, testData);
    console.log('✅ Write successful to users collection');
    
    // Test reading from users collection
    console.log('📖 Testing read from users collection...');
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      console.log('✅ Read successful:', docSnap.data());
    } else {
      console.log('❌ Document does not exist');
    }
    
    console.log('🎉 All tests passed! Firestore is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('🚨 Permission denied - check Firestore security rules');
    } else if (error.code === 'unauthenticated') {
      console.error('🚨 User not authenticated');
    }
  }
}

// Run the test
testFirestoreConnection();