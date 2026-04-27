import { createUser } from "./firebase.js";
import { showPopup } from "./feedback.js";

const form = document.querySelector("form");
const signUpBtn = document.getElementById("signUpBtn");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const confirmInput = document.getElementById("confirmInput");
const privacyCheck = document.getElementById("privacyCheck");

const errorBox = document.getElementById("loginError");

const passwordIconImg = passwordInput.nextElementSibling.querySelector("img");
const confirmIconImg = confirmInput.nextElementSibling.querySelector("img");

const lockIcon = "./assets/LogIn&SignUp/lock.svg";
const visibilityIcon = "./assets/LogIn&SignUp/visibility.svg";
const visibilityOffIcon = "./assets/LogIn&SignUp/visibility_off.svg";

if (form) form.noValidate = true;
nameInput.maxLength = 50;
emailInput.maxLength = 120;
passwordInput.maxLength = 64;
confirmInput.maxLength = 64;

nameInput.addEventListener("blur", () => {
  if (nameInput.value.trim().length < 2) {
    errorBox.textContent = "Please enter your name.";
  }
});

emailInput.addEventListener("blur", () => {
  if (!isValidEmail(emailInput.value.trim())) {
    errorBox.textContent = "Please enter a valid email address.";
  }
});

passwordInput.addEventListener("blur", () => {
  if (!validatePassword(passwordInput.value)) return;
});

confirmInput.addEventListener("blur", () => {
  if (confirmInput.value !== passwordInput.value) {
    errorBox.textContent = "Passwords do not match.";
  }
});

function setupPasswordToggle(inputEl, iconImg) {
  inputEl.addEventListener("input", () => {
    if (inputEl.value.length > 0) {
      iconImg.src = visibilityIcon;
    } else {
      iconImg.src = lockIcon;
      inputEl.type = "password";
    }
  });

  iconImg.addEventListener("click", () => {
    if (inputEl.value.length === 0) return;

    if (inputEl.type === "password") {
      inputEl.type = "text";
      iconImg.src = visibilityOffIcon;
    } else {
      inputEl.type = "password";
      iconImg.src = visibilityIcon;
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

setupPasswordToggle(passwordInput, passwordIconImg);
setupPasswordToggle(confirmInput, confirmIconImg);

signUpBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  errorBox.textContent = "";

  if (!validateForm()) {
    showPopup("Please check your sign up data.", "info");
    return;
  }

  try {
    await createUser(emailInput.value.trim(), passwordInput.value, nameInput.value.trim());
    form.reset();
    showPopup("Registration successful. You can now log in.", "success", 2200);
    setTimeout(() => {
      window.location.href = "logIn.html";
    }, 900);
  } catch (error) {
    errorBox.textContent = error.message;
    showPopup(error.message || "Registration failed.");
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  signUpBtn.click();
});

function validateForm() {
  if (nameInput.value.trim().length < 2) {
    errorBox.textContent = "Please enter your name.";
    return false;
  }

  if (!isValidEmail(emailInput.value.trim())) {
    errorBox.textContent = "Please enter a valid email address.";
    return false;
  }

  if (!validatePassword(passwordInput.value)) return false;

  if (confirmInput.value !== passwordInput.value) {
    errorBox.textContent = "Passwords do not match.";
    return false;
  }

  if (!privacyCheck.checked) {
    errorBox.textContent = "You must accept the privacy policy.";
    return false;
  }

  return true;
}

function validatePassword(password) {
  if (password.length < 6) {
    errorBox.textContent = "Password must be at least 6 characters.";
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    errorBox.textContent = "Password must contain a capital letter.";
    return false;
  }

  if (!/[a-z]/.test(password)) {
    errorBox.textContent = "Password must contain a lowercase letter.";
    return false;
  }

  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    errorBox.textContent = "Password must contain a special character.";
    return false;
  }

  return true;
}
