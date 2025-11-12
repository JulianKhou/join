import { getContactsGroupTemplate } from "./contactsTemplate.js";

const contacts = [
  { name: "Anton Mayer", email: "antonm@gmail.com", initials: "AM", color: "var(--orange-default)" },
  { name: "Anja Schulz", email: "schulz@hotmail.com", initials: "AS", color: "var(--purpleViolett-default)" },
  { name: "Benedikt Ziegler", email: "benedikt@gmail.com", initials: "BZ", color: "var(--skyBlue-default)" },
  { name: "David Eisenberg", email: "davidberg@gmail.com", initials: "DE", color: "var(--pink-default)" },
  { name: "Eva Fischer", email: "eva@gmail.com", initials: "EF", color: "var(--yellow-default)" },
  { name: "Emmanuel Mauer", email: "emmanuelma@gmail.com", initials: "EM", color: "var(--aquamarine-default)" },
];

// Groups an array of contacts alphabetically by the first letter of their name
function groupContacts(contacts) {
  const grouped = {};
  contacts.forEach(contact => {
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
