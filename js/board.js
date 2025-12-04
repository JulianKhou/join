import {
  getAllTasks,
  changeTaskProgress,
  getSubtasksCompletionState,
} from "./firebase.js";
import {
  taskCardTemplate,
  taskDetailTemplate,
  assigneeAvatarTemplate,
} from "../templates/boardTasksTemplates.js";

import { getInitials,returnContactById } from "./utility.js";
import { getContacts } from "./firebase.js";

const overlay = document.getElementById("taskDetailOverlay");
const closeBtn = document.getElementById("overlayCloseBtn");
let contactsList = [];
document.addEventListener("DOMContentLoaded", async () => {
  const tasks = await getAllTasks();
  contactsList = await getContacts();
  renderTasks(tasks);

  // query rendered cards and drop zones AFTER render
  const cards = document.querySelectorAll('[draggable="true"]');
  const dropZones = document.querySelectorAll(".kanban-column");

  // attach drag listeners
  cards.forEach((card) => card.addEventListener("dragstart", handleDragStart));
  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  });

  // attach click listener to each rendered card (create new detail per click)
  const taskCards = document.querySelectorAll(".task-card");
  taskCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("svg") || e.target.closest("button")) return;
      // create fresh detail content each time
      const taskDetail = taskDetailTemplate(card.dataset.taskId || card.id);
      // clear previous content and open overlay
      overlay.innerHTML = "";
      if (typeof taskDetail === "string") {
        overlay.insertAdjacentHTML("beforeend", taskDetail);
      } else if (taskDetail instanceof Node) {
        overlay.appendChild(taskDetail);
      }
      overlay.classList.add('active');
      
      // Re-attach close button listener after content is inserted
      const newCloseBtn = overlay.querySelector('#overlayCloseBtn');
      newCloseBtn?.addEventListener('click', closeOverlayOnBtn);
    });
  });
  checkColumnVisibility();

  // close handlers
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeOverlayOnBtn(); });
});

function closeOverlayOnBtn() {
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.classList.remove('active', 'closing');
  }, 200);
}

function renderTasks(tasks) {
  const toDoColumn = document.getElementById("todoColumnContainer");
  const inProgressColumn = document.getElementById("inProgressColumnContainer");
  const awaitFeedbackColumn = document.getElementById(
    "feedbackColumnContainer"
  );
  const doneColumn = document.getElementById("doneColumnContainer");

  tasks.forEach((task) => {
    const taskCardHTML = taskCardTemplate(task);
    // Assume this function generates HTML for a task card
    switch (task.progress) {
      case "toDo":
        toDoColumn.insertAdjacentHTML("beforeend", taskCardHTML);

        changeSubtaskProgressbar(task);
        addAssigneeAvatar(task);
        break;
      case "inProgress":
        inProgressColumn.insertAdjacentHTML("beforeend", taskCardHTML);

        changeSubtaskProgressbar(task);
        addAssigneeAvatar(task);
        break;
      case "awaitFeedback":
        awaitFeedbackColumn.insertAdjacentHTML("beforeend", taskCardHTML);

        changeSubtaskProgressbar(task);
        addAssigneeAvatar(task);
        break;
      case "done":
        doneColumn.insertAdjacentHTML("beforeend", taskCardHTML);

        changeSubtaskProgressbar(task);
        addAssigneeAvatar(task);
        break;
    }
  });
}

function handleDragStart(drag) {
  const card = drag.target.closest('[draggable="true"]');
  drag.dataTransfer.setData("text/plain", card.id);
  card.classList.add("dragging");
}

function handleDragOver(drag) {
  drag.preventDefault();
  drag.dataTransfer.dropEffect = "move";
  this.style.backgroundColor = "rgba(0, 102, 255, 0.1)";
}

function handleDragLeave() {
  this.style.backgroundColor = "";
}

function handleDrop(drag) {
  drag.preventDefault();
  const cardId = drag.dataTransfer.getData("text/plain");
  const movedCard = document.getElementById(cardId);
  if (!movedCard) return;

    this.appendChild(movedCard);
    this.style.backgroundColor = "";
    movedCard.classList.remove('dragging');

  // prefer data-task-id if available, fall back to element id
  let taskId = movedCard.dataset.taskId || movedCard.id;
  taskId = taskId.replace("task-card-", ""); // clean up id if needed
  const newProgress = getNewProgressFromDropZone(this);
  checkColumnVisibility();
  updateTaskProgressInFirebase(taskId, newProgress);
}

function updateTaskProgressInFirebase(taskId, newProgress) {
  changeTaskProgress(taskId, newProgress)
    .then(() => {})
    .catch((error) => {
      console.error("Error updating task progress in Firebase:", error);
    });
}

function getNewProgressFromDropZone(dropZone) {
  switch (dropZone.id) {
    case "todoColumnContainer":
      return "toDo";
    case "inProgressColumnContainer":
      return "inProgress";
    case "feedbackColumnContainer":
      return "awaitFeedback";
    case "doneColumnContainer":
      return "done";
  }
}
function getTaskIdformCard(card) {
    
}

// Add Task Overlay Functions
const addTaskOverlay = document.getElementById('addTaskOverlay');
const addTaskBtn = document.getElementById('addTaskBtn');
const addTaskCloseBtn = document.getElementById('addTaskCloseBtn');
const addTaskCancelBtn = document.getElementById('addTaskCancelBtn');
const addTaskFormOverlay = document.getElementById('addTaskFormOverlay');

// Open Add Task Overlay
addTaskBtn?.addEventListener('click', () => {
    addTaskOverlay?.classList.add('active');
});

// Close Add Task Overlay Functions
function closeAddTaskOverlay() {
    addTaskOverlay?.classList.add('closing');
    setTimeout(() => {
        addTaskOverlay?.classList.remove('active', 'closing');
    }, 200);
}

// Close button in overlay
addTaskCloseBtn?.addEventListener('click', closeAddTaskOverlay);

// Cancel button
addTaskCancelBtn?.addEventListener('click', closeAddTaskOverlay);

// Close on overlay background click
addTaskOverlay?.addEventListener('click', (e) => {
    if (e.target === addTaskOverlay) {
        closeAddTaskOverlay();
    }
});

// Priority button selection
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.priority-button');
    if (btn) {
        const group = btn.closest('.priority-button-group');
        
        // Remove active class from all buttons and their icons
        group?.querySelectorAll('.priority-button').forEach(b => {
            b.classList.remove('priority-button-urgant-active', 'priority-button-medium-active', 'priority-button-low-active');
            const icon = b.querySelector('svg');
            icon?.classList.remove('priority-button-icon-active');
        });
        
        // Add active class to clicked button
        if (btn.id === 'priority-button-urgant') {
            btn.classList.add('priority-button-urgant-active');
        } else if (btn.textContent.includes('Medium')) {
            btn.classList.add('priority-button-medium-active');
        } else if (btn.textContent.includes('Low')) {
            btn.classList.add('priority-button-low-active');
        }
        
        // Add active class to the icon
        const icon = btn.querySelector('svg');
        icon?.classList.add('priority-button-icon-active');
    }
});

// Multi-select dropdown
document.addEventListener('click', (e) => {
    if (e.target.closest('.selected-box')) {
        const box = e.target.closest('.selected-box');
        const list = box.nextElementSibling;
        
        // Close other open dropdowns
        document.querySelectorAll('.checkbox-list.active').forEach(l => {
            if (l !== list) l.classList.remove('active');
        });
        
        list?.classList.toggle('active');
    }
});

// Form submission
addTaskFormOverlay?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.querySelector('input[placeholder="Enter a title..."]')?.value;
    const description = document.querySelector('textarea[placeholder="Enter a description..."]')?.value;
    const dueDate = document.querySelector('input[type="date"]')?.value;
    
    const activePriority = document.querySelector('.priority-btn-active');
    const priority = activePriority?.dataset.priority || 'medium';
    
    const category = document.querySelector('select')?.value || 'User Story';
    
    const selectedContacts = Array.from(
        document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked')
    ).map(cb => cb.value);
    
    const subtasks = Array.from(
        document.querySelectorAll('.subtask-item-overlay')
    ).map(item => ({
        title: item.textContent.trim(),
        completed: false
    }));
    
    // Validation
    if (!title?.trim()) {
        alert('Please enter a task title');
        return;
    }
    
    // Create task object
    const newTask = {
        title,
        description,
        dueDate,
        priority,
        category,
        assignedTo: selectedContacts,
        subtasks,
        progress: 'toDo',
        createdAt: new Date().toISOString()
    };
    
    console.log('New Task:', newTask);
    // TODO: Send to Firebase and refresh board
    
    closeAddTaskOverlay();
});

// Subtask input handling
const subtaskInput = document.querySelector('.form-input[type="text"][placeholder="Add new subtask..."]');
const subtaskAddBtn = document.querySelector('.subtask-btn-group .subtask-action-btn:nth-child(2)');

subtaskAddBtn?.addEventListener('click', () => {
    const subtaskText = subtaskInput?.value?.trim();
    if (!subtaskText) return;
    
    const subtasksList = document.querySelector('.subtasks-list-overlay');
    const subtaskItem = document.createElement('div');
    subtaskItem.className = 'subtask-item-overlay';
    subtaskItem.innerHTML = `
        <span>${subtaskText}</span>
        <button type="button" class="subtask-remove-btn">×</button>
    `;
    
    subtaskItem.querySelector('.subtask-remove-btn').addEventListener('click', () => {
        subtaskItem.remove();
    });
    
    subtasksList?.appendChild(subtaskItem);
    if (subtaskInput) subtaskInput.value = '';
});

// Allow Enter key to add subtask
subtaskInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        subtaskAddBtn?.click();
    }
});

function switchTodoColumn() {
  const toDoColumn = document.getElementById("todoColumnContainer");
  const toDoColumnContent = document.getElementById("todoColumn");
  const hasCards = toDoColumn.querySelectorAll(".task-card").length > 0;
  if (hasCards) {
    toDoColumnContent.style.display = "none";
  } else {
    toDoColumnContent.style.display = "block";
  }
}
function switchInProgressColumn() {
  const inProgressColumn = document.getElementById("inProgressColumnContainer");
  const inProgressColumnContent = document.getElementById("progressColumn");
  const hasCards = inProgressColumn.querySelectorAll(".task-card").length > 0;

  if (hasCards) {
    inProgressColumnContent.style.display = "none";
  } else {
    inProgressColumnContent.style.display = "block";
  }
}
function switchAwaitFeedbackColumn() {
  const feedbackColumn = document.getElementById("feedbackColumnContainer");
  const awaitFeedbackColumn = document.getElementById("awaitFeedbackColumn");
  // query cards INSIDE feedbackColumn only
  const hasCards = feedbackColumn.querySelectorAll(".task-card").length > 0;

  if (hasCards) {
    awaitFeedbackColumn.style.display = "none";
  } else {
    awaitFeedbackColumn.style.display = "block";
  }
}

function switchDoneColumn() {
  const doneColumn = document.getElementById("doneColumnContainer");
  const doneColumnContent = document.getElementById("doneColumn");
  const hasCards = doneColumn.querySelectorAll(".task-card").length > 0;
  if (hasCards) {
    doneColumnContent.style.display = "none";
  } else {
    doneColumnContent.style.display = "block";
  }
}

function checkColumnVisibility() {
  switchTodoColumn();
  switchAwaitFeedbackColumn();
  switchInProgressColumn();
  switchDoneColumn();
}

function changeSubtaskProgressbar(task) {
  getSubtasksCompletionState(task.id)
    .then(({ totalSubtasks, completedSubtasks }) => {
      const progressBar = document.getElementById(`progress-bar-${task.id}`);
      const printInfo = document.getElementById(`subtask-info-${task.id}`);
      if (printInfo) {
        printInfo.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
      }
      if (progressBar) {
        const percentage = (completedSubtasks / totalSubtasks) * 100 || 0;
        progressBar.style.width = `${percentage}%`;
      }
    })
    .catch((error) => {
      console.error("Error getting subtask completion state:", error);
    });
}


function addAssigneeAvatar(task){
  let assignedUid=task.assignedTo;
  assignedUid.forEach(uid=>{
    let contact = returnContactById(uid, contactsList);
    let initials=getInitials(contact.name);
    let color=contact.color;
    console.log("Adding avatar for assignee:", initials, color);
    let avatarHTML=assigneeAvatarTemplate(initials,color);
    let taskCard=document.getElementById(`task-card-${task.id}`);
    let assigneesContainer=taskCard.querySelector(".task-assignees");
    assigneesContainer.insertAdjacentHTML("beforeend",avatarHTML);
  });
} 