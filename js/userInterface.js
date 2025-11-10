import {
  deleteUserProfile,
  onAuthChange,
  getUsername,
  logout,
} from "./firebase.js";
import { profileTemplate } from "../templates/profileTemplates.js";

var uid = null;
var username = null;
var logoutBtn = null;

document.addEventListener("DOMContentLoaded", () => {
  var profileShowMoreBtn = document.getElementById("userProfileInitialsBtn");

  if (profileShowMoreBtn) {
    profileShowMoreBtn.addEventListener("click", function () {
      document.getElementById("profileShowMore").innerHTML = profileTemplate;
      document.getElementById("profileShowMore").classList.toggle("d-none");
      logoutBtn = document.getElementById("logoutBtn");
      logoutBtn.addEventListener("click", function (event) {
        console.log("Logout button clicked");
        logoutUser();
      });
    });
  }
});

onAuthChange(async (user) => {
  if (user) {
    console.log("Auth state changed, user logged in:", user.uid);
    uid = user.uid;

    try {
      username = await getUsername(uid);
      console.log("Username fetched:", username);

      if (username) {
        // ← Nur aufrufen wenn username wirklich da ist!
        editProfileInitials();
      } else {
        console.error("Username is null or undefined!");
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  } else {
    // Nur umleiten, wenn nicht bereits auf logIn.html
    if (!window.location.href.includes("logIn.html")) {
      window.location.href = "logIn.html";
    }
  }
});

export function getInitials(Name) {
  if (!Name) return "";
  const names = Name.split(" ");
  let initials = names[0].charAt(0).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].charAt(0).toUpperCase();
  }
  if (initials.length === 1) {
    initials += names[0].charAt(1).toUpperCase();
  }
  console.log("Initials:", initials);
  return initials;
}

export function editProfileInitials() {
  console.log("Editing profile initials for username:", getInitials(username));
  const nameInitialsElement = document.getElementById("nameInitials");

  if (nameInitialsElement) {
    nameInitialsElement.innerHTML = getInitials(username);
  } else {
    console.error("Element 'nameInitials' not found in DOM");
  }
}

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
