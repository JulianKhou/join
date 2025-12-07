import {loginWithEmail, signInWithGoogle } from "./firebase.js";

var emailInput = document.getElementById("emailInput");
var passwordInput = document.getElementById("passwordInput");
var loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function(event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    loginWithEmail(email, password).then((user) => {
        // Save user to localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            username: user.displayName || user.email.split('@')[0]
        }));
        window.location.href = "summaryUser.html";
    }).catch((error) => {
        alert(error.message);
    });
});


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
