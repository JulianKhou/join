import {createUser} from "./firebase.js";

// ← KEINE onAuthStateChanged hier!

var signUpBtn= document.getElementById("signUpBtn");

signUpBtn.addEventListener("click",function(event){
    event.preventDefault(); // Verhindert das Standard-Formularverhalten

    if(checkCorrectPassword()){
        createUser(getEmailInput(),getPasswordInput(),getUsernameInput())
            .then((user) => {
                console.log("Registration successful!");
                // Formular leeren nach erfolgreicher Registrierung
                event.target.closest('form').reset();
                // Optional: Weiterleitung zum Login
                alert("Registrierung erfolgreich! Du kannst dich jetzt einloggen.");
                window.location.href = "logIn.html";
            })
            .catch((error) => {
                console.error("Registration failed:", error);
                alert("Registrierung fehlgeschlagen: " + error.message);
            });
    } else {
        // Password validation failed — don't proceed
        console.log("Form validation failed, not submitting");
    }
});



function getEmailInput(){
    return document.getElementById("emailInput").value;
}
function getPasswordInput(){
    return document.getElementById("passwordInput").value;
}
function getConfirmPasswordInput(){
    return document.getElementById("confirmInput").value;
}
function getUsernameInput(){
    return document.getElementById("nameInput").value;
}



function checkCorrectPassword(){
    const password= getPasswordInput();
    const confirmPassword= getConfirmPasswordInput();
    
    if(!checkPasswordMatch(password,confirmPassword)){
        alert("Password and confirm password do not match");
        return false; // ← wichtig!
    }
    if(!checkLengthPassword(password)){
        alert("Password must be at least 6 characters long");
        return false;
    }
    if(!checkCApitalLetter(password)){
        alert("Password must contain at least one capital letter");
        return false;
    }
    if(!checkLowerCaseLetter(password)){
        alert("Password must contain at least one lowercase letter");
        return false;
    }
    if(!checkSpecialCharacter(password)){
        alert("Password must contain at least one special character");
        return false;
    }
    if(!checkIfPrivacyChecked()){
        alert("You must accept the privacy policy");
        return false;
    }
    
    return true; // ← alle Checks bestanden
}

function checkPasswordMatch(password,confirmPassword){
    return password===confirmPassword;
}
function checkLengthPassword(password){
    return password.length>=6;
}
function checkCApitalLetter(password){
        return /[A-Z]/.test(password);
}
function checkLowerCaseLetter(password){
    return /[a-z]/.test(password);
}
function checkSpecialCharacter(password){
    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
}
function checkIfPrivacyChecked(){
    return document.getElementById("privacyCheck").checked;
}

