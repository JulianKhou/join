import { onAuthChange, getUsername, logout } from "./firebase.js";
import { showPopup } from "./feedback.js";

let uid = null;
let username = null;

onAuthChange(async (user) => {
  if (user) {
    uid = user.uid;

    try {
      username = await getUsername(uid);
      if (username) {
        editProfileInitials();
      }
    } catch {
      // Silently ignore: guest accounts or missing Firestore profiles
      // are expected and don't need an error popup
      editProfileInitials();
    }

    return;
  }

  // Small delay to avoid false-positive logout during history.back() navigation
  setTimeout(() => {
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage !== "logIn.html" && currentPage !== "signUp.html") {
      window.location.href = "logIn.html";
    }
  }, 300);
});

export function getInitials(name) {
  if (!name) return "";
  const names = name.split(" ");
  let initials = names[0].charAt(0).toUpperCase();

  if (names.length > 1) {
    initials += names[names.length - 1].charAt(0).toUpperCase();
  }

  if (initials.length === 1 && names[0].length > 1) {
    initials += names[0].charAt(1).toUpperCase();
  }

  return initials;
}

export function editProfileInitials() {
  const nameInitialsElement = document.getElementById("nameInitials");
  if (nameInitialsElement) {
    nameInitialsElement.innerHTML = getInitials(username);
  }
}

function logoutUser() {
  logout()
    .then(() => {
      window.location.href = "logIn.html";
    })
    .catch((error) => {
      showPopup("Logout failed: " + (error.message || "Unknown error"));
    });
}

function addEventListenersToProfileButtons() {
  const privacySettingsBtn = document.getElementById("privacySettingsBtn");
  const legalNoticeBtn = document.getElementById("legalNoticeBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  privacySettingsBtn?.addEventListener("click", () => {
    window.location.href = "privacyPolicyInt.html";
  });

  legalNoticeBtn?.addEventListener("click", () => {
    window.location.href = "legalNoticeInt.html";
  });

  logoutBtn?.addEventListener("click", () => {
    logoutUser();
  });
}

function initBackButtons() {
  const backTargets = [
    ...document.querySelectorAll(".h1-arrow"),
    ...document.querySelectorAll("#backBtn"),
    ...document.querySelectorAll(".back-btn"),
  ];

  const internalPages = [
    "summaryUser.html", "board.html", "contacts.html",
    "addTask.html", "help.html", "legalNoticeInt.html",
    "privacyPolicyInt.html"
  ];

  backTargets.forEach((target) => {
    target.addEventListener("click", (event) => {
      event.preventDefault();

      const currentPage = window.location.pathname.split("/").pop();
      const publicPages = ["signUp.html", "logIn.html", "legalNoticeExt.html", "privacyPolicyExt.html"];
      const fallbackTarget = publicPages.includes(currentPage) ? "logIn.html" : "summaryUser.html";

      // Only use history.back() when the referrer is a known internal app page,
      // never back to logIn.html (would trigger auth-change logout)
      const referrerPage = document.referrer
        ? new URL(document.referrer).pathname.split("/").pop()
        : "";

      const canGoBack =
        document.referrer &&
        document.referrer !== window.location.href &&
        internalPages.includes(referrerPage);

      if (canGoBack) {
        window.history.back();
      } else {
        window.location.href = fallbackTarget;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  addEventListenersToProfileButtons();
  initBackButtons();
});
