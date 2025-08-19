// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA3uI1nMGiwoK0V5xvGTUR1prWFX44MtnI",
  authDomain: "flashzen-7lxkc.firebaseapp.com",
  projectId: "flashzen-7lxkc",
  storageBucket: "flashzen-7lxkc.appspot.com",
  messagingSenderId: "717026879552",
  appId: "1:717026879552:web:5188aec8da24c9bbb897a5",
  clientId: "717026879552-3k1vj6f9q2n4s3s8n5v2a7gq5q5j2e2h.apps.googleusercontent.com"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, firebaseConfig };
