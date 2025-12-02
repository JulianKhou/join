const lowBtn = document.getElementById("priorityLowBtn");
const lowImg = lowBtn.querySelector("img");

lowBtn.addEventListener("mouseenter", (e) => {
    e.preventDefault();
  lowImg.src = "./assets/addTask/green.svg";
});
lowBtn.addEventListener("mouseleave", (e) => {
    e.preventDefault();
  lowImg.src = "./assets/addTask/low.svg";
});

const mediumBtn = document.getElementById("priorityMediumBtn");
const mediumImg = mediumBtn.querySelector("img");

mediumBtn.addEventListener("mouseenter", (e) => {
    e.preventDefault();
  mediumImg.src = "./assets/addTask/orange.svg";
      
});
mediumBtn.addEventListener("mouseleave", (e) => {
    e.preventDefault();
  mediumImg.src = "./assets/addTask/medium.svg";
});

const urgentBtn = document.getElementById("priorityUrgentBtn");
const urgentImg = urgentBtn.querySelector("img");

urgentBtn.addEventListener("mouseenter", (e) => {
    e.preventDefault();
  urgentImg.src = "./assets/addTask/red.svg";
});
urgentBtn.addEventListener("mouseleave", (e) => {  
    e.preventDefault();
  urgentImg.src = "./assets/addTask/urgent.svg";
});
