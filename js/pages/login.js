import { loginWithEmail as login, signInWithGoogle } from "../firebase.js";

const loginForm = document.getElementById("loginForm");
const guestLoginBtn = document.getElementById("guestLoginBtn");
const googleLoginBtn = document.getElementById("googleLoginBtn");

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in?
  // Usually handled by firebase auto-auth, but here we set listeners.
});

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

if (guestLoginBtn) {
  guestLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    guestLogin();
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleGoogleLogin();
  });
}

function handleLogin(e) {
  e.preventDefault();
  // Correct IDs match HTML: emailInput, passwordInput
  const emailEl = document.getElementById("emailInput");
  const passwordEl = document.getElementById("passwordInput");

  if (!emailEl || !passwordEl) {
    console.error("Input elements not found");
    return;
  }

  const email = emailEl.value;
  const password = passwordEl.value;

  login(email, password)
    .then((user) => {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ uid: user.uid, email: user.email })
      );
      window.location.href = "summaryUser.html";
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
}

function guestLogin() {
  login("guest@join.com", "guest1234")
    .then((user) => {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ uid: user.uid, email: user.email, username: "Guest" })
      );
      window.location.href = "summaryUser.html";
    })
    .catch((error) => {
      console.error("Guest login failed:", error);
      alert("Guest login failed. Please try again or sign up.");
      // Do NOT redirect on failure, that causes the loop!
    });
}

function handleGoogleLogin() {
  signInWithGoogle()
    .then((user) => {
      console.log("Google login success:", user);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        })
      );
      window.location.href = "summaryUser.html";
    })
    .catch((error) => {
      console.error("Google login failed:", error);
      alert("Google Sign-In failed: " + error.message);
    });
}
