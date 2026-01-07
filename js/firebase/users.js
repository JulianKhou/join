import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { auth, db } from "./init.js";
import { editOrAddContact, deleteContact } from "./contacts.js";

// Utility (could be in utility.js but used here)
function generateRandomColor() {
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33A1",
    "#A133FF",
    "#33FFF5",
    "#F5FF33",
    "#FF8C33",
    "#8C33FF",
    "#33FF8C",
    "#33FF8C",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const googleProvider = new GoogleAuthProvider();

export function createUser(email, password, username) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      // Create user profile first
      return createOrUpdateUserProfile(uid, username, email)
        .then(() => {
          // Then create contact with user's data
          return editOrAddContact(
            uid, // use uid as contact ID so it's linked
            username,
            email,
            "", // no phone number initially
            generateRandomColor()
          );
        })
        .then(() => userCredential.user);
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

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("✅ Login successful, user:", userCredential.user);
      return userCredential.user;
    })
    .catch((error) => {
      console.error("❌ Login failed:", error);
      let message = "Login failed, check email and password.";
      if (error.code === "auth/user-not-found") {
        message = "User not found.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address or password.";
      }
      throw new Error(message);
    });
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      return createOrUpdateUserProfile(user.uid, user.displayName, user.email)
        .then(() => {
          return editOrAddContact(
            user.uid,
            user.displayName,
            user.email,
            "",
            generateRandomColor()
          );
        })
        .then(() => user);
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

export async function createOrUpdateUserProfile(uid, username, email) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        username,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        color: generateRandomColor(),
      });
    } else {
      await setDoc(
        userRef,
        {
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    throw error;
  }
}

export async function updateUserProfile(uid, data) {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(
      userRef,
      {
        username: data.username,
        email: data.email,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const contactRef = doc(db, "contacts", uid);
    const contactSnap = await getDoc(contactRef);

    if (contactSnap.exists()) {
      await setDoc(
        contactRef,
        {
          name: data.username,
          email: data.email,
          phoneNumber: data.phone || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function deleteUserProfile(uid) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No user is currently logged in.");
  }

  try {
    await deleteDoc(doc(db, "users", uid));
    await deleteContact(uid); // using the helper from contacts.js
    await user.delete();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export function logout() {
  return auth.signOut();
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUsername(uid) {
  const myRef = doc(db, "users", uid);
  const snapshot = await getDoc(myRef);
  const username = snapshot.data().username;
  return username;
}

export async function getUserById(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  } else {
    throw new Error("User not found");
  }
}
