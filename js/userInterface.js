import { login,createUser,signInWithGoogle } from "./firebase.js";


var loginButton = document.getElementById("login");
loginButton.addEventListener("click",async function(){
    console.log("button pressed");
  console.log(getEmail());
  console.log(getPassword());
 await createUser(getEmail(),getPassword());
});


function getEmail(){
    return document.getElementById("email").value;
}

function getPassword(){
    return document.getElementById("password").value;

}

document.getElementById("googleLogin")
  .addEventListener("click", googleLogin);


  async function googleLogin() {
    console.log("button pressed");
  const userCred= await signInWithGoogle();
  console.log(userCred);
  

}