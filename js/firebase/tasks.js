import { db, auth } from "./init.js";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

/**
 * Creates a new task in the tasks collection.
 * @param {Object} task - Task data object
 * @returns {Promise<string>} The ID of the created task
 */
export async function createTask(task) {
  const user = auth.currentUser;
  const taskRef = doc(collection(db, "tasks"));
  const createData = {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    subtasks: task.subtasks,
    assignedTo: task.assignedTo,
    category: task.category,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    progress: "toDo",
  };
  await setDoc(taskRef, createData);
  return taskRef.id;
}

/**
 * Updates an existing task by ID.
 * @param {string} taskId - ID of the task
 * @param {Object} updateData - Partial data to update
 * @returns {Promise<string>} Task ID
 */
export async function updateTask(taskId, updateData) {
  const taskRef = doc(db, "tasks", taskId);
  await setDoc(taskRef, updateData, { merge: true });
  return taskRef.id;
}

export async function addEditTask(task) {
  return createTask(task).then((taskId) => {
    console.log("Task added with ID:", taskId);
    return taskId;
  });
}

export function deleteTask(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  return deleteDoc(taskRef);
}

export function checkIfTaskExists(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  return getDoc(taskRef).then((docSnap) => docSnap.exists());
}

export function changeTaskProgress(taskId, newProgress) {
  if (!["toDo", "inProgress", "awaitFeedback", "done"].includes(newProgress)) {
    throw new Error("Invalid progress status");
  }
  const taskRef = doc(db, "tasks", taskId);
  return setDoc(
    taskRef,
    { progress: newProgress, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getTask(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    return { id: taskSnap.id, ...taskSnap.data() };
  } else {
    throw new Error("Task not found");
  }
}

export async function getAllTasks() {
  const tasksRef = collection(db, "tasks");
  const snapshot = await getDocs(tasksRef);
  const tasks = [];
  snapshot.forEach((doc) => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  return tasks;
}

export async function getTaskIds() {
  const tasksRef = collection(db, "tasks");
  const snapshot = await getDocs(tasksRef);
  const taskIds = [];
  snapshot.forEach((doc) => {
    taskIds.push(doc.id);
  });
  return taskIds;
}

export async function getSubtasksCompletionState(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    const subtasks = taskSnap.data().subtasks || [];
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(
      (subtask) => subtask.completed
    ).length;
    console.log(
      "Subtasks for task",
      taskId,
      ":",
      totalSubtasks,
      "total,",
      completedSubtasks,
      "completed"
    );
    return { totalSubtasks, completedSubtasks };
  } else {
    throw new Error("Task not found");
  }
}

export async function changeSubtaskCompletion(taskId, subtaskIndex, completed) {
  const taskRef = doc(db, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (taskSnap.exists()) {
    const taskData = taskSnap.data();
    const subtasks = taskData.subtasks || [];

    if (subtaskIndex >= 0 && subtaskIndex < subtasks.length) {
      subtasks[subtaskIndex].completed = completed;
      await setDoc(
        taskRef,
        { subtasks, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } else {
      throw new Error("Invalid subtask index");
    }
  } else {
    throw new Error("Task not found");
  }
}
