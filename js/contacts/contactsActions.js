import { initOutsideClickHandler, getRandomColor } from "../utility.js";
import { editOrAddContact, deleteContact } from "../firebase.js";
import {
  editContactTemplate,
  addContactTemplate,
} from "../../templates/contactTemplates.js";

// Helper to access DOM elements for logic
function getName() {
  const el = document.getElementById("AddContactNameInput");
  return el ? el.value : "";
}
function getEmail() {
  const el = document.getElementById("AddContactEmailInput");
  return el ? el.value : "";
}
function getPhoneNumber() {
  const el = document.getElementById("AddContactPhoneNumberInput");
  return el ? el.value : "";
}

// We need a callback to update state/render
export async function addContactAction(contacts, renderCallback) {
  const id = crypto.randomUUID();
  const name = getName();
  const email = getEmail();
  const phoneNumber = getPhoneNumber();
  const color = getRandomColor();

  if (!name || !email) {
    alert("Please provide at least a name and an email.");
    return;
  }

  const initials = name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);

  try {
    const returnedId = await editOrAddContact(
      id,
      name,
      email,
      phoneNumber,
      color
    );
    const docId = returnedId || id;

    contacts.push({
      id: docId,
      name,
      email,
      phoneNumber,
      initials,
      color,
    });
    contacts[contacts.length - 1]._index = contacts.length - 1;

    renderCallback();
    return true; // success
  } catch (error) {
    console.error("Error saving contact:", error);
    alert("There was an error saving the contact.");
    return false;
  }
}

export function editContactAction(
  contact,
  renderCallback,
  refreshDetailCallback
) {
  const contactTemplate = editContactTemplate(
    contact.name,
    contact.email,
    contact.phoneNumber,
    contact.id,
    contact.color,
    contact.initials
  );
  const addContent = document.getElementById("addContact");
  addContent.insertAdjacentHTML("beforeend", contactTemplate);

  // Set values
  const nameInput =
    document.getElementById("EditContactNameInput") ||
    document.getElementById("AddContactNameInput");
  const emailInput =
    document.getElementById("EditContactEmailInput") ||
    document.getElementById("AddContactEmailInput");
  const phoneInput =
    document.getElementById("EditContactPhoneNumberInput") ||
    document.getElementById("AddContactPhoneNumberInput");

  if (nameInput) nameInput.value = contact.name || "";
  if (emailInput) emailInput.value = contact.email || "";
  if (phoneInput) phoneInput.value = contact.phoneNumber || "";

  setupEditFormListeners(contact, renderCallback, refreshDetailCallback);
}

function setupEditFormListeners(
  contact,
  renderCallback,
  refreshDetailCallback
) {
  const closeEditBtn = document.getElementById("closeEditContactBtn");
  if (closeEditBtn) {
    closeEditBtn.addEventListener("click", closeEditContactOverlay);
  }

  initOutsideClickHandler(
    document.querySelector(".edit-contact-container"),
    closeEditContactOverlay,
    [closeEditBtn]
  );

  const saveEditContactBtn = document.getElementById("saveEditContactBtn");
  if (saveEditContactBtn) {
    saveEditContactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      saveEditedContact(contact, renderCallback, refreshDetailCallback);
      closeEditContactOverlay();
    });
  }

  const deleteContactBtn = document.getElementById("deleteEditContactBtn");
  if (deleteContactBtn) {
    deleteContactBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await performDelete(contact.id, renderCallback);
      closeEditContactOverlay();
    });
  }
}

async function performDelete(id, renderCallback) {
  try {
    await deleteContact(id);
    // callback must handle splicing contacts array
    renderCallback(id, true); // true for delete
  } catch (error) {
    console.error("Error deleting contact:", error);
    alert("Error deleting contact.");
  }
}

async function saveEditedContact(
  contact,
  renderCallback,
  refreshDetailCallback
) {
  const nameEl =
    document.getElementById("EditContactNameInput") ||
    document.getElementById("AddContactNameInput");
  const emailEl =
    document.getElementById("EditContactEmailInput") ||
    document.getElementById("AddContactEmailInput");
  const phoneEl =
    document.getElementById("EditContactPhoneNumberInput") ||
    document.getElementById("AddContactPhoneNumberInput");

  const name = nameEl ? nameEl.value : contact.name;
  const email = emailEl ? emailEl.value : contact.email;
  const phoneNumber = phoneEl ? phoneEl.value : contact.phoneNumber;

  try {
    await editOrAddContact(contact.id, name, email, phoneNumber, contact.color);
    // Update object via callback or mutation?
    // Let's assume callback handles state update
    renderCallback(contact.id, { name, email, phoneNumber });

    if (refreshDetailCallback) refreshDetailCallback(contact.id);
  } catch (error) {
    console.error("Error saving contact:", error);
    alert("Error saving contact.");
  }
}

function closeEditContactOverlay() {
  const overlay = document.querySelector(".edit-contact-overlay");
  if (overlay) overlay.remove();
}
