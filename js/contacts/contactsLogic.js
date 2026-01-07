import {
  addContactTemplate,
  getContactsGroupTemplate,
  getContactDetailsTemplate,
} from "../../templates/contactTemplates.js";
import { initOutsideClickHandler } from "../utility.js";
import {
  getContacts as fetchContacts,
  getContact,
  deleteContact as removeContact,
  auth,
} from "../firebase.js";
import { addContactAction, editContactAction } from "./contactsActions.js";

// State
let contacts = [];
let currentShownContact = null;

// Initialize contacts
export async function loadContacts() {
  contacts = await fetchContacts();
  return contacts;
}

export function getContactsArray() {
  return contacts;
}

/* Groups contacts by first letter, computes initials and stores a stable _index */
function groupContacts(contactsList) {
  const grouped = {};
  contactsList.forEach((contact, idx) => {
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

/* Render all contacts using templates. */
export function renderContacts() {
  const container = document.getElementById("contactsList");
  if (!container) return;

  const groupedContacts = groupContacts(contacts);
  let html = "";

  for (const letter in groupedContacts) {
    html += getContactsGroupTemplate(letter, groupedContacts[letter]);
  }
  container.innerHTML = html;
}

/* Event delegation for contact items */
export function contactListClickHandler(e) {
  const item = e.target.closest(".contact-item");
  if (!item) return;
  const id = Number(item.dataset.contactId);
  const contact = contacts.find((c) => c._index === id) || contacts[id];
  if (contact) {
    contactShowDetails(contact, contact._index);
  }
}

/* Open add-contact overlay */
export function openAddContactOverlay() {
  if (document.querySelector(".add-contact-overlay")) return;

  const addContent = document.getElementById("addContact");
  addContent.insertAdjacentHTML("beforeend", addContactTemplate);

  addEventListenerToAddContactForm();
}

/* Add listeners for add-contact overlay */
function addEventListenerToAddContactForm() {
  const closeAddBtn = document.getElementById("closeAddContactBtn");
  if (closeAddBtn) {
    closeAddBtn.addEventListener("click", closeAddContactOverlay);
  }

  initOutsideClickHandler(
    document.querySelector(".add-contact-container"),
    closeAddContactOverlay,
    [closeAddBtn]
  );

  const saveContactBtn = document.getElementById("saveContactBtn");
  if (saveContactBtn) {
    saveContactBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      // Call action and pass render callback
      const success = await addContactAction(contacts, renderContacts);
      if (success) closeAddContactOverlay();
    });
  }
}

function closeAddContactOverlay() {
  const overlay = document.querySelector(".add-contact-overlay");
  if (overlay) overlay.remove();
}

/* Show contact details */
function contactShowDetails(contact, index) {
  // Update active state
  if (currentShownContact != null) {
    const prevBtn = document.querySelector(
      `[data-contact-id="${currentShownContact._index}"]`
    );
    if (prevBtn) prevBtn.classList.remove("active-contact");
  }

  const contactButton = document.querySelector(`[data-contact-id="${index}"]`);
  if (contactButton) contactButton.classList.add("active-contact");

  const contactDetailsOverlay = document.getElementById(
    "contactDetailsOverlay"
  );
  currentShownContact = contact;
  contactDetailsOverlay.innerHTML = getContactDetailsTemplate(
    contact,
    contact.color
  );
  contactDetailsAddEventListeners();
}

function contactDetailsAddEventListeners() {
  const deleteDetailsBtn = document.getElementById("deleteContactDetailsBtn");
  const editDetailsBtn = document.getElementById("editContactBtn");
  const contact = currentShownContact;

  if (deleteDetailsBtn) {
    deleteDetailsBtn.addEventListener("click", async () => {
      try {
        await removeContact(contact.id);
        const idx = contacts.findIndex((c) => c.id === contact.id);
        if (idx !== -1) contacts.splice(idx, 1);
        renderContacts();
        const contactDetailsOverlay = document.getElementById(
          "contactDetailsOverlay"
        );
        if (contactDetailsOverlay) contactDetailsOverlay.innerHTML = "";
        currentShownContact = null;
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("Error deleting contact.");
      }
    });
  }

  if (editDetailsBtn) {
    editDetailsBtn.addEventListener("click", () => {
      // Use action with callbacks
      editContactAction(
        currentShownContact,
        (idOrObj, newData) => {
          // Update state callback
          if (newData === true) {
            // delete case
            const idx = contacts.findIndex((c) => c.id === idOrObj);
            if (idx !== -1) contacts.splice(idx, 1);
            renderContacts();
          } else if (newData && typeof newData === "object") {
            const idx = contacts.findIndex((c) => c.id === idOrObj);
            if (idx !== -1) {
              Object.assign(contacts[idx], newData);
              // re-compute initials
              contacts[idx].initials = newData.name
                .split(" ")
                .map((n) => n.charAt(0).toUpperCase())
                .join("")
                .substring(0, 2);
            }
            renderContacts();
          }
        },
        (id) => {
          // Refresh detail callback
          const idx = contacts.findIndex((c) => c.id === id);
          if (idx !== -1)
            contactShowDetails(contacts[idx], contacts[idx]._index);
        }
      );
    });
  }
}

export async function handleEditProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("No user logged in.");
    return;
  }
  try {
    const contact = await getContact(user.uid);
    editContactAction(
      contact,
      () => {},
      () => {}
    );
  } catch (error) {
    console.error("Could not fetch user contact:", error);
    alert("Could not load your profile.");
  }
}
