import {loginWithEmailAndPW, signInWithGoogle, checkRedirectResult } from "./firebase.js";

// Prüfe beim Laden der Seite, ob der Nutzer von Google zurückkommt
checkRedirectResult().then((user) => {
    if (user) {
        // Nutzer wurde erfolgreich eingeloggt, weiterleiten
        window.location.href = "summaryUser.html";
    }
});

var emailInput = document.getElementById("emailInput");
var passwordInput = document.getElementById("passwordInput");
var loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function(event) {
    event.preventDefault();
    console.log("Login button clicked");
    const email = emailInput.value;
    const password = passwordInput.value;
    console.log("Email: " + email);
    console.log("Password: " + password);

    loginWithEmailAndPW(email, password);

});


var googleLoginBtn = document.getElementById("googleLoginBtn");
googleLoginBtn.addEventListener("click", function(event) {
    event.preventDefault();
    signInWithGoogle();
});