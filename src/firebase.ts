// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrKiRM4UiQpLEjNuEhZjgJBEdA5LbDvjQ",
  authDomain: "hustlex.firebaseapp.com",
  projectId: "hustlex",
  storageBucket: "hustlex.appspot.com", // 🔧 Fixed typo: should be .appspot.com not .app
  messagingSenderId: "63503218548",
  appId: "1:63503218548:web:ac8b836919c2a05ed7de21",
  measurementId: "G-1KM1Y18JS4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth, Firestore, and Google Provider
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
