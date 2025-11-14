import {
  addContactTemplate,
  getContactsGroupTemplate,
} from "../templates/contactTemplates.js";
import {
  initOutsideClickHandler,
  getRandomColor
} from "./utility.js";
import {editOrAddContact} from "./firebase.js";

const contacts = [
  {
    name: "Anton Mayer",
    email: "antonm@gmail.com",
    initials: "AM",
    color: "var(--orange-default)",
  },
  {
    name: "Anja Schulz",
    email: "schulz@hotmail.com",
    initials: "AS",
    color: "var(--purpleViolett-default)",
  },
  {
    name: "Benedikt Ziegler",
    email: "benedikt@gmail.com",
    initials: "BZ",
    color: "var(--skyBlue-default)",
  },
  {
    name: "David Eisenberg",
    email: "davidberg@gmail.com",
    initials: "DE",
    color: "var(--pink-default)",
  },
  {
    name: "Eva Fischer",
    email: "eva@gmail.com",
    initials: "EF",
    color: "var(--yellow-default)",
  },
  {
    name: "Emmanuel Mauer",
    email: "emmanuelma@gmail.com",
    initials: "EM",
    color: "var(--aquamarine-default)",
  },
];

// Groups an array of contacts alphabetically by the first letter of their name
function groupContacts(contacts) {
  const grouped = {};
  contacts.forEach((contact) => {
    const letter = contact.name.charAt(0).toUpperCase();
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
    getRandomColor()
  ).catch((error) => {
    console.error("Error saving contact:", error);
    alert("There was an error saving the contact. Please try again.");
    return;
  });

  
  renderContacts();
}