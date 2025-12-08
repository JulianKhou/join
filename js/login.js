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

const passwordInputEl = document.getElementById("passwordInput");
const passwordIconImg = document.getElementById("passwordIconImg");

const lockIcon = "./assets/LogIn&SignUp/lock.svg";
const visibilityIcon = "./assets/LogIn&SignUp/visibility.svg";
const visibilityOffIcon = "./assets/LogIn&SignUp/visibility_off.svg";


passwordInputEl.addEventListener("input", () => {
    if (passwordInputEl.value.length > 0) {
        passwordIconImg.src = visibilityIcon;
    } else {
        passwordIconImg.src = lockIcon;
        passwordInputEl.type = "password"; 
    }
});

passwordIconImg.addEventListener("click", () => {
    if (passwordInputEl.type === "password" && passwordInputEl.value.length > 0) {
        passwordInputEl.type = "text";                   
        passwordIconImg.src = visibilityOffIcon;         
    } else {
        passwordInputEl.type = "password";                 
        passwordIconImg.src = visibilityIcon;              
    }
});

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
                errorBox.textContent = "Error: " + error.message;
        }

    });
});

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("loginBtn").click();
});

form.addEventListener("submit", (e) => {
    e.preventDefault(); // verhindert Browser-Fehler
    loginBtn.click();
});
