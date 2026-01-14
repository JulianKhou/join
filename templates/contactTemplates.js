export var addContactTemplate = `

<div class="edit-contact-overlay add-contact-overlay">
        <div class="edit-contact-container">
      
          <div class="edit-contact-left">
            <img src="./assets/sideboardAssets/joinLogo.svg" class="logo">
            <h2 class="add-contact-title">Add contact</h2>
            <div class="blue-line"></div>
          </div>
      
          <div class="edit-contact-right">
            <button class="close-btn" id="closeAddContactBtn">×</button>
      
            <div class="profile-circle">TW</div>
      
            <form class="edit-form">
              <div class="input-wrapper">
                <input type="text" id="AddContactNameInput" placeholder="Name">
                <span class="icon"><img src="./assets/LogIn&SignUp/person.svg" alt=""></span>
              </div>
      
              <div class="input-wrapper">
                <input type="email" id="AddContactEmailInput" placeholder="Mail">
                <span class="icon"><img src="./assets/LogIn&SignUp/mail.svg" alt=""></span>
              </div>
      
              <div class="input-wrapper">
                <input type="tel" id="AddContactPhoneNumberInput" placeholder="Phone Number">
                <span class="icon"><img src="./assets/LogIn&SignUp/call.svg" alt=""></span>
              </div>
      
              <div class="buttons">
                <button class="delete-btn">Delete</button>
                <button class="save-btn" id="saveContactBtn">Save ✓</button>
              </div>
            </form>
      
          </div>
        </div>
      </div>
    `;

export function getContactsGroupTemplate(letter, contacts) {
  const itemsHTML = contacts
    .map(
      (c) => `
        <button class="contact-item" data-contact-id="${c._index}">
            <div class="contact-avatar" style="background-color: ${c.color}">
            ${c.initials}
            </div>
            
            <div class="contact-data">
                <span class="contact-name">${c.name}</span>
                <span class="contact-email">${c.email}</span>
            </div>
        </button>
      `
    )
    .join("");

  // Return the complete group section
  return `
    <div class="contacts-letter">${letter}</div>
    ${itemsHTML}
  `;
}
export function getContactDetailsTemplate(contact, color) {
  var contactDetailsTemplate = `

<div class="contact-details-container" id="contactDetailsContainer">
    
    <!-- Mobile Header inside Details View -->
    <div class="contacts-mobile-header">
        <h1>Contacts</h1>
        <div class="blue-line-mobile"></div>
        <span class="subtitle">Better with a team</span>
    </div>

    <div class="contact-details-header">
        <div class="contact-avatar-large" id="contactAvatarLarge" style="background-color: ${color}">${contact.initials}</div>
        
        <div class="contact-details-content">
            <h2 class="contact-name-large" id="contactNameLarge">${contact.name}</h2>
            <!-- Back Arrow attached to name/header area -->
            <img src="./assets/utilitys/arrowBack.svg" class="mobile-back-arrow" id="mobileBackArrow" alt="Back">

            <div class=contact-buttons>
                <button class="edit-contact-btn contact-btn" id="editContactBtn">
                <img src="./assets/contacts/editButton.svg" alt="Edit Icon" class="edit-icon">
                Edit</button>
                <button class="delete-contact-details-btn contact-btn" id="deleteContactDetailsBtn">
                <img src="./assets/contacts/deleteButton.svg" alt="Delete Icon" class="delete-icon">
                Delete</button>
            </div>
        </div>
    </div>

    <div class="contact-details-body">
        <h3>Contact Information </h3>
        <div>
            <h4> Email </h4>
            <a href="mailto:${contact.email}">${contact.email}</a>
        </div>
        <div>
            <h4> Phone </h4>
            <span>${contact.phoneNumber}</span>
        </div>
    </div>

    <!-- Floating Options Button (Mobile Only) -->
    <div class="mobile-options-container">
        <!-- Using inline SVG for options or image if available -->
        <button class="mobile-options-btn" id="mobileOptionsBtn">
            <img src="./assets/sideboardAssets/more_vert.svg" alt="Options"> 
        </button>
        <!-- Mobile Menu -->
        <div class="mobile-options-menu d-none" id="mobileOptionsMenu">
            <button class="mobile-menu-btn" id="mobileEditBtn">
                <img src="./assets/contacts/editButton.svg" alt="Edit"> Edit
            </button>
            <button class="mobile-menu-btn" id="mobileDeleteBtn">
                <img src="./assets/contacts/deleteButton.svg" alt="Delete"> Delete
            </button>
        </div>
    </div>

</div>
`;
  return contactDetailsTemplate;
}
export function editContactTemplate(
  name,
  email,
  phoneNumber,
  uuid,
  color,
  initials
) {
  return `

<div class="edit-contact-overlay ">
        <div class="edit-contact-container add-contact-container">
      
          <div class="edit-contact-left ">
            <img src="./assets/sideboardAssets/joinLogo.svg" class="logo">
            <h2 class="add-contact-title">Edit contact</h2>
            <div class="blue-line"></div>
          </div>
      
          <div class="edit-contact-right ">
            <button class="close-btn" id="closeEditContactBtn">×</button>
      
            <div class="profile-circle" style="background-color: ${color}">${initials}</div>
      
            <form class="edit-form">
              <div class="input-wrapper">
                <input type="text" id="EditContactNameInput" placeholder="Name" value="${name}">
                <span class="icon"><img src="./assets/LogIn&SignUp/person.svg" alt=""></span>
              </div>
      
              <div class="input-wrapper">
                <input type="email" id="EditContactEmailInput" placeholder="Mail" value="${email}">
                <span class="icon"><img src="./assets/LogIn&SignUp/mail.svg" alt=""></span>
              </div>
      
              <div class="input-wrapper">
                <input type="tel" id="EditContactPhoneNumberInput" placeholder="Phone Number" value="${phoneNumber}">
                <span class="icon"><img src="./assets/LogIn&SignUp/call.svg" alt=""></span>
              </div>
      
              <div class="buttons">
                <button class="delete-btn" id="deleteEditContactBtn">Delete</button>
                <button class="save-btn" id="saveEditContactBtn">Save ✓</button>
              </div>
            </form>
      
          </div>
        </div>
      </div>
    `;
}
