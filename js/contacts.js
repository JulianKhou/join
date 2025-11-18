import {
  addContactTemplate,
  getContactsGroupTemplate,
  getContactDetailsTemplate,
  editContactTemplate,
} from "../templates/contactTemplates.js";
import { initOutsideClickHandler, getRandomColor } from "./utility.js";
import { editOrAddContact, getContacts,deleteContact } from "./firebase.js";

const contacts = await getContacts();
var currentShownContact = null;

// Groups an array of contacts alphabetically by the first letter of their name
// and computes initials and a stable _index for each contact.
function groupContacts(contacts) {
  const grouped = {};
  contacts.forEach((contact,idx) => {
    // store array index so rendered elements can reference this contact
    contact._index = idx;
   
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

// Render all contacts to the DOM using templates.
// After injecting HTML, attach event listeners to items.
function renderContacts() {
  let container = document.getElementById("contactsList");
  let groupedContacts = groupContacts(contacts);
  let html = "";

  for (const letter in groupedContacts) {
    html += getContactsGroupTemplate(letter, groupedContacts[letter]);
  }
  container.innerHTML = html;
  addContactDetailsEventListeners();
}

// Execute initial render
renderContacts();

const addContactBtn = document.getElementById("addContactBtn");
var closeAddBtn = null;
var saveContactBtn = null;

// Open add-contact overlay. Prevent multiple overlays.
addContactBtn.addEventListener("click", () => {
  console.log("Add Contact button clicked!");
  if (document.querySelector(".add-contact-overlay")) {
    return;
  }

  var addContent = document.getElementById("addContact");
  addContent.insertAdjacentHTML("beforeend", addContactTemplate);

  addEventListenerToAddContactForm();
});

// Attach listeners for add-contact overlay (close, outside click, save)
function addEventListenerToAddContactForm() {
  closeAddBtn = document.getElementById("closeAddContactBtn");
  closeAddBtn.addEventListener("click", () => {
    console.log("Close button clicked!");
    closeAddContactOverlay();
  });
  // initOutsideClickHandler will close overlay when clicking outside
  initOutsideClickHandler(
    document.querySelector(".add-contact-container"),
    closeAddContactOverlay,
    [closeAddBtn]
  );

  saveContactBtn = document.getElementById("saveContactBtn");
  saveContactBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Save Contact button clicked!");
    addContact();
    closeAddContactOverlay();
  });
}

// Remove add-contact overlay from DOM
function closeAddContactOverlay() {
  var overlay = document.querySelector(".add-contact-overlay");
  if (overlay) {
    overlay.remove();
  }
}

// Small helpers to read input fields
function getName() {
  return document.getElementById("AddContactNameInput").value;
}
function getEmail() {
  return document.getElementById("AddContactEmailInput").value;
}
function getPhoneNumber() {
  return document.getElementById("AddContactPhoneNumberInput").value;
}

// Create new contact: generate uuid, validate, save to Firestore, update local array and re-render.
function addContact() {
  
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

  // save or update Firestore document (uses id above)
  editOrAddContact(
    id,
    name,
    email,
    phoneNumber,
    color
  ).catch((error) => {
    console.error("Error saving contact:", error);
    alert("There was an error saving the contact. Please try again.");
    return;
  });

  // keep local copy in memory
  contacts.push({
    name,
    email,
    phoneNumber,
    initials,
    color,
  });
  // ensure last pushed contact has a correct _index
  contacts[contacts.length - 1]._index = contacts.length - 1;
  renderContacts();
}

// Attach click listeners to each rendered contact item.
// Uses contact._index if available, otherwise falls back to indexOf (less ideal).
function addContactDetailsEventListeners() {
  contacts.forEach((contact) => {
    // nullish coalescing: use stored _index if set; fallback to contacts.indexOf(contact)
    const id = contact._index ?? contacts.indexOf(contact);
    const contactItem = document.querySelector(`[data-contact-id="${id}"]`);
    console.log(contactItem);
    if (contactItem) {
      contactItem.addEventListener("click", () => {
        console.log(`Contact item ${contact.name} clicked!`);
        contactShowDetails(contact, id);
      });
    }
  });
}

// Show contact details in the right panel.
// Also manages active CSS class for selected contact.
function contactShowDetails(contact,index) {
  var contactButton;
  if (currentShownContact != null){
    contactButton = document.querySelector(`[data-contact-id="${currentShownContact._index}"]`);
    if (contactButton) {
      contactButton.classList.remove("active-contact");
    }
  }
  contactButton = document.querySelector(`[data-contact-id="${index}"]`);
  if (!contactButton) return;
  var contactDetailsOverlay = document.getElementById(
    "contactDetailsOverlay"
  );
  contactButton.classList.add("active-contact");
  currentShownContact = contact;
  contactDetailsOverlay.innerHTML = getContactDetailsTemplate(contact, contact.color);
  contactDetailsAddEventListeners();

}

// Add listeners to buttons inside the contact details panel (delete, edit)
function contactDetailsAddEventListeners() {
var deleteDetailsBtn = document.getElementById("deleteContactDetailsBtn");
var editDetailsBtn = document.getElementById("editContactBtn");
var contact = currentShownContact;

// delete contact from Firestore and update UI
deleteDetailsBtn.addEventListener("click", async () => {
    await deleteContact(contact.id).catch((error) => {
    console.error("Error deleting contact:", error);
    alert("There was an error deleting the contact. Please try again.");
    contacts.remove(contact);
    renderContacts();
    return;
  }); 
  });
// open edit overlay for the current contact
editDetailsBtn.addEventListener("click", () => {
    console.log("Edit Contact button clicked!");
    editContact(currentShownContact);
  });

}


// Build and insert edit-contact overlay, prefill values.
// Uses template and string replacements to set input values.
function editContact(contact) {
 var name=contact.name;
 var email=contact.email;
 var phoneNumber=contact.phoneNumber;
 var uuid=contact.id;
 

var contactTemplate= editContactTemplate(name,email,phoneNumber,uuid,contact.color,contact.initials);
// replace placeholders in template with actual values (simple approach)
contactTemplate= contactTemplate.replace('id="AddContactNameInput" value=""','id="AddContactNameInput" value="'+name+'"');
contactTemplate= contactTemplate.replace('id="AddContactEmailInput" value=""','id="AddContactEmailInput" value="'+email+'"');
contactTemplate= contactTemplate.replace('id="AddContactPhoneNumberInput" value=""','id="AddContactPhoneNumberInput" value="'+phoneNumber+'"');
 var addContent = document.getElementById("addContact");
 
 addContent.insertAdjacentHTML("beforeend", contactTemplate);
  addEventListenerToEditContactForm(contact);
  
}

// Attach listeners for edit overlay (close, outside click, save, delete)
function addEventListenerToEditContactForm(contact) {
  var closeEditBtn = null;
  var saveEditContactBtn = null;

  closeEditBtn = document.getElementById("closeEditContactBtn");  {
    closeEditBtn.addEventListener("click", () => {
      console.log("Close button clicked!");
      closeEditContactOverlay();
    });
    initOutsideClickHandler(
      document.querySelector(".edit-contact-container"),
      closeEditContactOverlay,
      [closeEditBtn]
    );
  }
  saveEditContactBtn = document.getElementById("saveEditContactBtn");
  {
    saveEditContactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Save Contact button clicked!");
      saveEditedContact(contact);
      closeEditContactOverlay();
    });
  }
  var deleteContactBtn = document.getElementById("deleteEditContactBtn");
  {
    deleteContactBtn.addEventListener("click", async (e) => { 
      e.preventDefault();
      console.log("Delete Contact button clicked!");
      await deleteContact(contact.id).catch((error) => {
        console.error("Error deleting contact:", error);
        alert("There was an error deleting the contact. Please try again.");
        return;
      });
      // remove from local array, re-render and close overlay
      contacts.splice(contacts.indexOf(contact), 1);
      renderContacts();
      closeEditContactOverlay();
    });
  }
}

// Save edited values: update Firestore and local array then re-render.
// Uses contact.id as the stable document id.
function saveEditedContact(contact) {
  const name = document.getElementById("EditContactNameInput").value;
  const email = document.getElementById("EditContactEmailInput").value;
  const phoneNumber = document.getElementById("EditContactPhoneNumberInput").value;   
 editOrAddContact(
    contact.id,
    name,
    email,
    phoneNumber,
    contact.color
  ).catch((error) => {
    console.error("Error saving contact:", error);
    alert("There was an error saving the contact. Please try again.");
    return;
  });
  // update local copy
  contacts[contacts.indexOf(contact)].name = name;
  contacts[contacts.indexOf(contact)].email = email;
  contacts[contacts.indexOf(contact)].phoneNumber = phoneNumber;

  renderContacts();
  // show updated details panel for the same contact
  contactShowDetails(contacts[contacts.indexOf(contact)],contacts[contacts.indexOf(contact)]._index);
}
// Remove edit-contact overlay from DOM
function closeEditContactOverlay() {
  var overlay = document.querySelector(".edit-contact-overlay");
  if (overlay) {
    overlay.remove();
  }
}