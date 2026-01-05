import {
  getAllTasks,
  getContacts,
  getTask,
  updateTask,
  deleteTask,
  updateTask,
  createTask,
  addEditTask,
} from "./firebase.js";
import {
  taskCardTemplate,
  editTaskFormTemplate,
  assigneeAvatarToDetail,
  addSubtaskToDetailTemplate,
} from "../templates/boardTasksTemplates.js";
import {
  returnContactById,
  getInitials,
  initOutsideClickHandler,
} from "./utility.js";
import {
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
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
document.addEventListener("DOMContentLoaded", async () => {
  const tasks = await getAllTasks();
  contactsList = await getContacts();

  initializeModules(tasks, contactsList);
  setupDragAndDropListeners();
  setupGlobalDelegationListeners();
  setupSearchListener();
});

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

function openAddTaskOverlay() {
  if (addTaskOverlay) addTaskOverlay.classList.add("active");
}

function closeAddTaskOverlay() {
  if (!addTaskOverlay) return;
  addTaskOverlay.classList.add("closing");
  setTimeout(() => {
    addTaskOverlay.classList.remove("active", "closing");
  }, 200);
}

if (addTaskCloseBtn)
  addTaskCloseBtn.addEventListener("click", closeAddTaskOverlay);
if (addTaskCancelBtn)
  addTaskCancelBtn.addEventListener("click", closeAddTaskOverlay);
if (addTaskOverlay) {
  addTaskOverlay.addEventListener("click", (e) => {
    if (e.target === addTaskOverlay) closeAddTaskOverlay();
  });
}
