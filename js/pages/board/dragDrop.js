import { changeTaskProgress } from "../../firebase.js";
import { checkColumnVisibility } from "./render.js";

/**
 * Handles the drag start event.
 * @param {DragEvent} drag
 */
export function handleDragStart(drag) {
  const card = drag.target.closest('[draggable="true"]');
  if (!card) return;

  drag.dataTransfer.setData("text/plain", card.id);
  card.classList.add("dragging");
}

/**
 * Handles the drag over event (allows dropping).
 * @param {DragEvent} drag
 */
export function handleDragOver(drag) {
  drag.preventDefault();
  drag.dataTransfer.dropEffect = "move";

  const dropZone = drag.currentTarget;
  if (dropZone) dropZone.style.backgroundColor = "rgba(0, 102, 255, 0.1)";
}

/**
 * Handles the drag leave event.
 * @param {DragEvent} drag
 */
export function handleDragLeave(drag) {
  const dropZone = drag.currentTarget;
  if (dropZone) dropZone.style.backgroundColor = "";
}

/**
 * Handles the drop event.
 * @param {DragEvent} drag
 */
export function handleDrop(drag) {
  drag.preventDefault();
  const dropZone = drag.currentTarget;
  const cardId = drag.dataTransfer.getData("text/plain");

  if (!cardId || !dropZone) return;

  finalizeDrop(dropZone, cardId);
}

/**
 * Finalizes the drop action: moves element, updates UI and Firebase.
 * @param {HTMLElement} dropZone
 * @param {string} cardId
 */
function finalizeDrop(dropZone, cardId) {
  const movedCard = document.getElementById(cardId);
  if (!movedCard) return;

  resetDropZoneStyle(dropZone, movedCard);

  // Move DOM element directly for immediate feedback
  dropZone.appendChild(movedCard);
  checkColumnVisibility();

  const taskId = extractTaskId(movedCard);
  const newProgress = getNewProgressFromDropZone(dropZone);
  updateTaskProgressInFirebase(taskId, newProgress);
}

/**
 * Resets styles after drop.
 * @param {HTMLElement} dropZone
 * @param {HTMLElement} card
 */
function resetDropZoneStyle(dropZone, card) {
  dropZone.style.backgroundColor = "";
  card.classList.remove("dragging");
}

/**
 * Extracts pure task ID from element ID or dataset.
 * @param {HTMLElement} card
 */
function extractTaskId(card) {
  const rawId = card.dataset.taskId || card.id;
  return rawId.replace("task-card-", "");
}

/**
 * Updates task progress in Firebase.
 * @param {string} taskId
 * @param {string} newProgress
 */
function updateTaskProgressInFirebase(taskId, newProgress) {
  changeTaskProgress(taskId, newProgress).catch((error) => {
    console.error("Error updating task progress:", error);
  });
}

/**
 * Determines new progress state based on drop zone ID.
 * @param {HTMLElement} dropZone
 * @returns {string} Progress status
 */
function getNewProgressFromDropZone(dropZone) {
  const map = {
    todoColumnContainer: "toDo",
    inProgressColumnContainer: "inProgress",
    feedbackColumnContainer: "awaitFeedback",
    doneColumnContainer: "done",
  };
  return map[dropZone.id] || "toDo";
}
