import { showPopup } from "./feedback.js";

export function isValidEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && !email.includes("..");
}

export function configureContactFormValidation(nameInput, emailInput, phoneInput) {
  if (!nameInput || !emailInput || !phoneInput) return;

  nameInput.maxLength = 50;
  emailInput.maxLength = 120;
  phoneInput.maxLength = 30;

  nameInput.addEventListener("blur", () => {
    if (nameInput.value.trim().length >= 2) {
      nameInput.style.borderColor = "";
      return;
    }

    nameInput.style.borderColor = "red";
    showPopup("Please enter a contact name.", "info");
  });

  emailInput.addEventListener("blur", () => {
    if (isValidEmail(emailInput.value.trim())) {
      emailInput.style.borderColor = "";
      return;
    }

    emailInput.style.borderColor = "red";
    showPopup("Please enter a valid email address.", "info");
  });

  phoneInput.addEventListener("blur", () => {
    const phone = phoneInput.value.trim();
    if (phone.length === 0 || phone.length >= 5) {
      phoneInput.style.borderColor = "";
      return;
    }

    phoneInput.style.borderColor = "red";
    showPopup("Phone number is too short.", "info");
  });
}

export function getAddContactFormValues() {
  const name = document.getElementById("AddContactNameInput")?.value.trim() || "";
  const email = document.getElementById("AddContactEmailInput")?.value.trim() || "";
  const phoneNumber = document.getElementById("AddContactPhoneNumberInput")?.value.trim() || "";

  return { name, email, phoneNumber };
}
