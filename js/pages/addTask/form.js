const CATEGORY = Object.freeze({
  TECHTASK: "Technical Task",
  USERSTORY: "User Story",
});

/**
 * Adds category options to the select element.
 */
export function addCategoryOptionsTask() {
  const list = document.getElementById("categorySelect");
  if (!list || list.options.length > 2) return;

  for (const key in CATEGORY) {
    const option = document.createElement("option");
    option.value = CATEGORY[key];
    option.text = CATEGORY[key];
    list.appendChild(option);
  }
}

/**
 * Gets the selected category value.
 * @returns {string} The selected category or empty string if default.
 */
export function getCategoryTask() {
  const list = document.getElementById("categorySelect");
  if (list && list.value === "Select task category") {
    return "";
  }
  return list ? list.value : "";
}

/**
 * Validates the Add Task form inputs.
 * @returns {boolean} True if valid, false otherwise.
 */
export function validateTaskForm() {
  resetValidationBorders();

  let valid = true;
  if (!validateInput("taskTitle", showRedBorderTaskName)) valid = false;
  if (!validateInput("taskDate", showRedBorderTaskDate)) valid = false;
  if (!getCategoryTask()) {
    showRedBorderTaskCategory();
    valid = false;
  }

  return valid;
}

/**
 * Resets all validation error borders.
 */
function resetValidationBorders() {
  removeRedBorderTaskName();
  removeRedBorderTaskDate();
  removeRedBorderTaskCategory();
}

/**
 * Validates a single input.
 * @param {string} id - Element ID.
 * @param {Function} errorCb - Callback to show error.
 * @returns {boolean} True if element has value.
 */
function validateInput(id, errorCb) {
  const el = document.getElementById(id);
  if (!el || !el.value) {
    errorCb();
    return false;
  }
  return true;
}

export function showRedBorderTaskName() {
  setBorderColor("taskTitle", "red");
}
export function showRedBorderTaskDate() {
  setBorderColor("taskDate", "red");
}
export function showRedBorderTaskCategory() {
  setBorderColor("categorySelect", "red");
}

export function removeRedBorderTaskName() {
  setBorderColor("taskTitle", "");
}
export function removeRedBorderTaskDate() {
  setBorderColor("taskDate", "");
}
export function removeRedBorderTaskCategory() {
  setBorderColor("categorySelect", "");
}

/**
 * Helper to set border color.
 * @param {string} id
 * @param {string} color
 */
function setBorderColor(id, color) {
  const el = document.getElementById(id);
  if (el) el.style.borderColor = color;
}

export function clearTitleInput() {
  setInputValue("taskTitle", "");
}
export function clearDescriptionInput() {
  setInputValue("taskDescription", "");
}
export function clearDueDateInput() {
  setInputValue("taskDate", "");
}

/**
 * Helper to set input value.
 * @param {string} id
 * @param {string} val
 */
function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

export function resetCategorySelection() {
  const el = document.getElementById("categorySelect");
  if (el) el.selectedIndex = 0;
}
