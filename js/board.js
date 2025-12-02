const cards = document.querySelectorAll('[draggable="true"]');
const dropZones = document.querySelectorAll('.kanban-column');

function handleDragStart(drag) {
    const card = drag.target.closest('[draggable="true"]');
    drag.dataTransfer.setData("text/plain", card.id);
    card.classList.add('dragging');
}

function handleDragOver(drag) {
    drag.preventDefault();
    drag.dataTransfer.dropEffect = "move";
    this.style.backgroundColor = "rgba(0, 102, 255, 0.1)";
}

function handleDragLeave() {
    this.style.backgroundColor = "";
}

function handleDrop(drag) {
    drag.preventDefault();
    const cardId = drag.dataTransfer.getData("text/plain");
    const movedCard = document.getElementById(cardId);
    movedCard && this.appendChild(movedCard);
    movedCard?.classList.remove('dragging');
    this.style.backgroundColor = "";
}

cards.forEach(card => card.addEventListener("dragstart", handleDragStart));
dropZones.forEach(zone => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
});

// Overlay functionality
const overlay = document.getElementById('taskDetailOverlay');
const closeBtn = document.getElementById('overlayCloseBtn');
const taskCards = document.querySelectorAll('.task-card.grabbable');

// Open overlay when clicking on a task card
taskCards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.closest('svg') || e.target.closest('button')) return;
        overlay.classList.remove('closing');
        overlay.classList.add('active');
    });
});

// Close overlay with animation
function closeOverlay() {
    overlay.classList.add('closing');
    setTimeout(() => {
        overlay.classList.remove('active', 'closing');
    }, 200);
}

closeBtn?.addEventListener('click', closeOverlay);

// Close overlay when clicking outside the card
overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeOverlay();
    }
});