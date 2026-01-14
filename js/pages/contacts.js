import {
  renderContacts,
  handleContactListClick,
  openAddContactOverlay,
  getContactsArray,
} from "./contactsUI.js";

/**
 * Main initializer for contacts page.
 */
function init() {
  renderContacts();
  setupGlobalEventListeners();
  setupAddContactButton();
}

/**
 * Sets up global event listeners (like delegation for list).
 */
function setupGlobalEventListeners() {
  const list = document.getElementById("contactsList");
  if (list) list.addEventListener("click", handleContactListClick);
}

/**
 * Sets up the Add Contact button.
 */
function setupAddContactButton() {
  const btn = document.getElementById("addContactBtn");
  if (btn) btn.addEventListener("click", openAddContactOverlay);

  const mobileBtn = document.getElementById("addContactMobileBtn");
  if (mobileBtn) mobileBtn.addEventListener("click", openAddContactOverlay);
}

// Start
init();

export { getContactsArray };
