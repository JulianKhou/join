import { addAssignedToBarTask } from "../../../templates/addTaskTemplates.js";
import { getInitials, returnContactById } from "../../utility.js";
import { iconTemplate } from "../../../templates/profileTemplates.js";

let _GlobalContactsList = [];

/**
 * Sets the global contact list for this module.
 * @param {Array} list - List of contact objects.
 */
export function setContactsList(list) {
  _GlobalContactsList = list;
}

/**
 * Populates the assign-to checkbox list with contacts.
 * @param {Array} contacts - List of contacts.
 * @param {string} filterString - Search term to filter contacts.
 */
export function addContactsToAssignTask(contacts, filterString = "") {
  const list = document.getElementById("chooseContactsCheckboxList");
  if (!list) return;

  list.innerHTML = "";

  const filtered = getFilteredAndSortedContacts(contacts, filterString);

  if (filtered.length === 0) {
    list.innerHTML = '<div class="no-results">No contacts found</div>';
    return;
  }

  filtered.forEach((contact) => renderContactOption(list, contact));
}

/**
 * Filters and sorts contacts (Current User first, then alphabetical).
 * @param {Array} contacts
 * @param {string} filter
 * @returns {Array} Sorted contacts
 */
function getFilteredAndSortedContacts(contacts, filter) {
  const term = filter.trim().toLowerCase();
  const filtered = term
    ? contacts.filter((c) => c.name.toLowerCase().includes(term))
    : contacts;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  return filtered.sort((a, b) => {
    if (currentUser && a.id === currentUser.uid) return -1;
    if (currentUser && b.id === currentUser.uid) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Renders a single contact option into the list.
 * @param {HTMLElement} listContainer
 * @param {Object} contact
 */
function renderContactOption(listContainer, contact) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isMe = currentUser && contact.id === currentUser.uid;
  const name = isMe ? `${contact.name} (You)` : contact.name;

  const icon = iconTemplate(
    getInitials(contact.name),
    contact.color,
    "assignedToCheckboxIcon"
  );

  const option = addAssignedToBarTask(name, contact.id, icon);

  // Safely insert depending on template return type
  if (typeof option === "string") {
    listContainer.insertAdjacentHTML("beforeend", option);
  } else if (option instanceof Node) {
    listContainer.appendChild(option);
  }
}

/**
 * Initializes listeners for contact checkboxes.
 */
export function checkCheckboxChanges() {
  const list = document.getElementById("chooseContactsCheckboxList");
  if (!list) return;

  const checkboxes = list.querySelectorAll(".assignedToCheckbox");
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => handleCheckboxChange(checkboxes));
  });
}

/**
 * Handles changes in contact checkboxes.
 * @param {NodeList} checkboxes
 */
function handleCheckboxChange(checkboxes) {
  const selected = [...checkboxes]
    .filter((cb) => cb.checked)
    .map((cb) => returnContactById(cb.value, _GlobalContactsList)?.name || "");

  updateSelectBoxText(selected);
  updateAssignedIcons(checkboxes);
}

/**
 * Updates the text display of the select box.
 * @param {Array<string>} selectedNames
 */
function updateSelectBoxText(selectedNames) {
  const box = document.getElementById("selectedBox");
  if (box) {
    box.innerText = selectedNames.length
      ? selectedNames.join(", ")
      : "Bitte auswählen";
  }
}

/**
 * Updates the icon container based on selected contacts.
 * @param {NodeList} checkboxes
 */
function updateAssignedIcons(checkboxes) {
  const container = document.getElementById("assignedIcons");
  if (!container) return;
  container.innerHTML = "";

  [...checkboxes]
    .filter((cb) => cb.checked)
    .forEach((cb) => renderAssignedIcon(container, cb.value));
}

/**
 * Renders a single assigned icon.
 * @param {HTMLElement} container
 * @param {string} contactId
 */
function renderAssignedIcon(container, contactId) {
  const contact = returnContactById(contactId, _GlobalContactsList);
  if (!contact) return;

  const icon = iconTemplate(
    getInitials(contact.name),
    contact.color,
    "assignedToContainerChecked"
  );

  // Safely insert
  if (typeof icon === "string") {
    container.insertAdjacentHTML("beforeend", icon);
  } else if (icon instanceof Node) {
    container.appendChild(icon);
  }
}

/**
 * Retrieves IDs of selected contacts.
 * @returns {Array<string>} List of selected user IDs.
 */
export function getSelectedAssignedTo() {
  const list = document.getElementById("chooseContactsCheckboxList");
  if (!list) return [];

  return [...list.querySelectorAll(".assignedToCheckbox")]
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
}

/**
 * Clears all contact selections.
 */
export function clearAssignedToSelection() {
  const list = document.getElementById("chooseContactsCheckboxList");
  if (list) {
    list
      .querySelectorAll(".assignedToCheckbox")
      .forEach((cb) => (cb.checked = false));
  }
}

/**
 * Resets the select box text to default.
 */
export function resetAssignToSelectBox() {
  const box = document.getElementById("selectedBox");
  if (box) box.innerText = "Bitte auswählen";
}
