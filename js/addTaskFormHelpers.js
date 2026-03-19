import {
  toggleUrgentButtonOnClick,
  toggleMediumButtonOnClick,
  toggleLowButtonOnClick,
  removeClickedFromPriorityButtons,
} from "./addTaskPriorityButtons.js";

function setBorderColor(id, color = "") {
  const input = document.getElementById(id);
  if (input) input.style.borderColor = color;
}

export function applyContentLimits() {
  const titleInput = document.getElementById("taskTitle");
  const descriptionInput = document.getElementById("taskDescription");
  const subtaskInput = document.getElementById("subtasks");
  const selectInput = document.getElementById("selectedBox");

  if (titleInput) titleInput.maxLength = 80;
  if (descriptionInput) descriptionInput.maxLength = 500;
  if (subtaskInput) subtaskInput.maxLength = 120;
  if (selectInput) selectInput.maxLength = 120;
}

export function initBlurValidation({ getTitle, getDueDate, getCategory, showInfo }) {
  const titleInput = document.getElementById("taskTitle");
  const dueDateInput = document.getElementById("taskDate");
  const categoryInput = document.getElementById("categorySelect");

  titleInput?.addEventListener("blur", () => {
    if (!getTitle().trim()) {
      setBorderColor("taskTitle", "red");
      showInfo("Please enter a task title.");
      return;
    }
    setBorderColor("taskTitle");
  });

  dueDateInput?.addEventListener("blur", () => {
    if (!getDueDate()) {
      setBorderColor("taskDate", "red");
      showInfo("Please select a due date.");
      return;
    }
    setBorderColor("taskDate");
  });

  categoryInput?.addEventListener("blur", () => {
    if (!getCategory()) {
      setBorderColor("categorySelect", "red");
      showInfo("Please select a category.");
      return;
    }
    setBorderColor("categorySelect");
  });
}

export function validateTaskForm({ getTitle, getDueDate, getCategory, showInfo }) {
  const taskName = getTitle();
  const taskDate = getDueDate();
  const taskCategory = getCategory();

  setBorderColor("taskTitle");
  setBorderColor("taskDate");
  setBorderColor("categorySelect");

  let isValid = true;

  if (!taskName) {
    setBorderColor("taskTitle", "red");
    isValid = false;
  }

  if (!taskDate) {
    setBorderColor("taskDate", "red");
    isValid = false;
  }

  if (!taskCategory) {
    setBorderColor("categorySelect", "red");
    showInfo("Please select a category.");
    isValid = false;
  }

  return isValid;
}

export function resetAddTaskForm({ checkboxList, selectBox, placeholder, resetPriority }) {
  const titleInput = document.getElementById("taskTitle");
  const descriptionInput = document.getElementById("taskDescription");
  const dueDateInput = document.getElementById("taskDate");
  const subtasksList = document.getElementById("subtasksList");
  const categorySelect = document.getElementById("categorySelect");

  if (titleInput) titleInput.value = "";
  if (descriptionInput) descriptionInput.value = "";
  if (dueDateInput) dueDateInput.value = "";
  if (subtasksList) subtasksList.innerHTML = "";
  if (categorySelect) categorySelect.selectedIndex = 0;
  if (selectBox) selectBox.innerText = placeholder;

  checkboxList?.querySelectorAll(".assignedToCheckbox").forEach((cb) => {
    cb.checked = false;
  });

  resetPriority();
  setBorderColor("taskTitle");
  setBorderColor("taskDate");
  setBorderColor("categorySelect");
}

export function initPriorityButtons({ lowBtn, mediumBtn, urgentBtn, priorities, setPriority }) {
  const configs = [
    { button: lowBtn, value: priorities.low, toggle: toggleLowButtonOnClick },
    { button: mediumBtn, value: priorities.medium, toggle: toggleMediumButtonOnClick },
    { button: urgentBtn, value: priorities.urgent, toggle: toggleUrgentButtonOnClick },
  ];

  configs.forEach(({ button, value, toggle }) => {
    button?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (button.classList.contains("clicked")) {
        button.classList.remove("clicked");
        toggle(button);
        setPriority(null);
        return;
      }

      setPriority(value);
      removeClickedFromPriorityButtons();
      button.classList.add("clicked");
      toggle(button);
    });
  });
}
