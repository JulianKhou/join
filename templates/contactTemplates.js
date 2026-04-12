import { escapeHtml, sanitizeColor } from "../js/utility.js";

export const addContactTemplate = `
<div class="edit-contact-overlay add-contact-overlay">
  <div class="edit-contact-container add-contact-container">
    <div class="edit-contact-left">
      <img src="./assets/sideboardAssets/joinLogo.svg" class="logo" alt="Join logo">
      <h2 class="add-contact-title">Add contact</h2>
      <div class="blue-line"></div>
    </div>

    <div class="edit-contact-right">
      <button class="close-btn" id="closeAddContactBtn" type="button">&times;</button>
      <div class="profile-circle">TW</div>

      <form class="edit-form" novalidate>
        <div class="input-wrapper">
          <input type="text" id="AddContactNameInput" placeholder="Name" maxlength="50" autocomplete="off">
          <span class="icon"><img src="./assets/LogIn&SignUp/person.svg" alt=""></span>
        </div>

        <div class="input-wrapper">
          <input type="text" id="AddContactEmailInput" placeholder="Mail" maxlength="120" autocomplete="off" inputmode="email">
          <span class="icon"><img src="./assets/LogIn&SignUp/mail.svg" alt=""></span>
        </div>

        <div class="input-wrapper">
          <input type="text" id="AddContactPhoneNumberInput" placeholder="Phone Number" maxlength="30" autocomplete="off" inputmode="tel">
          <span class="icon"><img src="./assets/LogIn&SignUp/call.svg" alt=""></span>
        </div>

        <div class="buttons">
          <button class="delete-btn" type="button">Delete</button>
          <button class="save-btn" id="saveContactBtn" type="submit">Save &#10003;</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;

export function getContactsGroupTemplate(letter, contacts) {
  const itemsHTML = contacts
    .map((contact) => {
      const safeId = escapeHtml(contact._index);
      const safeColor = sanitizeColor(contact.color);
      const safeInitials = escapeHtml(contact.initials);
      const safeName = escapeHtml(contact.name);
      const safeEmail = escapeHtml(contact.email);

      return `
        <button class="contact-item" data-contact-id="${safeId}">
          <div class="contact-avatar" style="background-color: ${safeColor}">
            ${safeInitials}
          </div>

          <div class="contact-data">
            <span class="contact-name">${safeName}</span>
            <span class="contact-email">${safeEmail}</span>
          </div>
        </button>
      `;
    })
    .join("");

  return `
    <div class="contacts-letter">${escapeHtml(letter)}</div>
    ${itemsHTML}
  `;
}

export function getContactDetailsTemplate(contact, color) {
  const safeColor = sanitizeColor(color);
  const safeInitials = escapeHtml(contact.initials);
  const safeName = escapeHtml(contact.name);
  const safeEmail = escapeHtml(contact.email);
  const safePhone = escapeHtml(contact.phoneNumber || "-");

  return `
<div class="contact-details-container" id="contactDetailsContainer">
  <div class="contact-details-header">
    <div class="contact-avatar-large" id="contactAvatarLarge" style="background-color: ${safeColor}">${safeInitials}</div>
    <div class="contact-details-content">
      <h2 class="contact-name-large" id="contactNameLarge">${safeName}</h2>
      <div class="contact-buttons">
        <button class="edit-contact-btn contact-btn" id="editContactBtn" type="button">
          <img src="./assets/contacts/editButton.svg" alt="Edit icon" class="edit-icon">
          Edit
        </button>
        <button class="delete-contact-details-btn contact-btn" id="deleteContactDetailsBtn" type="button">
          <img src="./assets/contacts/deleteButton.svg" alt="Delete icon" class="delete-icon">
          Delete
        </button>
      </div>
    </div>
  </div>

  <div class="contact-details-body">
    <h3>Contact Information</h3><br><br>
    <div>
      <h4>Email</h4><br>
      <a href="mailto:${safeEmail}">${safeEmail}</a><br>
    </div><br>
    <div>
      <h4>Phone</h4><br>
      <span>${safePhone}</span>
    </div>
  </div>
</div>
`;
}

export function editContactTemplate(name, email, phoneNumber, uuid, color, initials) {
  const safeUuid = escapeHtml(uuid);
  const safeColor = sanitizeColor(color);
  const safeInitials = escapeHtml(initials);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phoneNumber);

  return `
<div class="edit-contact-overlay">
  <div class="edit-contact-container add-contact-container" data-contact-id="${safeUuid}">
    <div class="edit-contact-left">
      <img src="./assets/sideboardAssets/joinLogo.svg" class="logo" alt="Join logo">
      <h2 class="add-contact-title">Edit contact</h2>
      <div class="blue-line"></div>
    </div>

    <div class="edit-contact-right">
      <button class="close-btn" id="closeEditContactBtn" type="button">&times;</button>
      <div class="profile-circle" style="background-color: ${safeColor}">${safeInitials}</div>

      <form class="edit-form" novalidate>
        <div class="input-wrapper">
          <input type="text" id="EditContactNameInput" placeholder="Name" value="${safeName}" maxlength="50" autocomplete="off">
          <span class="icon"><img src="./assets/LogIn&SignUp/person.svg" alt=""></span>
        </div>

        <div class="input-wrapper">
          <input type="text" id="EditContactEmailInput" placeholder="Mail" value="${safeEmail}" maxlength="120" autocomplete="off" inputmode="email">
          <span class="icon"><img src="./assets/LogIn&SignUp/mail.svg" alt=""></span>
        </div>

        <div class="input-wrapper">
          <input type="text" id="EditContactPhoneNumberInput" placeholder="Phone Number" value="${safePhone}" maxlength="30" autocomplete="off" inputmode="tel">
          <span class="icon"><img src="./assets/LogIn&SignUp/call.svg" alt=""></span>
        </div>

        <div class="buttons">
          <button class="delete-btn" id="deleteEditContactBtn" type="button">Delete</button>
          <button class="save-btn" id="saveEditContactBtn" type="submit">Save &#10003;</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;
}
