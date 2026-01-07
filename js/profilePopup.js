import {
  profileTemplate,
  viewProfileTemplate,
  editProfileTemplate,
  deleteConfirmationTemplate,
} from "../templates/profileTemplates.js";
import {
  logout,
  auth,
  getContact,
  editOrAddContact,
  updateUserProfile,
  deleteUserProfile,
  updateTask,
  getAllTasks,
} from "./firebase.js";
import { getInitials } from "./userInterface.js";

console.log("profilePopup.js loaded");

// Button & Dropdown abrufen
const profileBtn = document.getElementById("userProfileInitialsBtn");
const profileMenu = document.getElementById("profileShowMore");

// Global functions for template callbacks
/**
 * Closes the edit profile overlay if open.
 * @param {Event} event - Optional event to stop propagation
 */
window.closeEditProfileModal = function (event) {
  if (event) event.stopPropagation();
  const editOverlay = document.getElementById("editProfileOverlay");
  if (editOverlay) {
    editOverlay.remove();
  }
};

/**
 * Opens the profile edit overlay with current user data.
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} phone - User's phone number
 */
window.openEditProfile = function (name, email, phone) {
  // Check if phone is "undefined" string or null
  const safePhone = phone && phone !== "undefined" ? phone : "";
  const container = document.getElementById("editProfileOverlay").parentNode;

  // Close existing (view) overlay
  window.closeEditProfileModal();

  // Create new (edit) overlay
  const div = document.createElement("div");
  div.innerHTML = editProfileTemplate(name, email, safePhone);
  document.body.appendChild(div.firstElementChild);
};

/**
 * Saves the edited user profile to Firebase (both 'users' and 'contacts' collection).
 * Reloads the page on success to reflect changes.
 * @param {Event} event - Form submission event
 */
window.saveUserProfile = async function (event) {
  event.preventDefault();
  const name = document.getElementById("editProfileName").value;
  const email = document.getElementById("editProfileEmail").value;
  const phone = document.getElementById("editProfilePhone").value;
  const uid = auth.currentUser.uid;

  try {
    // 1. Update User/Contact (Syncs both 'users' and 'contacts' collection)
    await updateUserProfile(uid, {
      username: name,
      email: email,
      phone: phone,
    });

    // 2. Update all tasks where this user is assigned
    // This is expensive but necessary if we want names to update everywhere immediately without reload
    // For now, simpler: reload page to reflect changes or just close.
    // Let's reload to be safe and simple:
    window.location.reload();
  } catch (error) {
    console.error("Failed to save profile:", error);
    alert("Error saving profile.");
  }
};

/**
 * Closes the delete confirmation modal.
 * @param {Event} event - Optional event to stop propagation
 */
window.closeDeleteConfirmationModal = function (event) {
  if (event) event.stopPropagation();
  const overlay = document.getElementById("deleteConfirmationOverlay");
  if (overlay) overlay.remove();
};

/**
 * Executes the actual deletion of the user profile via Firebase.
 * Redirects to login page on success.
 */
const performDeletion = async function () {
  const uid = auth.currentUser.uid;
  try {
    // Show loading state if desired, or just wait
    const btn = document.getElementById("confirmDeleteBtn");
    if (btn) btn.innerText = "Deleting...";

    await deleteUserProfile(uid);
    alert("Your account has been deleted.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.code === "auth/requires-recent-login") {
      alert(
        "Security Requirement: Please log out and log in again to delete your account."
      );
    } else {
      alert("ERROR: " + error.message);
    }
  }
};

/**
 * Opens the custom delete confirmation modal.
 * Attaches the listener to the 'Yes' button dynamically.
 */
const deleteCurrentUser = function () {
  // Close the view profile overlay first (optional, but cleaner)
  // window.closeEditProfileModal();

  const div = document.createElement("div");
  div.innerHTML = deleteConfirmationTemplate();
  document.body.appendChild(div.firstElementChild);

  // Attach listener to the new "Yes" button
  setTimeout(() => {
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", performDeletion);
    }
  }, 0);
};
window.deleteCurrentUser = deleteCurrentUser;

/**
 * Fetches current user data and opens the View Profile overlay.
 */
async function openViewProfile() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    const contact = await getContact(uid);
    const initials = getInitials(contact.name);
    // Use contact.phone or empty string
    const phone = contact.phoneNumber || "";
    const color = contact.color || "#29abe2";

    const div = document.createElement("div");
    div.innerHTML = viewProfileTemplate(
      contact.name,
      contact.email,
      phone,
      initials,
      color
    );
    const overlay = div.firstElementChild;
    document.body.appendChild(overlay);

    // Attach event listener explicitly
    const deleteBtn = overlay.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", deleteCurrentUser);
    }
  } catch (e) {
    console.error("Error fetching contact for profile view:", e);
  }
}

if (profileBtn && profileMenu) {
  // Template nur EINMAL setzen
  profileMenu.innerHTML = profileTemplate;

  // Buttons aus dem Template holen
  const editProfileBtn = profileMenu.querySelector("#editProfileBtn");
  const logoutBtn = profileMenu.querySelector("#logoutBtn");
  const privacyBtn = profileMenu.querySelector("#privacySettingsBtn");
  const legalBtn = profileMenu.querySelector("#legalNoticeBtn");

  // Logout → zurück zur Login-Seite
  logoutBtn?.addEventListener("click", () => {
    logout().then(() => (window.location.href = "index.html"));
  });

  // Privacy Settings → weiterleiten
  privacyBtn?.addEventListener("click", () => {
    window.location.href = "privacyPolicyInt.html";
  });

  // Legal Notice → weiterleiten
  legalBtn?.addEventListener("click", () => {
    window.location.href = "legalNoticeInt.html";
  });

  // Dropdown toggle
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("d-none");
  });

  // Klick im Dropdown → nicht schließen
  profileMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Klick außerhalb → schließen
  document.addEventListener("click", () => {
    profileMenu.classList.add("d-none");
  });

  // Profil anzeigen → Overlay öffnen
  editProfileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.add("d-none"); // Dropdown schließen
    openViewProfile();
  });
}
