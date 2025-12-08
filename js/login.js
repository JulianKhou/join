import {loginWithEmail, signInWithGoogle } from "./firebase.js";

var emailInput = document.getElementById("emailInput");
var passwordInput = document.getElementById("passwordInput");
var loginBtn = document.getElementById("loginBtn");

var googleLoginBtn = document.getElementById("googleLoginBtn");
googleLoginBtn.addEventListener("click", function(event) {
    event.preventDefault();
    signInWithGoogle()
        .then((user) => {
            // Save user to localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                username: user.displayName || user.email.split('@')[0]
            }));
            window.location.href = "summaryUser.html";
        })
        .catch((error) => {
            if (error) {
                alert(error.message);
            }
        });
});


var loginGuest= document.getElementById("guestLoginBtn");
loginGuest.addEventListener("click", function(event) {
    event.preventDefault();
    const guestEmail = "guest@example.com";
    const guestPassword = "Guestpassword#1";

    loginWithEmail(guestEmail, guestPassword).then((user) => {
        // Save guest user to localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            username: 'Guest'
        }));
        window.location.href = "summaryUser.html";
    }).catch((error) => {
        alert(error.message);
    });

}); 

// --------- ELEMENTE ---------
const passwordInput = document.getElementById("passwordInput");
const confirmInput = document.getElementById("confirmInput");

// Icons für Passwort
const passwordIconImg = passwordInput.nextElementSibling.querySelector("img");
const confirmIconImg = confirmInput.nextElementSibling.querySelector("img");

const lockIcon = "./assets/LogIn&SignUp/lock.svg";
const visibilityIcon = "./assets/LogIn&SignUp/visibility.svg";
const visibilityOffIcon = "./assets/LogIn&SignUp/visibility_off.svg";

// --------- ICON / SICHTBARKEIT LOGIK ---------
function setupPasswordToggle(inputEl, iconImg) {
    // Wenn der Benutzer etwas eingibt → Auge
    inputEl.addEventListener("input", () => {
        if (inputEl.value.length > 0) {
            iconImg.src = visibilityIcon;
        } else {
            iconImg.src = lockIcon;
            inputEl.type = "password";
        }
    });

    // Klick auf Icon → Passwort sichtbar/unsichtbar
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

// Anwenden auf beide Felder
setupPasswordToggle(passwordInput, passwordIconImg);
setupPasswordToggle(confirmInput, confirmIconImg);

loginBtn.addEventListener("click", function(event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const errorBox = document.getElementById("loginError");

    errorBox.textContent = "";

    loginWithEmail(email, password).then((user) => {

        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            username: user.displayName || user.email.split('@')[0]
        }));

        window.location.href = "summaryUser.html";

    }).catch((error) => {

        switch (error.code) {
            default:
                errorBox.textContent = "" + error.message;
        }

    });
});

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("loginBtn").click();
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    loginBtn.click();
});
