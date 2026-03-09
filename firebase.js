/**
 * Firebase Configuration Module
 * Handles all Firebase connection and initialization
 * Uses Firebase SDK v9+ (modular syntax)
 */

// Import Firebase SDK modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
  getFirestore, 
  connectFirestoreEmulator 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import {
  getAuth,
  connectAuthEmulator
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

/**
 * Firebase Configuration
 * IMPORTANT: Replace with your actual Firebase project credentials
 * Get these from Firebase Console > Project Settings
 */
const firebaseConfig = {
  apiKey: "AIzaSyCvg6bacuKjH7bxlq_AUJWVGZeXgWDwlIA",
  authDomain: "guestreviewdashboard.firebaseapp.com",
  projectId: "guestreviewdashboard",
  storageBucket: "guestreviewdashboard.firebasestorage.app",
  messagingSenderId: "726657937453",
  appId: "1:726657937453:web:f87dfc6273467d8051c8a4"
};

/**
 * Initialize Firebase App
 * This connects to your Firebase project
 */
let app;
let db;
let auth;
let isEmulator = false;

/**
 * Initialize Firebase
 * Call this once on app startup
 */
export async function initializeFirebase() {
  try {
    // Initialize Firebase App
    app = initializeApp(firebaseConfig);
    
    // Initialize Firestore Database
    db = getFirestore(app);
    
    // Initialize Authentication
    auth = getAuth(app);
    
    // For development: Optionally connect to emulator
    // Uncomment these lines if you're using Firebase Emulator Suite
    // if (window.location.hostname === 'localhost') {
    //   try {
    //     connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    //     connectFirestoreEmulator(db, 'localhost', 8080);
    //     isEmulator = true;
    //     console.log('✓ Connected to Firebase Emulator');
    //   } catch (error) {
    //     console.log('Firebase Emulator not available, using production');
    //   }
    // }
    
    console.log('✓ Firebase initialized successfully');
    return { app, db, auth };
  } catch (error) {
    console.error('✗ Firebase initialization error:', error);
    throw error;
  }
}

/**
 * Get Firestore database instance
 * Use this in other modules to access the database
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
}

/**
 * Get Auth instance
 * Use this in other modules for authentication operations
 */
export function getAuthInstance() {
  if (!auth) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return auth;
}

/**
 * Get current app instance
 */
export function getFirebaseApp() {
  if (!app) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return app;
}

/**
 * Check if using emulator
 */
export function isUsingEmulator() {
  return isEmulator;
}

/**
 * Error handler for Firebase operations
 * Provides user-friendly error messages
 */
export function handleFirebaseError(error, context = '') {
  let userMessage = 'An error occurred';
  
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        userMessage = 'Access denied. Check your permissions.';
        break;
      case 'not-found':
        userMessage = 'Document or collection not found.';
        break;
      case 'already-exists':
        userMessage = 'This item already exists.';
        break;
      case 'invalid-argument':
        userMessage = 'Invalid data format provided.';
        break;
      case 'unavailable':
        userMessage = 'Service temporarily unavailable. Please try again.';
        break;
      case 'auth/user-not-found':
        userMessage = 'User not found.';
        break;
      case 'auth/wrong-password':
        userMessage = 'Incorrect password.';
        break;
      case 'auth/email-already-in-use':
        userMessage = 'Email already registered.';
        break;
      default:
        userMessage = error.message || 'An error occurred';
    }
  }
  
  const fullMessage = context ? `${context}: ${userMessage}` : userMessage;
  console.error(`✗ Firebase Error [${error.code}]:`, error);
  
  return {
    code: error.code,
    message: fullMessage,
    details: error
  };
}

/**
 * Validate Firebase Config
 * Check if Firebase is properly configured
 */
export function validateFirebaseConfig() {
  const requiredKeys = ['apiKey', 'projectId', 'authDomain'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ Missing Firebase config keys:', missingKeys);
    console.warn('Update firebaseConfig in firebase.js with your actual credentials');
    return false;
  }
  return true;
}

/**
 * Get Firebase Configuration Info (for debugging)
 */
export function getFirebaseInfo() {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    isEmulator: isEmulator,
    appInitialized: !!app,
    dbInitialized: !!db,
    authInitialized: !!auth
  };
}
