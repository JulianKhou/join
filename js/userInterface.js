import {
  deleteUserProfile,
  onAuthChange,
  getUsername,
  logout,
} from "./firebase.js";
import { profileTemplate } from "../templates/profileTemplates.js";

// Global variables for user data and UI elements
var uid = null;
var username = null;
var logoutBtn = null;
var privacySettingsBtn = null;
var legalNoticeBtn = null;

// Wait for DOM to load before accessing elements
document.addEventListener("DOMContentLoaded", () => {
  var profileShowMoreBtn = document.getElementById("userProfileInitialsBtn");

  if (profileShowMoreBtn) {
    // Toggle profile dropdown and attach event listeners
    profileShowMoreBtn.addEventListener("click", function () {
      document.getElementById("profileShowMore").innerHTML = profileTemplate;
      document.getElementById("profileShowMore").classList.toggle("d-none");
      addEventListenersToProfileButtons();
    });
  }
});

// Listen for authentication state changes
onAuthChange(async (user) => {
  if (user) {
    console.log("Auth state changed, user logged in:", user.uid);
    uid = user.uid;

    try {
      username = await getUsername(uid);
      console.log("Username fetched:", username);

      if (username) {
        editProfileInitials();
      } else {
        console.error("Username is null or undefined!");
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  } else {
    // Redirect to login if not authenticated and not already on login page
    if (!window.location.href.includes("logIn.html")) {
      window.location.href = "logIn.html";
    }
  }
});

// Extract initials from full name
export function getInitials(Name) {
  if (!Name) return "";
  const names = Name.split(" ");
  let initials = names[0].charAt(0).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].charAt(0).toUpperCase();
  }
  // Use second letter if only one name
  if (initials.length === 1) {
    initials += names[0].charAt(1).toUpperCase();
  }
  console.log("Initials:", initials);
  return initials;
}

// Display user initials in profile button
export function editProfileInitials() {
  console.log("Editing profile initials for username:", getInitials(username));
  const nameInitialsElement = document.getElementById("nameInitials");

  if (nameInitialsElement) {
    nameInitialsElement.innerHTML = getInitials(username);
  } else {
    console.error("Element 'nameInitials' not found in DOM");
  }
}

// Handle user logout
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

// Attach event listeners to profile dropdown buttons
function addEventListenersToProfileButtons() {
  privacySettingsBtn = document.getElementById("privacySettingsBtn");
  legalNoticeBtn = document.getElementById("legalNoticeBtn");
  logoutBtn = document.getElementById("logoutBtn");
  
  privacySettingsBtn.addEventListener("click", function (event) {
    window.location.href = "privacyPolicyInt.html";
  });
  legalNoticeBtn.addEventListener("click", function (event) {
    window.location.href = "legalNoticeInt.html";
  });
  logoutBtn.addEventListener("click", function (event) {
    console.log("Logout button clicked");
    logoutUser();
  });
}
