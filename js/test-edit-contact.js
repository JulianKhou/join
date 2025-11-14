document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".edit-contact-overlay");
  const container = document.querySelector(".edit-contact-container");
  const closeBtn = document.querySelector(".close-btn");

  const closeOverlay = () => overlay.classList.add("hidden");

  const openOverlay = () => {
    overlay.classList.remove("hidden");
    const firstInput = overlay.querySelector("input");
    if (firstInput) firstInput.focus();
  };

  const initCloseBtn = () => {
    if (!closeBtn) return;
    closeBtn.addEventListener("click", (i) => {
      i.preventDefault();
      closeOverlay();
    });
  };

  const initOutsideClick = () => {
    if (!overlay) return;
    overlay.addEventListener("click", (i) => {
      if (i.target === overlay) closeOverlay();
    });
  };

  const initStopPropagation = () => {
    if (!container) return;
    container.addEventListener("click", (i) => i.stopPropagation());
  };

  const initEscapeKey = () => {
    document.addEventListener("keydown", (i) => {
      const escapePressed = i.key === "Escape" || i.key === "Esc";
      if (escapePressed && !overlay.classList.contains("hidden")) {
        closeOverlay();
      }
    });
  };

  const deleteBtn = document.querySelector(".delete-btn");

  const clearFormFields = () => {
    const inputs = overlay.querySelectorAll("input");
    inputs.forEach((input) => (input.value = ""));
  };

  const initDeleteBtn = () => {
    if (!deleteBtn) return;
    deleteBtn.addEventListener("click", (i) => {
      i.preventDefault();
      clearFormFields();
    });
  };

  initCloseBtn();
  initOutsideClick();
  initStopPropagation();
  initEscapeKey();
  initDeleteBtn();

  window.openEditContactOverlay = openOverlay;
  window.closeEditContactOverlay = closeOverlay;
});
