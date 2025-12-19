import { getSubtasksCompletionState } from "../../firebase.js";
import {
  taskCardTemplate,
  assigneeAvatarTemplate,
} from "../../../templates/boardTasksTemplates.js";
import { getInitials, returnContactById } from "../../utility.js";

let _GlobalContactsList = [];

/**
 * Sets the contacts list used for rendering avatars.
 * @param {Array} list
 */
export function setContactsListForRender(list) {
  _GlobalContactsList = list;
}

/**
 * Main function to render tasks into columns.
 * @param {Array} tasks - List of tasks from Firestore.
 */
export function renderTasks(tasks) {
  clearAllColumns();

  tasks.forEach((task) => {
    const cardHTML = taskCardTemplate(task);
    insertTaskIntoColumn(task, cardHTML);
    updateTaskDetails(task);
  });

  checkColumnVisibility();
}

/**
 * Clears the HTML content of all board columns.
 */
function clearAllColumns() {
  const columns = [
    "todoColumn",
    "progressColumn",
    "awaitFeedbackColumn",
    "doneColumn",
  ];
  columns.forEach((id) => {
    const col = document.getElementById(id);
    if (col) {
      // Find the "no-task" placeholder and keep it, OR just re-render it if needed.
      // Actually the templates don't include the "no-task" placeholder, it's static in HTML.
      // If we clear innerHTML, we lose the placeholder div: <div class="no-task todo-Column-no-task">...</div>
      // Logic checkColumnVisibility toggles display of that placeholder.
      // So we should NOT delete it if we can avoid it, OR we just toggle its visibility.
      // If we clear innerHTML, we delete the placeholder element entirely!

      // BETTER STRATEGY:
      // 1. Select all .task-card elements in the column and remove them.
      const cards = col.querySelectorAll(".task-card");
      cards.forEach((card) => card.remove());
    }
  });
}

function insertTaskIntoColumn(task, html) {
  const columnId = getColumnIdByProgress(task.progress);
  const column = document.getElementById(columnId);
  if (column) {
    column.insertAdjacentHTML("beforeend", html);
  }
}

function getColumnIdByProgress(progress) {
  switch (progress) {
    case "toDo":
      return "todoColumn";
    case "inProgress":
      return "progressColumn";
    case "awaitFeedback":
      return "awaitFeedbackColumn";
    case "done":
      return "doneColumn";
    default:
      return "todoColumn";
  }
}

/**
 * Updates dynamic details like progress bar and avatars.
 * @param {Object} task
 */
function updateTaskDetails(task) {
  changeSubtaskProgressbar(task);
  addAssigneeAvatar(task);
}

/**
 * Toggles visibility of empty state placeholders.
 */
export function checkColumnVisibility() {
  toggleColumnPlaceholder("todoColumnContainer");
  toggleColumnPlaceholder("inProgressColumnContainer");
  toggleColumnPlaceholder("feedbackColumnContainer");
  toggleColumnPlaceholder("doneColumnContainer");
}

function toggleColumnPlaceholder(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const hasCards = container.querySelectorAll(".task-card").length > 0;
  const placeholder = container.querySelector(".no-task");

  if (placeholder) {
    placeholder.style.display = hasCards ? "none" : "flex";
  }
}

/**
 * Updates the subtask progress bar and text.
 * @param {Object} task
 */
export function changeSubtaskProgressbar(task) {
  getSubtasksCompletionState(task.id)
    .then(({ totalSubtasks, completedSubtasks }) => {
      updateProgressBarUI(task.id, totalSubtasks, completedSubtasks);
    })
    .catch((error) => console.error(error));
}

/**
 * Updates the DOM elements for progress bar.
 * @param {string} taskId
 * @param {number} total
 * @param {number} completed
 */
function updateProgressBarUI(taskId, total, completed) {
  const textEl = document.getElementById(`subtask-info-${taskId}`);
  const barEl = document.getElementById(`progress-bar-${taskId}`);

  if (textEl) textEl.textContent = `${completed}/${total} Subtasks`;

  if (barEl) {
    const percent = total > 0 ? (completed / total) * 100 : 0;
    barEl.style.width = `${percent}%`;
  }
}

/**
 * Adds assignee avatars to the task card.
 * @param {Object} task
 */
function addAssigneeAvatar(task) {
  if (!task.assignedTo) return;
  const container = getAssigneeContainer(task.id);
  if (!container) return;

  task.assignedTo.forEach((uid) => {
    const contact = returnContactById(uid, _GlobalContactsList);
    if (contact) renderAvatar(container, contact);
  });
}

/**
 * Helper to find assignee container of a card.
 * @param {string} taskId
 */
function getAssigneeContainer(taskId) {
  const card = document.getElementById(`task-card-${taskId}`);
  return card ? card.querySelector(".task-assignees") : null;
}

/**
 * Renders a single avatar.
 * @param {HTMLElement} container
 * @param {Object} contact
 */
function renderAvatar(container, contact) {
  const html = assigneeAvatarTemplate(getInitials(contact.name), contact.color);
  container.insertAdjacentHTML("beforeend", html);
}
