import { deleteUserProfile,onAuthChange,getUsername } from "./firebase.js";

var uid = null;
var username = null;
onAuthChange((user) => {
  if (user) {
    console.log("Auth state changed, user logged in:", user.uid);
    console.log("Fetching username for UID:", getUsername(user.uid));
    uid = user.uid;
    username = user.username;
    showCurrentUserInfo();
  }
});

export async function showCurrentUserInfo() {
        document.getElementById("userName").textContent = await getUsername(uid);
       
}


export function setUid(currentUid) {
  user = currentUid;
    return user;
}