import {getContacts,addEditTask,getContact} from "./firebase.js";
import {addAssignedToBarTask,addSubTask} from '../templates/addTaskTemplates.js';
import { getInitials,initOutsideClickHandler,returnContactById } from "./utility.js";
import {toggleUrgentButtonOnClick,toggleMediumButtonOnClick,toggleLowButtonOnClick,removeClickedFromPriorityButtons} from "./addTaskPriorityButtons.js";
import { iconTemplate } from "../templates/profileTemplates.js";
// replace top-level var queries with declarations only so functions can still access them
const PRIORITY = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
    URGENT: "Urgant",
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
let contactsList=[];

// On DOM ready: set up UI, attach handlers and load contacts.
document.addEventListener("DOMContentLoaded", async () => {
    contactsList = await getContacts();
    const addTaskBtn = document.getElementById("addTaskBtn");
    const cancelTaskBtn = document.getElementById("cancelTaskBtn");

    priorityUrgentBtn = document.getElementById("priorityUrgentBtn");
    priorityMediumBtn = document.getElementById("priorityMediumBtn");
    priorityLowBtn = document.getElementById("priorityLowBtn");
    priorityUrgentImg = document.getElementById("priorityUrgentImg");
    priorityMediumImg = document.getElementById("priorityMediumImg");
    priorityLowImg = document.getElementById("priorityLowImg");
    selectBox = document.getElementById("selectedBox");
    checkboxList = document.getElementById("chooseContactsCheckboxList");

    // ✅ Initialize outside click handler ONCE
    if (selectBox && checkboxList) {
      selectBox.addEventListener("click", (e) => {
        const wasVisible = checkboxList.style.display === "flex";
        checkboxList.style.display = wasVisible ? "none" : "flex";
        
        // Only init outside click handler when OPENING the list
        if (!wasVisible) {
          initOutsideClickHandler(
            selectBox,      // target: clicks on this are "inside"
            () => {         // onClose callback
              checkboxList.style.display = "none";
            },
            [checkboxList]  // ignore: also treat clicks on list as "inside"
          );
        }
      });
      
      // Filter contacts while typing
      selectBox.addEventListener("input", () => {
        const searchTerm = selectBox.value;
        console.log("Searching for:", searchTerm);
        addContactsToAssignTask(contactsList, searchTerm);
        checkCheckboxChanges();
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

    await addContactsToAssignTask(contactsList);
    checkCheckboxChanges();
    addCategoryOptionsTask();
    initSubtaskEventListeners();
    initAddEventListeners();
});



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
        ? contacts.filter(contact => 
            contact.name.toLowerCase().includes(filterString.toLowerCase())
          )
        : contacts;
    
    // ✅ Sort: current user first, then alphabetically
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const sortedContacts = filteredContacts.sort((a, b) => {
        // Current user comes first
        if (currentUser && a.id === currentUser.uid) return -1;
        if (currentUser && b.id === currentUser.uid) return 1;
        
        // Then sort alphabetically by name
        return a.name.localeCompare(b.name);
    });
    
    sortedContacts.forEach(contact => {
        // ✅ Add (YOU) label for current user
        const isCurrentUser = currentUser && contact.id === currentUser.uid;
        const displayName = isCurrentUser ? `${contact.name} (You)` : contact.name;
        
        const option = addAssignedToBarTask(
            displayName,  // ← use modified name
            contact.id, 
            iconTemplate(getInitials(contact.name), contact.color, "assignedToCheckboxIcon")
        );
     
        // if function returns a string of HTML, insert as HTML; if Node, append
        if (typeof option === "string") {
            assignedSelect.insertAdjacentHTML("beforeend", option);
        } else if (option instanceof Node) {
            assignedSelect.appendChild(option);
        } else {
            console.warn("Unexpected option type:", option);
        }
    });
    
    // Show "No results" message if nothing found
    if (filteredContacts.length === 0) {
        assignedSelect.innerHTML = '<div class="no-results">No contacts found</div>';
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

// Wire change handlers for assign-to checkboxes and update the select box text + icons.
function checkCheckboxChanges() {    
  const checkboxes = checkboxList.querySelectorAll(".assignedToCheckbox");
  const selectedNamesIconContainer = document.getElementById("assignedIcons");
  
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      // Update select box text
      const selected = [...checkboxes]
        .filter(cb => cb.checked)
        .map(cb => returnContactById(cb.value, contactsList).name);
      
      selectBox.innerText = selected.length
        ? selected.join(", ")
        : "Bitte auswählen";
      
      // ✅ Update icons container
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
    .filter(cb => cb.checked)
    .forEach(cb => {
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
    const checkboxes = checkboxList.querySelectorAll(".assignedToCheckbox");
    const selectedIds = [...checkboxes]
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    return selectedIds;
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
            
            // Get the actual DOM element that was just inserted
            const lastAddedElement = subtasksList.lastElementChild;
            addSubtaskEventListeners(lastAddedElement);
            
            subtaskInput.value = ""; // Clear input field
        }
    });
    removeSubtaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const lastSubtask = subtasksList.lastElementChild;
        if (lastSubtask) {
            console.log("Removing last subtask:", lastSubtask);
            subtasksList.removeChild(lastSubtask);
        }
    });
}
function addSubtaskEventListeners(subtaskElement) { 
  const editBtn = subtaskElement.querySelector(".edit-subtask-button-size");
    const deleteBtn = subtaskElement.querySelector(".delete-subtask-button-size");
  console.log("Adding event listeners to subtask element:", subtaskElement);
    // ✅ Fixed: "dblclick" not "dbclick", use subtaskElement not subtaskNode
    subtaskElement.addEventListener("dblclick", (e) => {
        console.log("Double click on subtask to edit");
        e.preventDefault();
        editBtn.style.display = "inline-block";
        deleteBtn.style.display = "inline-block";
        // Get the text span element
        const textSpan = subtaskElement.querySelector("span") || subtaskElement;
        addSubtaskBtnEventListeners(subtaskElement);
        
      
    });


}

function addSubtaskBtnEventListeners(subtaskNode) {
    const editBtn = subtaskNode.querySelector(".edit-subtask-button-size");
    const deleteBtn = subtaskNode.querySelector(".delete-subtask-button-size");
    const subtaskElement = subtaskNode.querySelector(".subtask-label-left") || subtaskNode;
    if (editBtn && editBtn.style.display !== "none") {
        editBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Make the span editable
            const textSpan = subtaskElement.querySelector("span");
            if (textSpan) {
               editableSubtaskText(subtaskNode);
      
                
                // Helper to close edit mode
                const closeEdit = () => {
                    removeEditableSubtaskText(subtaskNode);
                    document.removeEventListener("click", handleOutsideClick);
                };

                // Handle outside clicks
                const handleOutsideClick = (event) => {
                    // Check if click is inside the subtask row using closest
                    const clickedInside = event.target.closest(".subtask-label");
                    // Ensure the clicked row is THIS row (compare references) 
                    // Note: subtaskNode refers to the div created in addSubTask template which HAS class 'subtask-label'
                    if (clickedInside !== subtaskNode) {
                        closeEdit();
                    }
                };
                
                // Save on click outside (delayed to avoid immediate trigger)
                setTimeout(() => {
                    document.addEventListener("click", handleOutsideClick);
                }, 0);
                
                // Save on Enter key
                textSpan.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        closeEdit();
                    }
                }, { once: true });
            }
        });
    }

    if (deleteBtn && deleteBtn.style.display !== "none") {
        deleteBtn.addEventListener("click", (e) => {
            e.preventDefault();
            subtaskNode.remove();
        });
    }

}

function editableSubtaskText(subtaskElement) {
  const textSpan = subtaskElement.querySelector("span");
  const pointDiv = subtaskElement.querySelector(".point");
  if (pointDiv) {
    pointDiv.style.display = "none"; // Hide the point while editing
  }
  // Change: Set contentEditable on the SPAN, not the parent container
  if (textSpan) {
    textSpan.contentEditable = true;
    textSpan.focus(); // Ensure focus is set
  }
  
  subtaskElement.classList.add("subtask-label-active");

  // Selection range handling (optional but good for UX: select all text)
  if (textSpan) {
      const range = document.createRange();
      range.selectNodeContents(textSpan);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
  }
}

function removeEditableSubtaskText(subtaskElement) {
    console.log("Removing editable state from subtask element:", subtaskElement);
    const textSpan = subtaskElement.querySelector("span");
    const pointDiv = subtaskElement.querySelector(".point");

    if (pointDiv) {
        pointDiv.style.display = "block"; // Show the point again
    }
    // Change: Remove contentEditable from the SPAN
    if (textSpan) {
        textSpan.contentEditable = false;
    }
    subtaskElement.classList.remove("subtask-label-active");
}


// Collect subtask texts from the DOM and return them as an array of objects with completion state.
function getSubtasksList() {
    const subtasksList = document.getElementById("subtasksList");
    const subtasks = [];
    subtasksList.querySelectorAll("span").forEach(span => {
        // if template includes a checkbox, read its checked state; else default to false
        const checkbox = span.querySelector('input[type="checkbox"]');
        const subtaskText = span.textContent.trim();
        subtasks.push({
            text: subtaskText,
            completed: checkbox ? checkbox.checked : false
        });
    });
    console.log("Collected Subtasks:", subtasks);
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
        subtasks: getSubtasksList(),
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
function initAddEventListeners() {
  if (priorityLowBtn) {
    priorityLowBtn.addEventListener("click", (e) => {
        e.preventDefault(); // ← wichtig!
        e.stopPropagation();
        selectedPriority = PRIORITY.LOW;
        removeClickedFromPriorityButtons();
        priorityLowBtn.classList.toggle("clicked");
        toggleLowButtonOnClick(priorityLowBtn);
        
    });
  }

  if (priorityMediumBtn) {
    priorityMediumBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectedPriority = PRIORITY.MEDIUM;
        removeClickedFromPriorityButtons();
        priorityMediumBtn.classList.toggle("clicked");
        toggleMediumButtonOnClick(priorityMediumBtn);
    });
  }

  if (priorityUrgentBtn) {
    priorityUrgentBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectedPriority = PRIORITY.URGENT;
        removeClickedFromPriorityButtons();
        priorityUrgentBtn.classList.toggle("clicked");
        toggleUrgentButtonOnClick(priorityUrgentBtn); // ← pass the button element
        
    });
  }
}