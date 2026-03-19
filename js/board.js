import {
  getAllTasks,
  getContacts,
  getTask,
  deleteTask,
  changeTaskProgress,
  getSubtasksCompletionState,
  changeSubtaskCompletion,
} from "./firebase.js";
import {
  taskCardTemplate,
  taskDetailTemplate,
  assigneeAvatarTemplate,
  assigneeAvatarToDetail,
  addSubtaskToDetailTemplate,
} from "../templates/boardTasksTemplates.js";
import { getInitials, returnContactById } from "./utility.js";
import { showPopup } from "./feedback.js";
import { createBoardEditTaskController } from "./boardEditTask.js";
import { createBoardAddOverlayController } from "./boardAddOverlay.js";

const overlay = document.getElementById("taskDetailOverlay");
let contactsList = [];

const editTaskController = createBoardEditTaskController({
  overlay,
  getContactsList: () => contactsList,
  refreshTaskCard: updateTaskCard,
  showTaskDetail,
});

const addTaskOverlayController = createBoardAddOverlayController({
  getContactsList: () => contactsList,
  appendNewTaskToBoard,
});

document.addEventListener("DOMContentLoaded", async () => {
  initTaskCardClicks();
  initOverlayClose();
  initSearch();
  addTaskOverlayController.initAddTaskOverlay();

  const [tasksResult, contactsResult] = await Promise.allSettled([getAllTasks(), getContacts()]);

  if (contactsResult.status === "fulfilled") {
    contactsList = Array.isArray(contactsResult.value) ? contactsResult.value : [];
    addTaskOverlayController.populateOverlayContacts();
  } else {
    contactsList = [];
    showPopup("Contacts could not be loaded for the board.", "info");
  }

  if (tasksResult.status === "fulfilled") {
    renderTasks(tasksResult.value);
  } else {
    showPopup("Tasks could not be loaded for the board.", "info");
  }

  initDragAndDrop();
  checkColumnVisibility();
});

window.openAddTaskOverlay = () => addTaskOverlayController.openAddTaskOverlay();

function initDragAndDrop() {
  const cards = document.querySelectorAll('[draggable="true"]');
  const dropZones = document.querySelectorAll(".tasks-container");
  cards.forEach((card) => card.addEventListener("dragstart", handleDragStart));
  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  });
}

function initTaskCardClicks() {
  document.addEventListener("click", (event) => {
    const card = event.target.closest(".task-card");
    if (!card) return;
    handleTaskCardClick(event, card);
  });
}

async function handleTaskCardClick(event, card) {
  if (event.target.closest("button") || card.classList.contains("dragging")) return;
  const taskId = card.dataset.taskId || card.id.replace("task-card-", "");
  if (!taskId) return;

  try {
    const task = await getTask(taskId);
    showTaskDetail(task);
  } catch (error) {
    showPopup(error.message || "Could not load task details.");
  }
}

function showTaskDetail(task) {
  overlay.innerHTML = taskDetailTemplate(task);
  overlay.classList.add("active");
  addAssigneeAvatartoDetail(task);
  addSubtaskToDetail(task);
  addEventListenersToSubtaskButtons(task.id);
  initAddEventListenersToTaskDetailButtons(task.id);
  overlay.querySelector("#overlayCloseBtn")?.addEventListener("click", closeOverlayOnBtn);
}

function initOverlayClose() {
  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) closeOverlayOnBtn();
  });
}

function initSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;
  searchInput.addEventListener("input", (event) => {
    filterTasks(event.target.value.toLowerCase());
  });
}

function filterTasks(searchText) {
  document.querySelectorAll(".task-card").forEach((card) => {
    const title = card.querySelector(".task-title")?.textContent.toLowerCase() || "";
    const description = card.querySelector(".task-description")?.textContent.toLowerCase() || "";
    const matches = searchText === "" || title.includes(searchText) || description.includes(searchText);
    card.style.display = matches ? "" : "none";
  });
  updateNoTaskVisibility();
}

function updateNoTaskVisibility() {
  const columns = [
    { id: "todoColumn", noTaskClass: ".todo-Column-no-task" },
    { id: "progressColumn", noTaskClass: ".inProgress-Column-no-task" },
    { id: "awaitFeedbackColumn", noTaskClass: ".awaitFeedback-Column-no-task" },
    { id: "doneColumn", noTaskClass: ".done-Column-no-task" },
  ];

  columns.forEach((columnConfig) => {
    const column = document.getElementById(columnConfig.id);
    const visibleTasks = column?.querySelectorAll('.task-card:not([style*="display: none"])').length || 0;
    const noTaskDiv = column?.querySelector(columnConfig.noTaskClass);
    if (noTaskDiv) noTaskDiv.style.display = visibleTasks === 0 ? "" : "none";
  });
}

function closeOverlayOnBtn() {
  overlay.classList.add("closing");
  setTimeout(() => {
    overlay.classList.remove("active", "closing");
  }, 200);
}

function renderTasks(tasks) {
  const columns = {
    toDo: document.getElementById("todoColumn"),
    inProgress: document.getElementById("progressColumn"),
    awaitFeedback: document.getElementById("awaitFeedbackColumn"),
    done: document.getElementById("doneColumn"),
  };

  (Array.isArray(tasks) ? tasks : []).forEach((task) => {
    const column = columns[task.progress];
    if (!column) return;

    try {
      column.insertAdjacentHTML("beforeend", taskCardTemplate(task));
      changeSubtaskProgressbar(task);
      addAssigneeAvatar(task);
    } catch (error) {
      showPopup("A task could not be rendered completely.", "info");
    }
  });
}

function handleDragStart(event) {
  const card = event.target.closest('[draggable="true"]');
  event.dataTransfer.setData("text/plain", card.id);
  card.classList.add("dragging");
}

function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
}

function handleDragLeave() {
  this.style.backgroundColor = "";
}

function handleDrop(event) {
  event.preventDefault();
  const cardId = event.dataTransfer.getData("text/plain");
  const movedCard = document.getElementById(cardId);
  if (!movedCard) return;

  this.appendChild(movedCard);
  this.style.backgroundColor = "";
  movedCard.classList.remove("dragging");

  const taskId = (movedCard.dataset.taskId || movedCard.id).replace("task-card-", "");
  updateTaskProgressInFirebase(taskId, getNewProgressFromDropZone(this));
  checkColumnVisibility();
}

function updateTaskProgressInFirebase(taskId, newProgress) {
  changeTaskProgress(taskId, newProgress).catch((error) => {
    showPopup(error.message || "Task progress could not be updated.");
  });
}

function getNewProgressFromDropZone(dropZone) {
  const progressMap = {
    todoColumn: "toDo",
    progressColumn: "inProgress",
    awaitFeedbackColumn: "awaitFeedback",
    doneColumn: "done",
  };

  return progressMap[dropZone.id];
}

function checkColumnVisibility() {
  updateNoTaskVisibility();
}

function changeSubtaskProgressbar(task) {
  getSubtasksCompletionState(task.id)
    .then(({ totalSubtasks, completedSubtasks }) => {
      const progressBar = document.getElementById(`progress-bar-${task.id}`);
      const info = document.getElementById(`subtask-info-${task.id}`);
      if (info) info.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
      if (!progressBar) return;
      const percentage = (completedSubtasks / totalSubtasks) * 100 || 0;
      progressBar.style.width = `${percentage}%`;
    })
    .catch((error) => showPopup(error.message || "Subtask progress could not be loaded."));
}

function addAssigneeAvatar(task) {
  const container = document.getElementById(`task-card-${task.id}`)?.querySelector(".task-assignees");
  if (!container) return;

  (Array.isArray(task.assignedTo) ? task.assignedTo : []).forEach((uid) => {
    const contact = returnContactById(uid, contactsList);
    if (!contact) return;
    container.insertAdjacentHTML("beforeend", assigneeAvatarTemplate(getInitials(contact.name), contact.color));
  });
}

function addAssigneeAvatartoDetail(task) {
  const container = document.getElementById(`overlayDetailCard-${task.id}`)?.querySelector(".overlay-assignees");
  if (!container) return;

  (Array.isArray(task.assignedTo) ? task.assignedTo : []).forEach((uid) => {
    const contact = returnContactById(uid, contactsList);
    if (!contact) return;
    container.insertAdjacentHTML("beforeend", assigneeAvatarToDetail(getInitials(contact.name), contact.name, contact.color));
  });
}

function addSubtaskToDetail(task) {
  const subtaskDetails = document.getElementById(`subtaskDetails-${task.id}`);
  if (!subtaskDetails) return;

  subtaskDetails.innerHTML = '<span class="overlay-label">Subtasks</span>';
  task.subtasks?.forEach((subtask, index) => {
    subtaskDetails.insertAdjacentHTML("beforeend", addSubtaskToDetailTemplate(subtask.text, subtask.completed, index));
  });

  if (!task.subtasks || task.subtasks.length === 0) {
    subtaskDetails.insertAdjacentHTML("beforeend", '<p class="no-subtasks">No subtasks</p>');
  }
}

function addEventListenersToSubtaskButtons(taskId) {
  const subtaskDetails = document.getElementById(`subtaskDetails-${taskId}`);
  if (!subtaskDetails) return;

  const subtaskItems = subtaskDetails.querySelectorAll(".overlay-subtask-item");
  subtaskItems.forEach((item, index) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    checkbox.addEventListener("change", async () => handleSubtaskCheckboxChange(taskId, index, checkbox));
  });
}

async function handleSubtaskCheckboxChange(taskId, index, checkbox) {
  try {
    await changeSubtaskCompletion(taskId, index, checkbox.checked);
    const updatedTask = await getTask(taskId);
    changeSubtaskProgressbar(updatedTask);
    updateOverlaySubtaskInfo(updatedTask);
  } catch (error) {
    showPopup(error.message || "Failed to update subtask.");
    checkbox.checked = !checkbox.checked;
  }
}

function updateOverlaySubtaskInfo(task) {
  const total = task.subtasks?.length || 0;
  const completed = task.subtasks?.filter((subtask) => subtask.completed).length || 0;
  const infoElement = document.getElementById(`subtaskDetails-${task.id}`)?.querySelector(".overlay-subtask-info");
  if (infoElement) infoElement.textContent = `${completed}/${total} Subtasks`;
}

function initAddEventListenersToTaskDetailButtons(taskId) {
  document.getElementById(`deleteTaskBtn-${taskId}`)?.addEventListener("click", () => deleteTaskFromBoard(taskId));
  document.getElementById(`editTaskBtn-${taskId}`)?.addEventListener("click", async () => {
    await editTaskController.openEditTaskOverlay(taskId);
  });
}

async function updateTaskCard(taskId, updatedTask) {
  const taskCard = document.getElementById(`task-card-${taskId}`);
  if (!taskCard || !updatedTask) return;

  taskCard.outerHTML = taskCardTemplate(updatedTask);
  const newCard = document.getElementById(`task-card-${taskId}`);
  if (!newCard) return;

  newCard.querySelector(".task-assignees").innerHTML = "";
  addAssigneeAvatar(updatedTask);
  newCard.addEventListener("dragstart", handleDragStart);
}

function deleteTaskFromBoard(taskId) {
  deleteTask(taskId)
    .then(() => {
      showPopup("Task deleted.", "success");
      closeOverlayOnBtn();
      document.getElementById(`task-card-${taskId}`)?.remove();
      checkColumnVisibility();
    })
    .catch((error) => showPopup(error.message || "Error deleting task."));
}

function getTasksContainerId(progress) {
  const map = {
    toDo: "todoColumn",
    inProgress: "progressColumn",
    awaitFeedback: "awaitFeedbackColumn",
    done: "doneColumn",
  };

  return map[progress] || "todoColumn";
}

function appendNewTaskToBoard(task) {
  const column = document.getElementById(getTasksContainerId(task.progress));
  if (!column) return;

  column.insertAdjacentHTML("beforeend", taskCardTemplate(task));
  changeSubtaskProgressbar(task);
  addAssigneeAvatar(task);
  document.getElementById(`task-card-${task.id}`)?.addEventListener("dragstart", handleDragStart);
  checkColumnVisibility();
}
