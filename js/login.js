import { loginWithEmail, createUser } from "./firebase.js";
import { showPopup } from "./feedback.js";

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginGuest = document.getElementById("guestLoginBtn");
const errorBox = document.getElementById("loginError");
const form = document.querySelector("form");

const passwordIconImg = document.getElementById("passwordIconImg");

const lockIcon = "./assets/LogIn&SignUp/lock.svg";
const visibilityIcon = "./assets/LogIn&SignUp/visibility.svg";
const visibilityOffIcon = "./assets/LogIn&SignUp/visibility_off.svg";
const GUEST_CREDENTIALS_KEY = "join_guest_credentials_v1";

if (form) {
  form.noValidate = true;
}

if (emailInput) emailInput.maxLength = 120;
if (passwordInput) passwordInput.maxLength = 64;

function validateEmailOnBlur() {
  if (!emailInput.value.trim().includes("@")) {
    errorBox.textContent = "Please enter a valid email address.";
    return false;
  }

  errorBox.textContent = "";
  return true;
}

function validatePasswordOnBlur() {
  if (passwordInput.value.trim().length < 6) {
    errorBox.textContent = "Password must be at least 6 characters.";
    return false;
  }

  errorBox.textContent = "";
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

function readGuestCredentials() {
  const raw = localStorage.getItem(GUEST_CREDENTIALS_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.email || !parsed?.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveGuestCredentials(credentials) {
  localStorage.setItem(GUEST_CREDENTIALS_KEY, JSON.stringify(credentials));
}

function clearGuestCredentials() {
  localStorage.removeItem(GUEST_CREDENTIALS_KEY);
}

function generateGuestCredentials() {
  const nonce = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  const random = Math.random().toString(36).slice(2, 8);

  return {
    email: `guest.${nonce}@example.com`,
    password: `Guest#${random}Aa1`,
  };
}

async function loginOrCreateGuestUser() {
  const savedCredentials = readGuestCredentials();

  if (savedCredentials) {
    try {
      return await loginWithEmail(savedCredentials.email, savedCredentials.password);
    } catch {
      clearGuestCredentials();
    }
  }

  const newCredentials = generateGuestCredentials();
  const user = await createUser(newCredentials.email, newCredentials.password, "Guest");
  saveGuestCredentials(newCredentials);
  return user;
}

emailInput?.addEventListener("blur", validateEmailOnBlur);
passwordInput?.addEventListener("blur", validatePasswordOnBlur);

loginGuest?.addEventListener("click", async (event) => {
  event.preventDefault();
  loginGuest.disabled = true;

  try {
    const user = await loginOrCreateGuestUser();
    persistCurrentUser(user, "Guest");
    window.location.href = "summaryUser.html";
  } catch (error) {
    showPopup(error.message || "Guest login failed.");
  } finally {
    loginGuest.disabled = false;
  }
});

passwordInput?.addEventListener("input", () => {
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
