import { getContactsGroupTemplate } from "../../templates/contactTemplates.js";

/**
 * Groups contacts by first letter.
 * @param {Array} contactsList
 * @returns {Object} Grouped contacts
 */
export function groupContacts(contactsList) {
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
export function renderContactsList(contacts) {
  const container = document.getElementById("contactsList");
  if (!container) return;

  const groupedContacts = groupContacts(contacts);
  let html = "";

  for (const letter in groupedContacts) {
    html += getContactsGroupTemplate(letter, groupedContacts[letter]);
  }
  container.innerHTML = html;
}
