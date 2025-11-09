// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";

// Firebase Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyCgMFf3jcbG-pl3II5aRK9r4XxfF4ysc1c",
  authDomain: "join-44e84.firebaseapp.com",
  projectId: "join-44e84",
  storageBucket: "join-44e84.firebasestorage.app",
  messagingSenderId: "80172784787",
  appId: "1:80172784787:web:2922fbb80429f90e34c166",
  measurementId: "G-TC3XZWJL58"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Firebase Services exportieren
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Google Auth Provider konfigurieren
const googleProvider = new GoogleAuthProvider();

/**
 * Erstellt einen neuen User mit Email und Passwort
 * @param {string} email - Die Email-Adresse für den neuen Account
 * @param {string} password - Das Passwort für den neuen Account (min. 6 Zeichen)
 * @returns {Promise} User-Objekt bei erfolgreicher Registrierung
 */
export function createUser(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return userCredential.user;
    })
    .catch((error) => {
      let message = "Registrierung fehlgeschlagen.";
      if (error.code === 'auth/email-already-in-use') {
        message = "Diese Email wird bereits verwendet.";
      } else if (error.code === 'auth/weak-password') {
        message = "Das Passwort ist zu schwach.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Ungültige Email-Adresse.";
      }
      throw new Error(message);
    });
}

/**
 * Login mit Email und Passwort
 * @param {string} email - Die Email-Adresse des Users
 * @param {string} password - Das Passwort des Users
 * @returns {Promise} User-Objekt bei erfolgreicher Anmeldung
 */
export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return userCredential.user;
    })
    .catch((error) => {
      let message = "Login fehlgeschlagen.";
      if (error.code === 'auth/user-not-found') {
        message = "Kein Account mit dieser Email gefunden.";
      } else if (error.code === 'auth/wrong-password') {
        message = "Falsches Passwort.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Ungültige Email-Adresse.";
      }
      throw new Error(message);
    });
}

/**
 * Google Sign-In mit Popup
 * Öffnet ein Popup-Fenster für die Google-Authentifizierung
 * @returns {Promise} User-Objekt bei erfolgreichem Login
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
    .then((result) => {
      return result.user;
    })
    .catch((error) => {
      let message = "Google Login fehlgeschlagen.";
      if (error.code === 'auth/popup-blocked') {
        message = "Popup wurde blockiert! Bitte erlaube Popups für diese Seite.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        return null;
      }
      throw new Error(message);
    });
}

