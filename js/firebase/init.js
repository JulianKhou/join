import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCgMFf3jcbG-pl3II5aRK9r4XxfF4ysc1c",
  authDomain: "join-44e84.firebaseapp.com",
  projectId: "join-44e84",
  storageBucket: "join-44e84.firebasestorage.app",
  messagingSenderId: "80172784787",
  appId: "1:80172784787:web:2922fbb80429f90e34c166",
  measurementId: "G-TC3XZWJL58",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
