import { getAllTasksFromContacts } from "./utility.js";
import { getUserById, getAllTasks } from "./firebase.js";
import { showPopup } from "./feedback.js";

let currentUser = null;
let allTasks = [];

const PROGRESS = {
  TODO: "toDo",
  IN_PROGRESS: "inProgress",
  AWAIT_FEEDBACK: "awaitFeedback",
  DONE: "done",
};

const PRIORITY = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

document.addEventListener("DOMContentLoaded", async () => {
  allTasks = await getAllTasks();
  loadUserData();
});

function loadUserData() {
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) {
    window.location.href = "logIn.html";
    return;
  }

  currentUser = JSON.parse(storedUser);

  getUserById(currentUser.uid)
    .then((user) => {
      currentUser = user;
      const usernameTarget = document.getElementById("shownUsernameOnSummary");

      if (currentUser.username === "Guest") {
        if (usernameTarget) usernameTarget.textContent = "";
      } else if (usernameTarget) {
        usernameTarget.textContent = currentUser.username || currentUser.name || "Unknown";
      }

      const effectiveUid = currentUser.id || currentUser.uid;
      const userTasks = getUserTasks(effectiveUid);

      updateTaskCount("summaryUserToDoCount", userTasks, (task) => task.progress === PROGRESS.TODO);
      updateTaskCount("summaryUserDoneCount", userTasks, (task) => task.progress === PROGRESS.DONE);
      updateTaskCount("summaryUserInProgressCount", userTasks, (task) => task.progress === PROGRESS.IN_PROGRESS);
      updateTaskCount(
        "summaryUserAwaitFeedbackCount",
        userTasks,
        (task) => task.progress === PROGRESS.AWAIT_FEEDBACK
      );

      updateUrgentTasksAndDeadline(userTasks);
      updateTotalTasksOnBoard();
    })
    .catch(() => {
      showPopup("Failed to load summary data.");
    });
}

function getUserTasks(uid) {
  if (!uid) {
    return [];
  }
  return getAllTasksFromContacts(allTasks, uid);
}

function updateTaskCount(elementId, userTasks, filterFn) {
  const count = userTasks.filter(filterFn).length;
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = count;
  }
}

function updateUrgentTasksAndDeadline(userTasks) {
  let nextUrgentDate = null;

  const urgentTasks = userTasks.filter(
    (task) =>
      (task.priority === PRIORITY.URGENT || task.priority === PRIORITY.HIGH) &&
      task.progress !== PROGRESS.DONE
  );

  urgentTasks.forEach((task) => {
    const dueDate = new Date(task.dueDate);
    if (!nextUrgentDate || dueDate < nextUrgentDate) {
      nextUrgentDate = dueDate;
    }
  });

  const countElement = document.getElementById("summaryUserUrgentCount");
  if (countElement) countElement.textContent = urgentTasks.length;

  const dateElement = document.getElementById("summaryUserUrgentDate");
  if (!dateElement) return;

  if (nextUrgentDate) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    dateElement.textContent = nextUrgentDate.toLocaleDateString("en-US", options);
  } else {
    dateElement.textContent = "No urgent tasks";
  }
}

function updateTotalTasksOnBoard() {
  const element = document.getElementById("summaryAllTasksOnBoardCount");
  if (element) {
    element.textContent = allTasks.length;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash-screen");
  const main = document.querySelector(".main-content-summary");

  if (!splash || !main || window.innerWidth >= 750) {
    if (splash) splash.style.display = "none";
    return;
  }

  const storedUser = localStorage.getItem("currentUser");
  let greeting = "Good morning!";

  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user.username && user.username !== "Guest") {
      greeting = `Good morning, ${user.username}!`;
    }
  }

  splash.textContent = greeting;
  main.style.visibility = "hidden";
  splash.style.display = "flex";

  setTimeout(() => {
    splash.style.opacity = 0;
    setTimeout(() => {
      splash.style.display = "none";
      main.style.visibility = "visible";
    }, 500);
  }, 2000);
});
