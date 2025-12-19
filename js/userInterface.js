import { updateUserProfile } from "./firebase.js";
import {
  profileTemplate,
  editProfileTemplate,
} from "../templates/profileTemplates.js";
import { getInitials } from "./utility.js";

// Global variables for user data and UI elements
let uid = null;
let username = null;

// Wait for DOM to load before accessing elements
document.addEventListener("DOMContentLoaded", initUserProfile);

function initUserProfile() {
  const profileShowMoreBtn = document.getElementById("userProfileInitialsBtn");

  if (profileShowMoreBtn) {
    profileShowMoreBtn.addEventListener("click", toggleProfileDropdown);
  }
}

/**
 * Toggles profile dropdown and attach event listeners
 */
function toggleProfileDropdown() {
  const dropdown = document.getElementById("profileShowMore");
  if (!dropdown) return;

  dropdown.innerHTML = profileTemplate;
  dropdown.classList.toggle("d-none");
  addEventListenersToProfileButtons();
}

// Listen for authentication state changes
onAuthChange(async (user) => {
  if (user) {
    await handleUserAuthenticated(user);
  } else {
    handleUserLogoutRedirect();
  }
});

/**
 * Handles logic when user is authenticated.
 * @param {Object} user
 */
async function handleUserAuthenticated(user) {
  uid = user.uid;
  try {
    username = await getUsername(uid);
    if (username) {
      // Update local storage to keep it fresh
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ uid: uid, email: user.email, username: username })
      );
      editProfileInitials();
    } else {
      console.error("Username is null or undefined!");
    }
  } catch (error) {
    console.error("Error fetching username:", error);
  }
}

/**
 * Redirects to login if not authenticated, but allows public pages.
 */
function handleUserLogoutRedirect() {
  const currentPath = window.location.pathname.toLowerCase();
  // Using lower case names for check
  const publicPages = [
    "login.html",
    "signup.html",
    "privacypolicyext.html",
    "legalnoticeext.html",
    "index.html",
  ];

  // Check if current page is one of the public pages
  // We use includes to handle full paths (e.g. /join/signup.html)
  const isPublic = publicPages.some((page) => currentPath.includes(page));

  // If not public and not logged in (and not potentially root /), redirect
  // Also check if we are NOT already on the login page (prevent loop if logic is weird)
  if (
    !isPublic &&
    !currentPath.endsWith("/") &&
    !currentPath.includes("login.html")
  ) {
    console.warn("Redirecting to logIn.html from", currentPath);
    window.location.href = "logIn.html";
  }
}

// Re-export getInitials if needed by legacy code, or remove export if not used elsewhere
export { getInitials };

/**
 * Displays user initials in profile button.
 */
export function editProfileInitials() {
  const nameInitialsElement = document.getElementById("nameInitials");

  if (nameInitialsElement) {
    nameInitialsElement.innerHTML = getInitials(username);
  } else {
    console.error("Element 'nameInitials' not found in DOM");
  }
}

/**
 * Handle user logout.
 */
function logoutUser() {
  logout()
    .then(() => {
      window.location.href = "logIn.html";
      console.log("User logged out and redirected to logIn.html");
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      alert("Logout fehlgeschlagen: " + error.message);
    });
}

/**
 * Attach event listeners to profile dropdown buttons.
 */
function addEventListenersToProfileButtons() {
  setupProfileLink("privacySettingsBtn", "privacyPolicyInt.html");
  setupProfileLink("legalNoticeBtn", "legalNoticeInt.html");

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);
}

/**
 * Helper to link buttons.
 * @param {string} btnId
 * @param {string} url
 */
function setupProfileLink(btnId, url) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = url;
    });
  }
}
