// This file is now a facade for overlayLogic to keep file size small.
import { closeOverlayOnBtn, getOverlay } from "./overlayHelpers.js";

// Re-export functions used by board.js / html
export * from "./overlayHelpers.js";

const overlay = getOverlay(); // Retrieved from helpers, or access DOM here

if (overlay) {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeOverlayOnBtn();
    }
  });
}
