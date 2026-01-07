import {
  taskDetailTemplate,
  assigneeAvatarToDetail,
  assigneeAvatarTemplate,
} from "../../../templates/boardTasksTemplates.js";
import { returnContactById, getInitials } from "../../utility.js";
import { getTask, deleteTask } from "../../firebase.js";
import {
  addSubtaskToDetail,
  addEventListenersToSubtaskButtons,
} from "./overlaySubtasks.js";
import { handleEditTaskAction } from "./overlayEdit.js";

let _GlobalContactsList = [];

// DOM Elements
const overlay = document.getElementById("taskDetailOverlay");

export function getOverlay() {
  return overlay;
}

export function setContactsListForOverlay(list) {
  _GlobalContactsList = list;
}

export function getGlobalContactsList() {
  return _GlobalContactsList;
}

/**
 * Closes the task detail overlay.
 */
export function closeOverlayOnBtn() {
  if (!overlay) return;
  overlay.classList.add("closing");
  setTimeout(() => {
    overlay.classList.remove("active", "closing");
  }, 200);
}

/**
 * Opens the overlay and loads task details.
 * @param {string} taskId
 */
export async function openTaskDetail(taskId) {
  if (!overlay) return;

  try {
    const task = await getTask(taskId);
    renderOverlayContent(task);
    overlay.classList.add("active");

    hydrateOverlay(task);
    setupOverlayCloseBtn();
  } catch (error) {
    console.error("Failed to load task details:", error);
    alert("Could not load task details.");
  }
}

/**
 * Renders the base template into the overlay.
 * @param {Object} task
 */
function renderOverlayContent(task) {
  overlay.innerHTML = "";
  const html = taskDetailTemplate(task);

  if (typeof html === "string") {
    overlay.insertAdjacentHTML("beforeend", html);
  } else if (html instanceof Node) {
    overlay.appendChild(html);
  }
}

/**
 * Populates dynamic sections (assignees, subtasks, listeners).
 * @param {Object} task
 */
function hydrateOverlay(task) {
  addAssigneeAvatartoDetail(task);
  addSubtaskToDetail(task);
  addEventListenersToSubtaskButtons(task.id);
  initAddEventListenersToTaskDetailButtons(task.id);
}

/**
 * Attaches listener to the close button.
 */
function setupOverlayCloseBtn() {
  const btn = overlay.querySelector("#overlayCloseBtn");
  if (btn) btn.addEventListener("click", closeOverlayOnBtn);
}

/**
 * Renders assignees into the detail card.
 * @param {Object} task
 */
function addAssigneeAvatartoDetail(task) {
  if (!task.assignedTo) return;

  const container = getAssigneeContainer(task.id);
  if (!container) return;

  task.assignedTo.forEach((uid) => renderDetailAvatar(container, uid));
}

function getAssigneeContainer(taskId) {
  const card = document.getElementById(`overlayDetailCard-${taskId}`);
  return card ? card.querySelector(".overlay-assignees") : null;
}

function renderDetailAvatar(container, uid) {
  const contact = returnContactById(uid, _GlobalContactsList);
  if (contact) {
    const html = assigneeAvatarToDetail(
      getInitials(contact.name),
      contact.name,
      contact.color
    );
    container.insertAdjacentHTML("beforeend", html);
  }
}

/**
 * Initializes Edit/Delete buttons.
 * @param {string} taskId
 */
function initAddEventListenersToTaskDetailButtons(taskId) {
  const del = document.getElementById(`deleteTaskBtn-${taskId}`);
  const edit = document.getElementById(`editTaskBtn-${taskId}`);

  if (del) del.addEventListener("click", () => handleDeleteTaskAction(taskId));
  if (edit) edit.addEventListener("click", () => handleEditTaskAction(taskId));
}

function handleDeleteTaskAction(taskId) {
  const btn = document.getElementById(`deleteTaskBtn-${taskId}`);
  if (!btn) return;

  // Check if already in confirm state
  if (btn.classList.contains("confirm-delete-state")) {
    // DO DELETE
    console.log("Confirmed delete for:", taskId);
    btn.disabled = true;
    btn.innerHTML = "Deleting...";

    deleteTask(taskId)
      .then(() => {
        console.log("Task deleted");
        closeOverlayOnBtn();
        setTimeout(() => window.location.reload(), 300);
      })
      .catch((err) => {
        console.error("Delete error:", err);
        alert("Delete failed: " + err.message);
        // Reset button
        resetDeleteButton(btn);
      });
  } else {
    // ENTER CONFIRM STATE
    btn.classList.add("confirm-delete-state");
    btn.classList.add("btn-delete-confirm"); // Use class for styling
    const originalContent = btn.innerHTML;
    btn.innerHTML = "Confirm"; // Professional text

    // Auto-revert after 3 seconds
    setTimeout(() => {
      if (btn && btn.classList.contains("confirm-delete-state")) {
        resetDeleteButton(btn, originalContent);
      }
    }, 3000);

    // Initial reset helper store
    btn.dataset.originalContent = originalContent;
  }
}

function resetDeleteButton(btn, originalContent) {
  if (!btn) return;
  btn.classList.remove("confirm-delete-state");
  btn.classList.remove("btn-delete-confirm"); // Remove class
  btn.style.backgroundColor = ""; // Clear any leftover inline styles if any
  btn.style.color = "";
  btn.innerHTML = originalContent || btn.dataset.originalContent || "Delete";
  btn.disabled = false;
}
