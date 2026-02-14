// Firebase (CDN modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// TODO: paste your Firebase config from Firebase Console → Project settings → Your apps
const firebaseConfig = {
  apiKey: "AIzaSyDBlM0r0Q5j9fPJaCX0X5lz77umYQ4GFF0",
  authDomain: "waste-management-6b634.firebaseapp.com",
  projectId: "waste-management-6b634",
  storageBucket: "waste-management-6b634.firebasestorage.app",
  messagingSenderId: "752464336479",
  appId: "1:752464336479:web:132ad8ec5254901ad92dea",
  measurementId: "G-C3CTZL55HK"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
