import {loginWithEmail, signInWithGoogle } from "./firebase.js";
import { setUid } from "./userInterface.js";

var emailInput = document.getElementById("emailInput");
var passwordInput = document.getElementById("passwordInput");
var loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function(event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    loginWithEmail(email, password).then(() => {
        window.location.href = "summaryUser.html";
    }).catch((error) => {
        alert(error.message);
    });

});


var googleLoginBtn = document.getElementById("googleLoginBtn");
googleLoginBtn.addEventListener("click", function(event) {
    event.preventDefault();
    signInWithGoogle()
        .then(() => {
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
    // Use predefined guest credentials
    const guestEmail = "guest@example.com";
    const guestPassword = "Guestpassword#1";

    loginWithEmail(guestEmail, guestPassword).then(() => {
        window.location.href = "summaryUser.html";

    }).catch((error) => {
        alert(error.message);
    });
});