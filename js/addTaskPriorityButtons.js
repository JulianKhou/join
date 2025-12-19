const lowBtn = document.getElementById("priorityLowBtn");
const lowImg = lowBtn?.querySelector("img");

const mediumBtn = document.getElementById("priorityMediumBtn");
const mediumImg = mediumBtn?.querySelector("img");

const urgentBtn = document.getElementById("priorityUrgentBtn");
const urgentImg = urgentBtn?.querySelector("img");

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
    document.getElementById("priorityUrgentBtn"),
  ];
  priorityButtons.forEach((button) => {
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
