import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvTTQgYR-dhwb5C5xPk6Qol-hGTKtKJM4",
  authDomain: "docusaurus-c520c.firebaseapp.com",
  projectId: "docusaurus-c520c",
  storageBucket: "docusaurus-c520c.firebasestorage.app",
  messagingSenderId: "648934909429",
  appId: "1:648934909429:web:d18c526e3d6c9d1ba26cbc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
