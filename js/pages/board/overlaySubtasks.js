import { changeSubtaskCompletion, getTask } from "../../firebase.js";
import { changeSubtaskProgressbar } from "./render.js";
import { addSubtaskToDetailTemplate } from "../../../templates/boardTasksTemplates.js";

// DOM Logic for viewing/toggling subtasks
export function addSubtaskToDetail(task) {
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

export function addEventListenersToSubtaskButtons(taskId) {
  const container = document.getElementById(`subtaskDetails-${taskId}`);
  if (!container) return;

  const items = container.querySelectorAll(".overlay-subtask-item");
  items.forEach((item, index) => {
    item.addEventListener("click", () =>
      handleSubtaskToggle(taskId, index, item)
    );
  });
}

async function handleSubtaskToggle(taskId, index, itemDiv) {
  const checkboxDiv = itemDiv.querySelector(".custom-checkbox");
  const isChecked = checkboxDiv.classList.contains("checked");
  const newState = !isChecked; // Toggle

  // Optimistic UI Update
  if (newState) {
    checkboxDiv.classList.add("checked");
    checkboxDiv.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.288 8.775L13.763 0.3C13.963 0.1 14.2005 0 14.4755 0C14.7505 0 14.988 0.1 15.188 0.3C15.388 0.5 15.488 0.7375 15.488 1.0125C15.488 1.2875 15.388 1.525 15.188 1.725L5.988 10.925C5.788 11.125 5.55467 11.225 5.288 11.225C5.02133 11.225 4.788 11.125 4.588 10.925L0.288 6.625C0.088 6.425 -0.00783333 6.1875 0.0005 5.9125C0.00883333 5.6375 0.113 5.4 0.313 5.2C0.513 5 0.7505 4.9 1.0255 4.9C1.3005 4.9 1.538 5 1.738 5.2L5.288 8.775Z" fill="#2A3647"/></svg>';
  } else {
    checkboxDiv.classList.remove("checked");
    checkboxDiv.innerHTML = "";
  }

  try {
    await changeSubtaskCompletion(taskId, index, newState);
    const updated = await getTask(taskId);
    changeSubtaskProgressbar(updated);
  } catch (err) {
    console.error("Failed to update subtask:", err);
    // Revert UI on error
    if (isChecked) {
      checkboxDiv.classList.add("checked");
      checkboxDiv.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.288 8.775L13.763 0.3C13.963 0.1 14.2005 0 14.4755 0C14.7505 0 14.988 0.1 15.188 0.3C15.388 0.5 15.488 0.7375 15.488 1.0125C15.488 1.2875 15.388 1.525 15.188 1.725L5.988 10.925C5.788 11.125 5.55467 11.225 5.288 11.225C5.02133 11.225 4.788 11.125 4.588 10.925L0.288 6.625C0.088 6.425 -0.00783333 6.1875 0.0005 5.9125C0.00883333 5.6375 0.113 5.4 0.313 5.2C0.513 5 0.7505 4.9 1.0255 4.9C1.3005 4.9 1.538 5 1.738 5.2L5.288 8.775Z" fill="#2A3647"/></svg>';
    } else {
      checkboxDiv.classList.remove("checked");
      checkboxDiv.innerHTML = "";
    }
  }
}

// EDIT Mode Subtask Logic
let _editSubtasks = [];

export function setupEditSubtasks(task, renderCallback) {
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

export function getEditSubtasks() {
  return _editSubtasks;
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

    div.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("input")) return;
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
