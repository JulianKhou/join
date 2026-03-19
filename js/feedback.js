let popupRoot = null;
let hideTimeout = null;

function ensureStyles() {
  if (document.getElementById("app-popup-styles")) return;

  const style = document.createElement("style");
  style.id = "app-popup-styles";
  style.textContent = `
    .app-popup-root {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 12000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .app-popup {
      min-width: 280px;
      max-width: 420px;
      border-radius: 12px;
      padding: 14px 16px;
      color: #fff;
      font-size: 16px;
      line-height: 1.35;
      font-weight: 500;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity 160ms ease, transform 160ms ease;
      pointer-events: auto;
    }

    .app-popup.show {
      opacity: 1;
      transform: translateY(0);
    }

    .app-popup.error {
      background: #c62828;
    }

    .app-popup.success {
      background: #2e7d32;
    }

    .app-popup.info {
      background: #2a3647;
    }

    @media (max-width: 600px) {
      .app-popup-root {
        right: 12px;
        left: 12px;
        top: 12px;
      }

      .app-popup {
        min-width: auto;
        max-width: none;
      }
    }
  `;

  document.head.appendChild(style);
}

function ensureRoot() {
  if (popupRoot) return popupRoot;
  ensureStyles();
  popupRoot = document.createElement("div");
  popupRoot.className = "app-popup-root";
  popupRoot.setAttribute("aria-live", "polite");
  popupRoot.setAttribute("aria-atomic", "true");
  document.body.appendChild(popupRoot);
  return popupRoot;
}

function clearPopup() {
  if (!popupRoot) return;
  popupRoot.innerHTML = "";
}

export function showPopup(message, type = "error", duration = 3200) {
  if (!message) return;

  const root = ensureRoot();
  clearTimeout(hideTimeout);
  clearPopup();

  const popup = document.createElement("div");
  popup.className = `app-popup ${type}`;
  popup.setAttribute("role", "alert");
  popup.textContent = String(message);

  root.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add("show"));

  hideTimeout = setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => {
      if (popup.parentElement) popup.remove();
    }, 180);
  }, duration);
}
