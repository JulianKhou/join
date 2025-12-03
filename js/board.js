import { getAllTasks,changeTaskProgress,getSubtasksCompletionState } from "./firebase.js";
import { taskCardTemplate, taskDetailTemplate } from "../templates/boardTasksTemplates.js";

const overlay = document.getElementById('taskDetailOverlay');
const closeBtn = document.getElementById('overlayCloseBtn');

document.addEventListener("DOMContentLoaded", async () => {
  const tasks = await getAllTasks();
  renderTasks(tasks);

  // query rendered cards and drop zones AFTER render
  const cards = document.querySelectorAll('[draggable="true"]');
  const dropZones = document.querySelectorAll('.kanban-column');

  // attach drag listeners
  cards.forEach(card => card.addEventListener("dragstart", handleDragStart));
  dropZones.forEach(zone => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
  });

  // attach click listener to each rendered card (create new detail per click)
  const taskCards = document.querySelectorAll('.task-card');
  taskCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('svg') || e.target.closest('button')) return;
      // create fresh detail content each time
      const taskDetail = taskDetailTemplate(card.dataset.taskId || card.id);
      // clear previous content and open overlay
      overlay.innerHTML = "";
      if (typeof taskDetail === "string") {
        overlay.insertAdjacentHTML("beforeend", taskDetail);
      } else if (taskDetail instanceof Node) {
        overlay.appendChild(taskDetail);
      }
      overlay.classList.add('active');
    });
  });
  checkColumnVisibility();

  // close handlers
  closeBtn?.addEventListener('click', () => overlay.classList.remove('active'));
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
});

function renderTasks(tasks) {
    const toDoColumn = document.getElementById('todoColumnContainer');
    const inProgressColumn = document.getElementById('inProgressColumnContainer');
    const awaitFeedbackColumn = document.getElementById('feedbackColumnContainer');
    const doneColumn = document.getElementById('doneColumnContainer');

    tasks.forEach(task => {
        const taskCardHTML = taskCardTemplate(task);
         // Assume this function generates HTML for a task card
        switch (task.progress) {
            case 'toDo':
                toDoColumn.insertAdjacentHTML('beforeend', taskCardHTML);
                
                changeSubtaskProgressbar(task);
                break;
            case 'inProgress':
                inProgressColumn.insertAdjacentHTML('beforeend', taskCardHTML);
                
                changeSubtaskProgressbar(task);
                break;
            case 'awaitFeedback':
                awaitFeedbackColumn.insertAdjacentHTML('beforeend', taskCardHTML);
         
                changeSubtaskProgressbar(task);
                break;
            case 'done':
                doneColumn.insertAdjacentHTML('beforeend', taskCardHTML);
              
                changeSubtaskProgressbar(task);
                break;
        }
    });
}

function handleDragStart(drag) {
    const card = drag.target.closest('[draggable="true"]');
    drag.dataTransfer.setData("text/plain", card.id);
    card.classList.add('dragging');
}

function handleDragOver(drag) {
    drag.preventDefault();
    drag.dataTransfer.dropEffect = "move";
    this.style.backgroundColor = "rgba(0, 102, 255, 0.1)";
}

function handleDragLeave() {
    this.style.backgroundColor = "";
}

function handleDrop(drag) {
    drag.preventDefault();
    const cardId = drag.dataTransfer.getData("text/plain");
    const movedCard = document.getElementById(cardId);
    if (!movedCard) return;

    this.appendChild(movedCard);
    this.style.backgroundColor = "";

    // prefer data-task-id if available, fall back to element id
    let taskId = movedCard.dataset.taskId || movedCard.id;
    taskId = taskId.replace('task-card-', ''); // clean up id if needed
    const newProgress = getNewProgressFromDropZone(this);
    checkColumnVisibility();
    updateTaskProgressInFirebase(taskId, newProgress);
}



function updateTaskProgressInFirebase(taskId, newProgress) {
    changeTaskProgress(taskId, newProgress)
        .then(() => {
           
        })
        .catch((error) => {
            console.error("Error updating task progress in Firebase:", error);
        });
}

function getNewProgressFromDropZone(dropZone) {
    switch (dropZone.id) {
        case 'todoColumnContainer':
            return 'toDo';
        case 'inProgressColumnContainer':
            return 'inProgress';
        case 'feedbackColumnContainer':
            return 'awaitFeedback';
        case 'doneColumnContainer':
            return 'done';
    }
}

function switchTodoColumn() {
    const toDoColumn = document.getElementById('todoColumnContainer');
    const toDoColumnContent = document.getElementById('todoColumn');
    const hasCards = toDoColumn.querySelectorAll('.task-card').length > 0;
    if (hasCards) {
        toDoColumnContent.style.display = 'none';
    } else {
        toDoColumnContent.style.display = 'block';
    }
}
function switchInProgressColumn() {
  const inProgressColumn = document.getElementById('inProgressColumnContainer');
  const inProgressColumnContent = document.getElementById('progressColumn');
  const hasCards = inProgressColumn.querySelectorAll('.task-card').length > 0;

    if (hasCards) {
        inProgressColumnContent.style.display = 'none';
    } else {
        inProgressColumnContent.style.display = 'block';
    }
}
function switchAwaitFeedbackColumn() {
  const feedbackColumn = document.getElementById('feedbackColumnContainer');
  const awaitFeedbackColumn = document.getElementById('awaitFeedbackColumn');
  // query cards INSIDE feedbackColumn only
  const hasCards = feedbackColumn.querySelectorAll('.task-card').length > 0;

  if (hasCards) {
    awaitFeedbackColumn.style.display = 'none';
  } else {
    awaitFeedbackColumn.style.display = 'block';
  }
}


function switchDoneColumn() {
    const doneColumn = document.getElementById('doneColumnContainer');
    const doneColumnContent = document.getElementById('doneColumn');
    const hasCards = doneColumn.querySelectorAll('.task-card').length > 0;
    if (hasCards) {
        doneColumnContent.style.display = 'none';
    } else {
        doneColumnContent.style.display = 'block';
    }
} 

function checkColumnVisibility() {
   switchTodoColumn();
    switchAwaitFeedbackColumn();
    switchInProgressColumn();
    switchDoneColumn();
}


function changeSubtaskProgressbar(task) {
  getSubtasksCompletionState(task.id)
    .then(({ totalSubtasks, completedSubtasks }) => {
      const progressBar = document.getElementById(`progress-bar-${task.id}`);
      const printInfo = document.getElementById(`subtask-info-${task.id}`);
      if (printInfo) {
        printInfo.textContent = `${completedSubtasks}/${totalSubtasks} Subtasks`;
      }
      if (progressBar) {
        const percentage = (completedSubtasks / totalSubtasks) * 100 || 0;
        progressBar.style.width = `${percentage}%`;
      }

    })
    .catch((error) => {
      console.error("Error getting subtask completion state:", error);
    });
}
