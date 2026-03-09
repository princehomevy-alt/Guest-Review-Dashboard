import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
  getFirestore
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyReplaceMeWithYourActualKey",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

let app;
let db;

export async function initializeFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
    return { app, db };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  return db;
}

export function getFirebaseApp() {
  if (!app) {
    throw new Error('Firebase not initialized');
  }
  return app;
}

export function handleFirebaseError(error, context = '') {
  const message = error.message || 'An error occurred';
  console.error('Firebase Error:', message);
  return {
    code: error.code,
    message: context ? `${context}: ${message}` : message,
    details: error
  };
}
