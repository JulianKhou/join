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
const initSummary = async () => {
  console.log("Initializing summary...");

  // Safety timeout: Ensure overlay is removed after 8 seconds max to prevent infinite loading
  const safetyTimeout = setTimeout(() => {
    console.warn("Summary data loading timed out, forcing overlay removal.");
    const overlay = document.getElementById("summary-loading-overlay");
    if (overlay) overlay.classList.add("d-none");
  }, 8000);

  try {
    allTasks = await getAllTasks();
    await loadUserData();
  } catch (error) {
    console.error("Error loading summary data:", error);
  } finally {
    clearTimeout(safetyTimeout);
    const overlay = document.getElementById("summary-loading-overlay");
    if (overlay) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        overlay.classList.add("d-none");
      }, 500);
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSummary);
} else {
  // DOM already ready (e.g. module loaded late)
  initSummary();
}

// Load user from localStorage, fetch fresh data from Firestore, update UI
async function loadUserData() {
  const storedUser = localStorage.getItem("currentUser");
  if (!storedUser) {
    console.error("No user found in localStorage");
    return;
  }

  currentUser = JSON.parse(storedUser);

  // Set initial data from local storage to avoid flicker
  updateGreetingName(currentUser);

  try {
    const user = await getUserById(currentUser.uid);
    currentUser = user;
    updateGreetingName(currentUser);

    // Update all task counts using global tasks (allTasks) instead of userTasks
    updateTaskCount(
      "summaryUserToDoCount",
      allTasks,
      (t) => t.progress === PROGRESS.TODO
    );
    updateTaskCount(
      "summaryUserDoneCount",
      allTasks,
      (t) => t.progress === PROGRESS.DONE
    );
    updateTaskCount(
      "summaryUserInProgressCount",
      allTasks,
      (t) => t.progress === PROGRESS.IN_PROGRESS
    );
    updateTaskCount(
      "summaryUserAwaitFeedbackCount",
      allTasks,
      (t) => t.progress === PROGRESS.AWAIT_FEEDBACK
    );

    // Special cases
    updateUrgentTasksAndDeadline(allTasks);
    updateTotalTasksOnBoard();

    // Check for phone number (Only once per session)
    const userId = currentUser.id || currentUser.uid;
    const alreadyChecked = sessionStorage.getItem("phoneCheckDone");

    if (!alreadyChecked) {
      // Don't await this one to avoid blocking UI if it's slow,
      // or do await if we want to be strict.
      // User requested "loading screen while data loaded".
      // Phone check is secondary. Let's make it non-blocking for the loader.
      getContact(userId)
        .then((contact) => {
          sessionStorage.setItem("phoneCheckDone", "true");
          if (!contact.phoneNumber) {
            // alert("Please add a phone number to your profile."); // Disabled to avoid popup blocking verification
          }
        })
        .catch((err) => console.warn("Could not check phone number:", err));
    }
  } catch (error) {
    console.error("Failed to load user data:", error);
    throw error; // Re-throw to be caught in main listener
  }
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

  if (sessionStorage.getItem("splashScreenShown")) {
    return;
  }

  if (window.innerWidth >= 750) {
    return;
  }

  sessionStorage.setItem("splashScreenShown", "true");

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

function handleResponsiveGreeting() {
  const greeting = document.querySelector(".summary-greeting");
  if (!greeting) return;

  // Only apply logic if within the tablet/desktop breakpoint where it's stacked
  // Mobile (< 750px) handles it with splash screen or hidden by CSS
  // Our breakpoint for vertical stack is 1350px.
  // We want to hide it after 2s if width <= 1350px and > 570px (mobile handles differently)

  if (window.innerWidth <= 1350 && window.innerWidth > 570) {
    setTimeout(() => {
      greeting.classList.add("fade-out");
    }, 2000);
  } else {
    // Reset if resized back to large screen
    greeting.classList.remove("fade-out");
  }
}

// Run on load
document.addEventListener("DOMContentLoaded", handleResponsiveGreeting);
// Optional: Run on resize (debounced preferably, but simple here)
window.addEventListener("resize", handleResponsiveGreeting);
