const loader = document.getElementById("loader");

// Die Logo-Animation soll bei jedem Öffnen von LogIn.html abspielen,
// daher wird der zuvor gesetzte Merker (vorerst) ignoriert.
loader.addEventListener("animationend", (event) => {
  if (event.animationName === "loaderFadeOut") {
    loader.style.display = "none";
  }
});
