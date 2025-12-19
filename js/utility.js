/**
 * Removes all whitespace from a string.
 * @param {string} str
 * @returns {string}
 */
export function removeWhitespace(str) {
  return str.replace(/\s+/g, "");
}

/**
 * Registers a global outside-click handler to close target.
 * @param {HTMLElement} target - Element to close on outside click.
 * @param {Function} onClose - Callback invoked on outside click.
 * @param {HTMLElement[]} ignore - Elements to ignore for clicks.
 */
export function initOutsideClickHandler(target, onClose, ignore = []) {
  if (!target) return;
  function handleClick(e) {
    const inside = target.contains(e.target);
    const ignored = ignore.some((el) => el && el.contains(e.target));
    if (!inside && !ignored) {
      onClose?.();
      document.removeEventListener("click", handleClick, true);
    }
  }
  requestAnimationFrame(() =>
    document.addEventListener("click", handleClick, true)
  );
}

/**
 * Returns a random color from the predefined palette.
 * @returns {string} CSS var string
 */
export function getRandomColor() {
  const colors = [
    "var(--orange-default)",
    "var(--purpleViolett-default)",
    "var(--skyBlue-default)",
    "var(--pink-default)",
    "var(--yellow-default)",
    "var(--aquamarine-default)",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Returns initials from a name (first letters of first/last name).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return "";
  const names = name.split(" ");
  let initials = names[0].charAt(0).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].charAt(0).toUpperCase();
  }
  return initials;
}

/**
 * Finds a contact by ID in a given list.
 * @param {string} id
 * @param {Array} contactsList
 * @returns {Object|undefined}
 */
export function returnContactById(id, contactsList) {
  if (!contactsList) return undefined;
  return contactsList.find((c) => c.id === id);
}

/**
 * Returns the index of a task by ID.
 * @param {string} id
 * @param {Array} tasks
 * @returns {number}
 */
export function getTaskIndexById(id, tasks) {
  return tasks.findIndex((t) => t.id === id);
}

/**
 * Returns tasks assigned to a specific contact/user.
 * @param {Array} tasks
 * @param {string} contactId
 * @returns {Array}
 */
export function getAllTasksFromContacts(tasks, contactId) {
  if (!tasks || !contactId) return [];
  return tasks.filter((task) => {
    return task.assignedTo && task.assignedTo.includes(contactId);
  });
}
