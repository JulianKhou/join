import {
  loginWithEmail as login,
  signInWithGoogle,
  createUser,
} from "../firebase.js";

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
  const guestEmail = "guest@join.com";
  const guestPassword = "Guest1234!";

  login(guestEmail, guestPassword)
    .then((user) => {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ uid: user.uid, email: user.email, username: "Guest" })
      );
      window.location.href = "summaryUser.html";
    })
    .catch((error) => {
      console.warn("Guest login failed, attempting fallback...", error);

      const errorMsg = error.message || "";

      // Fallback: Create the guest account if it doesn't exist
      // firebase.js throws "User not found." check for that string
      if (
        errorMsg.includes("User not found") ||
        errorMsg.includes("not found")
      ) {
        createUser(guestEmail, guestPassword, "Guest")
          .then((user) => {
            localStorage.setItem(
              "currentUser",
              JSON.stringify({
                uid: user.uid,
                email: user.email,
                username: "Guest",
              })
            );
            alert("Guest account created! Logging in...");
            window.location.href = "summaryUser.html";
          })
          .catch((createError) => {
            console.error("Failed to create guest account:", createError);
            // Try a random guest if the main one is bricked?
            // For now just show error
            alert("Guest Creation Error: " + createError.message);
          });
      } else if (errorMsg.includes("Incorrect password")) {
        alert(
          "Error: The Guest User exists but the password 'guest1234' is wrong. Please delete the user 'guest@join.com' in Firebase manually or contact admin."
        );
      } else {
        // Show the exact error so user can report it
        alert("Guest Login Error: " + errorMsg);
      }
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
