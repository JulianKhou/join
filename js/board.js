import {
  getAllTasks,
  getContacts,
  getTask,
  updateTask,
  deleteTask,
  createTask,
  addEditTask,
  changeTaskProgress,
  auth,
} from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
// import { initBoardData } from "./board.js"; // Removed self-import
import { handleDrop } from "./pages/board/dragDrop.js";
import {
  taskCardTemplate,
  assigneeAvatarToDetail,
  addSubtaskToDetailTemplate,
} from "../templates/boardTasksTemplates.js";
import { editTaskFormTemplate } from "../templates/boardEditTemplates.js";
import {
  returnContactById,
  getInitials,
  initOutsideClickHandler,
} from "./utility.js";
import {
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  // handleDrop, // Already imported above
} from "./pages/board/dragDrop.js";
import {
  renderTasks,
  checkColumnVisibility,
  setContactsListForRender,
} from "./pages/board/render.js";
import {
  openTaskDetail,
  closeOverlayOnBtn,
  setContactsListForOverlay,
} from "./pages/board/overlay.js";

const overlay = document.getElementById("taskDetailOverlay");
let contactsList = [];

/**
 * Initializes the board: loads data, renders tasks, sets up listeners.
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Board: DOMContentLoaded. Waiting for Auth...");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Board: User authenticated:", user.uid);
      try {
        await initBoardData();
      } catch (err) {
        console.error("Board: Init failed", err);
      }
    } else {
      console.warn("Board: No user logged in. Redirecting to login?");
      // Optionally redirect or show empty board
      // window.location.href = "index.html";
      // For now, let's try to init anyway in case of public access, but warn.
      console.log("Board: Attempting init without user...");
      await initBoardData();
    }
  });
});

async function initBoardData() {
  console.log("Board: Fetching tasks...");
  const tasks = await getAllTasks();
  console.log("Board: Tasks fetched:", tasks);

  // MOCK DATA CHECK: If tasks are empty, inject one to verify renderer.
  if (!tasks || tasks.length === 0) {
    console.warn(
      "Board: No tasks found in DB. Injecting MOCK task for validation."
    );
    tasks.push({
      id: "mock-1",
      title: "Test Task (Mock)",
      description: "If you see this, rendering works but DB is empty.",
      category: "User Story",
      priority: "Urgent",
      progress: "toDo",
      assignedTo: [],
      dueDate: "2023-12-31",
    });
  }

  console.log("Board: Fetching contacts...");
  contactsList = await getContacts();
  console.log("Board: Contacts fetched:", contactsList);

  initializeModules(tasks, contactsList);
  setupDragAndDropListeners();
  setupGlobalDelegationListeners();
  setupSearchListener();
  setupAddTaskListeners();
  console.log("Board: Initialization complete.");
}

/**
 * Passes data to sub-modules and triggers initial render.
 * @param {Array} tasks
 * @param {Array} contacts
 */
function initializeModules(tasks, contacts) {
  setContactsListForRender(contacts);
  setContactsListForOverlay(contacts);
  renderTasks(tasks);
}

/**
 * Sets up static drag events for columns.
 */
function setupDragAndDropListeners() {
  const dropZones = document.querySelectorAll(".kanban-column");
  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  });
}

/**
 * Sets up global event delegation (DragStart, Click on Card, etc).
 */
function setupGlobalDelegationListeners() {
  document.addEventListener("dragstart", handleGlobalDragStart);
  document.addEventListener("click", handleGlobalClick);
}

/**
 * Delegate DragStart to module.
 * @param {DragEvent} e
 */
function handleGlobalDragStart(e) {
  const card = e.target.closest('[draggable="true"]');
  if (card) handleDragStart(e);
}

/**
 * Delegate Clicks (Card Open) to module.
 * @param {MouseEvent} e
 */
function handleGlobalClick(e) {
  // 1. Task Card Click -> Open Detail
  const card = e.target.closest(".task-card");
  if (card) {
    if (!shouldIgnoreCardClick(e)) {
      const taskId = card.id.replace("task-card-", "");
      openTaskDetail(taskId);
    }
  }
}

/**
 * Checks if click should be ignored (e.g. on button/icon).
 * @param {MouseEvent} e
 */
function shouldIgnoreCardClick(e) {
  return e.target.closest("svg") || e.target.closest("button");
}

/**
 * Sets up the search input listener.
 */
function setupSearchListener() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchText = e.target.value.toLowerCase();
      filterTasks(searchText);
    });
  }
}

/**
 * Filters visible tasks based on search text.
 * @param {string} searchText
 */
function filterTasks(searchText) {
  const allTaskCards = document.querySelectorAll(".task-card");
  allTaskCards.forEach((card) => {
    const title =
      card.querySelector(".task-title")?.textContent.toLowerCase() || "";
    const description =
      card.querySelector(".task-description")?.textContent.toLowerCase() || "";

    if (title.includes(searchText) || description.includes(searchText)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
  checkColumnVisibility();
}

/* 
  NOTE: The Add Task Overlay logic below seems duplicated from the main addTask page 
  or a separate overlay. Ideally, this should also be moved to `js/pages/board/addTaskOverlay.js`.
  For this refactor step, I am keeping it minimally functional but clean.
*/

const addTaskOverlay = document.getElementById("addTaskOverlay");
const addTaskCloseBtn = document.getElementById("addTaskCloseBtn");
const addTaskCancelBtn = document.getElementById("addTaskCancelBtn");

// Expose to window if needed by HTML onclicks, otherwise standard listeners preferred
window.openAddTaskOverlay = openAddTaskOverlay;

function logError(msg) {
  console.error(`[Board Debug]: ${msg}`);
}

function openAddTaskOverlay() {
  const addTaskOverlay = document.getElementById("addTaskOverlay");
  console.log("Attempting to open add task overlay", addTaskOverlay);
  if (addTaskOverlay) {
    addTaskOverlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scroll
  } else {
    logError("addTaskOverlay element not found!");
  }
}

function closeAddTaskOverlay() {
  const addTaskOverlay = document.getElementById("addTaskOverlay");
  if (!addTaskOverlay) return;
  addTaskOverlay.classList.add("closing");
  setTimeout(() => {
    addTaskOverlay.classList.remove("active", "closing");
    document.body.style.overflow = ""; // Restore background scroll
  }, 200);
}

// Initialize Add Task Listeners inside init or check availability
function setupAddTaskListeners() {
  const addTaskCloseBtn = document.getElementById("addTaskCloseBtn");
  const addTaskCancelBtn = document.getElementById("addTaskCancelBtn");
  const addTaskOverlay = document.getElementById("addTaskOverlay");

  if (addTaskCloseBtn)
    addTaskCloseBtn.addEventListener("click", closeAddTaskOverlay);
  if (addTaskCancelBtn)
    addTaskCancelBtn.addEventListener("click", closeAddTaskOverlay);
  if (addTaskOverlay) {
    addTaskOverlay.addEventListener("click", (e) => {
      if (e.target === addTaskOverlay) closeAddTaskOverlay();
    });
  }

  const addTaskFormOverlay = document.getElementById("addTaskFormOverlay");
  if (addTaskFormOverlay) {
    console.log("Board: Attaching submit listener to addTaskFormOverlay");
    // Remove existing listener to be safe? (Not easily possible without named function reference handling, but ok for now)
    addTaskFormOverlay.removeEventListener("submit", handleAddTaskSubmit);
    addTaskFormOverlay.addEventListener("submit", handleAddTaskSubmit);
  } else {
    console.error("Board: addTaskFormOverlay not found during setup!");
  }

  // --- Subtask Listeners ---
  const addSubtaskBtn = document.getElementById("addSubtaskBtnOverlay");
  const clearSubtaskBtn = document.getElementById("removeSubtaskBtnOverlay");
  const subtaskInput = document.getElementById("overlaySubtask");

  if (addSubtaskBtn && subtaskInput) {
    addSubtaskBtn.addEventListener("click", () => {
      handleAddSubtaskOverlay();
    });
    // Also allow Enter key in input
    subtaskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault(); // Prevent form submit
        handleAddSubtaskOverlay();
      }
    });
  }

  if (clearSubtaskBtn && subtaskInput) {
    clearSubtaskBtn.addEventListener("click", () => {
      subtaskInput.value = "";
    });
  }

  // --- Priority Listeners ---
  const prioUrgent = document.getElementById("prioUrgentOverlay");
  const prioMedium = document.getElementById("prioMediumOverlay");
  const prioLow = document.getElementById("prioLowOverlay");

  if (prioUrgent && prioMedium && prioLow) {
    [prioUrgent, prioMedium, prioLow].forEach((btn) => {
      btn.addEventListener("click", (e) => {
        handlePriorityClickOverlay(e.currentTarget);
      });
    });
  }

  // --- Assigned To Listeners ---
  const selectedBox = document.getElementById("overlaySelectedBox");
  const checkboxList = document.getElementById("overlayCheckboxList");

  if (selectedBox && checkboxList) {
    selectedBox.addEventListener("click", (e) => {
      e.stopPropagation();
      checkboxList.classList.toggle("d-none"); // or custom class
      // Toggle logic using style or class. Usually d-none is standard utility.
      // But let's check if styles define it. Assuming we can just use toggle logic.
      const isVisible = checkboxList.style.display === "block";
      checkboxList.style.display = isVisible ? "none" : "block";
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".multi-select-overlay")) {
        checkboxList.style.display = "none";
      }
    });

    // Render Mock Contacts if empty
    if (checkboxList.innerHTML.trim() === "") {
      renderOverlayContacts(checkboxList);
    }
  }
}

// State
let overlaySubtasks = [];
let overlaySelectedPrio = "Medium";
let overlayAssignedContacts = [];
let contactsCache = []; // Cache to store fetched contacts

async function renderOverlayContacts(container) {
  container.innerHTML = "<div style='padding:8px;'>Loading contacts...</div>";

  try {
    if (contactsCache.length === 0) {
      contactsCache = await getContacts();
    }

    container.innerHTML = "";
    contactsCache.forEach((contact) => {
      const div = document.createElement("div");
      div.className = "contact-item-overlay";
      div.style.padding = "8px";
      div.style.cursor = "pointer";
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";

      div.innerHTML = `
        <div style="display:flex; align-items:center; gap: 8px;">
          <div style="width:30px; height:30px; border-radius:50%; background:${
            contact.color
          }; display:flex; justify-content:center; align-items:center; color:white; font-size:12px;">
            ${getInitials(contact.name)}
          </div>
          <span>${contact.name}</span>
        </div>
        <input type="checkbox" value="${
          contact.id
        }" style="pointer-events:none;"> 
      `;

      div.addEventListener("click", () => {
        const checkbox = div.querySelector("input");
        checkbox.checked = !checkbox.checked;
        handleContactSelectionOverlay(contact.id, checkbox.checked);
        div.classList.toggle("selected-contact", checkbox.checked);
      });

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load contacts for overlay", err);
    container.innerHTML =
      "<div style='padding:8px; color:red;'>Error loading contacts</div>";
  }
}

function handleContactSelectionOverlay(contactId, isSelected) {
  if (isSelected) {
    if (!overlayAssignedContacts.includes(contactId)) {
      overlayAssignedContacts.push(contactId);
    }
  } else {
    overlayAssignedContacts = overlayAssignedContacts.filter(
      (id) => id !== contactId
    );
  }

  // Update top box text
  const box = document.getElementById("overlaySelectedBox");
  if (box) {
    if (overlayAssignedContacts.length > 0) {
      box.textContent = "Select contacts to assign"; // Keep label static or dynamic
    } else {
      box.textContent = "Select contacts to assign";
    }
  }

  // Render Avatars
  renderSelectedBadgesOverlay();
}

function renderSelectedBadgesOverlay() {
  const container = document.getElementById("overlaySelectedBadges");
  if (!container) return;

  container.innerHTML = "";

  overlayAssignedContacts.forEach((contactId) => {
    // Determine source: cache or fetch?
    // We can assume contactsCache is populated if we are selecting.
    const contact = contactsCache.find((c) => c.id === contactId);
    if (contact) {
      const div = document.createElement("div");
      div.className = "selected-badge-overlay";
      div.style.backgroundColor = contact.color || "#ccc";
      div.textContent = getInitials(contact.name);
      container.appendChild(div);
    }
  });
}

function handlePriorityClickOverlay(btn) {
  const prio = btn.dataset.prio;
  overlaySelectedPrio = prio;

  // Reset all
  document.querySelectorAll(".priority-button").forEach((b) => {
    b.classList.remove("active", "prio-urgent", "prio-medium", "prio-low");
  });

  // Activate clicked
  btn.classList.add("active");
  if (prio === "Urgent") btn.classList.add("prio-urgent");
  if (prio === "Medium") btn.classList.add("prio-medium");
  if (prio === "Low") btn.classList.add("prio-low");
}

function handleAddSubtaskOverlay() {
  const input = document.getElementById("overlaySubtask");
  const text = input.value.trim();
  if (!text) return;

  overlaySubtasks.push({ text: text, done: false });
  input.value = "";
  renderOverlaySubtasks();
}

function renderOverlaySubtasks() {
  const listContainer = document.getElementById("subtasksListOverlay");
  if (!listContainer) return;

  listContainer.innerHTML = "";
  overlaySubtasks.forEach((subtask, index) => {
    const li = document.createElement("li");
    li.className = "subtask-item-overlay subtask-label"; // Match class for edit logic check
    // Using structure from addTaskTemplates.js
    li.innerHTML = `
      <div class="subtask-label-left">
         <div class="point"></div>
         <span class="subtask-text">${subtask.text}</span>
      </div>
      <div class="edit-delete-subtask-buttons">
         <button type="button" class="edit-subtask-button-size edit-btn-overlay" data-index="${index}">
            <img src="./assets/contacts/editButton.svg" alt="edit">
         </button>
         <button type="button" class="delete-subtask-button-size delete-btn-overlay" data-index="${index}">
            <img src="./assets/contacts/deleteButton.svg" alt="delete">
         </button>
      </div>
    `;

    // Add hover effect to show buttons (simpler than dblclick for overlay) or stick to dblclick if preferred.
    // Given usage, hover is often better. But I'll stick to CSS or simple JS.
    // The previous implementation had a delete button always visible?
    // Let's make them visible on hover via CSS if possible, but for now inline styles in template were display:none.
    // I will remove display:none to make them visible or handle via CSS.

    listContainer.appendChild(li);

    // Enable Edit Mode
    const editBtn = li.querySelector(".edit-btn-overlay");
    const textSpan = li.querySelector(".subtask-text");
    const containerLeft = li.querySelector(".subtask-label-left");

    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        enableOverlaySubtaskEdit(li, textSpan, index);
      });
    }
  });

  // Delete Listeners
  document.querySelectorAll(".delete-btn-overlay").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      overlaySubtasks.splice(idx, 1);
      renderOverlaySubtasks();
    });
  });
}

function enableOverlaySubtaskEdit(liItem, textSpan, index) {
  // Hide standard content, show input
  liItem.classList.add("subtask-label-active"); // Reuse style if available or define new
  const originalText = textSpan.textContent;

  // Replace content with input
  liItem.innerHTML = `
        <input type="text" class="edit-subtask-input" value="${originalText}" />
        <div class="edit-subtask-actions">
           <button type="button" class="check-btn-overlay">
              <img src="./assets/utilitys/check.svg" alt="save"> 
           </button>
           <div class="dividing-line"></div>
           <button type="button" class="delete-btn-overlay-edit">
               <img src="./assets/utilitys/close.svg" alt="cancel">
           </button>
        </div>
    `;

  const input = liItem.querySelector("input");
  input.focus();

  // Save Handler
  const save = () => {
    const newText = input.value.trim();
    if (newText) {
      overlaySubtasks[index].text = newText;
    }
    renderOverlaySubtasks();
  };

  // Cancel Handler
  const cancel = () => {
    renderOverlaySubtasks();
  };

  liItem.querySelector(".check-btn-overlay").addEventListener("click", save);
  liItem
    .querySelector(".delete-btn-overlay-edit")
    .addEventListener("click", cancel);

  // Handle Enter key
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
  });
}

// Reset function needed to clear subtasks when opening overlay?
// For now, we leave it persistent per session or clear on close.
// Adding clear to open function would be better.

async function handleAddTaskSubmit(e) {
  e.preventDefault(); // Prevent default form submission

  const titleInput = document.getElementById("overlayTaskTitle");
  const descriptionInput = document.getElementById("overlayTaskDescription");
  const dateInput = document.getElementById("overlayTaskDate");
  const categorySelect = document.getElementById("overlayCategory");
  const requiredText = document.querySelector(
    ".add-task-actions .required-text"
  );
  const submitBtn =
    e.submitter || document.querySelector(".add-task-actions .btn-create"); // safer

  // Validation Helper
  const validateField = (field) => {
    if (!field.value.trim() || field.value === "Select task category") {
      field.classList.add("input-error");
      return false;
    } else {
      field.classList.remove("input-error");
      return true;
    }
  };

  let isValid = true;
  if (!validateField(titleInput)) isValid = false;
  if (!validateField(dateInput)) isValid = false;
  if (!validateField(categorySelect)) isValid = false;

  if (!isValid) {
    if (requiredText) requiredText.classList.remove("d-none");
    return;
  }

  if (requiredText) requiredText.classList.add("d-none");

  // Disable button to prevent double submit
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = "Creating...";
  }

  const newTask = {
    title: titleInput.value,
    description: descriptionInput ? descriptionInput.value : "",
    assignedTo: overlayAssignedContacts,
    dueDate: dateInput.value,
    priority: overlaySelectedPrio, // Key mismatch fixed: prio -> priority
    category: categorySelect.value,
    subtasks: overlaySubtasks,
    progress: "toDo", // Default status
  };

  try {
    await createTask(newTask);
    await initBoardData(); // Refresh board
    closeAddTaskOverlay();
  } catch (error) {
    console.error("Board: Failed to create task", error);
    alert("Failed to create task. Please try again.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Create Task <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M5.288 8.775L13.763 0.3C13.963 0.1 14.2005 0 14.4755 0C14.7505 0 14.988 0.1 15.188 0.3C15.388 0.5 15.488 0.7375 15.488 1.0125C15.488 1.2875 15.388 1.525 15.188 1.725L5.988 10.925C5.788 11.125 5.55467 11.225 5.288 11.225C5.02133 11.225 4.788 11.125 4.588 10.925L0.288 6.625C0.088 6.425 -0.00783333 6.1875 0.0005 5.9125C0.00883333 5.6375 0.113 5.4 0.313 5.2C0.513 5 0.7505 4.9 1.0255 4.9C1.3005 4.9 1.538 5 1.738 5.2L5.288 8.775Z" fill="white" /></svg>`;
    }
  }
}

/**
 * Moves a task to the next/prev status (Mobile).
 * @param {string} taskId
 * @param {string} direction 'up' or 'down'
 */
window.moveTask = async function (taskId, direction) {
  console.log(`Moving task ${taskId} ${direction}`);
  const task = await getTask(taskId); // Assuming getTask is available and returns the task object
  if (!task) {
    console.error("Task not found for move:", taskId);
    return;
  }

  const statuses = ["toDo", "inProgress", "awaitFeedback", "done"];
  const currentIndex = statuses.indexOf(task.progress);
  if (currentIndex === -1) return;

  let newIndex = currentIndex;
  if (direction === "down") {
    newIndex = currentIndex + 1;
  } else {
    newIndex = currentIndex - 1;
  }

  // Bounds check
  if (newIndex < 0 || newIndex >= statuses.length) {
    console.warn("Cannot move task beyond boundaries.");
    return;
  }

  const newStatus = statuses[newIndex];
  task.progress = newStatus;

  // Optimistic UI update or full reload
  await updateTask(task.id, { progress: task.progress }); // Imports from firebase.js

  // Re-init board to reflect changes
  initBoardData();
};

/**
 * Resets the Add Task overlay form fields and state.
 */
function resetAddTaskForm() {
  const title = document.getElementById("overlayTaskTitle");
  const desc = document.getElementById("overlayTaskDescription");
  const date = document.getElementById("overlayTaskDate");
  const subInput = document.getElementById("overlaySubtask");
  const category = document.getElementById("overlayCategory");

  if (title) title.value = "";
  if (desc) desc.value = "";
  if (date) date.value = "";
  if (subInput) subInput.value = "";
  if (category) category.selectedIndex = 0;

  // Reset globals
  overlaySubtasks = [];
  overlayAssignedContacts = [];
  overlaySelectedPrio = "Medium";

  // Reset UI
  renderOverlaySubtasks();
  const badges = document.getElementById("overlaySelectedBadges");
  if (badges) badges.innerHTML = "";

  // Reset Prio Buttons
  const urgent = document.getElementById("prioUrgentOverlay");
  const medium = document.getElementById("prioMediumOverlay");
  const low = document.getElementById("prioLowOverlay");

  [urgent, medium, low].forEach((btn) => {
    if (btn) {
      btn.classList.remove("active", "prio-urgent", "prio-medium", "prio-low");
    }
  });

  // Default to Medium
  if (medium) {
    medium.classList.add("active", "prio-medium");
  }

  // Reset Validation Errors
  const reqText = document.querySelector(".add-task-actions .required-text");
  if (reqText) reqText.classList.add("d-none");
  document
    .querySelectorAll(".input-error")
    .forEach((el) => el.classList.remove("input-error"));

  // Reset Checkboxes in dropdown
  document
    .querySelectorAll("#overlayCheckboxList input[type='checkbox']")
    .forEach((cb) => (cb.checked = false));
  document
    .querySelectorAll(".contact-item-overlay")
    .forEach((item) => item.classList.remove("selected-contact"));
  const box = document.getElementById("overlaySelectedBox");
  if (box) box.textContent = "Select contacts to assign";
}

/**
 * Global function to open the Add Task overlay and reset form.
 */
window.openAddTaskOverlay = function () {
  const overlay = document.getElementById("addTaskOverlay");
  if (overlay) {
    // Reset form first
    resetAddTaskForm();

    // Show overlay
    overlay.classList.remove("d-none");
    // Also check if it uses 'active' class from common styles
    overlay.classList.add("active");

    // Ensure body doesn't scroll
    document.body.style.overflow = "hidden";
  }
};
