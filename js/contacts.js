import {
  loadContacts,
  renderContacts,
  contactListClickHandler,
  openAddContactOverlay,
  getContactsArray,
  handleEditProfile,
} from "./contacts/contactsLogic.js";

// Initialize
await loadContacts();
renderContacts();

// Event Listeners
const contactsList = document.getElementById("contactsList");
if (contactsList) {
  contactsList.addEventListener("click", contactListClickHandler);
}

const addContactBtn = document.getElementById("addContactBtn");
if (addContactBtn) {
  addContactBtn.addEventListener("click", openAddContactOverlay);
}

const addContactMobileBtn = document.getElementById("addContactMobileBtn");
if (addContactMobileBtn) {
  addContactMobileBtn.addEventListener("click", openAddContactOverlay);
}

const editProfileBtn = document.getElementById("editProfileBtn");
if (editProfileBtn) {
  editProfileBtn.addEventListener("click", handleEditProfile);
}

// Export for other modules if needed
export { getContactsArray };
