import { createUser as signUp } from "../firebase.js";

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", handleSignup);
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const privacyCheck = document.getElementById("privacyPolicy")?.checked;

  if (!privacyCheck) {
    alert("Please accept the Privacy Policy.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  signUp(email, password, name)
    .then(() => {
      window.location.href = "logIn.html";
    })
    .catch((error) => {
      alert("Signup failed: " + error.message);
    });
}
