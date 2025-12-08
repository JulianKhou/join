const lowBtn = document.getElementById("priorityLowBtn");
const lowImg = lowBtn?.querySelector("img");

if (lowBtn && lowImg) {
  lowBtn.addEventListener("mouseenter", () => {
    if (!lowBtn.classList.contains("clicked")) {
      lowImg.src = "./assets/addTask/green.svg";
    }
  });
  lowBtn.addEventListener("mouseleave", () => {
    if (!lowBtn.classList.contains("clicked")) {
      lowImg.src = "./assets/addTask/low.svg";
    }
  });
}

const mediumBtn = document.getElementById("priorityMediumBtn");
const mediumImg = mediumBtn?.querySelector("img");

if (mediumBtn && mediumImg) {
  mediumBtn.addEventListener("mouseenter", () => {
    if (!mediumBtn.classList.contains("clicked")) {
      mediumImg.src = "./assets/addTask/orange.svg";
    }
  });
  mediumBtn.addEventListener("mouseleave", () => {
    if (!mediumBtn.classList.contains("clicked")) {
      mediumImg.src = "./assets/addTask/medium.svg";
    }
  });
}

const urgentBtn = document.getElementById("priorityUrgentBtn");
const urgentImg = urgentBtn?.querySelector("img");

if (urgentBtn && urgentImg) {
  urgentBtn.addEventListener("mouseenter", () => {
    if (!urgentBtn.classList.contains("clicked")) {
      urgentImg.src = "./assets/addTask/red.svg";
    }
  });
  urgentBtn.addEventListener("mouseleave", () => {
    if (!urgentBtn.classList.contains("clicked")) {
      urgentImg.src = "./assets/addTask/urgent.svg";
    }
  });
}

// ✅ Toggle button state and update icon
export function toggleUrgentButtonOnClick(button) {
  const img = button?.querySelector("img");
  if (img) {
    img.src = button.classList.contains("clicked") 
      ? "./assets/addTask/red.svg" 
      : "./assets/addTask/urgent.svg";
  }
}

export function toggleMediumButtonOnClick(button) {
  const img = button?.querySelector("img");
  if (img) {
    img.src = button.classList.contains("clicked") 
      ? "./assets/addTask/orange.svg" 
      : "./assets/addTask/medium.svg";
  }
}

export function toggleLowButtonOnClick(button) {
  const img = button?.querySelector("img");
  if (img) {
    img.src = button.classList.contains("clicked") 
      ? "./assets/addTask/green.svg" 
      : "./assets/addTask/low.svg";
  }
}
export function removeClickedFromPriorityButtons() {
  const priorityButtons = [
    document.getElementById("priorityLowBtn"),
    document.getElementById("priorityMediumBtn"),
    document.getElementById("priorityUrgentBtn")
  ];
  priorityButtons.forEach(button => {
    if (button && button.classList.contains("clicked")) {
      button.classList.remove("clicked");
      // Update icon accordingly  
      if (button.id === "priorityLowBtn") {
        toggleLowButtonOnClick(button);
      } else if (button.id === "priorityMediumBtn") {
        toggleMediumButtonOnClick(button);
      } else if (button.id === "priorityUrgentBtn") {
        toggleUrgentButtonOnClick(button);
      }
    }
  });
}

