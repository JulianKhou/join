document.addEventListener("DOMContentLoaded", () => {
    const addTaskBtn = document.getElementById("addTaskBtn");
    const cancelTaskBtn = document.getElementById("cancelTaskBtn");

    addTaskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Logic to add the task goes here
        console.log("Add Task button clicked");
    });
    cancelTaskBtn.addEventListener("click", (e) => {
        e.preventDefault(); 
        // Logic to cancel adding the task goes here
        console.log("Cancel Task button clicked");
    });

});

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
  priorityLowBtn.addEventListener("click", () => {

      selectedPriority = PRIORITY.LOW;
      console.log("Selected Priority: " + selectedPriority);
      priorityLowImg.style.fill = "red"; // Example visual feedback
  });

  priorityMediumBtn.addEventListener("click", () => {
      selectedPriority = PRIORITY.MEDIUM;
      console.log("Selected Priority: " + selectedPriority);
  });
    priorityUrgentBtn.addEventListener("click", () => {
      selectedPriority = PRIORITY.HIGH;
      console.log("Selected Priority: " + selectedPriority);
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
