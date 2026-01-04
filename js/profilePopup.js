import { profileTemplate } from "../templates/profileTemplates.js";
import { logout } from "./firebase.js";

console.log("profilePopup.js loaded");

// Button & Dropdown abrufen
const profileBtn = document.getElementById("userProfileInitialsBtn");
const profileMenu = document.getElementById("profileShowMore");

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
    logout().then(() => (window.location.href = "logIn.html"));
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

  // Edit Profile → Overlay öffnen
  editProfileBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // Dropdown nicht sofort schließen

    const editOverlay = document.getElementById("editProfileOverlay");
    if (editOverlay) {
      editOverlay.classList.remove("d-none");
    } else {
      console.warn("Kein Edit Profile Overlay auf dieser Seite vorhanden.");
    }

    profileMenu.classList.add("d-none"); // Dropdown schließen
  });
}