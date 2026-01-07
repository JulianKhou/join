import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { db } from "./init.js";

export async function editOrAddContact(
  docIdOrName,
  name,
  email,
  phoneNumber,
  color
) {
  try {
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

export async function getContact(uid) {
  const contactRef = doc(db, "contacts", uid);
  const contactSnap = await getDoc(contactRef);
  if (contactSnap.exists()) {
    return { id: contactSnap.id, ...contactSnap.data() };
  } else {
    throw new Error("Contact not found");
  }
}
