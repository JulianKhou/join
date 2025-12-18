import {
  getAllTasks,
  changeTaskProgress,
  getSubtasksCompletionState,
  changeSubtaskCompletion,
  getTask,
  deleteTask,
  updateTask,
} from "./firebase.js";
import {
  taskCardTemplate,
  taskDetailTemplate,
  assigneeAvatarTemplate,
  assigneeAvatarToDetail,
  addSubtaskToDetailTemplate,
  editTaskFormTemplate,
} from "../templates/boardTasksTemplates.js";

import { getInitials, returnContactById, getTaskIndexById } from "./utility.js";
import { getContacts } from "./firebase.js";

const overlay = document.getElementById("taskDetailOverlay");
const closeBtn = document.getElementById("overlayCloseBtn");
let contactsList = [];
document.addEventListener("DOMContentLoaded", async () => {
  const tasks = await getAllTasks();
  contactsList = await getContacts();
  renderTasks(tasks);

  const cards = document.querySelectorAll('[draggable="true"]');
  const dropZones = document.querySelectorAll(".kanban-column");

  cards.forEach((card) => card.addEventListener("dragstart", handleDragStart));
  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  });

  const taskCards = document.querySelectorAll(".task-card");
  taskCards.forEach((card) => {
    card.addEventListener("click", async (e) => {
      // ← async!
      if (e.target.closest("svg") || e.target.closest("button")) return;

      // Extract taskId from card id (e.g. "task-card-ABC123" → "ABC123")
      const taskId = card.id.replace("task-card-", "");

      try {
        // Load fresh task data from Firestore
        const task = await getTask(taskId);

        const taskDetail = taskDetailTemplate(task);

        overlay.innerHTML = "";
        if (typeof taskDetail === "string") {
          overlay.insertAdjacentHTML("beforeend", taskDetail);
        } else if (taskDetail instanceof Node) {
          overlay.appendChild(taskDetail);
        }

        overlay.classList.add("active");

        // NOW insert assignees & subtasks with FRESH data
        addAssigneeAvatartoDetail(task);
        addSubtaskToDetail(task);
        addEventListenersToSubtaskButtons(task.id);
        initAddEventListenersToTaskDetailButtons(task.id);

        const newCloseBtn = overlay.querySelector("#overlayCloseBtn");
        newCloseBtn?.addEventListener("click", closeOverlayOnBtn);
      } catch (error) {
        console.error("Failed to load task details:", error);
        alert("Could not load task details.");
      }
    });
  });

  checkColumnVisibility();
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeOverlayOnBtn();
  });

  // [API] Search functionality for tasks
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchText = e.target.value.toLowerCase();
      filterTasks(searchText);
    });
  }
});

function closeOverlayOnBtn() {
  overlay.classList.add("closing");
  setTimeout(() => {
    overlay.classList.remove("active", "closing");
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

    switch (task.progress) {
      case "toDo":
        toDoColumn.insertAdjacentHTML("beforeend", taskCardHTML);
        changeSubtaskProgressbar(task);
        addAssigneeAvatar(task);
        
        // removed addSubtaskToDetail(task); — only needed in overlay, not in card
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
  movedCard.classList.remove("dragging");

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

// Add Task Overlay Functions
const addTaskOverlay = document.getElementById("addTaskOverlay");
const addTaskCloseBtn = document.getElementById("addTaskCloseBtn");
const addTaskCancelBtn = document.getElementById("addTaskCancelBtn");
const addTaskFormOverlay = document.getElementById("addTaskFormOverlay");

function openAddTaskOverlay() {
  const addTaskOverlay = document.getElementById("addTaskOverlay");
  addTaskOverlay?.classList.add("active");
}

window.openAddTaskOverlay = openAddTaskOverlay;

// Close Add Task Overlay Functions
function closeAddTaskOverlay() {
  addTaskOverlay?.classList.add("closing");
  setTimeout(() => {
    addTaskOverlay?.classList.remove("active", "closing");
  }, 200);
}

// Close button in overlay
addTaskCloseBtn?.addEventListener("click", closeAddTaskOverlay);

// Cancel button
addTaskCancelBtn?.addEventListener("click", closeAddTaskOverlay);

// Close on overlay background click
addTaskOverlay?.addEventListener("click", (e) => {
  if (e.target === addTaskOverlay) {
    closeAddTaskOverlay();
  }
});

// Priority button selection
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".priority-button");
  if (btn) {
    const group = btn.closest(".priority-button-group");

    // Remove active class from all buttons and their icons
    group?.querySelectorAll(".priority-button").forEach((b) => {
      b.classList.remove(
        "priority-button-urgant-active",
        "priority-button-medium-active",
        "priority-button-low-active"
      );
      const icon = b.querySelector("svg");
      icon?.classList.remove("priority-button-icon-active");
    });

    // Add active class to clicked button
    if (btn.id === "priority-button-urgant") {
      btn.classList.add("priority-button-urgant-active");
    } else if (btn.textContent.includes("Medium")) {
      btn.classList.add("priority-button-medium-active");
    } else if (btn.textContent.includes("Low")) {
      btn.classList.add("priority-button-low-active");
    }

    // Add active class to the icon
    const icon = btn.querySelector("svg");
    icon?.classList.add("priority-button-icon-active");
  }
});

// Multi-select dropdown
document.addEventListener("click", (e) => {
  if (e.target.closest(".selected-box")) {
    const box = e.target.closest(".selected-box");
    const list = box.nextElementSibling;

    // Close other open dropdowns
    document.querySelectorAll(".checkbox-list.active").forEach((l) => {
      if (l !== list) l.classList.remove("active");
    });

    list?.classList.toggle("active");
  }
});

// Form submission
addTaskFormOverlay?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.querySelector(
    'input[placeholder="Enter a title..."]'
  )?.value;
  const description = document.querySelector(
    'textarea[placeholder="Enter a description..."]'
  )?.value;
  const dueDate = document.querySelector('input[type="date"]')?.value;

  const activePriority = document.querySelector(".priority-btn-active");
  const priority = activePriority?.dataset.priority || "medium";

  const category = document.querySelector("select")?.value || "User Story";

  const selectedContacts = Array.from(
    document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked')
  ).map((cb) => cb.value);

  const subtasks = Array.from(
    document.querySelectorAll(".subtask-item-overlay")
  ).map((item) => ({
    title: item.textContent.trim(),
    completed: false,
  }));

  // Validation
  if (!title?.trim()) {
    alert("Please enter a task title");
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
    progress: "toDo",
    createdAt: new Date().toISOString(),
  };

  console.log("New Task:", newTask);
  // TODO: Send to Firebase and refresh board

  closeAddTaskOverlay();
});

// Subtask input handling
const subtaskInput = document.querySelector(
  '.form-input[type="text"][placeholder="Add new subtask..."]'
);
const subtaskAddBtn = document.querySelector(
  ".subtask-btn-group .subtask-action-btn:nth-child(2)"
);

subtaskAddBtn?.addEventListener("click", () => {
  const subtaskText = subtaskInput?.value?.trim();
  if (!subtaskText) return;

  const subtasksList = document.querySelector(".subtasks-list-overlay");
  const subtaskItem = document.createElement("div");
  subtaskItem.className = "subtask-item-overlay";
  subtaskItem.innerHTML = `
        <span>${subtaskText}</span>
        <button type="button" class="subtask-remove-btn">×</button>
    `;

  subtaskItem
    .querySelector(".subtask-remove-btn")
    .addEventListener("click", () => {
      subtaskItem.remove();
    });

  subtasksList?.appendChild(subtaskItem);
  if (subtaskInput) subtaskInput.value = "";
});

subtaskInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
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

function addAssigneeAvatar(task) {
  task.assignedTo.forEach((uid) => {
    const contact = returnContactById(uid, contactsList);
    const avatarHTML = assigneeAvatarTemplate(
      getInitials(contact.name),
      contact.color
    );
    document
      .getElementById(`task-card-${task.id}`)
      .querySelector(".task-assignees")
      .insertAdjacentHTML("beforeend", avatarHTML);
  });
}
function addAssigneeAvatartoDetail(task) {
  task.assignedTo.forEach((uid) => {
    const contact = returnContactById(uid, contactsList);
    const avatarHTML = assigneeAvatarToDetail(
      getInitials(contact.name),
      contact.name,
      contact.color
    );
    document
      .getElementById(`overlayDetailCard-${task.id}`)
      .querySelector(".overlay-assignees")
      .insertAdjacentHTML("beforeend", avatarHTML);
  });
}

function addSubtaskToDetail(task) {
  const subtaskDetails = document.getElementById(`subtaskDetails-${task.id}`);
  if (!subtaskDetails) {
    console.warn(`Subtask details container not found for task ${task.id}`);
    return;
  }

  subtaskDetails.innerHTML = '<span class="overlay-label">Subtasks</span>';

  task.subtasks?.forEach((subtask, index) => {
    const subtaskHTML = addSubtaskToDetailTemplate(
      subtask.text,
      subtask.completed,
      index
    );
    subtaskDetails.insertAdjacentHTML("beforeend", subtaskHTML);
  });

  if (!task.subtasks || task.subtasks.length === 0) {
    subtaskDetails.insertAdjacentHTML(
      "beforeend",
      '<p class="no-subtasks">No subtasks</p>'
    );
  }
}

async function addEventListenersToSubtaskButtons(taskId) {
  const subtaskDetails = document.getElementById(`subtaskDetails-${taskId}`);
  if (!subtaskDetails) {
    console.warn(`Subtask details not found for task ${taskId}`);
    return;
  }

  const subtaskItems = subtaskDetails.querySelectorAll(".overlay-subtask-item");
  subtaskItems.forEach((item, index) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    checkbox.addEventListener("change", async () => {
      try {
        await changeSubtaskCompletion(taskId, index, checkbox.checked);
        console.log(`✅ Subtask ${index} changed to ${checkbox.checked}`);

        const updatedTask = await getTask(taskId);

        changeSubtaskProgressbar(updatedTask);

        updateOverlaySubtaskInfo(updatedTask);
      } catch (error) {
        console.error("❌ Failed to update subtask:", error);
        checkbox.checked = !checkbox.checked;
      }
    });
  });
}

// Update the subtask info text in the overlay (e.g. "2/4 Subtasks")
function updateOverlaySubtaskInfo(task) {
  const total = task.subtasks?.length || 0;
  const completed = task.subtasks?.filter((s) => s.completed).length || 0;

  const subtaskInfoEl = document
    .getElementById(`subtaskDetails-${task.id}`)
    ?.querySelector(".overlay-subtask-info");
  if (subtaskInfoEl) {
    subtaskInfoEl.textContent = `${completed}/${total} Subtasks`;
  }
}

function initAddEventListenersToTaskDetailButtons(taskId, task) {
  const deleteBtn = document.getElementById(`deleteTaskBtn-${taskId}`);
  const editBtn = document.getElementById(`editTaskBtn-${taskId}`);
  deleteBtn?.addEventListener("click", () => {
    deleteTaskFromBoard(taskId);
  });
  editBtn?.addEventListener("click", async () => {
    await openEditTaskOverlay(taskId);
  });
}

function initEditAssignedTo(taskId) {
  const listEl = overlay.querySelector(`#editCheckboxList-${taskId}`);
  const selectedBox = overlay.querySelector(`#editSelectedBox-${taskId}`);
  const iconsEl = overlay.querySelector(`#editAssignees-${taskId}`);
  if (!listEl) return;

  // Load current task to pre-check selections
  getTask(taskId).then((task) => {
    // Prepare and sort contacts: current user first then alphabetically
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const sorted = [...(contactsList || [])].sort((a, b) => {
      if (currentUser && a.id === currentUser.uid) return -1;
      if (currentUser && b.id === currentUser.uid) return 1;
      return a.name.localeCompare(b.name);
    });

    listEl.innerHTML = '';
    sorted.forEach((contact) => {
      const isYou = currentUser && contact.id === currentUser.uid;
      const displayName = isYou ? `${contact.name} (You)` : contact.name;
      const isChecked = Array.isArray(task.assignedTo) && task.assignedTo.includes(contact.id);
      
      // Create avatar icon for the contact
      const avatarIcon = `<div class="profileIconContainer" style="background-color: ${contact.color};">${getInitials(contact.name)}</div>`;
      
      const label = document.createElement('label');
      label.className = 'checkbox-item';
      label.innerHTML = `
        <div class="assignedToCheckboxNameIcon">${avatarIcon} ${displayName}</div>
        <input type="checkbox" class="assignedToCheckbox" name="assignedTo" value="${contact.id}" ${isChecked ? 'checked' : ''}>
      `;
      listEl.appendChild(label);
    });

    const updateSummary = () => {
      const checked = [...listEl.querySelectorAll('.assignedToCheckbox')]
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (selectedBox) {
        selectedBox.value = '';
      }

      if (iconsEl) {
        iconsEl.innerHTML = '';
        checked.forEach((id) => {
          const c = returnContactById(id, contactsList);
          if (c) {
            const avatarHTML = assigneeAvatarTemplate(getInitials(c.name), c.color);
            iconsEl.insertAdjacentHTML('beforeend', avatarHTML);
          }
        });
      }
    };

    // Initial summary
    updateSummary();

    // Listen for changes
    listEl.addEventListener('change', updateSummary);
  });
}

function initEditModeSubtasks(task) {
  const subtasksList = overlay.querySelector(`#editSubtasksList-${task.id}`);
  if (!subtasksList) return;
  
  // Clear existing subtasks
  subtasksList.innerHTML = "";
  
  // Add existing subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach((subtask) => {
      const subtaskHTML = createEditSubtaskElement(subtask.text);
      subtasksList.insertAdjacentHTML("beforeend", subtaskHTML);
      
      // Add event listeners to the newly added subtask
      const lastAddedElement = subtasksList.lastElementChild;
      addEditSubtaskEventListeners(lastAddedElement);
    });
  }
}

function createEditSubtaskElement(subtaskText) {
  return `<div class="subtask-label">
    <div class="subtask-label-left">
      <div class="point"></div>
      <span>${subtaskText}</span>
    </div>
    <div class="edit-delete-subtask-buttons">
      <button class="edit-subtask-button-size" style="display:none" type="button">
        <img src="./assets/contacts/editButton.svg" alt="edit subtask button">
      </button>
      <button class="delete-subtask-button-size" style="display:none" type="button">
        <img src="./assets/contacts/deleteButton.svg" alt="delete subtask button">
      </button>
    </div>
  </div>`;
}

function addEditSubtaskEventListeners(subtaskElement) {
  const editBtn = subtaskElement.querySelector(".edit-subtask-button-size");
  const deleteBtn = subtaskElement.querySelector(".delete-subtask-button-size");
  
  // Double click to show edit/delete buttons
  subtaskElement.addEventListener("dblclick", (e) => {
    e.preventDefault();
    editBtn.style.display = "inline-block";
    deleteBtn.style.display = "inline-block";
  });
  
  // Edit button
  if (editBtn) {
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      const textSpan = subtaskElement.querySelector("span");
      if (textSpan) {
        textSpan.contentEditable = true;
        textSpan.focus();
        
        // Save on blur
        textSpan.addEventListener("blur", () => {
          textSpan.contentEditable = false;
          editBtn.style.display = "none";
          deleteBtn.style.display = "none";
        }, { once: true });
        
        // Save on Enter
        textSpan.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            textSpan.blur();
          }
        }, { once: true });
      }
    });
  }
  
  // Delete button
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      subtaskElement.remove();
    });
  }
}

async function openEditTaskOverlay(taskId) {
  try {
    const task = await getTask(taskId);
    const editFormHTML = editTaskFormTemplate(task, [], contactsList);
    
    // Insert edit form inside the existing detail card
    const detailCard = overlay.querySelector(`#overlayDetailCard-${taskId}`);
    if (detailCard) {
      detailCard.insertAdjacentHTML("beforeend", editFormHTML);
    }
    
    // Initialize subtasks
    initEditModeSubtasks(task);
    
    // Attach event listeners to the edit form
    attachEditFormEventListeners(taskId);
  } catch (error) {
    console.error("Error opening edit overlay:", error);
    alert("Fehler beim Öffnen des Bearbeitungsformulars");
  }
}

function attachEditFormEventListeners(taskId) {
  const closeBtn = overlay.querySelector("#editOverlayCloseBtn");
  const editForm = overlay.querySelector(`#editTaskForm-${taskId}`);
  
  // Get the task to set initial priority
  const task = Array.from(document.querySelectorAll("[data-task-id]"))
    .find(el => el.getAttribute("data-task-id") === taskId);
  
  // Close button
  closeBtn?.addEventListener("click", () => {
    closeEditOverlay();
  });
  
  // Close on overlay background click
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeEditOverlay();
    }
  });
  
  // Priority buttons - Set initial priority and attach listeners
  const priorityButtons = overlay.querySelectorAll(`#editTaskForm-${taskId} .edit-priority-btn`);
  
  // Get the initial priority from a hidden data attribute or from form
  getTask(taskId).then((task) => {
    const initialPriority = task?.priority || "Medium";
    
    // Set initial priority button active state
    priorityButtons.forEach((btn) => {
      const btnPriority = btn.dataset.priority;
      if (btnPriority === initialPriority) {
        if (btnPriority === "Urgant") {
          btn.classList.add("edit-priority-urgant-active");
        } else if (btnPriority === "Medium") {
          btn.classList.add("edit-priority-medium-active");
        } else if (btnPriority === "Low") {
          btn.classList.add("edit-priority-low-active");
        }
      }
    });
  });
  
  priorityButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Remove active class from all buttons
      priorityButtons.forEach((b) => {
        b.classList.remove(
          "edit-priority-urgant-active",
          "edit-priority-medium-active",
          "edit-priority-low-active"
        );
      });
      
      // Add active class to clicked button
      const priority = btn.dataset.priority;
      if (priority === "Urgant") {
        btn.classList.add("edit-priority-urgant-active");
      } else if (priority === "Medium") {
        btn.classList.add("edit-priority-medium-active");
      } else if (priority === "Low") {
        btn.classList.add("edit-priority-low-active");
      }
    });
  });
  
  // Multi-select dropdown
  const selectedBox = overlay.querySelector(`#editSelectedBox-${taskId}`);
  const checkboxList = overlay.querySelector(`#editCheckboxList-${taskId}`);
  
  selectedBox?.addEventListener("click", (e) => {
    e.stopPropagation();
    checkboxList?.classList.toggle("active");

    // Close when clicking outside
    if (checkboxList?.classList.contains("active")) {
      const onDocClick = (evt) => {
        if (!checkboxList.contains(evt.target) && !selectedBox.contains(evt.target)) {
          checkboxList.classList.remove("active");
          document.removeEventListener("click", onDocClick);
        }
      };
      document.addEventListener("click", onDocClick);
    }
  });

  // Initialize Assigned To controls
  initEditAssignedTo(taskId);
  
  // Subtasks functionality
  const addSubtaskBtn = overlay.querySelector(`#editAddSubtaskBtn-${taskId}`);
  const removeSubtaskBtn = overlay.querySelector(`#editRemoveSubtaskBtn-${taskId}`);
  const subtasksInput = overlay.querySelector(`#editSubtasks-${taskId}`);
  const subtasksList = overlay.querySelector(`#editSubtasksList-${taskId}`);
  
  if (addSubtaskBtn && subtasksInput && subtasksList) {
    addSubtaskBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const subtaskText = subtasksInput.value.trim();
      if (subtaskText) {
        const subtaskHTML = createEditSubtaskElement(subtaskText);
        subtasksList.insertAdjacentHTML("beforeend", subtaskHTML);
        
        const lastAddedElement = subtasksList.lastElementChild;
        addEditSubtaskEventListeners(lastAddedElement);
        
        subtasksInput.value = "";
      }
    });
  }
  
  if (removeSubtaskBtn && subtasksList) {
    removeSubtaskBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const lastSubtask = subtasksList.lastElementChild;
      if (lastSubtask) {
        subtasksList.removeChild(lastSubtask);
      }
    });
  }
  
  // Form submission
  editForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = overlay.querySelector(`#editTaskTitle-${taskId}`)?.value;
    const description = overlay.querySelector(`#editTaskDescription-${taskId}`)?.value;
    const dueDate = overlay.querySelector(`#editTaskDate-${taskId}`)?.value;
    const category = overlay.querySelector(`#editTaskCategory-${taskId}`)?.value || "No Category";
    
    const activePriorityBtn = overlay.querySelector(
      `#editTaskForm-${taskId} .edit-priority-btn.edit-priority-urgant-active,
       #editTaskForm-${taskId} .edit-priority-btn.edit-priority-medium-active,
       #editTaskForm-${taskId} .edit-priority-btn.edit-priority-low-active`
    );
    const priority = activePriorityBtn?.dataset.priority || "Medium";
    
    if (!title?.trim()) {
      alert("Bitte gib einen Aufgabentitel ein");
      return;
    }
    
    try {
      // Collect selected assignees
      const checkboxScope = overlay.querySelector(`#editCheckboxList-${taskId}`);
      const selectedAssignees = [];
      if (checkboxScope) {
        checkboxScope.querySelectorAll('.assignedToCheckbox').forEach((cb) => {
          if (cb.checked) selectedAssignees.push(cb.value);
        });
      }

      // Collect subtasks from the list
      const subtasksList = overlay.querySelector(`#editSubtasksList-${taskId}`);
      const subtasks = [];
      if (subtasksList) {
        const subtaskElements = subtasksList.querySelectorAll(".subtask-label");
        subtaskElements.forEach((element) => {
          const textSpan = element.querySelector("span");
          if (textSpan && textSpan.textContent.trim()) {
            subtasks.push({
              text: textSpan.textContent.trim(),
              completed: false
            });
          }
        });
      }
      
      // Prepare update data
      const updateData = {
        title: title.trim(),
        description: description || "",
        dueDate: dueDate || "",
        priority: priority,
        category: category,
        assignedTo: selectedAssignees,
        subtasks: subtasks
      };
      
      // Update task in Firebase
      await updateTask(taskId, updateData);
      
      // Get updated task data
      const updatedTask = await getTask(taskId);
      
      // 1. Update task card on the board
      const taskCard = document.getElementById(`task-card-${taskId}`);
      if (taskCard && updatedTask) {
        const updatedCardHTML = taskCardTemplate(updatedTask);
        taskCard.outerHTML = updatedCardHTML;
        
        // Re-attach drag listeners to the updated card
        const newCard = document.getElementById(`task-card-${taskId}`);
        if (newCard) {
          // Re-render assignee avatars on the updated card
          const assigneesContainer = newCard.querySelector('.task-assignees');
          if (assigneesContainer) assigneesContainer.innerHTML = '';
          addAssigneeAvatar(updatedTask);

          newCard.addEventListener("dragstart", handleDragStart);
          newCard.addEventListener("click", async (e) => {
            if (e.target.closest("svg") || e.target.closest("button")) return;
            const clickedTaskId = newCard.id.replace("task-card-", "");
            try {
              const task = await getTask(clickedTaskId);
              const detailHTML = taskDetailTemplate(task, contactsList);
              overlay.innerHTML = detailHTML;
              overlay.classList.add("active");
              addAssigneeAvatartoDetail(task);
              addSubtaskToDetail(task);
              addEventListenersToSubtaskButtons(task.id);
              initAddEventListenersToTaskDetailButtons(task.id, task);
              const newCloseBtn = overlay.querySelector("#overlayCloseBtn");
              newCloseBtn?.addEventListener("click", closeOverlayOnBtn);
            } catch (error) {
              console.error("Failed to load task details:", error);
              alert("Could not load task details.");
            }
          });
        }
      }
      
      // 2. Close edit overlay and reload detail view with updated data
      closeEditOverlay();
      
      // 3. Reload detail overlay with updated data
      const taskDetail = taskDetailTemplate(updatedTask);
      overlay.innerHTML = "";
      if (typeof taskDetail === "string") {
        overlay.insertAdjacentHTML("beforeend", taskDetail);
      } else if (taskDetail instanceof Node) {
        overlay.appendChild(taskDetail);
      }

      // Suppress the entry animation when returning from the edit form
      const detailCard = overlay.querySelector(".overlay-detail-card");
      detailCard?.classList.add("no-animation");
      
      overlay.classList.add("active");
      
      // Re-insert assignees & subtasks with updated data
      addAssigneeAvatartoDetail(updatedTask);
      addSubtaskToDetail(updatedTask);
      addEventListenersToSubtaskButtons(updatedTask.id);
      initAddEventListenersToTaskDetailButtons(updatedTask.id);
      
      const newCloseBtn = overlay.querySelector("#overlayCloseBtn");
      newCloseBtn?.addEventListener("click", closeOverlayOnBtn);
    } catch (error) {
      console.error("Error updating task:", error);
      showNotification("✗ Fehler beim Speichern der Aufgabe", "error");
    }
  });
}

function closeEditOverlay() {
  const editCard = document.querySelector(".edit-overlay-card");
  if (editCard) {
    editCard.remove();
  }
}

function deleteTaskFromBoard(taskId) {
   deleteTask(taskId)
    .then(() => {
      console.log(`Task ${taskId} deleted successfully`); 
      closeOverlayOnBtn();
      const taskCard = document.getElementById(`task-card-${taskId}`);
      taskCard?.remove();
      checkColumnVisibility();
    })
    .catch((error) => {
      console.error("Error deleting task:", error);
    });
}

// Filter tasks based on search input (title or description)
function filterTasks(searchText) {
  const allTaskCards = document.querySelectorAll(".task-card");
  const columns = [
    { id: "todoColumnContainer", noTaskClass: ".todo-Column-no-task" },
    { id: "inProgressColumnContainer", noTaskClass: ".inProgress-Column-no-task" },
    { id: "feedbackColumnContainer", noTaskClass: ".awaitFeedback-Column-no-task" },
    { id: "doneColumnContainer", noTaskClass: ".done-Column-no-task" }
  ];
  
  // Filter task cards
  allTaskCards.forEach((card) => {
    const title = card.querySelector(".task-title")?.textContent.toLowerCase() || "";
    const description = card.querySelector(".task-description")?.textContent.toLowerCase() || "";
    
    // Show card if search text matches title or description, or if search is empty
    const matches = searchText === "" || title.includes(searchText) || description.includes(searchText);
    card.style.display = matches ? "" : "none";
  });

  // Check each column and show/hide no-task divs
  columns.forEach((col) => {
    const column = document.getElementById(col.id);
    const visibleTasks = column.querySelectorAll(".task-card:not([style*='display: none'])").length;
    const noTaskDiv = column.querySelector(col.noTaskClass);
    
    if (noTaskDiv) {
      noTaskDiv.style.display = visibleTasks === 0 ? "" : "none";
    }
  });
}

function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background-color: ${type === "success" ? "#7AE229" : "#FF3D00"};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-in-out;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

