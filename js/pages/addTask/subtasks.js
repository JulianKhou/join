import { addSubTask } from "../../../templates/addTaskTemplates.js";

/**
 * Initializes double-click event to show edit/delete buttons.
 * @param {HTMLElement} subtaskElement - The subtask DOM element.
 */
function addSubtaskEventListeners(subtaskElement) {
  const editBtn = subtaskElement.querySelector(".edit-subtask-button-size");
  const deleteBtn = subtaskElement.querySelector(".delete-subtask-button-size");

  subtaskElement.addEventListener("dblclick", (e) => {
    e.preventDefault();
    if (editBtn) editBtn.style.display = "inline-block";
    if (deleteBtn) deleteBtn.style.display = "inline-block";
    addSubtaskBtnEventListeners(subtaskElement);
  });
}

/**
 * Attaches event listeners to the edit and delete buttons of a subtask.
 * @param {HTMLElement} subtaskNode - The subtask container node.
 */
function addSubtaskBtnEventListeners(subtaskNode) {
  const editBtn = subtaskNode.querySelector(".edit-subtask-button-size");
  const deleteBtn = subtaskNode.querySelector(".delete-subtask-button-size");
  const subtaskElement =
    subtaskNode.querySelector(".subtask-label-left") || subtaskNode;

  if (editBtn && editBtn.style.display !== "none") {
    editBtn.addEventListener("click", (e) =>
      handleEditClick(e, subtaskNode, subtaskElement)
    );
  }

  if (deleteBtn && deleteBtn.style.display !== "none") {
    deleteBtn.addEventListener("click", (e) =>
      handleDeleteClick(e, subtaskNode)
    );
  }
}

/**
 * Handles the click event for the edit button.
 * @param {Event} e
 * @param {HTMLElement} subtaskNode
 * @param {HTMLElement} subtaskElement
 */
function handleEditClick(e, subtaskNode, subtaskElement) {
  e.preventDefault();
  e.stopPropagation();
  const textSpan = subtaskElement.querySelector("span");
  if (textSpan) {
    enableSubtaskEdit(subtaskNode, textSpan);
  }
}

/**
 * Handles the click event for the delete button.
 * @param {Event} e
 * @param {HTMLElement} subtaskNode
 */
function handleDeleteClick(e, subtaskNode) {
  e.preventDefault();
  subtaskNode.remove();
}

/**
 * Enables edit mode for a subtask.
 * @param {HTMLElement} subtaskNode
 * @param {HTMLElement} textSpan
 */
function enableSubtaskEdit(subtaskNode, textSpan) {
  editableSubtaskText(subtaskNode);

  const closeEdit = () => finishSubtaskEdit(subtaskNode, handleOutsideClick);

  // Create named handler to remove it later
  const handleOutsideClick = (event) => {
    const clickedInside = event.target.closest(".subtask-label");
    if (clickedInside !== subtaskNode) closeEdit();
  };

  setTimeout(() => document.addEventListener("click", handleOutsideClick), 0);
  textSpan.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        closeEdit();
      }
    },
    { once: true }
  );
}

/**
 * Finalizes the edit mode, cleaning up listeners and styles.
 * @param {HTMLElement} subtaskNode
 * @param {Function} outsideHandler
 */
function finishSubtaskEdit(subtaskNode, outsideHandler) {
  removeEditableSubtaskText(subtaskNode);
  document.removeEventListener("click", outsideHandler);
}

/**
 * Styles the subtask for editing (contentEditable).
 * @param {HTMLElement} subtaskElement
 */
function editableSubtaskText(subtaskElement) {
  const textSpan = subtaskElement.querySelector("span");
  const pointDiv = subtaskElement.querySelector(".point");
  if (pointDiv) pointDiv.style.display = "none";

  if (textSpan) {
    textSpan.contentEditable = true;
    textSpan.focus();
    selectAllText(textSpan);
  }
  subtaskElement.classList.add("subtask-label-active");
}

/**
 * Selects all text within an element.
 * @param {HTMLElement} element
 */
function selectAllText(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Reverts the subtask style from editing mode.
 * @param {HTMLElement} subtaskElement
 */
function removeEditableSubtaskText(subtaskElement) {
  const textSpan = subtaskElement.querySelector("span");
  const pointDiv = subtaskElement.querySelector(".point");

  if (pointDiv) pointDiv.style.display = "block";
  if (textSpan) textSpan.contentEditable = false;

  subtaskElement.classList.remove("subtask-label-active");
}

/**
 * Initializes the main Add and Remove subtask buttons.
 */
export function initSubtaskEventListeners() {
  const addBtn = document.getElementById("addSubtaskBtn");
  const removeBtn = document.getElementById("removeSubtaskBtn");

  if (!addBtn || !removeBtn) return;

  addBtn.addEventListener("click", handleAddSubtask);
  removeBtn.addEventListener("click", handleRemoveLastSubtask);
}

/**
 * add subtask event handler
 * @param {MouseEvent} e
 */
function handleAddSubtask(e) {
  e.preventDefault();
  const input = document.getElementById("subtasks");
  const list = document.getElementById("subtasksList");
  const text = input?.value.trim();

  if (text && list) {
    list.insertAdjacentHTML("beforeend", addSubTask(text));
    addSubtaskEventListeners(list.lastElementChild);
    input.value = "";
  }
}

/**
 * remove last subtask event handler
 * @param {MouseEvent} e
 */
function handleRemoveLastSubtask(e) {
  e.preventDefault();
  const list = document.getElementById("subtasksList");
  if (list?.lastElementChild) {
    list.removeChild(list.lastElementChild);
  }
}

/**
 * Retrieves the current list of subtasks.
 * @returns {Array<{text: string, completed: boolean}>} List of subtask objects.
 */
export function getSubtasksList() {
  const list = document.getElementById("subtasksList");
  if (!list) return [];

  const subtasks = [];
  list.querySelectorAll("span").forEach((span) => {
    const cb = span.querySelector('input[type="checkbox"]');
    subtasks.push({
      text: span.textContent.trim(),
      completed: cb ? cb.checked : false,
    });
  });
  return subtasks;
}

/**
 * Clears the visible subtask list.
 */
export function clearSubtasksList() {
  const list = document.getElementById("subtasksList");
  if (list) list.innerHTML = "";
}
