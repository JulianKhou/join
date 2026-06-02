import { loginWithEmail, createOrUpdateUserProfile, editOrAddContact } from "./firebase.js";
import { showPopup } from "./feedback.js";

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginGuest = document.getElementById("guestLoginBtn");
const errorBox = document.getElementById("loginError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const form = document.querySelector("form");

const passwordIconImg = document.getElementById("passwordIconImg");

const lockIcon = "./assets/LogIn&SignUp/lock.svg";
const visibilityIcon = "./assets/LogIn&SignUp/visibility.svg";
const visibilityOffIcon = "./assets/LogIn&SignUp/visibility_off.svg";
// Single shared guest account – create this user once in Firebase Console:
// Email: guest@join-demo.com | Password: Guest#Join2024!
const GUEST_EMAIL = "guest@join-demo.com";
const GUEST_PASSWORD = "Guest#Join2024!";

if (form) {
  form.noValidate = true;
}

if (emailInput) emailInput.maxLength = 120;
if (passwordInput) passwordInput.maxLength = 64;

function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && !email.includes("..");
}

function validateEmailOnBlur() {
  if (!isValidEmail(emailInput.value.trim())) {
    emailError.textContent = "Please enter a valid email address.";
    return false;
  }

  emailError.textContent = "";
  return true;
}

function validatePasswordOnBlur() {
  if (passwordInput.value.trim().length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    return false;
  }

  passwordError.textContent = "";
  return true;
}

function persistCurrentUser(user, fallbackName = "Guest") {
  const email = user.email || "";
  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      uid: user.uid,
      email,
      username: user.displayName || (email.includes("@") ? email.split("@")[0] : fallbackName),
    })
  );
}

async function loginAsGlobalGuest() {
  const user = await loginWithEmail(GUEST_EMAIL, GUEST_PASSWORD);
  // Ensure the Firestore user document exists (e.g. after DB wipe or first run)
  await createOrUpdateUserProfile(user.uid, "Guest", GUEST_EMAIL);
  // Ensure Guest is also in Contacts so they can be assigned tasks
  await editOrAddContact(user.uid, "Guest", GUEST_EMAIL, "", "#A133FF");
  return user;
}

emailInput?.addEventListener("blur", validateEmailOnBlur);
passwordInput?.addEventListener("blur", validatePasswordOnBlur);

emailInput?.addEventListener("input", () => {
  emailError.textContent = "";
});

loginGuest?.addEventListener("click", async (event) => {
  event.preventDefault();
  loginGuest.disabled = true;

  try {
    const user = await loginAsGlobalGuest();
    persistCurrentUser(user, "Guest");
    window.location.href = "summaryUser.html";
  } catch (error) {
    showPopup(error.message || "Guest login failed.");
  } finally {
    loginGuest.disabled = false;
  }
});

passwordInput?.addEventListener("input", () => {
  passwordError.textContent = "";

  if (passwordInput.value.length > 0) {
    passwordIconImg.src = visibilityIcon;
  } else {
    passwordIconImg.src = lockIcon;
    passwordInput.type = "password";
  }
});

passwordIconImg?.addEventListener("click", () => {
  if (passwordInput.type === "password" && passwordInput.value.length > 0) {
    passwordInput.type = "text";
    passwordIconImg.src = visibilityOffIcon;
  } else {
    passwordInput.type = "password";
    passwordIconImg.src = visibilityIcon;
  }
});

loginBtn?.addEventListener("click", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  errorBox.textContent = "";
  emailError.textContent = "";
  passwordError.textContent = "";

  if (!validateEmailOnBlur() || !validatePasswordOnBlur()) {
    showPopup("Please check the highlighted login fields.", "info");
    return;
  }

  try {
    const user = await loginWithEmail(email, password);
    persistCurrentUser(user, "User");
    window.location.href = "summaryUser.html";
  } catch (error) {
    errorBox.textContent = "Error: " + error.message;
    showPopup(error.message || "Login failed.");
  }
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  loginBtn?.click();
});
