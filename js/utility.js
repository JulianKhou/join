export function removeWhitespace(str) {
  return str.replace(/\s+/g, '');
}

/**
 * Adds a click event listener to the document that triggers the callback
 * when a click occurs outside the specified element.
 * By default, the listener is removed after the callback is executed.
 * If you need the listener to remain active for multiple outside clicks,
 * set the `removeAfterClick` parameter to false.
 *
 * @param {HTMLElement} element - The element to detect outside clicks for.
 * @param {Function} callback - The function to call when an outside click is detected.
 * @param {boolean} [removeAfterClick=true] - Whether to remove the listener after the first outside click.
 */
export function initOutsideClickListener(element, callback, removeAfterClick = true) {
    // Verzögere die Registrierung des Event Listeners bis nach dem aktuellen Event-Zyklus
    setTimeout(() => {
        document.addEventListener('click', function outsideClickListener(event) {
            if (!element.contains(event.target)) {
                console.log("Clicked outside the element");
                callback();
                if (removeAfterClick) {
                    document.removeEventListener('click', outsideClickListener);
                }
            }
        });
    }, 0);
}