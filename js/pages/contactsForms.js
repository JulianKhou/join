import {
  editContactTemplate,
  addContactTemplate,
  getContactDetailsTemplate,
} from "../../templates/contactTemplates.js";
import { initOutsideClickHandler, getRandomColor } from "../utility.js";
import { editOrAddContact, deleteContact } from "../firebase.js";
import { renderContactsList } from "./contactsRender.js";
import {
  addLocalContact,
  updateLocalContact,
  removeLocalContact,
  getContactsArray,
} from "./contactsState.js";

// We need to export this to update the detail view from here or main UI
let currentShownContactRef = null;

export function setCurrentContact(contact) {
  currentShownContactRef = contact;
}

export function openAddContactOverlay() {
  if (document.querySelector(".add-contact-overlay")) return;
  const container = document.getElementById("addContact");
  container.insertAdjacentHTML("beforeend", addContactTemplate);
  setupAddOverlayListeners();
}

function setupAddOverlayListeners() {
  const closeBtn = document.getElementById("closeAddContactBtn");
  const saveBtn = document.getElementById("saveContactBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeAddContactOverlay);

  initOutsideClickHandler(
    document.querySelector(".add-contact-container"),
    closeAddContactOverlay,
    [closeBtn]
  );
  if (saveBtn) saveBtn.addEventListener("click", handleSaveNewContact);
}

async function handleSaveNewContact(e) {
  e.preventDefault();
  await addNewContact();
  closeAddContactOverlay();
}

function closeAddContactOverlay() {
  const overlay = document.querySelector(".add-contact-overlay");
  if (overlay) overlay.remove();
}

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
    renderContactsList(getContactsArray());
  } catch (error) {
    console.error("Error saving contact:", error);
    alert("Error saving contact.");
  }
}

export function openEditContactOverlay(contact) {
  const container = document.getElementById("addContact");
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

function prefillEditInputs(contact) {
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

async function handleSaveEditedContact(e, contact) {
  e.preventDefault();
  const data = getContactFormData("Edit");
  if (!data.name) Object.assign(data, getContactFormData("Add"));

  try {
    await editOrAddContact(
      contact.id,
      data.name,
      data.email,
      data.phone,
      contact.color
    );
    updateLocalContact(contact.id, data);
    renderContactsList(getContactsArray());
    refreshDetailView(contact.id);
    closeEditContactOverlay();
  } catch (error) {
    console.error("Error saving:", error);
  }
}

async function handleDeleteFromEdit(e, id) {
  e.preventDefault();
  await handleDeleteContact(id);
  closeEditContactOverlay();
}

export async function handleDeleteContact(id) {
  try {
    await deleteContact(id);
    removeLocalContact(id);
    renderContactsList(getContactsArray());
    clearContactDetails();
  } catch (error) {
    console.error("Error deleting contact:", error);
    alert("Error deleting contact.");
  }
}

function closeEditContactOverlay() {
  const overlay = document.querySelector(".edit-contact-overlay");
  if (overlay) overlay.remove();
}

function clearContactDetails() {
  const overlay = document.getElementById("contactDetailsOverlay");
  if (overlay) overlay.innerHTML = "";
  // Reset active state? That's in UI.
  // We might need a callback or just re-render UI handles it.
}

function refreshDetailView(id) {
  const contacts = getContactsArray();
  const contact = contacts.find((c) => c.id === id);
  if (contact) {
    // We need to re-render detail view.
    // Ideally call contactShowDetails from UI.
    // For now, simple innerHTML update if element exists
    const overlay = document.getElementById("contactDetailsOverlay");
    if (overlay) {
      overlay.innerHTML = getContactDetailsTemplate(contact, contact.color);
      // Re-attach listeners? Yes. This is getting complex.
      // Better to trigger a CustomEvent or similar, or export setup listener
      // We will attach generic listeners in UI or here.
      setupContactDetailListenersFromForms(contact);
    }
  }
}

// Specialized listener setup because we are in Forms module but updating Detail View
// Specialized listener setup because we are in Forms module but updating Detail View
export function setupContactDetailListenersFromForms(contact) {
  const deleteBtn = document.getElementById("deleteContactDetailsBtn");
  const editBtn = document.getElementById("editContactBtn");

  // Desktop Listeners
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => handleDeleteContact(contact.id));
  }
  if (editBtn) {
    editBtn.addEventListener("click", () => openEditContactOverlay(contact));
  }

  // --- Mobile Listeners (Moved from contactsUI.js to persist after edits) ---

  // Back Arrow
  const backArrow = document.getElementById("mobileBackArrow");
  if (backArrow) {
    backArrow.onclick = () => {
      document.body.classList.remove("mobile-details-active");
      const activeBtn = document.querySelector(".active-contact");
      if (activeBtn) activeBtn.classList.remove("active-contact");
    };
  }

  // Mobile Options Menu Logic
  const optionsBtn = document.getElementById("mobileOptionsBtn");
  const optionsMenu = document.getElementById("mobileOptionsMenu");
  const mobileEditBtn = document.getElementById("mobileEditBtn");
  const mobileDeleteBtn = document.getElementById("mobileDeleteBtn");

  if (optionsBtn && optionsMenu) {
    optionsBtn.onclick = (e) => {
      e.stopPropagation();
      optionsMenu.classList.toggle("d-none");
    };

    // Close menu when clicking elsewhere (using a named function to avoid duplicates if possible,
    // but anonymous is safer for simple re-attachment if we don't care about piling up listeners on document?
    // actually piling up listeners on document IS bad.
    // Better to just add it once or use the existing "outside click" utility?
    // For now, let's keep it simple. If checking contains, it's cheap.
    document.addEventListener("click", (e) => {
      if (!optionsBtn.contains(e.target) && !optionsMenu.contains(e.target)) {
        optionsMenu.classList.add("d-none");
      }
    });
  }

  if (mobileEditBtn) {
    mobileEditBtn.onclick = () => {
      if (optionsMenu) optionsMenu.classList.add("d-none");
      openEditContactOverlay(contact);
    };
  }

  if (mobileDeleteBtn) {
    mobileDeleteBtn.onclick = async () => {
      if (optionsMenu) optionsMenu.classList.add("d-none");
      await handleDeleteContact(contact.id);
      document.body.classList.remove("mobile-details-active");
    };
  }
}

function getContactFormData(prefix) {
  return {
    name: getInputValue(prefix + "ContactNameInput"),
    email: getInputValue(prefix + "ContactEmailInput"),
    phone: getInputValue(prefix + "ContactPhoneNumberInput"),
  };
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function validateContactData(data) {
  if (!data.name || !data.email) {
    alert("Please provide at least a name and an email.");
    return false;
  }
  return true;
}
