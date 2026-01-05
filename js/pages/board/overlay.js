import {
  taskDetailTemplate,
  assigneeAvatarToDetail,
  addSubtaskToDetailTemplate,
  editTaskFormTemplate,
  assigneeAvatarTemplate,
} from "../../../templates/boardTasksTemplates.js";
import { returnContactById, getInitials } from "../../utility.js";
import {
  getTask,
  changeSubtaskCompletion,
  deleteTask,
  updateTask,
} from "../../firebase.js";
import { changeSubtaskProgressbar } from "./render.js";

let _GlobalContactsList = [];

export function setContactsListForOverlay(list) {
  _GlobalContactsList = list;
}

const overlay = document.getElementById("taskDetailOverlay");
if (overlay) {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeOverlayOnBtn();
    }
  });
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

async function handleEditTaskAction(taskId) {
  try {
    const task = await getTask(taskId);
    renderEditOverlayContent(task);
    setupEditOverlayListeners(task);
    setupEditOverlayListeners(task);
    setupEditAssignees(task); // Initialize assigned-to logic
    setupEditSubtasks(task); // Initialize subtasks logic
  } catch (error) {
    console.error("Failed to load task for editing:", error);
    alert("Could not load task for editing.");
  }
}

function renderEditOverlayContent(task) {
  const overlay = document.getElementById("taskDetailOverlay");
  if (!overlay) return;

  overlay.innerHTML = "";
  // We can pass dummy categories/contacts if the template uses them for dropdowns,
  // or use the global lists if available.
  // For now assuming template uses them or we might need to adjust template.
  // The template signature is editTaskFormTemplate(task, categories, contacts).
  const html = editTaskFormTemplate(task, [], _GlobalContactsList);

  if (typeof html === "string") {
    overlay.insertAdjacentHTML("beforeend", html);
  } else if (html instanceof Node) {
    overlay.appendChild(html);
  }
}

function setupEditOverlayListeners(task) {
  const closeBtn = document.getElementById("editOverlayCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => openTaskDetail(task.id)); // Go back to detail
  }

  const form = document.getElementById(`editTaskForm-${task.id}`);
  if (form) {
    form.addEventListener("submit", (e) => handleEditFormSubmit(e, task.id));
  }

  // Setup priority buttons in edit mode
  setupEditPriorityButtons(task.id, task.priority);
}

// Helper to handle priority selection visually in edit form
let _editSelectedPriority = "Medium";
let _editSelectedAssignees = [];
let _editSubtasks = [];

function setupEditSubtasks(task) {
  _editSubtasks = task.subtasks || [];
  renderEditSubtasks(task.id);

  const input = document.getElementById(`editSubtasks-${task.id}`);
  const addBtn = document.getElementById(`editAddSubtaskBtn-${task.id}`);
  const clearBtn = document.getElementById(`editRemoveSubtaskBtn-${task.id}`);

  if (input && addBtn) {
    addBtn.addEventListener("click", () => addEditSubtask(task.id));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addEditSubtask(task.id);
      }
    });
  }

  if (clearBtn && input) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
    });
  }
}

function renderEditSubtasks(taskId) {
  const container = document.getElementById(`editSubtasksList-${taskId}`);
  if (!container) return;

  container.innerHTML = "";

  _editSubtasks.forEach((sub, index) => {
    const div = document.createElement("div");
    div.className = "subtask-label";

    div.innerHTML = `
       <div class="subtask-label-left">
         <div class="point"></div>
         <span class="subtask-text">${sub.text}</span>
       </div>
       <div class="edit-delete-subtask-buttons">
         <button class="edit-subtask-button-size" type="button">
            <img src="./assets/contacts/editButton.svg" alt="edit">
         </button>
         <button class="delete-subtask-button-size" type="button">
            <img src="./assets/contacts/deleteButton.svg" alt="delete">
         </button>
       </div>
     `;

    const editBtn = div.querySelector(".edit-subtask-button-size");
    const deleteBtn = div.querySelector(".delete-subtask-button-size");
    const labelLeft = div.querySelector(".subtask-label-left");

    deleteBtn.addEventListener("click", () => removeEditSubtask(taskId, index));

    editBtn.addEventListener("click", () => {
      enableOverlaySubtaskEdit(div, index, sub.text, taskId);
    });

    labelLeft.addEventListener("dblclick", () => {
      enableOverlaySubtaskEdit(div, index, sub.text, taskId);
    });

    // Toggle focus on single click
    div.addEventListener("click", (e) => {
      // Ignore if clicking buttons directly
      if (e.target.closest("button") || e.target.closest("input")) return;

      // Optional: Remove focus from others?
      // container.querySelectorAll('.subtask-label').forEach(el => el.classList.remove('subtask-focus'));

      div.classList.toggle("subtask-focus");
    });

    container.appendChild(div);
  });
}

function enableOverlaySubtaskEdit(rowDiv, index, currentText, taskId) {
  rowDiv.classList.add("subtask-label-active");
  rowDiv.innerHTML = `
      <input type="text" class="edit-subtask-input-inline" value="${currentText}" />
      <div class="edit-subtask-buttons-inline">
        <button type="button" class="subtask-check-btn">
            <img src="./assets/utilitys/check.svg" alt="check">
        </button>
        <div class="dividing-line"></div>
        <button type="button" class="subtask-delete-btn">
             <img src="./assets/contacts/deleteButton.svg" alt="delete">
        </button>
      </div>
    `;

  const input = rowDiv.querySelector("input");
  const checkBtn = rowDiv.querySelector(".subtask-check-btn");
  const delBtn = rowDiv.querySelector(".subtask-delete-btn");

  input.focus();

  const save = () => {
    const newVal = input.value.trim();
    if (newVal) {
      _editSubtasks[index].text = newVal;
    } else {
      _editSubtasks.splice(index, 1);
    }
    renderEditSubtasks(taskId);
  };

  checkBtn.addEventListener("click", save);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") save();
  });

  delBtn.addEventListener("click", () => {
    _editSubtasks.splice(index, 1);
    renderEditSubtasks(taskId);
  });
}

function addEditSubtask(taskId) {
  const input = document.getElementById(`editSubtasks-${taskId}`);
  if (!input || !input.value.trim()) return;

  _editSubtasks.push({
    text: input.value.trim(),
    completed: false,
  });

  input.value = "";
  renderEditSubtasks(taskId);
}

function removeEditSubtask(taskId, index) {
  _editSubtasks.splice(index, 1);
  renderEditSubtasks(taskId);
}

function setupEditPriorityButtons(taskId, currentPriority) {
  _editSelectedPriority = currentPriority;

  const priorities = ["Urgent", "Medium", "Low"];

  priorities.forEach((p) => {
    const btn = document.getElementById(
      `edit-priority-${p.toLowerCase()}-${taskId}`
    );
    if (btn) {
      const activeClass = `edit-priority-${p.toLowerCase()}-active`;

      if (p === currentPriority) {
        btn.classList.add(activeClass);
      }

      btn.addEventListener("click", () => {
        // Reset all
        priorities.forEach((pr) => {
          const b = document.getElementById(
            `edit-priority-${pr.toLowerCase()}-${taskId}`
          );
          if (b) b.classList.remove(`edit-priority-${pr.toLowerCase()}-active`);
        });
        // Set active
        btn.classList.add(activeClass);
        _editSelectedPriority = p;
      });
    }
  });
}

function setupEditAssignees(task) {
  _editSelectedAssignees = task.assignedTo || [];
  const list = document.getElementById(`editCheckboxList-${task.id}`);
  const box = document.getElementById(`editSelectedBox-${task.id}`);

  if (!list || !box) return;

  // Toggle dropdown
  box.addEventListener("click", (e) => {
    e.stopPropagation();
    list.classList.toggle("active");
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove("active");
    }
  });

  // Render list
  renderEditContactsList(task.id, list);

  // Initial UI update
  updateEditAssigneeUI(task.id);
}

function renderEditContactsList(taskId, listContainer) {
  listContainer.innerHTML = "";

  _GlobalContactsList.forEach((contact) => {
    const isChecked = _editSelectedAssignees.includes(contact.id);
    const div = document.createElement("div");
    div.className = "checkbox-item";
    div.innerHTML = `
      <div class="assignedToCheckboxNameIcon">
        <div class="assignee-avatar" style="background-color: ${
          contact.color
        }; font-size: 10px; width: 24px; height: 24px;">${getInitials(
      contact.name
    )}</div>
        <span>${contact.name}</span>
      </div>
      <input type="checkbox" value="${contact.id}" ${
      isChecked ? "checked" : ""
    }>
    `;

    // Checkbox listener
    const checkbox = div.querySelector("input");
    div.addEventListener("click", (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      toggleEditAssignee(taskId, contact.id, checkbox.checked);
    });

    listContainer.appendChild(div);
  });
}

function toggleEditAssignee(taskId, contactId, isChecked) {
  if (isChecked) {
    if (!_editSelectedAssignees.includes(contactId)) {
      _editSelectedAssignees.push(contactId);
    }
  } else {
    _editSelectedAssignees = _editSelectedAssignees.filter(
      (id) => id !== contactId
    );
  }
  updateEditAssigneeUI(taskId);
}

function updateEditAssigneeUI(taskId) {
  const container = document.getElementById(`editAssignees-${taskId}`);
  const box = document.getElementById(`editSelectedBox-${taskId}`);

  if (container) {
    container.innerHTML = "";
    _editSelectedAssignees.forEach((uid) => {
      const contact = returnContactById(uid, _GlobalContactsList);
      if (contact) {
        const avatar = assigneeAvatarTemplate(
          getInitials(contact.name),
          contact.color
        );
        // slightly adjusted template usage or custom HTML
        const div = document.createElement("div");
        div.className = "edit-assignee-avatar";
        div.style.backgroundColor = contact.color;
        div.innerText = getInitials(contact.name);
        container.appendChild(div);
      }
    });
  }

  if (box) {
    if (_editSelectedAssignees.length > 0) {
      box.value = "Contacts selected"; // or list names if preferred
    } else {
      box.value = "";
    }
  }
}

async function handleEditFormSubmit(e, taskId) {
  e.preventDefault();

  const title = document.getElementById(`editTaskTitle-${taskId}`).value;
  const description = document.getElementById(
    `editTaskDescription-${taskId}`
  ).value;
  const dueDate = document.getElementById(`editTaskDate-${taskId}`).value;

  // Collect other fields if needed, e.g. assignedTo, subtasks
  // For MVP fix, we rely on what's in the form.
  // Note: The template includes complex assignedTo/subtasks UI but
  // we might need more JS to make those interactive in Edit mode.
  // For now, let's update the main fields and priority.

  const updateData = {
    title,
    description,
    dueDate,
    priority: _editSelectedPriority,
    assignedTo: _editSelectedAssignees,
    subtasks: _editSubtasks,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateTask(taskId, updateData);
    // Reload detail view
    openTaskDetail(taskId);
    // Or reload board?
    // window.location.reload(); // Simple sync
    // Better: refresh board + detail

    // To properly refresh everything without reload:
    // 1. Close overlay
    // closeOverlayOnBtn();
    // 2. Re-fetch tasks and re-render board (requires referencing board.js export, which isn't easy here due to circular deps)
    // So reload is safer for now.
    window.location.reload();
  } catch (error) {
    console.error("Failed to update task:", error);
    alert("Failed to save changes.");
  }
}
