import { getContactDetailsTemplate } from "../../templates/contactTemplates.js";
import { renderContactsList } from "./contactsRender.js";
import { initContacts, getContactsArray } from "./contactsState.js";
import {
  openAddContactOverlay,
  setCurrentContact,
  setupContactDetailListenersFromForms,
  openEditContactOverlay,
  handleDeleteContact,
} from "./contactsForms.js";

// Initialize data
await initContacts();
let currentShownContact = null;

export { getContactsArray }; // Re-export for compatibility

/**
 * Renders the contacts list.
 */
export function renderContacts() {
  renderContactsList(getContactsArray());
}

/**
 * Handles clicks on the contact list (Event Delegation).
 * @param {Event} e
 */
export function handleContactListClick(e) {
  const item = e.target.closest(".contact-item");
  if (!item) return;

  const contacts = getContactsArray();
  const id = Number(item.dataset.contactId);
  const contact = contacts.find((c) => c._index === id) || contacts[id];

  if (contact) {
    contactShowDetails(contact, contact._index);
  }
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
  setCurrentContact(contact); // keep state in sync

  overlay.innerHTML = getContactDetailsTemplate(contact, contact.color);

  setupContactDetailListenersFromForms(contact);

  /* Mobile View Class Toggle */
  if (window.innerWidth <= 1050) {
    document.body.classList.add("mobile-details-active");
  }
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

// Re-export this so facade can use it
export { openAddContactOverlay };
