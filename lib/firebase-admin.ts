import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function initAdmin() {
  const apps = getApps();
  
  if (!apps.length) {
    try {
      console.log('Initializing Firebase Admin SDK...');
      console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
      console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
      
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Missing required Firebase Admin credentials');
      }

      const app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      
      console.log('Firebase Admin SDK initialized successfully');
      return getFirestore(app);
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
      throw error;
    }
  }
  
  console.log('Using existing Firebase Admin app');
  return getFirestore();
}

export const firestore = initAdmin(); 