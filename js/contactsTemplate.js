// Generates HTML markup for a single contact group section
export function getContactsGroupTemplate(letter, contacts) {
  const itemsHTML = contacts
    .map(
      (c, i) => `
        <div class="contact-item" data-contact-id="${i}">
            <div class="contact-avatar" style="background-color: ${c.color}">
            ${c.initials}
            </div>
            
            <div class="contact-data">
                <span class="contact-name">${c.name}</span>
                <span class="contact-email">${c.email}</span>
            </div>
        </div>
      `
    )
    .join("");

  // Return the complete group section
  return `
    <div class="contacts-letter">${letter}</div>
    ${itemsHTML}
  `;
}
