import { getContacts } from "../firebase.js";

let contacts = [];

export async function initContacts() {
  contacts = await getContacts();
  return contacts;
}

export function getContactsArray() {
  return contacts;
}

export function addLocalContact(id, data, color) {
  const newContact = {
    id: id,
    name: data.name,
    email: data.email,
    phoneNumber: data.phone,
    initials: "",
    color: color,
  };
  contacts.push(newContact);
  // Temporary index fix, should be handled by render/grouping
  contacts[contacts.length - 1]._index = contacts.length - 1;
}

export function removeLocalContact(id) {
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx !== -1) contacts.splice(idx, 1);
}

export function updateLocalContact(id, data) {
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx !== -1) {
    contacts[idx].name = data.name;
    contacts[idx].email = data.email;
    contacts[idx].phoneNumber = data.phone;
  }
}
