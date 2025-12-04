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


  export function getInitials(name) {
    if (!name || typeof name !== 'string') return '';
    const names = name.trim().split(/\s+/); // split by any whitespace, remove leading/trailing
    if (names.length === 0) return '';
    
    let initials = names[0].charAt(0).toUpperCase();
    if (names.length > 1) {
        initials += names[names.length - 1].charAt(0).toUpperCase();
    }
    return initials;
}
export function returnContactById(id,contactsList){
    let contact = contactsList.find(contact => contact.id === id);
    return contact;
}
