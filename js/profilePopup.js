import { profileTemplate } from "../templates/profileTemplates.js";
import { logout } from "./firebase.js";

console.log("profilePopup.js loaded");


const profileBtn = document.getElementById("userProfileInitialsBtn");
const profileMenu = document.getElementById("profileShowMore");

if (profileBtn && profileMenu) {
  // Template nur EINMAL setzen
  profileMenu.innerHTML = profileTemplate;

  const editProfileBtn = profileMenu.querySelector("#editProfileBtn");
  const logoutBtn = profileMenu.querySelector("#logoutBtn");
  const privacyBtn = profileMenu.querySelector("#privacySettingsBtn");
  const legalBtn = profileMenu.querySelector("#legalNoticeBtn");

  logoutBtn?.addEventListener("click", () => {
    logout().then(() => (window.location.href = "logIn.html"));
  });

  privacyBtn?.addEventListener("click", () => {
    window.location.href = "privacyPolicyInt.html";
  });

  legalBtn?.addEventListener("click", () => {
    window.location.href = "legalNoticeInt.html";
  });

  // Toggle Popup
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("d-none");
  });

  // Klick im Popup → nicht schließen
  profileMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Klick außerhalb → schließen
  document.addEventListener("click", () => {
    profileMenu.classList.add("d-none");
  });

  document.addEventListener("click", (e) => {
    if (
      e.target.matches(".profileShowMore button") &&
      e.target.textContent.trim() === "Edit Profile"
    ) {
      const editContactBtn = document.getElementById("editContactBtn");
      editContactBtn?.click();
    }
  });
  console.log(document.getElementById("editContactBtn"));
}