import { getTask, updateTask } from "../../firebase.js";
import { editTaskFormTemplate } from "../../../templates/boardEditTemplates.js";
import {
  openTaskDetail,
  setContactsListForOverlay,
  getGlobalContactsList, // We need to export this getter from helpers or pass it
} from "./overlayHelpers.js";
import { setupEditSubtasks, getEditSubtasks } from "./overlaySubtasks.js";
import { assigneeAvatarTemplate } from "../../../templates/boardTasksTemplates.js";
import { returnContactById, getInitials } from "../../utility.js";

// State for edit mode
let _editSelectedPriority = "Medium";
let _editSelectedAssignees = [];

export async function handleEditTaskAction(taskId) {
  try {
    const task = await getTask(taskId);
    renderEditOverlayContent(task);
    setupEditOverlayListeners(task);
    setupEditAssignees(task);
    setupEditSubtasks(task);
  } catch (error) {
    console.error("Failed to load task for editing:", error);
    alert("Could not load task for editing.");
  }
}

function renderEditOverlayContent(task) {
  const overlay = document.getElementById("taskDetailOverlay");
  if (!overlay) return;

  overlay.innerHTML = "";
  // We need contacts list. It's in helpers. We can pass it or fetch it.
  // Ideally, overlayHelpers should export it or we import `getContacts` here if needed.
  // For now, let's assume we can get it from helpers.
  const contactsList = getGlobalContactsList();
  const html = editTaskFormTemplate(task, [], contactsList);

  if (typeof html === "string") {
    overlay.insertAdjacentHTML("beforeend", html);
  } else if (html instanceof Node) {
    overlay.appendChild(html);
  }
}

function setupEditOverlayListeners(task) {
  const closeBtn = document.getElementById("editOverlayCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => openTaskDetail(task.id));
  }

  const form = document.getElementById(`editTaskForm-${task.id}`);
  if (form) {
    form.addEventListener("submit", (e) => handleEditFormSubmit(e, task.id));
  }

  setupEditPriorityButtons(task.id, task.priority);
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
        priorities.forEach((pr) => {
          const b = document.getElementById(
            `edit-priority-${pr.toLowerCase()}-${taskId}`
          );
          if (b) b.classList.remove(`edit-priority-${pr.toLowerCase()}-active`);
        });
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

  box.addEventListener("click", (e) => {
    e.stopPropagation();
    list.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove("active");
    }
  });

  renderEditContactsList(task.id, list);
  updateEditAssigneeUI(task.id);
}

function renderEditContactsList(taskId, listContainer) {
  listContainer.innerHTML = "";
  const contactsList = getGlobalContactsList();

  contactsList.forEach((contact) => {
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
  const contactsList = getGlobalContactsList();

  if (container) {
    container.innerHTML = "";
    _editSelectedAssignees.forEach((uid) => {
      const contact = returnContactById(uid, contactsList);
      if (contact) {
        const div = document.createElement("div");
        div.className = "edit-assignee-avatar";
        div.style.backgroundColor = contact.color;
        div.innerText = getInitials(contact.name);
        container.appendChild(div);
      }
    });
  }

  if (box) {
    box.value = _editSelectedAssignees.length > 0 ? "Contacts selected" : "";
  }
}

async function handleEditFormSubmit(e, taskId) {
  e.preventDefault();

  const title = document.getElementById(`editTaskTitle-${taskId}`).value;
  const description = document.getElementById(
    `editTaskDescription-${taskId}`
  ).value;
  const dueDate = document.getElementById(`editTaskDate-${taskId}`).value;

  const subtasks = getEditSubtasks();

  const updateData = {
    title,
    description,
    dueDate,
    priority: _editSelectedPriority,
    assignedTo: _editSelectedAssignees,
    subtasks: subtasks,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateTask(taskId, updateData);
    openTaskDetail(taskId);
    window.location.reload();
  } catch (error) {
    console.error("Failed to update task:", error);
    alert("Failed to save changes.");
  }
}
