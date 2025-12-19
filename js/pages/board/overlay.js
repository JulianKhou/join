import {
  taskDetailTemplate,
  assigneeAvatarToDetail,
  addSubtaskToDetailTemplate,
} from "../../../templates/boardTasksTemplates.js";
import { returnContactById, getInitials } from "../../utility.js";
import {
  getTask,
  changeSubtaskCompletion,
  deleteTask,
} from "../../firebase.js";
import { changeSubtaskProgressbar } from "./render.js";

let _GlobalContactsList = [];

export function setContactsListForOverlay(list) {
  _GlobalContactsList = list;
}

const overlay = document.getElementById("taskDetailOverlay");

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
 * Renders subtasks list.
 * @param {Object} task
 */
function addSubtaskToDetail(task) {
  const container = document.getElementById(`subtaskDetails-${task.id}`);
  if (!container) return;

  container.innerHTML = '<span class="overlay-label">Subtasks</span>';

  if (!task.subtasks || task.subtasks.length === 0) {
    container.insertAdjacentHTML(
      "beforeend",
      '<p class="no-subtasks">No subtasks</p>'
    );
    return;
  }

  task.subtasks.forEach((sub, idx) => {
    const html = addSubtaskToDetailTemplate(sub.text, sub.completed, idx);
    container.insertAdjacentHTML("beforeend", html);
  });
}

/**
 * Attaches change listeners to subtask checkboxes.
 * @param {string} taskId
 */
function addEventListenersToSubtaskButtons(taskId) {
  const container = document.getElementById(`subtaskDetails-${taskId}`);
  if (!container) return;

  const items = container.querySelectorAll(".overlay-subtask-item");
  items.forEach((item, index) => setupSubtaskCheckbox(item, taskId, index));
}

/**
 * Sets up individual subtask checkbox.
 * @param {HTMLElement} item
 * @param {string} taskId
 * @param {number} index
 */
function setupSubtaskCheckbox(item, taskId, index) {
  const cb = item.querySelector('input[type="checkbox"]');
  if (!cb) return;

  cb.addEventListener("change", () => handleSubtaskToggle(taskId, index, cb));
}

/**
 * Handles subtask toggle action.
 * @param {string} taskId
 * @param {number} index
 * @param {HTMLInputElement} checkbox
 */
async function handleSubtaskToggle(taskId, index, checkbox) {
  try {
    await changeSubtaskCompletion(taskId, index, checkbox.checked);
    const updated = await getTask(taskId);
    changeSubtaskProgressbar(updated);
  } catch (err) {
    console.error("Failed to update subtask:", err);
    checkbox.checked = !checkbox.checked; // Revert UI
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
  if (confirm("Are you sure you want to delete this task?")) {
    deleteTask(taskId).then(() => {
      closeOverlayOnBtn();
      window.location.reload();
    });
  }
}

function handleEditTaskAction(taskId) {
  alert("Edit functionality not fully moved yet.");
}
