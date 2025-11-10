import { deleteUserProfile,onAuthChange,getUsername } from "./firebase.js";
import { profileTemplate } from "../templates/profileTemplates.js";

var uid = null;
var username = null;
var profileShowMoreBtn = document.getElementById("userProfileInitialsBtn");
onAuthChange(async (user) => {
  if (user) {
    console.log("Auth state changed, user logged in:", user.uid);
    console.log("Fetching username for UID:", getUsername(user.uid));
    uid = user.uid;
    username = await getUsername(uid);
    showCurrentUserInfo();
    editProfileInitials();
  }
});

export async function showCurrentUserInfo() {
        document.getElementById("userName").textContent = await getUsername(uid);
       
}


export function setUid(currentUid) {
  user = currentUid;
    return user;
}

export function getInitials(Name) {
  if (!Name) return "";
  const names = Name.split(" ");
  let initials = names[0].charAt(0).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].charAt(0).toUpperCase();
  }
  if(initials.length===1){
    initials+=names[0].charAt(1).toUpperCase();
  }
  console.log("Initials:", initials);
  return initials;
}

export async function editProfileInitials() {
  console.log("Editing profile initials for username:", username);
  document.getElementById("nameInitials").textContent = await getInitials(username);
};

profileShowMoreBtn.addEventListener("click", function () {
  document.getElementById("profileShowMore").innerHTML = profileTemplate;
  document.getElementById("profileShowMore").classList.toggle("d-none");
});
