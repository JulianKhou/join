import { profileTemplate, profileTemplateSimple } from "../templates/profileTemplates.js";
import { logout } from "./firebase.js";

function isSimpleProfilePage() {
  const simplePages = [
    "addTask.html",
    "board.html",
    "summaryUser.html",
    "privacyPolicyInt.html",
    "legalNoticeInt.html",
    "help.html",
  ];

  return simplePages.some((page) => window.location.pathname.endsWith(page));
}

function initBackButtons() {
  const backTargets = [
    ...document.querySelectorAll("#backBtn"),
    ...document.querySelectorAll(".h1-arrow"),
    ...document.querySelectorAll(".back-btn"),
  ];

  backTargets.forEach((target) => {
    target.addEventListener("click", (event) => {
      event.preventDefault();
      const currentPage = window.location.pathname.split("/").pop();
      const internalPages = [
        "summaryUser.html",
        "addTask.html",
        "board.html",
        "contacts.html",
        "help.html",
        "privacyPolicyInt.html",
        "legalNoticeInt.html",
      ];
      const fallbackTarget = internalPages.includes(currentPage) ? "summaryUser.html" : "logIn.html";

      if (document.referrer && document.referrer !== window.location.href) {
        window.history.back();
      } else {
        window.location.href = fallbackTarget;
      }
    });
  });
}

initBackButtons();

const profileBtn = document.getElementById("userProfileInitialsBtn");
const profileMenu = document.getElementById("profileShowMore");

if (profileBtn && profileMenu) {
  profileMenu.innerHTML = isSimpleProfilePage() ? profileTemplateSimple : profileTemplate;

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

  profileBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    profileMenu.classList.toggle("d-none");
  });

  profileMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    profileMenu.classList.add("d-none");
  });

  editProfileBtn?.addEventListener("click", (event) => {
    event.stopPropagation();

    const editOverlay = document.getElementById("editProfileOverlay");
    if (editOverlay) {
      editOverlay.classList.remove("d-none");
    }

    profileMenu.classList.add("d-none");
  });
}
