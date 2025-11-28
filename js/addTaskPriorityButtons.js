const lowBtn = document.getElementById("priorityLowBtn");
const lowImg = lowBtn.querySelector("img");

lowBtn.addEventListener("mouseenter", () => {
  lowImg.src = "./assets/addTask/green.svg";
});
lowBtn.addEventListener("mouseleave", () => {
  lowImg.src = "./assets/addTask/low.svg";
});

const mediumBtn = document.getElementById("priorityMediumBtn");
const mediumImg = mediumBtn.querySelector("img");

mediumBtn.addEventListener("mouseenter", () => {
  mediumImg.src = "./assets/addTask/orange.svg";
});
mediumBtn.addEventListener("mouseleave", () => {
  mediumImg.src = "./assets/addTask/medium.svg";
});

const urgentBtn = document.getElementById("priorityUrgentBtn");
const urgentImg = urgentBtn.querySelector("img");

urgentBtn.addEventListener("mouseenter", () => {
  urgentImg.src = "./assets/addTask/red.svg";
});
urgentBtn.addEventListener("mouseleave", () => {
  urgentImg.src = "./assets/addTask/urgent.svg";
});
