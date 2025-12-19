import { getContacts, addEditTask } from "./firebase.js";
import { initOutsideClickHandler } from "./utility.js";
import {
  toggleUrgentButtonOnClick,
  toggleMediumButtonOnClick,
  toggleLowButtonOnClick,
  removeClickedFromPriorityButtons,
} from "./addTaskPriorityButtons.js";

import {
  addContactsToAssignTask,
  checkCheckboxChanges,
  setContactsList,
  getSelectedAssignedTo,
  clearAssignedToSelection,
  resetAssignToSelectBox,
} from "./pages/addTask/contacts.js";

import {
  initSubtaskEventListeners,
  getSubtasksList,
  clearSubtasksList,
} from "./pages/addTask/subtasks.js";

import {
  addCategoryOptionsTask,
  getCategoryTask,
  validateTaskForm,
  resetCategorySelection,
  clearTitleInput,
  clearDescriptionInput,
  clearDueDateInput,
  removeRedBorderTaskName,
  removeRedBorderTaskDate,
  removeRedBorderTaskCategory,
} from "./pages/addTask/form.js";

const PRIORITY = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  URGENT: "Urgant",
});

let selectedPriority = PRIORITY.MEDIUM;
let contactsList = [];

// DOM Elements (assigned in DOMContentLoaded)
let priorityUrgentBtn, priorityMediumBtn, priorityLowBtn;

document.addEventListener("DOMContentLoaded", async () => {
  contactsList = await getContacts();
  setContactsList(contactsList);

  const addTaskBtn = document.getElementById("addTaskBtn");
  const cancelTaskBtn = document.getElementById("cancelTaskBtn");

  priorityUrgentBtn = document.getElementById("priorityUrgentBtn");
  priorityMediumBtn = document.getElementById("priorityMediumBtn");
  priorityLowBtn = document.getElementById("priorityLowBtn");

  addTaskBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;
    createTaskObject();
    // Logic to redirect or show success could go here
    window.location.href = "board.html";
  });

  cancelTaskBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    resetAddTaskForm();
  });

  // Initialize Priority Buttons
  initPriorityEventListeners();

  // Default: Medium active
  if (priorityMediumBtn) {
    priorityMediumBtn.classList.add("clicked");
    toggleMediumButtonOnClick(priorityMediumBtn);
  }

  // Dropdown "Click Outside" Logic for Contacts
  const selectBox = document.getElementById("selectedBox");
  const checkboxList = document.getElementById("chooseContactsCheckboxList");
  if (selectBox && checkboxList) {
    selectBox.addEventListener("click", () => {
      const wasHidden =
        checkboxList.style.display === "none" || !checkboxList.style.display;
      checkboxList.style.display = wasHidden ? "flex" : "none"; // CSS usually flex
      if (wasHidden) {
        initOutsideClickHandler(
          selectBox,
          () => {
            checkboxList.style.display = "none";
          },
          [checkboxList]
        );
      }
    });
    // Filter input logic
    selectBox.addEventListener("input", () => {
      addContactsToAssignTask(contactsList, selectBox.value);
      checkCheckboxChanges();
    });
  }

  // Init Modules
  await addContactsToAssignTask(contactsList);
  checkCheckboxChanges();
  addCategoryOptionsTask();
  initSubtaskEventListeners();
});

function initPriorityEventListeners() {
  if (priorityLowBtn) {
    priorityLowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (priorityLowBtn.classList.contains("clicked")) {
        priorityLowBtn.classList.remove("clicked");
        toggleLowButtonOnClick(priorityLowBtn);
        selectedPriority = null;
      } else {
        selectedPriority = PRIORITY.LOW;
        removeClickedFromPriorityButtons();
        priorityLowBtn.classList.add("clicked");
        toggleLowButtonOnClick(priorityLowBtn);
      }
    });
  }
  if (priorityMediumBtn) {
    priorityMediumBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (priorityMediumBtn.classList.contains("clicked")) {
        priorityMediumBtn.classList.remove("clicked");
        toggleMediumButtonOnClick(priorityMediumBtn);
        selectedPriority = null;
      } else {
        selectedPriority = PRIORITY.MEDIUM;
        removeClickedFromPriorityButtons();
        priorityMediumBtn.classList.add("clicked");
        toggleMediumButtonOnClick(priorityMediumBtn);
      }
    });
  }
  if (priorityUrgentBtn) {
    priorityUrgentBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (priorityUrgentBtn.classList.contains("clicked")) {
        priorityUrgentBtn.classList.remove("clicked");
        toggleUrgentButtonOnClick(priorityUrgentBtn);
        selectedPriority = null;
      } else {
        selectedPriority = PRIORITY.URGENT;
        removeClickedFromPriorityButtons();
        priorityUrgentBtn.classList.add("clicked");
        toggleUrgentButtonOnClick(priorityUrgentBtn);
      }
    });
  }
}

function resetAddTaskForm() {
  clearTitleInput();
  clearDescriptionInput();
  clearDueDateInput();
  clearSubtasksList();
  clearAssignedToSelection();
  resetPrioritySelection();
  resetCategorySelection();
  resetAssignToSelectBox();
  removeRedBorderTaskName();
  removeRedBorderTaskDate();
  removeRedBorderTaskCategory();
}

function resetPrioritySelection() {
  selectedPriority = PRIORITY.MEDIUM;
  removeClickedFromPriorityButtons();
  if (priorityMediumBtn) {
    priorityMediumBtn.classList.add("clicked");
    toggleMediumButtonOnClick(priorityMediumBtn);
  }
}

function createTaskObject() {
  const titleVal = document.getElementById("taskTitle").value;
  const descVal = document.getElementById("taskDescription").value;
  const dateVal = document.getElementById("taskDate").value;

  const task = {
    title: titleVal,
    description: descVal,
    dueDate: dateVal,
    priority: selectedPriority || PRIORITY.MEDIUM,
    assignedTo: getSelectedAssignedTo(),
    category: getCategoryTask(),
    subtasks: getSubtasksList(),
    createdAt: new Date().toISOString(),
    progress: "toDo", // Default state
  };

  // Using firebase function
  addEditTask(task);
  return task;
}
