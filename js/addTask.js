import { getContacts, addEditTask, getContact } from "./firebase.js";
import {
  addAssignedToBarTask,
} from "../templates/addTaskTemplates.js";
import {
  getInitials,
  initOutsideClickHandler,
  returnContactById,
} from "./utility.js";
import {
  applyContentLimits,
  initBlurValidation,
  validateTaskForm,
  resetAddTaskForm,
  initPriorityButtons,
} from "./addTaskFormHelpers.js";
import { getSubtasksList, initSubtaskEventListeners } from "./addTaskSubtasks.js";
import { iconTemplate } from "../templates/profileTemplates.js";
import { showPopup } from "./feedback.js";

const PRIORITY = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  URGENT: "Urgent",
});
let selectedPriority = PRIORITY.MEDIUM;

let priorityUrgentBtn;
let priorityMediumBtn;
let priorityLowBtn;
let selectBox;
let checkboxList;
let contactsList = [];
const ASSIGNED_TO_PLACEHOLDER = "Select contacts to assign";

// On DOM ready: set up UI, attach handlers and load contacts.
document.addEventListener("DOMContentLoaded", async () => {
    const dateInput = document.getElementById("taskDate");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }
  const form = document.querySelector(".add-task-form");
  if (form) form.noValidate = true;
  const addTaskBtn = document.getElementById("addTaskBtn");
  const cancelTaskBtn = document.getElementById("cancelTaskBtn");

  priorityUrgentBtn = document.getElementById("priorityUrgentBtn");
  priorityMediumBtn = document.getElementById("priorityMediumBtn");
  priorityLowBtn = document.getElementById("priorityLowBtn");
  selectBox = document.getElementById("selectedBox");
  checkboxList = document.getElementById("chooseContactsCheckboxList");

  // âœ… Initialize outside click handler ONCE
  if (selectBox && checkboxList) {
    selectBox.addEventListener("click", (e) => {
      const wasVisible = checkboxList.style.display === "flex";
      checkboxList.style.display = wasVisible ? "none" : "flex";
      selectBox.closest(".multi-select")?.classList.toggle("open", !wasVisible);

      // Only init outside click handler when OPENING the list
      if (!wasVisible) {
        initOutsideClickHandler(
          selectBox, // target: clicks on this are "inside"
          () => {
            // onClose callback
            checkboxList.style.display = "none";
            selectBox.closest(".multi-select")?.classList.remove("open");
          },
          [checkboxList] // ignore: also treat clicks on list as "inside"
        );
      }
    });

    // Filter contacts while typing
    selectBox.addEventListener("input", () => {
      const searchTerm = selectBox.value;

      addContactsToAssignTask(contactsList, searchTerm);
      checkCheckboxChanges();
    });
  }

  addTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (!validateTaskForm({
      getTitle: getTitleTask,
      getDueDate: getDueDateTask,
      getCategory: getCategoryTask,
    })) {
      return;
    }
    createTaskObject();
  });
  cancelTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetTaskFormState();
  });

  applyContentLimits();
  initBlurValidation({
    getTitle: getTitleTask,
    getDueDate: getDueDateTask,
    getCategory: getCategoryTask,
  });
  addCategoryOptionsTask();
  defaultCategoryOnMobile();
  initSubtaskEventListeners();
  initPriorityButtons({
    lowBtn: priorityLowBtn,
    mediumBtn: priorityMediumBtn,
    urgentBtn: priorityUrgentBtn,
    priorities: {
      low: PRIORITY.LOW,
      medium: PRIORITY.MEDIUM,
      urgent: PRIORITY.URGENT,
    },
    setPriority: (value) => {
      selectedPriority = value;
    },
  });
  await loadAddTaskContacts();
});

async function loadAddTaskContacts() {
  try {
    contactsList = await getContacts();
  } catch {
    contactsList = [];
    showPopup("Contacts could not be loaded right now.", "info");
  }

  addContactsToAssignTask(contactsList);
  checkCheckboxChanges();
}

// Insert contact options into the assign-to checkbox list.
// If filterString is provided, only show contacts matching the name (case-insensitive)
// Current user appears first in the list
function addContactsToAssignTask(contacts, filterString = "") {
  const assignedSelect = document.getElementById("chooseContactsCheckboxList");
  if (!assignedSelect) return;

  // Clear existing options before re-rendering
  assignedSelect.innerHTML = "";

  // Filter contacts if search string provided
  const filteredContacts = filterString.trim()
    ? contacts.filter((contact) =>
        contact?.name?.toLowerCase().includes(filterString.toLowerCase())
      )
    : contacts;

  // âœ… Sort: current user first, then alphabetically
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const sortedContacts = filteredContacts.sort((a, b) => {
    // Current user comes first
    if (currentUser && a.id === currentUser.uid) return -1;
    if (currentUser && b.id === currentUser.uid) return 1;

    // Then sort alphabetically by name
    return (a.name || "").localeCompare(b.name || "");
  });

  sortedContacts.forEach((contact) => {
    if (!contact?.id || !contact?.name) return;
    // âœ… Add (YOU) label for current user
    const isCurrentUser = currentUser && contact.id === currentUser.uid;
    const displayName = isCurrentUser ? `${contact.name} (You)` : contact.name;

    const option = addAssignedToBarTask(
      displayName, // â† use modified name
      contact.id,
      iconTemplate(
        getInitials(contact.name),
        contact.color,
        "assignedToCheckboxIcon"
      )
    );

    // if function returns a string of HTML, insert as HTML; if Node, append
    if (typeof option === "string") {
      assignedSelect.insertAdjacentHTML("beforeend", option);
    } else if (option instanceof Node) {
      assignedSelect.appendChild(option);
    } else {
      return;
    }
  });

  // Show "No results" message if nothing found
  if (filteredContacts.length === 0) {
    assignedSelect.innerHTML =
      '<div class="no-results">No contacts found</div>';
  }
}

// Return the task title input value.
function getTitleTask() {
  const titleTask = document.getElementById("taskTitle").value;
  return titleTask;
}

// Return the task description input value.
function getDescriptionTask() {
  const descriptionTask = document.getElementById("taskDescription").value;
  return descriptionTask;
}

// Return the task due date input value.
function getDueDateTask() {
  const dueDateTask = document.getElementById("taskDate").value;

  return dueDateTask;
}

// Return the currently selected priority.
function getPriorityTask() {
  return selectedPriority;
}

// Wire change handlers for assign-to checkboxes and update the select box text + icons.
function checkCheckboxChanges() {
  if (!checkboxList || !selectBox) return;
  const checkboxes = checkboxList.querySelectorAll(".assignedToCheckbox");
  const selectedNamesIconContainer = document.getElementById("assignedIcons");

  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      // Update select box text
      const selected = [...checkboxes]
        .filter((cb) => cb.checked)
        .map((cb) => returnContactById(cb.value, contactsList)?.name)
        .filter(Boolean);

      selectBox.innerText = selected.length
        ? selected.join(", ")
        : ASSIGNED_TO_PLACEHOLDER;

      // âœ… Update icons container
      updateAssignedIcons(selectedNamesIconContainer, checkboxes);
    });
  });
}

// Update the icons container based on checked checkboxes
function updateAssignedIcons(container, checkboxes) {
  if (!container) return;

  // Clear existing icons
  container.innerHTML = "";

  // Add icon for each checked checkbox
  [...checkboxes]
    .filter((cb) => cb.checked)
    .forEach((cb) => {
      const contact = returnContactById(cb.value, contactsList);
      if (contact) {
        const icon = iconTemplate(
          getInitials(contact.name),
          contact.color,
          "assignedToContainerChecked" // CSS class for styling
        );

        // Insert icon (handle both string and Node)
        if (typeof icon === "string") {
          container.insertAdjacentHTML("beforeend", icon);
        } else if (icon instanceof Node) {
          container.appendChild(icon);
        }
      }
    });
}

function getSelectedAssignedTo() {
  if (!checkboxList) return [];
  const checkboxes = checkboxList.querySelectorAll(".assignedToCheckbox");
  const selectedIds = [...checkboxes]
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);
  return selectedIds;
}

const CATEGORY = Object.freeze({
  TECHTASK: "Technical Task",
  USERSTORY: "User Story",
});
// Populate category select with options.
function addCategoryOptionsTask() {
  const categorySelect = document.getElementById("categorySelect");
  for (const key in CATEGORY) {
    const option = document.createElement("option");
    option.value = CATEGORY[key];
    option.text = CATEGORY[key];
    categorySelect.appendChild(option);
  }
}

function defaultCategoryOnMobile() {
  if (window.innerWidth > 768) return;
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect) return;
  categorySelect.value = CATEGORY.TECHTASK;
}

function getCategoryTask() {
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect.value === "Select task category") {
    return "";
  }
  return categorySelect.value;
}

// Build task object from inputs and send to firebase handler.
async function createTaskObject() {
  const task = {
    title: getTitleTask(),
    description: getDescriptionTask(),
    dueDate: getDueDateTask(),
    priority: getPriorityTask(),
    assignedTo: getSelectedAssignedTo(),
    category: getCategoryTask(),
    subtasks: getSubtasksList(),
  };

  const addTaskBtn = document.getElementById("addTaskBtn");
  if (addTaskBtn) addTaskBtn.style.pointerEvents = "none";

  try {
    await addEditTask(task);
    showPopup("Task created.", "success");
    resetTaskFormState();
  } catch (error) {
    showPopup(error.message || "Task could not be created.");
    throw error;
  } finally {
    if (addTaskBtn) addTaskBtn.style.pointerEvents = "";
  }

  return task;
}
function resetPrioritySelection() {
  selectedPriority = PRIORITY.MEDIUM;
}

function resetTaskFormState() {
  resetAddTaskForm({
    checkboxList,
    selectBox,
    placeholder: ASSIGNED_TO_PLACEHOLDER,
    resetPriority: resetPrioritySelection,
  });
}




