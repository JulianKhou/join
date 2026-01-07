import { getAllTasksFromContacts } from "./utility.js";
import { getUserById, getAllTasks, getContact } from "./firebase.js";

let currentUser = null;
let allTasks = [];

// Constants for magic strings
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

// Initialize: load all tasks from Firestore and populate UI
document.addEventListener("DOMContentLoaded", async () => {
  allTasks = await getAllTasks();
  loadUserData();
});

// Load user from localStorage, fetch fresh data from Firestore, update UI
function loadUserData() {
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) {
    console.error("No user found in localStorage");
    return;
  }

  currentUser = JSON.parse(storedUser);

  // Set initial data from local storage to avoid flicker
  updateGreetingName(currentUser);

  getUserById(currentUser.uid)
    .then((user) => {
      currentUser = user;
      updateGreetingName(currentUser);

      const userTasks = getUserTasks(currentUser.id);

      // Update all task counts
      updateTaskCount(
        "summaryUserToDoCount",
        userTasks,
        (t) => t.progress === PROGRESS.TODO
      );
      updateTaskCount(
        "summaryUserDoneCount",
        userTasks,
        (t) => t.progress === PROGRESS.DONE
      );
      updateTaskCount(
        "summaryUserInProgressCount",
        userTasks,
        (t) => t.progress === PROGRESS.IN_PROGRESS
      );
      updateTaskCount(
        "summaryUserAwaitFeedbackCount",
        userTasks,
        (t) => t.progress === PROGRESS.AWAIT_FEEDBACK
      );

      // Special cases
      updateUrgentTasksAndDeadline(userTasks);
      updateTotalTasksOnBoard();

      // Check for phone number (Only once per session)
      const userId = currentUser.id || currentUser.uid;
      const alreadyChecked = sessionStorage.getItem("phoneCheckDone");

      if (!alreadyChecked) {
        getContact(userId)
          .then((contact) => {
            // Mark as checked immediately so we don't spam even if it fails
            sessionStorage.setItem("phoneCheckDone", "true");

            if (!contact.phoneNumber) {
              alert("Please add a phone number to your profile.");
            }
          })
          .catch((err) => console.warn("Could not check phone number:", err));
      }
    })
    .catch((error) => {
      console.error("Failed to load user data:", error);
    });
}

// Filter all tasks to only those assigned to the given user
function getUserTasks(uid) {
  if (!uid) {
    console.warn("getUserTasks: uid is undefined");
    return [];
  }
  return getAllTasksFromContacts(allTasks, uid);
}

// Generic counter function (DRY) — counts tasks matching filterFn and updates DOM
function updateTaskCount(elementId, userTasks, filterFn) {
  const count = userTasks.filter(filterFn).length;
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = count;
  } else {
    console.warn(`Element ${elementId} not found`);
  }
}

// Count urgent tasks (priority="Urgent"/"High", not done) & show next deadline
function updateUrgentTasksAndDeadline(userTasks) {
  let nextUrgentDate = null;

  const urgentTasks = userTasks.filter(
    (task) =>
      (task.priority === PRIORITY.URGENT || task.priority === PRIORITY.HIGH) &&
      task.progress !== PROGRESS.DONE
  );

  // Find earliest due date among urgent tasks
  urgentTasks.forEach((task) => {
    const dueDate = new Date(task.dueDate);
    if (!nextUrgentDate || dueDate < nextUrgentDate) {
      nextUrgentDate = dueDate;
    }
  });

  // Update counter
  const countElement = document.getElementById("summaryUserUrgentCount");
  if (countElement) countElement.textContent = urgentTasks.length;

  // Update next urgent deadline (formatted)
  const dateElement = document.getElementById("summaryUserUrgentDate");
  if (dateElement) {
    if (nextUrgentDate) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      dateElement.textContent = nextUrgentDate.toLocaleDateString(
        "en-US",
        options
      );
    } else {
      dateElement.textContent = "No urgent tasks";
    }
  }
}

// Display total number of tasks on the board (all users)
function updateTotalTasksOnBoard() {
  const element = document.getElementById("summaryAllTasksOnBoardCount");
  if (element) {
    element.textContent = allTasks.length;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash-screen");
  const main = document.querySelector(".main-content-summary");

  if (window.innerWidth >= 750) {
    splash.style.display = "none";
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

function updateGreetingName(user) {
  const nameElement = document.getElementById("shownUsernameOnSummary");
  if (!nameElement) return;

  // Try multiple fields to find a display name
  const displayName =
    user.username ||
    user.name ||
    (user.email ? user.email.split("@")[0] : "") ||
    "Guest";
  nameElement.textContent = displayName;
}
