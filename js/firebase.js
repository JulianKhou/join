import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import {signInWithEmailAndPassword, GoogleAuthProvider,signInWithPopup } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
 

const firebaseConfig = {
  apiKey: "AIzaSyCgMFf3jcbG-pl3II5aRK9r4XxfF4ysc1c",
  authDomain: "join-44e84.firebaseapp.com",
  projectId: "join-44e84",
  storageBucket: "join-44e84.firebasestorage.app",
  messagingSenderId: "80172784787",
  appId: "1:80172784787:web:2922fbb80429f90e34c166",
  measurementId: "G-TC3XZWJL58"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
auth.languageCode = 'it';
provider.setCustomParameters({
  'login_hint': 'user@example.com'
});



export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}


export function createUser(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
   console.log(user.uid);
   console.log(user.email);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
}

export function signInWithEmailAndPW(auth, email, password){
 
 return signInWithEmailAndPassword(auth, email, password)
 .then((userCredential) => {
 // Signed in
 const user = userCredential.user;
 // ...
 })
 .catch((error) => {
 const errorCode = error.code;
 const errorMessage = error.message;
 });
}


export function signInWithGoogle() {
  return signInWithPopup(auth, provider)
    .then((result) => {
      return result.user;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
}