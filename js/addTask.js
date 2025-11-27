import {getContacts,addEditTask} from "./firebase.js";
import {addAssignedToBarTask,addSubTask} from '../templates/addTaskTemplates.js';
import { getInitials } from "./utility.js";

document.addEventListener("DOMContentLoaded", async () => {
    const addTaskBtn = document.getElementById("addTaskBtn");
    const cancelTaskBtn = document.getElementById("cancelTaskBtn");

    addTaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        createTaskObject();
        console.log("Add Task button clicked");
    });
    cancelTaskBtn.addEventListener("click", (e) => {
        e.preventDefault(); 
        // Logic to cancel adding the task goes here
        console.log("Cancel Task button clicked");
    });
    addContactsToAssignTask(await getContacts());
    initAddEventListeners();
    checkChekboxChanges();
    addCategoryOptionsTask();
    initSubtaskEventListeners();
});




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

const PRIORITY= Object.freeze({
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High'
});
var selectedPriority = PRIORITY.MEDIUM; // Default priority
var priorityUrgentBtn = document.getElementById("priorityUrgentBtn");
var priorityMediumBtn = document.getElementById("priorityMediumBtn");
var priorityLowBtn = document.getElementById("priorityLowBtn");
var priorityUrgentImg = document.getElementById("priorityUrgentImg");
var priorityMediumImg = document.getElementById("priorityMediumImg");
var priorityLowImg = document.getElementById("priorityLowImg");

function initAddEventListeners() {
  priorityLowBtn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedPriority = PRIORITY.LOW;
      priorityLowImg.style.fill = "red"; // Example visual feedback
  });

  priorityMediumBtn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedPriority = PRIORITY.MEDIUM;
        
  });
    priorityUrgentBtn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedPriority = PRIORITY.HIGH;
        
  });
}

function getTitleTask() {  
    const titleTask = document.getElementById("taskTitle").value;
    return titleTask;
}

function getDescriptionTask() {  
    const descriptionTask = document.getElementById("taskDescription").value;
    return descriptionTask;
}
function getDueDateTask() {  
    const dueDateTask = document.getElementById("taskDate").value;
    return dueDateTask;
}
function getPriorityTask() {  
    return selectedPriority;
}




async function addAssignToBarTask() {  
    const assignedToSelect = document.getElementById("assignedArea");
   assignedToSelect.appendChild(addAssignedToBarTask());
   addContactsToAssignTask(await getContacts());
}

 const selectBox = document.getElementById("selectedBox");
const checkboxList = document.getElementById("chooseContactsCheckboxList");

selectBox.addEventListener("click", () => {
  checkboxList.style.display =
    checkboxList.style.display === "block" ? "none" : "block";
});

function checkChekboxChanges() {    
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


function getSelectedAssignedTo() {  
    const checkboxes = checkboxList.querySelectorAll(".assignedToCheckbox");
    const selected = [...checkboxes]
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    return selected;
}

const CATEGORY= Object.freeze({
    TECHTASK: 'Technical Task',
    DEVELOPMENT: 'Development',
    MARKETING: 'Marketing',
    USERSTORY: 'User Story ',
});
function addCategoryOptionsTask() {  
    const categorySelect = document.getElementById("categorySelect");
    for (const key in CATEGORY) {
        const option = document.createElement("option");
        option.value = CATEGORY[key];
        option.text = CATEGORY[key];
        categorySelect.appendChild(option);
    }
}

function getCategoryTask() {  
    const categorySelect = document.getElementById("categorySelect");
    return categorySelect.value;
}

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
function getSubtasksList() {
    const subtasksList = document.getElementById("subtasksList");
    const subtasks = [];
    subtasksList.querySelectorAll("label").forEach(label => {
        const subtaskText = label.textContent.trim();
        subtasks.push(subtaskText);
    });
    return subtasks;
}

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