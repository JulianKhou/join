import {
  addContactTemplate,
  getContactsGroupTemplate,
  getContactDetailsTemplate,
  editContactTemplate,
} from "../templates/contactTemplates.js";
import { initOutsideClickHandler, getRandomColor } from "./utility.js";
import { editOrAddContact, getContacts, auth, getContact, deleteContact } from "./firebase.js";

const contacts = await getContacts();
let currentShownContact = null;

/* Groups contacts by first letter, computes initials and stores a stable _index
   _index corresponds to the position in the contacts array */
function groupContacts(contacts) {
  const grouped = {};
  contacts.forEach((contact, idx) => {
    contact._index = idx;

    const letter = contact.name.charAt(0).toUpperCase();
    const initials = contact.name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
    contact.initials = initials;

    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(contact);
  });
  return grouped;
}

/* Render all contacts using templates.
   We use event delegation instead of per-item listeners (see below). */
function renderContacts() {
  const container = document.getElementById("contactsList");
  const groupedContacts = groupContacts(contacts);
  let html = "";

  for (const letter in groupedContacts) {
    html += getContactsGroupTemplate(letter, groupedContacts[letter]);
  }
  container.innerHTML = html;
}

/* Initial render */
renderContacts();

/* Event delegation for contact items:
   Single click handler on the list container. Finds the clicked .contact-item,
   reads data-contact-id and shows details. This avoids adding/removing many listeners. */
const contactsList = document.getElementById("contactsList");
function contactListClickHandler(e) {
  const item = e.target.closest(".contact-item");
  if (!item) return;
  const id = Number(item.dataset.contactId);
  // find contact by stored _index (preferred) or fallback by id
  const contact = contacts.find((c) => c._index === id) || contacts[id];
  if (contact) {
    contactShowDetails(contact, contact._index);
  }
}
// attach once
if (contactsList) contactsList.addEventListener("click", contactListClickHandler);

const addContactBtn = document.getElementById("addContactBtn");
const addContactMobileBtn = document.getElementById("addContactMobileBtn");

let closeAddBtn = null;
let saveContactBtn = null;
/* Open add-contact overlay (prevents multiple overlays). */
function openAddContactOverlay() {
  if (document.querySelector(".add-contact-overlay")) return;

  const addContent = document.getElementById("addContact");
  addContent.insertAdjacentHTML("beforeend", addContactTemplate);

  addEventListenerToAddContactForm();
}

if (addContactBtn) {
  addContactBtn.addEventListener("click", openAddContactOverlay);
}

if (addContactMobileBtn) {
  addContactMobileBtn.addEventListener("click", openAddContactOverlay);
}

/* Add listeners for add-contact overlay: close button, outside click, save. */
function addEventListenerToAddContactForm() {
  closeAddBtn = document.getElementById("closeAddContactBtn");
  if (closeAddBtn) {
    closeAddBtn.addEventListener("click", () => {
    
      closeAddContactOverlay();
    });
  }

  // close when clicking outside the overlay container
  initOutsideClickHandler(
    document.querySelector(".add-contact-container"),
    closeAddContactOverlay,
    [closeAddBtn]
  );

  saveContactBtn = document.getElementById("saveContactBtn");
  if (saveContactBtn) {
    saveContactBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      
      await addContact(); // await so we have correct id before updating UI
      closeAddContactOverlay();
    });
  }
}

/* Remove add-contact overlay from DOM */
function closeAddContactOverlay() {
  const overlay = document.querySelector(".add-contact-overlay");
  if (overlay) overlay.remove();
}

/* Input helpers */
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

/* Create new contact: generate uuid, validate, save to Firestore, update local array and re-render.
   - generate uuid
   - save to Firestore (await)
   - add local copy with returned doc id
   - re-render */
async function addContact() {
  const id = crypto.randomUUID(); // UUID used as Firestore doc id

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
    // await Firestore write and use returned doc id
    const returnedId = await editOrAddContact(id, name, email, phoneNumber, color);
    const docId = returnedId || id;

    // keep local copy in memory, include stable doc id
    contacts.push({
      id: docId,
      name,
      email,
      phoneNumber,
      initials,
      color,
    });
    // ensure last pushed contact has a correct _index
    contacts[contacts.length - 1]._index = contacts.length - 1;
    renderContacts();
  } catch (error) {
    console.error("Error saving contact:", error);
    alert("There was an error saving the contact. Please try again.");
    return;
  }
}

/* Show contact details in right panel and mark active contact */
function contactShowDetails(contact, index) {
  let contactButton;
  if (currentShownContact != null) {
    contactButton = document.querySelector(
      `[data-contact-id="${currentShownContact._index}"]`
    );
    if (contactButton) contactButton.classList.remove("active-contact");
  }

  contactButton = document.querySelector(`[data-contact-id="${index}"]`);
  if (!contactButton) return;

  const contactDetailsOverlay = document.getElementById("contactDetailsOverlay");
  contactButton.classList.add("active-contact");
  currentShownContact = contact;
  contactDetailsOverlay.innerHTML = getContactDetailsTemplate(contact, contact.color);
  contactDetailsAddEventListeners();
}

/* Add listeners to buttons inside the contact details panel (delete, edit)
   - delete contact from Firestore and update UI
   - open edit overlay for the current contact */
function contactDetailsAddEventListeners() {
  var deleteDetailsBtn = document.getElementById("deleteContactDetailsBtn");
  var editDetailsBtn = document.getElementById("editContactBtn");
  var contact = currentShownContact;

  if (deleteDetailsBtn) {
    // delete contact from Firestore and update UI
    deleteDetailsBtn.addEventListener("click", async () => {
      try {
        await deleteContact(contact.id);
        // remove from local array by id
        const idx = contacts.findIndex((c) => c.id === contact.id);
        if (idx !== -1) contacts.splice(idx, 1);
        renderContacts();
        // clear details panel
        const contactDetailsOverlay = document.getElementById("contactDetailsOverlay");
        if (contactDetailsOverlay) contactDetailsOverlay.innerHTML = "";
        currentShownContact = null;
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("There was an error deleting the contact. Please try again.");
      }
    });
  }

  if (editDetailsBtn) {
    // open edit overlay for the current contact
    editDetailsBtn.addEventListener("click", () => {
      
      editContact(currentShownContact);
    });
  }
}

/* Build and insert edit-contact overlay, prefill values.
   Uses template and DOM to set input values (safer than string replace). */
function editContact(contact) {
  var name = contact.name;
  var email = contact.email;
  var phoneNumber = contact.phoneNumber;
  var uuid = contact.id;

  var contactTemplate = editContactTemplate(name, email, phoneNumber, uuid, contact.color, contact.initials);
  var addContent = document.getElementById("addContact");

  addContent.insertAdjacentHTML("beforeend", contactTemplate);

  // safer: set values directly on inputs (template may expose either Edit* or Add* ids)
  const nameInput = document.getElementById("EditContactNameInput") || document.getElementById("AddContactNameInput");
  const emailInput = document.getElementById("EditContactEmailInput") || document.getElementById("AddContactEmailInput");
  const phoneInput = document.getElementById("EditContactPhoneNumberInput") || document.getElementById("AddContactPhoneNumberInput");

  if (nameInput) nameInput.value = name || "";
  if (emailInput) emailInput.value = email || "";
  if (phoneInput) phoneInput.value = phoneNumber || "";

  addEventListenerToEditContactForm(contact);
}

/* Attach listeners for edit overlay: close, outside click, save, delete */
function addEventListenerToEditContactForm(contact) {
  const closeEditBtn = document.getElementById("closeEditContactBtn");
  if (closeEditBtn) {
    closeEditBtn.addEventListener("click", () => {
  
      closeEditContactOverlay();
    });
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
    
      saveEditedContact(contact);
      closeEditContactOverlay();
    });
  }

  const deleteContactBtn = document.getElementById("deleteEditContactBtn");
  if (deleteContactBtn) {
    deleteContactBtn.addEventListener("click", async (e) => {
      e.preventDefault();
     
      try {
        await deleteContact(contact.id);
        const idx = contacts.findIndex((c) => c.id === contact.id);
        if (idx !== -1) contacts.splice(idx, 1);
        renderContacts();
        closeEditContactOverlay();
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("There was an error deleting the contact. Please try again.");
        return;
      }
    });
  }
}

/* Save edited values: update Firestore and local array then re-render.
   Uses contact.id as the stable document id. */
async function saveEditedContact(contact) {
  const nameEl = document.getElementById("EditContactNameInput") || document.getElementById("AddContactNameInput");
  const emailEl = document.getElementById("EditContactEmailInput") || document.getElementById("AddContactEmailInput");
  const phoneEl = document.getElementById("EditContactPhoneNumberInput") || document.getElementById("AddContactPhoneNumberInput");

  const name = nameEl ? nameEl.value : contact.name;
  const email = emailEl ? emailEl.value : contact.email;
  const phoneNumber = phoneEl ? phoneEl.value : contact.phoneNumber;

  try {
    await editOrAddContact(contact.id, name, email, phoneNumber, contact.color);
    // update local copy by id
    const idx = contacts.findIndex((c) => c.id === contact.id);
    if (idx !== -1) {
      contacts[idx].name = name;
      contacts[idx].email = email;
      contacts[idx].phoneNumber = phoneNumber;
      // recompute initials when name changed
      contacts[idx].initials = name
        .split(" ")
        .map((n) => n.charAt(0).toUpperCase())
        .join("")
        .substring(0, 2);
    }

    renderContacts();
    // show updated details panel for the same contact
    const updatedIdx = contacts.findIndex((c) => c.id === contact.id);
    if (updatedIdx !== -1) contactShowDetails(contacts[updatedIdx], contacts[updatedIdx]._index);
  } catch (error) {
    console.error("Error saving contact:", error);
    alert("There was an error saving the contact. Please try again.");
    return;
  }
}

/* Remove edit-contact overlay from DOM */
function closeEditContactOverlay() {
  const overlay = document.querySelector(".edit-contact-overlay");
  if (overlay) overlay.remove();
}

export function getContactsArray() {
  return contacts;
}

const editProfileBtn = document.getElementById("editProfileBtn");

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("No user logged in.");
      return;
    }

    try {
      // Holt die Kontaktdaten des aktuell eingeloggten Users
      const contact = await getContact(user.uid);
      editContact(contact); // ruft die existierende editContact-Funktion auf
    } catch (error) {
      console.error("Could not fetch user contact:", error);
      alert("Could not load your profile.");
    }
  });
}


