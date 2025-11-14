export function removeWhitespace(str) {
  return str.replace(/\s+/g, '');
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
    requestAnimationFrame(() => document.addEventListener("click", handleClick, true));
  }
  
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