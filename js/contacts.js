import {
  addContactTemplate,
  getContactsGroupTemplate,
} from "../templates/contactTemplates.js";
import {
  initOutsideClickHandler,
  getRandomColor
} from "./utility.js";
import {editOrAddContact,getContacts} from "./firebase.js";


const contacts = await getContacts();

// Groups an array of contacts alphabetically by the first letter of their name
function groupContacts(contacts) {
  const grouped = {};
  contacts.forEach((contact) => {
    const letter = contact.name.charAt(0).toUpperCase();
    const initials = contact.name
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
    contact.initials = initials;
    if (!grouped[letter]) {
      grouped[letter] = [];
    }
    grouped[letter].push(contact);
  });
  return grouped;
}

// Rendering function that displays all contacts in the DOM
function renderContacts() {
  let container = document.getElementById("contactsList");
  let groupedContacts = groupContacts(contacts);
  let html = "";

  for (const letter in groupedContacts) {
    html += getContactsGroupTemplate(letter, groupedContacts[letter]);
  }
  container.innerHTML = html;
}

// Execute the renderContacts function immediately when this script file loads
renderContacts();

const addEditBtn = document.getElementById("addEditContactBtn");
var closeEditBtn = null;
var saveContactBtn = null;

// Prevent multiple overlays
addEditBtn.addEventListener("click", () => {
  console.log("Add/Edit Contact button clicked!");
  if (document.querySelector(".edit-contact-overlay")) {
    return;
  }

  var addContent = document.getElementById("addContact");
  addContent.insertAdjacentHTML("beforeend", addContactTemplate);

  addEventListenerToEditContactForm();
});

function addEventListenerToEditContactForm() {
  closeEditBtn = document.getElementById("closeEditContactBtn");
  closeEditBtn.addEventListener("click", () => {
    console.log("Close button clicked!");
    closeEditContactOverlay();
  });
 initOutsideClickHandler(
    document.querySelector(".edit-contact-container"),
    closeEditContactOverlay,
    [closeEditBtn]
  );

  saveContactBtn = document.getElementById("saveContactBtn");
  saveContactBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Save Contact button clicked!");
    addContact();
    closeEditContactOverlay();
  });
}

function closeEditContactOverlay() {
  var overlay = document.querySelector(".edit-contact-overlay");
  if (overlay) {
    overlay.remove();
  }
}



function getName(){
  return document.getElementById("AddContactNameInput").value;
}
function getEmail(){
  return document.getElementById("AddContactEmailInput").value;
}
function getPhoneNumber(){
  return document.getElementById("AddContactPhoneNumberInput").value;
}

function addContact(){
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

editOrAddContact(
    name.replace(/\s+/g, ''),
    name,
    email,
    phoneNumber,
    color
  ).catch((error) => {
    console.error("Error saving contact:", error);
    alert("There was an error saving the contact. Please try again.");
    return;
  });

  contacts.push({
    name,
    email,
    phoneNumber,
    initials,
    color,
  });
  renderContacts();
}