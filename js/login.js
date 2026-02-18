import { loginWithEmail } from "./firebase.js";

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginGuest = document.getElementById("guestLoginBtn");
const errorBox = document.getElementById("loginError");

const passwordIconImg = document.getElementById("passwordIconImg");

const lockIcon = "./assets/LogIn&SignUp/lock.svg";
const visibilityIcon = "./assets/LogIn&SignUp/visibility.svg";
const visibilityOffIcon = "./assets/LogIn&SignUp/visibility_off.svg";

emailInput.addEventListener("blur", () => {
    if (!emailInput.value.includes("@")) {
        errorBox.textContent = "Please enter a valid email address.";
    } else {
        errorBox.textContent = "";
    }
});

passwordInput.addEventListener("blur", () => {
    if (passwordInput.value.length < 6) {
        errorBox.textContent = "Password must be at least 6 characters.";
    } else {
        errorBox.textContent = "";
    }
});

loginGuest.addEventListener("click", function (event) {
    event.preventDefault();

    const guestEmail = "guest@example.com";
    const guestPassword = "Guestpassword#1";

    loginWithEmail(guestEmail, guestPassword)
        .then((user) => {
            localStorage.setItem(
                "currentUser",
                JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    username: "Guest",
                })
            );

            window.location.href = "summaryUser.html";
        })
        .catch((error) => {
            alert(error.message);
        });
});

passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0) {
        passwordIconImg.src = visibilityIcon;
    } else {
        passwordIconImg.src = lockIcon;
        passwordInput.type = "password";
    }
});

passwordIconImg.addEventListener("click", () => {
    if (passwordInput.type === "password" && passwordInput.value.length > 0) {
        passwordInput.type = "text";
        passwordIconImg.src = visibilityOffIcon;
    } else {
        passwordInput.type = "password";
        passwordIconImg.src = visibilityIcon;
    }
});

loginBtn.addEventListener("click", function (event) {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    errorBox.textContent = "";

    loginWithEmail(email, password)
        .then((user) => {
            localStorage.setItem(
                "currentUser",
                JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    username:
                        user.displayName || user.email.split("@")[0],
                })
            );

            window.location.href = "summaryUser.html";
        })
        .catch((error) => {
            errorBox.textContent = "Error: " + error.message;
        });
});

const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    loginBtn.click();
});

  




