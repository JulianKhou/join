import { createTask } from "./firebase.js";
import { iconTemplate } from "../templates/profileTemplates.js";
import { addAssignedToBarTask } from "../templates/addTaskTemplates.js";
import { getInitials, returnContactById } from "./utility.js";
import { showPopup } from "./feedback.js";

export function createBoardAddOverlayController({ getContactsList, appendNewTaskToBoard }) {
  function getContacts() {
    const contacts = getContactsList?.();
    return Array.isArray(contacts) ? contacts : [];
  }

  function initAddTaskOverlay() {
    const form = document.getElementById("addTaskFormOverlay");
    if (form) form.noValidate = true;

    applyOverlayContentLimits();
    initOverlayBlurValidation();
    populateOverlayContacts();
    initOverlayPriorityButtons();
    initOverlayAssignedTo();
    initOverlaySubtasks();
    initOverlayFormSubmit();
    bindOverlayCloseHandlers();
  }

  function bindOverlayCloseHandlers() {
    document.getElementById("addTaskCloseBtn")?.addEventListener("click", closeAddTaskOverlay);
    document.getElementById("addTaskCancelBtn")?.addEventListener("click", closeAddTaskOverlay);
    document.getElementById("addTaskOverlay")?.addEventListener("click", (event) => {
      if (event.target !== document.getElementById("addTaskOverlay")) return;
      closeAddTaskOverlay();
    });
  }

  function openAddTaskOverlay() {
    document.getElementById("addTaskOverlay")?.classList.add("active");
  }

  function closeAddTaskOverlay() {
    const overlay = document.getElementById("addTaskOverlay");
    overlay?.classList.add("closing");
    setTimeout(() => {
      overlay?.classList.remove("active", "closing");
      resetOverlayForm();
    }, 200);
  }

  function populateOverlayContacts() {
    const checkboxList = document.getElementById("overlayCheckboxList");
    if (!checkboxList) return;

    checkboxList.innerHTML = "";
    getContacts().forEach((contact) => {
      if (!contact?.id || !contact?.name) return;
      const icon = iconTemplate(getInitials(contact.name), contact.color, "assignedToCheckboxIcon");
      checkboxList.insertAdjacentHTML("beforeend", addAssignedToBarTask(contact.name, contact.id, icon));
    });

    attachCheckboxChangeListeners();
  }

  function initOverlayPriorityButtons() {
    const priorityBtns = document.querySelectorAll(".priority-button-group .priority-button");
    priorityBtns.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        priorityBtns.forEach((priorityButton) => {
          priorityButton.classList.remove(
            "priority-button-urgent-active",
            "priority-button-medium-active",
            "priority-button-low-active",
          );
        });

        if (button.textContent.includes("Urgent")) {
          button.classList.add("priority-button-urgent-active");
          return;
        }

        if (button.textContent.includes("Medium")) {
          button.classList.add("priority-button-medium-active");
          return;
        }

        button.classList.add("priority-button-low-active");
      });
    });
  }

  function initOverlayAssignedTo() {
    const selectBox = document.getElementById("overlaySelectedBox");
    const checkboxList = document.getElementById("overlayCheckboxList");
    if (!selectBox || !checkboxList) return;

    selectBox.addEventListener("click", (event) => {
      event.stopPropagation();
      const isVisible = checkboxList.style.display === "flex";
      checkboxList.style.display = isVisible ? "none" : "flex";
      if (isVisible) return;

      const closeOnOutsideClick = (docEvent) => {
        if (checkboxList.contains(docEvent.target) || selectBox.contains(docEvent.target)) return;
        checkboxList.style.display = "none";
        document.removeEventListener("click", closeOnOutsideClick);
      };

      document.addEventListener("click", closeOnOutsideClick);
    });
  }

  function attachCheckboxChangeListeners() {
    const checkboxes = document.querySelectorAll("#overlayCheckboxList .assignedToCheckbox");
    const selectBox = document.getElementById("overlaySelectedBox");

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const selected = Array.from(checkboxes)
          .filter((currentCheckbox) => currentCheckbox.checked)
          .map((currentCheckbox) => returnContactById(currentCheckbox.value, getContacts())?.name)
          .filter(Boolean);

        selectBox.innerText = selected.length ? selected.join(", ") : "Select contacts to assign";
      });
    });
  }

  function initOverlaySubtasks() {
    const addBtn = document.getElementById("addSubtaskBtnOverlay");
    const removeBtn = document.getElementById("removeSubtaskBtnOverlay");
    const input = document.getElementById("overlaySubtask");
    const list = document.getElementById("subtasksListOverlay");
    if (!addBtn || !removeBtn || !input || !list) return;

    addBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addOverlaySubtask(text, list);
      input.value = "";
      input.focus();
    });

    removeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      list.lastElementChild?.remove();
    });
  }

  function addOverlaySubtask(text, list) {
    const subtaskDiv = document.createElement("div");
    const textSpan = document.createElement("span");
    const removeBtn = document.createElement("button");

    subtaskDiv.className = "subtask-item-overlay";
    textSpan.textContent = text;
    removeBtn.type = "button";
    removeBtn.className = "subtask-remove-btn";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      subtaskDiv.remove();
    });

    subtaskDiv.append(textSpan, removeBtn);
    list.appendChild(subtaskDiv);
  }

  function applyOverlayContentLimits() {
    const titleInput = document.getElementById("overlayTaskTitle");
    const descriptionInput = document.getElementById("overlayTaskDescription");
    const subtaskInput = document.getElementById("overlaySubtask");

    if (titleInput) titleInput.maxLength = 80;
    if (descriptionInput) descriptionInput.maxLength = 500;
    if (subtaskInput) subtaskInput.maxLength = 120;
  }

  function initOverlayBlurValidation() {
    const titleInput = document.getElementById("overlayTaskTitle");
    const dateInput = document.getElementById("overlayTaskDate");
    const categoryInput = document.getElementById("overlayCategory");

    titleInput?.addEventListener("blur", () => {
      if (titleInput.value.trim()) {
        titleInput.style.borderColor = "";
        return;
      }

      titleInput.style.borderColor = "red";
      showPopup("Please enter a task title.", "info");
    });

    dateInput?.addEventListener("blur", () => {
      if (dateInput.value) {
        dateInput.style.borderColor = "";
        return;
      }

      dateInput.style.borderColor = "red";
      showPopup("Please select a due date.", "info");
    });

    categoryInput?.addEventListener("blur", () => {
      if (categoryInput.value && categoryInput.value !== "Select task category") {
        categoryInput.style.borderColor = "";
        return;
      }

      categoryInput.style.borderColor = "red";
      showPopup("Please select a category.", "info");
    });
  }

  function initOverlayFormSubmit() {
    const form = document.getElementById("addTaskFormOverlay");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const taskData = collectOverlayFormData();
      if (!validateOverlayForm(taskData)) return;

      const newTask = { ...taskData, progress: "toDo" };
      try {
        const taskId = await createTask(newTask);
        newTask.id = taskId;
        appendNewTaskToBoard(newTask);
        resetOverlayForm();
        closeAddTaskOverlay();
      } catch (error) {
        showPopup(error.message || "Task could not be created.");
      }
    });
  }

  function collectOverlayFormData() {
    const title = document.getElementById("overlayTaskTitle")?.value || "";
    const description = document.getElementById("overlayTaskDescription")?.value || "";
    const dueDate = document.getElementById("overlayTaskDate")?.value || "";
    const priority = getOverlayPriority();
    const assignedTo = getOverlayAssignedTo();
    const category = document.getElementById("overlayCategory")?.value || "";
    const subtasks = getOverlaySubtasks();

    return { title, description, dueDate, priority, assignedTo, category, subtasks };
  }

  function getOverlayPriority() {
    const activeBtn = document.querySelector(".priority-button-urgent-active, .priority-button-medium-active, .priority-button-low-active");
    if (!activeBtn) return "Medium";
    if (activeBtn.classList.contains("priority-button-urgent-active")) return "Urgent";
    if (activeBtn.classList.contains("priority-button-low-active")) return "Low";
    return "Medium";
  }

  function getOverlayAssignedTo() {
    return Array.from(document.querySelectorAll("#overlayCheckboxList .assignedToCheckbox:checked"))
      .map((checkbox) => checkbox.value);
  }

  function getOverlaySubtasks() {
    return Array.from(document.querySelectorAll("#subtasksListOverlay .subtask-item-overlay span"))
      .map((span) => ({ text: span.textContent.trim(), completed: false }));
  }

  function validateOverlayForm(taskData) {
    if (!taskData.title.trim()) {
      showPopup("Please enter a task title", "info");
      return false;
    }

    if (!taskData.dueDate) {
      showPopup("Please select a due date", "info");
      return false;
    }

    if (!taskData.category || taskData.category === "Select task category") {
      showPopup("Please select a category", "info");
      return false;
    }

    return true;
  }

  function resetOverlayForm() {
    document.getElementById("overlayTaskTitle").value = "";
    document.getElementById("overlayTaskDescription").value = "";
    document.getElementById("overlayTaskDate").value = "";
    document.getElementById("overlayCategory").selectedIndex = 0;
    document.getElementById("overlaySelectedBox").innerText = "Select contacts to assign";
    document.querySelectorAll("#overlayCheckboxList .assignedToCheckbox").forEach((checkbox) => {
      checkbox.checked = false;
    });
    document.getElementById("overlayCheckboxList").style.display = "none";
    document.getElementById("subtasksListOverlay").innerHTML = "";
    document.querySelectorAll(".priority-button").forEach((button) => {
      button.classList.remove(
        "priority-button-urgent-active",
        "priority-button-medium-active",
        "priority-button-low-active",
      );
    });
  }

  return {
    initAddTaskOverlay,
    openAddTaskOverlay,
    closeAddTaskOverlay,
    populateOverlayContacts,
  };
}
