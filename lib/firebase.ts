// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if all required config values are available
const app = getApps().length
  ? getApps()[0]
  : firebaseConfig.apiKey
  ? initializeApp(firebaseConfig)
  : null;

// Safety check in case environment variables aren't loaded
if (!app) {
  console.error("Firebase configuration is missing or incomplete. Check your .env.local file.");
}

const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider }; 