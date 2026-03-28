let percent = 0;

const percentText = document.getElementById("percent-text");
const progressBar = document.getElementById("progress-bar");
const loader = document.getElementById("loader");

const hasSeenLoader = localStorage.getItem("hasSeenLoader");

if (!hasSeenLoader) {
  const interval = setInterval(() => {
    percent++;

    percentText.textContent = percent + "%";

    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (percent / 100) * circumference;
    progressBar.style.strokeDashoffset = offset;

    if (percent >= 100) {
      clearInterval(interval);

      setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.transition = "opacity 0.5s ease";

        setTimeout(() => {
          loader.style.display = "none";
          
          localStorage.setItem("hasSeenLoader", "true");
        }, 500);
      }, 300);
    }

  }, 8);

} else {
  loader.style.display = "none";
}