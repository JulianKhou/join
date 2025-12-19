import { getContacts, deleteContact } from "../firebase.js";
import { getInitials, getRandomColor } from "../utility.js";
import {
  getContactDetailsTemplate,
  editContactTemplate,
  addContactTemplate,
  getContactsGroupTemplate,
} from "../../templates/contactTemplates.js";
import { initOutsideClickHandler } from "../utility.js";
import { editOrAddContact } from "../firebase.js";

const contacts = await getContacts();
let currentShownContact = null;

/**
 * Main initializer for contacts page.
 */
function init() {
  renderContacts();
  setupGlobalEventListeners();
  setupAddContactButton();
}

/**
 * Groups contacts by first letter.
 * @param {Array} contactsList
 * @returns {Object} Grouped contacts
 */
function groupContacts(contactsList) {
  const grouped = {};
  contactsList.forEach((contact, idx) => {
    contact._index = idx;
    processContactInitials(contact);

    const letter = contact.name.charAt(0).toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(contact);
  });
  return grouped;
}

/**
 * Helper to compute and store initials.
 * @param {Object} contact
 */
function processContactInitials(contact) {
  const parts = contact.name.split(" ");
  let initials = parts[0].charAt(0).toUpperCase();
  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0).toUpperCase();
  }
  contact.initials = initials.substring(0, 2);
}

/**
 * Renders the contacts list.
 */
function renderContacts() {
  const container = document.getElementById("contactsList");
  if (!container) return;

  const groupedContacts = groupContacts(contacts);
  let html = "";

  for (const letter in groupedContacts) {
    html += getContactsGroupTemplate(letter, groupedContacts[letter]);
  }
  container.innerHTML = html;
}

/**
 * Sets up global event listeners (like delegation for list).
 */
function setupGlobalEventListeners() {
  const list = document.getElementById("contactsList");
  if (list) list.addEventListener("click", handleContactListClick);
}

/**
 * Handles clicks on the contact list (Event Delegation).
 * @param {Event} e
 */
function handleContactListClick(e) {
  const item = e.target.closest(".contact-item");
  if (!item) return;

  const id = Number(item.dataset.contactId);
  const contact = contacts.find((c) => c._index === id) || contacts[id];

  if (contact) {
    contactShowDetails(contact, contact._index);
  }
}

/**
 * Sets up the Add Contact button.
 */
function setupAddContactButton() {
  const btn = document.getElementById("addContactBtn");
  if (btn) btn.addEventListener("click", openAddContactOverlay);
}

/**
 * Opens the Add Contact overlay.
 */
function openAddContactOverlay() {
  if (document.querySelector(".add-contact-overlay")) return;

  const container = document.getElementById("addContact");
  container.insertAdjacentHTML("beforeend", addContactTemplate);

  setupAddOverlayListeners();
}

/**
 * Sets up listeners for the Add Contact overlay.
 */
function setupAddOverlayListeners() {
  const closeBtn = document.getElementById("closeAddContactBtn");
  const saveBtn = document.getElementById("saveContactBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeAddContactOverlay);
  }

  initOutsideClickHandler(
    document.querySelector(".add-contact-container"),
    closeAddContactOverlay,
    [closeBtn]
  );

  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveNewContact);
  }
}

/**
 * Handles saving a new contact.
 * @param {Event} e
 */
async function handleSaveNewContact(e) {
  e.preventDefault();
  await addNewContact();
  closeAddContactOverlay();
}

/**
 * Closes the Add Contact overlay.
 */
function closeAddContactOverlay() {
  const overlay = document.querySelector(".add-contact-overlay");
  if (overlay) overlay.remove();
}

/**
 * Reads input values and creates a new contact.
 */
async function addNewContact() {
  const data = getContactFormData("Add");
  if (!validateContactData(data)) return;

  const id = crypto.randomUUID();
  const color = getRandomColor();

  try {
    const returnedId = await editOrAddContact(
      id,
      data.name,
      data.email,
      data.phone,
      color
    );
    addLocalContact(returnedId || id, data, color);
    renderContacts();
  } catch (error) {
    console.error("Error saving contact:", error);
    alert("Error saving contact.");
  }
}

/**
 * Retrieves form data from inputs.
 * @param {string} prefix - 'Add' or 'Edit'
 * @returns {Object} {name, email, phone}
 */
function getContactFormData(prefix) {
  return {
    name: getInputValue(prefix + "ContactNameInput"),
    email: getInputValue(prefix + "ContactEmailInput"),
    phone: getInputValue(prefix + "ContactPhoneNumberInput"),
  };
}

/**
 * Helper to get input value safely.
 * @param {string} id
 */
function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

/**
 * Validates contact data.
 * @param {Object} data
 * @returns {boolean}
 */
function validateContactData(data) {
  if (!data.name || !data.email) {
    alert("Please provide at least a name and an email.");
    return false;
  }
  return true;
}

/**
 * Adds a new contact to the local state.
 * @param {string} id
 * @param {Object} data
 * @param {string} color
 */
function addLocalContact(id, data, color) {
  const newContact = {
    id: id,
    name: data.name,
    email: data.email,
    phoneNumber: data.phone,
    initials: "", // Calculated in groupContacts or verify
    color: color,
  };
  contacts.push(newContact);
  // Index will be fixed on re-render/grouping or manually here
  contacts[contacts.length - 1]._index = contacts.length - 1;
}

/**
 * Display contact details.
 * @param {Object} contact
 * @param {number} index
 */
function contactShowDetails(contact, index) {
  updateActiveContactHighlight(index);

  const overlay = document.getElementById("contactDetailsOverlay");
  currentShownContact = contact;
  overlay.innerHTML = getContactDetailsTemplate(contact, contact.color);

  setupContactDetailListeners(contact);
}

/**
 * Updates the active styling on the contact list.
 * @param {number} newIndex
 */
function updateActiveContactHighlight(newIndex) {
  if (currentShownContact != null) {
    const prevBtn = document.querySelector(
      `[data-contact-id="${currentShownContact._index}"]`
    );
    if (prevBtn) prevBtn.classList.remove("active-contact");
  }
  const newBtn = document.querySelector(`[data-contact-id="${newIndex}"]`);
  if (newBtn) newBtn.classList.add("active-contact");
}

/**
 * Sets up listeners for the Detail View (Edit/Delete).
 * @param {Object} contact
 */
function setupContactDetailListeners(contact) {
  const deleteBtn = document.getElementById("deleteContactDetailsBtn");
  const editBtn = document.getElementById("editContactBtn");

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => handleDeleteContact(contact.id));
  }
  if (editBtn) {
    editBtn.addEventListener("click", () => openEditContactOverlay(contact));
  }
}

/**
 * Handles contact deletion.
 * @param {string} id
 */
async function handleDeleteContact(id) {
  try {
    await deleteContact(id);
    removeLocalContact(id);
    renderContacts();
    clearContactDetails();
  } catch (error) {
    console.error("Error deleting contact:", error);
    alert("Error deleting contact.");
  }
}

/**
 * Removes contact from local array.
 * @param {string} id
 */
function removeLocalContact(id) {
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx !== -1) contacts.splice(idx, 1);
}

/**
 * Clears the detail view.
 */
function clearContactDetails() {
  const overlay = document.getElementById("contactDetailsOverlay");
  if (overlay) overlay.innerHTML = "";
  currentShownContact = null;
}

/**
 * Opens the Edit Contact overlay.
 * @param {Object} contact
 */
function openEditContactOverlay(contact) {
  const container = document.getElementById("addContact");
  // Use template generator
  const template = editContactTemplate(
    contact.name,
    contact.email,
    contact.phoneNumber,
    contact.id,
    contact.color,
    contact.initials
  );
  container.insertAdjacentHTML("beforeend", template);

  prefillEditInputs(contact);
  setupEditOverlayListeners(contact);
}

/**
 * Prefills inputs for editing.
 * @param {Object} contact
 */
function prefillEditInputs(contact) {
  // Attempt to find inputs by specific IDs if template uses them,
  // fallback to 'Add' IDs if reused (as per original code logic)
  setInputIfFound("EditContactNameInput", contact.name) ||
    setInputIfFound("AddContactNameInput", contact.name);
  setInputIfFound("EditContactEmailInput", contact.email) ||
    setInputIfFound("AddContactEmailInput", contact.email);
  setInputIfFound("EditContactPhoneNumberInput", contact.phoneNumber) ||
    setInputIfFound("AddContactPhoneNumberInput", contact.phoneNumber);
}

function setInputIfFound(id, val) {
  const el = document.getElementById(id);
  if (el) {
    el.value = val || "";
    return true;
  }
  return false;
}

/**
 * Sets up listeners for Edit Overlay.
 * @param {Object} contact
 */
function setupEditOverlayListeners(contact) {
  const closeBtn = document.getElementById("closeEditContactBtn");
  const saveBtn = document.getElementById("saveEditContactBtn");
  const delBtn = document.getElementById("deleteEditContactBtn");

  if (closeBtn) closeBtn.addEventListener("click", closeEditContactOverlay);

  initOutsideClickHandler(
    document.querySelector(".edit-contact-container"),
    closeEditContactOverlay,
    [closeBtn]
  );

  if (saveBtn)
    saveBtn.addEventListener("click", (e) =>
      handleSaveEditedContact(e, contact)
    );
  if (delBtn)
    delBtn.addEventListener("click", (e) =>
      handleDeleteFromEdit(e, contact.id)
    );
}

/**
 * Handles saving edited contact.
 * @param {Event} e
 * @param {Object} contact
 */
async function handleSaveEditedContact(e, contact) {
  e.preventDefault();
  const data = getContactFormData("Edit");
  // Fallback to existing logic where IDs might be mixed
  if (!data.name) Object.assign(data, getContactFormData("Add")); // Try Add prefix if Edit failed

  try {
    await editOrAddContact(
      contact.id,
      data.name,
      data.email,
      data.phone,
      contact.color
    );
    updateLocalContact(contact.id, data);
    renderContacts();
    refreshDetailView(contact.id);
    closeEditContactOverlay();
  } catch (error) {
    console.error("Error saving:", error);
  }
}

/**
 * Updates local contact data.
 * @param {string} id
 * @param {Object} data
 */
function updateLocalContact(id, data) {
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx !== -1) {
    contacts[idx].name = data.name;
    contacts[idx].email = data.email;
    contacts[idx].phoneNumber = data.phone;
  }
}

/**
 * Refreshes the detail view if it's currently open.
 * @param {string} id
 */
function refreshDetailView(id) {
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx !== -1) contactShowDetails(contacts[idx], contacts[idx]._index);
}

/**
 * Handles delete from edit overlay.
 * @param {Event} e
 * @param {string} id
 */
async function handleDeleteFromEdit(e, id) {
  e.preventDefault();
  await handleDeleteContact(id);
  closeEditContactOverlay();
}

/**
 * Closes Edit Overlay.
 */
function closeEditContactOverlay() {
  const overlay = document.querySelector(".edit-contact-overlay");
  if (overlay) overlay.remove();
}

export function getContactsArray() {
  return contacts;
}

// Start
init();
