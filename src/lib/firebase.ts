// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "flashzen-7lxkc",
  appId: "1:717026879552:web:5188aec8da24c9bbb897a5",
  storageBucket: "flashzen-7lxkc.firebasestorage.app",
  apiKey: "AIzaSyA3uI1nMGiwoK0V5xvGTUR1prWFX44MtnI",
  authDomain: "flashzen-7lxkc.firebaseapp.com",
  messagingSenderId: "717026879552"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
