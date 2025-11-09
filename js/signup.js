import {createUser} from "./firebase.js";
var signUpBtn= document.getElementById("signUpBtn");


signUpBtn.addEventListener("click",function(event){
    event.preventDefault(); // Verhindert das Standard-Formularverhalten
    console.log("Sign Up button clicked");
    console.log("Email: "+getEmailInput());
    console.log(checkCorrectPassword());
    if(checkCorrectPassword()){
        createUser(getEmailInput(),getPasswordInput())
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
        console.log("Password and confirm password do not match");
    }else if(!checkLengthPassword(password)){
        console.log("Password must be at least 6 characters long");
    }else if(!checkCApitalLetter(password)){
        console.log("Password must contain at least one capital letter");
    }else if(!checkLowerCaseLetter(password)){
        console.log("Password must contain at least one lowercase letter");
    }else if(!checkSpecialCharacter(password)){
        console.log("Password must contain at least one special character");
    }else if(!checkIfPrivacyChecked()){
        console.log("You must accept the privacy policy");
    }else{
        return true;
    }
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

