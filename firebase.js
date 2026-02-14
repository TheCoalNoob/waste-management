// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBlM0r0Q5j9fPJaCX0X5lz77umYQ4GFF0",
  authDomain: "waste-management-6b634.firebaseapp.com",
  projectId: "waste-management-6b634",
  storageBucket: "waste-management-6b634.firebasestorage.app",
  messagingSenderId: "752464336479",
  appId: "1:752464336479:web:132ad8ec5254901ad92dea",
  measurementId: "G-C3CTZL55HK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
