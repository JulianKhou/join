import {getContacts,addEditTask} from "./firebase.js";
import {addAssignedToBarTask,addSubTask} from '../templates/addTaskTemplates.js';
import { getInitials } from "./utility.js";

// replace top-level var queries with declarations only so functions can still access them
const PRIORITY = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
});
let selectedPriority = PRIORITY.MEDIUM; // default

// declare DOM refs here (no queries yet)
let priorityUrgentBtn;
let priorityMediumBtn;
let priorityLowBtn;
let priorityUrgentImg;
let priorityMediumImg;
let priorityLowImg;
let selectBox;
let checkboxList;

// On DOM ready: set up UI, attach handlers and load contacts.
document.addEventListener("DOMContentLoaded", async () => {
    const addTaskBtn = document.getElementById("addTaskBtn");
    const cancelTaskBtn = document.getElementById("cancelTaskBtn");

    // assign DOM refs after DOM is ready (no functionality change, just safer)
    priorityUrgentBtn = document.getElementById("priorityUrgentBtn");
    priorityMediumBtn = document.getElementById("priorityMediumBtn");
    priorityLowBtn = document.getElementById("priorityLowBtn");
    priorityUrgentImg = document.getElementById("priorityUrgentImg");
    priorityMediumImg = document.getElementById("priorityMediumImg");
    priorityLowImg = document.getElementById("priorityLowImg");
    selectBox = document.getElementById("selectedBox");
    checkboxList = document.getElementById("chooseContactsCheckboxList");

    // attach listeners that relied on those refs (moved here to ensure elements exist)
    if (selectBox && checkboxList) {
      selectBox.addEventListener("click", () => {
        checkboxList.style.display =
          checkboxList.style.display === "block" ? "none" : "block";
      });
    }

    addTaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        createTaskObject();
        console.log("Add Task button clicked");
    });
    cancelTaskBtn.addEventListener("click", (e) => {
        e.preventDefault(); 
        resetAddTaskForm();
        console.log("Cancel Task button clicked");
    });

    // rest of initialization (unchanged order)
    await addContactsToAssignTask(await getContacts());
    checkCheckboxChanges();
    addCategoryOptionsTask();
    initSubtaskEventListeners();
});



// Insert contact options into the assign-to checkbox list.
function addContactsToAssignTask(contacts) {
    const assignedSelect = document.getElementById("chooseContactsCheckboxList");
    if (!assignedSelect) return;
    contacts.forEach(contact => {
        const option = addAssignedToBarTask(contact.name);
     
        // if function returns a string of HTML, insert as HTML; if Node, append
        if (typeof option === "string") {
            assignedSelect.insertAdjacentHTML("beforeend", option);
        } else if (option instanceof Node) {
            assignedSelect.appendChild(option);
        } else {
            console.warn("Unexpected option type:", option);
        }
    });
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
    console.log("Due Date Task:", dueDateTask);
    return dueDateTask;
}

// Return the currently selected priority.
function getPriorityTask() {  
    return selectedPriority;
}


// Append the assigned area UI and populate contacts.
async function addAssignToBarTask() {  
    const assignedToSelect = document.getElementById("assignedArea");
   assignedToSelect.appendChild(addAssignedToBarTask());
   addContactsToAssignTask(await getContacts());
}

// Wire change handlers for assign-to checkboxes and update the select box text.
function checkCheckboxChanges() {    
const checkboxes = checkboxList.querySelectorAll(".assignedToCheckbox");
checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    const selected = [...checkboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    selectBox.innerText = selected.length
      ? selected.join(", ")
      : "Bitte auswählen";
  });
});
}   


// Return array of selected assigned-to values.
function getSelectedAssignedTo() {  
    const checkboxes = checkboxList.querySelectorAll(".assignedToCheckbox");
    const selected = [...checkboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    return selected;
}

const CATEGORY= Object.freeze({
    TECHTASK: 'Technical Task',
    USERSTORY: 'User Story',
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

// Return currently selected category.
function getCategoryTask() {  
    const categorySelect = document.getElementById("categorySelect");
    return categorySelect.value;
}

// Initialize add/remove subtask buttons and handlers.
function initSubtaskEventListeners() {  
    const addSubtaskBtn = document.getElementById("addSubtaskBtn");
    const removeSubtaskBtn = document.getElementById("removeSubtaskBtn");
    const subtasksList = document.getElementById("subtasksList");
    const subtaskInput = document.getElementById("subtasks");
    addSubtaskBtn.addEventListener("click", (e) => {
        console.log("Add subtask button clicked");
        e.preventDefault();
        const subtaskText = subtaskInput.value.trim();
        if (subtaskText) {
            const subtaskElement = addSubTask(subtaskText);
            subtasksList.insertAdjacentHTML("beforeend", subtaskElement);
            subtaskInput.value = ""; // Clear input field
        }
    });
    removeSubtaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const lastSubtask = subtasksList.lastElementChild;
        if (lastSubtask) {
            subtasksList.removeChild(lastSubtask);
        }
    });
}
// Collect subtask texts from the DOM and return them as an array of objects with completion state.
function getSubtasksList() {
    const subtasksList = document.getElementById("subtasksList");
    const subtasks = [];
    subtasksList.querySelectorAll("label").forEach(label => {
        // if template includes a checkbox, read its checked state; else default to false
        const checkbox = label.querySelector('input[type="checkbox"]');
        const subtaskText = label.textContent.trim();
        subtasks.push({
            text: subtaskText,
            completed: checkbox ? checkbox.checked : false
        });
    });
    return subtasks;
}

// Build task object from inputs and send to firebase handler.
function createTaskObject() {  
   var task = {
        title: getTitleTask(),
        description: getDescriptionTask(),
        dueDate: getDueDateTask(),
        priority: getPriorityTask(),
        assignedTo: getSelectedAssignedTo(),
        category: getCategoryTask(),
        subtasks: getSubtasksList()
   };
   console.log("Created Task Object:", task);
    addEditTask(task);

    return task;
}
function clearTitleInput() {  
    const titleInput = document.getElementById("taskTitle");
    titleInput.value = "";
}
function clearDescriptionInput() {  
    const descriptionInput = document.getElementById("taskDescription");
    descriptionInput.value = "";
}
function clearDueDateInput() {  
    const dueDateInput = document.getElementById("taskDate");
    dueDateInput.value = "";
}
function clearSubtasksList() {  
    const subtasksList = document.getElementById("subtasksList");
    subtasksList.innerHTML = "";
}
function clearAssignedToSelection() {  
    const checkboxes = checkboxList.querySelectorAll(".assignedToCheckbox");    
    checkboxes.forEach(cb => cb.checked = false);
}
function resetPrioritySelection() {
    selectedPriority = PRIORITY.MEDIUM;
}
function resetCategorySelection() {  
    const categorySelect = document.getElementById("categorySelect");
    categorySelect.selectedIndex = 0;
}
function resetAssignToSelectBox() {  
    selectBox.innerText = "Bitte auswählen";
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
}