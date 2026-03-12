import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For conversion purposes, we'll use placeholder values.
// In a real app, these should be in .env.local
const firebaseConfig = {
  apiKey: "placeholder-api-key",
  authDomain: "wenlance-app.firebaseapp.com",
  projectId: "wenlance-app",
  storageBucket: "wenlance-app.appspot.com",
  messagingSenderId: "placeholder-sender-id",
  appId: "placeholder-app-id"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;
