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
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
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
      const uid = userCredential.user.uid;
      
      // Create user profile first
      return createOrUpdateUserProfile(uid, username, email)
        .then(() => {
          // Then create contact with user's data
          return editOrAddContact(
            uid,           // use uid as contact ID so it's linked
            username,
            email,
            "",            // no phone number initially
            generateRandomColor() // or pass a default color
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

/**
 * Login with email and password
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise} User object on successful login
 */
export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("✅ Login successful, user:", userCredential.user); // ← Debug
      return userCredential.user; // ← wichtig!
    })
    .catch((error) => {
      console.error("❌ Login failed:", error); // ← Debug
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
      
      // Create/update user profile
      return createOrUpdateUserProfile(user.uid, user.displayName, user.email)
        .then(() => {
          // Also create/update contact
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
    const userSnap = await getDoc(userRef);
    
    // Only create if doesn't exist (avoid overwriting existing data)
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        username,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        color: generateRandomColor(),
      });
    } else {
      // Just update timestamp if already exists
      await setDoc(userRef, {
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    throw error;
  }
}

// Helper function to generate a random color
function generateRandomColor() {
  const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF",
    "#33FFF5", "#F5FF33", "#FF8C33", "#8C33FF", "#33FF8C"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
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

export async function getUsername(uid) {
  const myRef = doc(db, "users", uid);
  const snapshot = await getDoc(myRef);
  const username = snapshot.data().username;
  return username;
}

export async function editOrAddContact(
  docIdOrName,
  name,
  email,
  phoneNumber,
  color
) {
  try {
    // Wenn ein docId übergeben wurde, verwenden; sonst Fallback auf name ohne Whitespace
    const docId = docIdOrName ?? name.replace(/\s+/g, "");
    const userRef = doc(db, "contacts", docId);
    await setDoc(
      userRef,
      {
        name,
        email,
        phoneNumber,
        color,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    return docId;
  } catch (error) {
    console.error("Error creating/updating contact profile:", error);
    throw error;
  }
}

export async function deleteContact(uuid) {
  try {
    await deleteDoc(doc(db, "contacts", uuid));
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

export async function getContacts() {
  try {
    const contactsRef = collection(db, "contacts");
    const snapshot = await getDocs(contactsRef);

    const contacts = [];
    snapshot.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() });
    });

    return contacts;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
}
export async function createTask(task) {
const user = auth.currentUser;
  const taskRef = doc(collection(db, "tasks"));
  const createData = {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    subtasks: task.subtasks,
    assignedTo: task.assignedTo,
    category: task.category,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    progress: "toDo",
  };
  await setDoc(taskRef, createData);
  return taskRef.id;
}

export async function updateTask(taskId, updateData) {
  const taskRef = doc(db, "tasks", taskId);
  await setDoc(taskRef, updateData, { merge: true });
  return taskRef.id;
}




export async function addEditTask(task) {
createTask(task).then((taskId) => {
    console.log("Task added with ID:", taskId);
  });
  //später mal updateTask aufrufen, wenn taskId existiert
}


export function deleteTask(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  return deleteDoc(taskRef);
}

function checkIfTaskExists(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  return getDoc(taskRef).then((docSnap) => docSnap.exists());
}

export function changeTaskProgress(taskId, newProgress) {
  if (!["toDo", "inProgress", "awaitFeedback" ,"done"].includes(newProgress)) {
    throw new Error("Invalid progress status");
  }
  const taskRef = doc(db, "tasks", taskId);
  return setDoc(
    taskRef,
    { progress: newProgress, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getTask(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    return { id: taskSnap.id, ...taskSnap.data() };
  } else {
    throw new Error("Task not found");
  }
}
export async function getAllTasks() {
  const tasksRef = collection(db, "tasks");
  const snapshot = await getDocs(tasksRef);
  const tasks = [];
  snapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  return tasks;
}
export async function getTaskIds() {
  const tasksRef = collection(db, "tasks");
  const snapshot = await getDocs(tasksRef);
  const taskIds = [];
  snapshot.forEach((doc) => {
    taskIds.push(doc.id);
  }
  );
  return taskIds;
}

export async function getSubtasksCompletionState(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    const subtasks = taskSnap.data().subtasks || [];
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    console.log("Subtasks for task", taskId, ":", totalSubtasks, "total,", completedSubtasks, "completed");
    return { totalSubtasks, completedSubtasks };
  } else {
    throw new Error("Task not found");
  }
}

export async function getContact(uid) {
  const contactRef = doc(db, "contacts", uid);
  const contactSnap = await getDoc(contactRef); 
  if (contactSnap.exists()) { 
    return { id: contactSnap.id, ...contactSnap.data() };
  } else {
    throw new Error("Contact not found");
  }
}

export async function changeSubtaskCompletion(taskId, subtaskIndex, completed) {
  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    const taskData = taskSnap.data();
    const subtasks = taskData.subtasks || [];
    
    if (subtaskIndex >= 0 && subtaskIndex < subtasks.length) {
      subtasks[subtaskIndex].completed = completed;
      await setDoc(taskRef, { subtasks, updatedAt: serverTimestamp() }, { merge: true });
    } else {
      throw new Error("Invalid subtask index");
    }
  } else {
    throw new Error("Task not found");
  }
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