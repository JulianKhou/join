const loader = document.getElementById("loader");
const hasSeenLoader = localStorage.getItem("hasSeenLoader");

if (hasSeenLoader) {
  loader.style.display = "none";
} else {
  loader.addEventListener("animationend", (event) => {
    if (event.animationName === "loaderFadeOut") {
      loader.style.display = "none";
      localStorage.setItem("hasSeenLoader", "true");
    }
  });
}
