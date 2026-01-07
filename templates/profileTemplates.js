export var profileTemplate = `
    <button class="btnListItem" id="editProfileBtn">View Profile</button>
    <button class="btnListItem" id="legalNoticeBtn">Legal Notice</button>
    <button class="btnListItem" id="privacySettingsBtn">Privacy Policy</button>
    <button class="btnListItem" id="logoutBtn">Log out</button>
`;

export const viewProfileTemplate = (name, email, phone, initials, color) => `
<div class="edit-profile-overlay" id="editProfileOverlay" onclick="closeEditProfileModal(event)">
  <div class="edit-profile-card" onclick="event.stopPropagation()">
      <div class="edit-profile-header">
          <h2>Profile</h2>
          <button class="close-btn" onclick="closeEditProfileModal(event)">✕</button>
      </div>
      <div class="profile-view-content">
          <div class="profile-avatar-large" style="background-color: ${color}; color: white; width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48px; margin: 0 auto 20px auto; border: 3px solid white; box-shadow: 0px 0px 4px rgba(0,0,0,0.1);">
              ${initials}
          </div>
          <h3 style="text-align: center; margin-bottom: 20px; font-size: 48px; font-weight: 700;">${name}</h3>
          
          <div class="profile-data-row" style="margin-bottom: 15px;">
              <div style="font-weight: 700; font-size: 21px; margin-bottom: 8px;">Email</div>
              <a href="mailto:${email}" style="color: #29abe2; text-decoration: none; font-size: 21px;">${email}</a>
          </div>

          <div class="profile-data-row" style="margin-bottom: 30px;">
              <div style="font-weight: 700; font-size: 21px; margin-bottom: 8px;">Phone</div>
              <a href="tel:${phone}" style="color: black; text-decoration: none; font-size: 21px;">${
  phone || "N/A"
}</a>
          </div>

          <div class="form-actions" style="justify-content: center; gap: 16px; flex-direction: column; align-items: center;">
              <button class="save-btn" onclick="openEditProfile('${name}', '${email}', '${phone}')">Edit</button>
              <button class="delete-btn">Delete Profile</button>
          </div>
      </div>
  </div>
</div>
`;

export const editProfileTemplate = (name, email, phone) => `
<div class="edit-profile-overlay" id="editProfileOverlay" onclick="closeEditProfileModal(event)">
  <div class="edit-profile-card" onclick="event.stopPropagation()">
      <div class="edit-profile-header">
          <h2>Edit Profile</h2>
          <button class="close-btn" onclick="closeEditProfileModal(event)">✕</button>
      </div>
      <form id="editProfileForm" onsubmit="saveUserProfile(event)">
          <div class="input-group">
              <label for="editProfileName">Name</label>
              <input type="text" id="editProfileName" value="${name}" required />
          </div>
          <div class="input-group">
              <label for="editProfileEmail">Email</label>
              <input type="email" id="editProfileEmail" value="${email}" required />
          </div>
          <div class="input-group">
            <label for="editProfilePhone">Phone</label>
            <input type="tel" id="editProfilePhone" value="${
              phone || ""
            }" placeholder="+49..." />
        </div>
          <div class="form-actions">
              <button type="button" class="cancel-btn" onclick="closeEditProfileModal(event)">Cancel</button>
              <button type="submit" class="save-btn">Save</button>
          </div>
      </form>
  </div>
</div>
`;

export function iconTemplate(initials, color, addedClass = "") {
  return `
    <div class="profileIconContainer ${addedClass}" style="background-color: ${color};">
        ${initials}
    </div>
    `;
}

export const deleteConfirmationTemplate = () => `
<div class="edit-profile-overlay" id="deleteConfirmationOverlay" onclick="closeDeleteConfirmationModal(event)">
  <div class="edit-profile-card" onclick="event.stopPropagation()" style="text-align: center;">
      <div class="edit-profile-header" style="justify-content: center;">
          <h2 style="color: #ff8181;">Delete Profile?</h2>
      </div>
      <p style="font-size: 18px; margin-bottom: 32px;">This action cannot be undone. Are you sure?</p>
      <div class="form-actions" style="justify-content: center; gap: 20px;">
          <button class="cancel-btn" onclick="closeDeleteConfirmationModal(event)">Cancel</button>
          <button class="delete-btn" id="confirmDeleteBtn">Yes, Delete</button>
      </div>
  </div>
</div>
`;
