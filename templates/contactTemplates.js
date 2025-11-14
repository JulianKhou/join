export var addContactTemplate = `

<div class="edit-contact-overlay">
        <div class="edit-contact-container">
      
          <div class="edit-contact-left">
            <img src="./assets/sideboardAssets/joinLogo.svg" class="logo">
            <h2>Edit contact</h2>
            <div class="blue-line"></div>
          </div>
      
          <div class="edit-contact-right">
            <button class="close-btn" id="closeEditContactBtn">×</button>
      
            <div class="profile-circle">TW</div>
      
            <form class="edit-form">
              <div class="input-wrapper">
                <input type="text" placeholder="Name">
                <span class="icon"><img src="./assets/LogIn&SignUp/person.svg" alt=""></span>
              </div>
      
              <div class="input-wrapper">
                <input type="email" placeholder="Mail">
                <span class="icon"><img src="./assets/LogIn&SignUp/mail.svg" alt=""></span>
              </div>
      
              <div class="input-wrapper">
                <input type="tel" placeholder="Phone Number">
                <span class="icon"><img src="./assets/LogIn&SignUp/call.svg" alt=""></span>
              </div>
      
              <div class="buttons">
                <button class="delete-btn">Delete</button>
                <button class="save-btn">Save ✓</button>
              </div>
            </form>
      
          </div>
        </div>
      </div>
    `;

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
