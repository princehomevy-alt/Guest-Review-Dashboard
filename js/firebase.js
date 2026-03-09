import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
  getFirestore
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCvg6bacuKjH7bxlq_AUJWVGZeXgWDwlIA",
  authDomain: "guestreviewdashboard.firebaseapp.com",
  projectId: "guestreviewdashboard",
  storageBucket: "guestreviewdashboard.firebasestorage.app",
  messagingSenderId: "726657937453",
  appId: "1:726657937453:web:f87dfc6273467d8051c8a4"
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
