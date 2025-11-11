// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore, doc, setDoc, deleteDoc, serverTimestamp,getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


// Export Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Creates a new user with email and password
 * @param {string} email - The email address for the new account
 * @param {string} password - The password for the new account (min. 6 characters)
 * @param {string} username - The username for the new account
 * @returns {Promise} User object on successful registration
 */
export function createUser(email, password, username) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return createOrUpdateUserProfile(userCredential.user.uid, username, email).then(
        () => userCredential.user
      );
    })
    .catch((error) => {
      let message = "Registration failed.";
      if (error.code === "auth/email-already-in-use") {
        message = "This email is already in use.";
      } else if (error.code === "auth/weak-password") {
        message = "The password is too weak.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      }
      throw new Error(message);
    });
}

/**
 * Login with email and password
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise} User object on successful login
 */
export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return userCredential.user.uid;
    })
    .catch((error) => {
      let message = "Login failed.";
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      }
      throw new Error(message);
    });
}

/**
 * Google Sign-In with popup
 * Opens a popup window for Google authentication
 * Creates or updates user profile if it doesn't exist
 * @returns {Promise} User object on successful login
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      // Use merge: true to avoid overwriting existing profiles
      return createOrUpdateUserProfile(user.uid, user.displayName, user.email).then(
        () => user
      );
    })
    .catch((error) => {
      let message = "Google login failed.";
      if (error.code === "auth/popup-blocked") {
        message = "Popup was blocked! Please allow popups for this site.";
      } else if (error.code === "auth/popup-closed-by-user") {
        return null;
      }
      throw new Error(message);
    });
}

/**
 * Creates or updates a user profile in Firestore
 * Uses merge to avoid overwriting existing data (e.g., createdAt)
 * 
 * @param {string} uid - The unique user ID from Firebase Authentication
 * @param {string} username - The user's username
 * @param {string} email - The user's email address
 * @returns {Promise<void>} Promise that resolves when the profile is created/updated
 */
export async function createOrUpdateUserProfile(uid, username, email) {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(
      userRef,
      {
        username,
        email,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp() // Firestore überschreibt nicht wenn merge: true
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    throw error;
  }
}

/**
 * Deletes a user profile from Firestore and Firebase Authentication
 * First deletes the user from Authentication, then removes their profile from Firestore
 *
 * @param {string} uid - The unique user ID to delete
 * @returns {Promise<void>} Promise that resolves when the user is completely deleted
 * @throws {Error} If the user is not authenticated or deletion fails
 */
export async function deleteUserProfile(uid) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user is currently logged in.");
  }

  try {
    await user.delete();

    await deleteDoc(doc(db, "users", uid));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Logs out the current user
 * @returns {Promise<void>}
 */
export function logout() {
  return auth.signOut();
}

/**
 * Checks if a user is currently logged in
 * @param {Function} callback - Called with user object or null
 */
export function onAuthChange(callback) {
  
  return onAuthStateChanged(auth, callback);
}


export async function getUsername(uid){
  const myRef = doc(db,"users",uid);
  const snapshot = await getDoc(myRef);
  const username = snapshot.data().username;
  console.log("Fetched username:", username);
  return username;
}