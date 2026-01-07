import { createUser as signUp } from "../firebase.js";

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", handleSignup);
}

/**
 * Handles the signup form submission.
 * Validates inputs, checks privacy policy, and calls firebase createUser.
 * Use preventDefault to stop page reload.
 * @param {Event} e - The submission event
 */
function handleSignup(e) {
  e.preventDefault();
  // alert("Debug: Form submitted");

  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;
  const confirmPassword = document.getElementById("confirmInput").value;
  // Privacy check already done above
  const inputs = [
    document.getElementById("nameInput"),
    document.getElementById("emailInput"),
    document.getElementById("passwordInput"),
    document.getElementById("confirmInput"),
  ];

  let isValid = true;
  inputs.forEach((input) => {
    // Remove error on input
    input.addEventListener("input", () =>
      input.classList.remove("input-error")
    );

    if (!input.value.trim()) {
      input.classList.add("input-error");
      isValid = false;
    } else {
      input.classList.remove("input-error");
    }
  });

  const msgBox = document.getElementById("loginError");
  msgBox.innerHTML = ""; // Clear previous errors

  const privacyCheck = document.getElementById("privacyCheck")?.checked;
  if (!privacyCheck) {
    msgBox.innerHTML = "Please accept the Privacy Policy.";
    return;
  }

  if (!isValid) return;

  if (password !== confirmPassword) {
    msgBox.innerHTML = "Passwords do not match.";
    document.getElementById("passwordInput").classList.add("input-error");
    document.getElementById("confirmInput").classList.add("input-error");
    return;
  }

  // alert("Debug: calling createUser...");
  signUp(email, password, name)
    .then(() => {
      // alert("Debug: createUser success! Redirecting...");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Signup failed:", error);
      // Simplify error message for user
      if (error.message.includes("password")) {
        msgBox.innerHTML = "Password is too weak (min. 6 characters).";
      } else if (error.code === "auth/email-already-in-use") {
        msgBox.innerHTML = "Email is already in use.";
      } else {
        msgBox.innerHTML = "Signup failed. Please check your data.";
      }
    });
}
