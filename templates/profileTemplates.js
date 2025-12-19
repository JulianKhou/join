export var profileTemplate = `
<div class="btnList" id="profileShowMore">
    <button class="btnListItem" id="editProfileBtn">Edit Profile</button>
    <button class="legalNoticeBtn btnListItem" id="legalNoticeBtn">Legal Notice</button>
    <button class="btnListItem" id="privacySettingsBtn">Privacy Settings</button>
    <button class="btnListItem" id="logoutBtn">Logout</button>
</div>
`;

export const editProfileTemplate = `
<div class="edit-profile-overlay" id="editProfileOverlay" onclick="closeEditProfileModal(event)">
  <div class="edit-profile-card" onclick="event.stopPropagation()">
      <div class="edit-profile-header">
          <h2>Edit Profile</h2>
          <button class="close-btn" onclick="closeEditProfileModal(event)">✕</button>
      </div>
      <form id="editProfileForm" onsubmit="saveUserProfile(event)">
          <div class="input-group">
              <label for="editProfileName">Name</label>
              <input type="text" id="editProfileName" required />
          </div>
          <div class="input-group">
              <label for="editProfileEmail">Email</label>
              <input type="email" id="editProfileEmail" required />
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
