const cards = document.querySelectorAll('[draggable="true"]');
const dropZones = document.querySelectorAll('.kanban-column');

function handleDragStart(drag) {
    drag.dataTransfer.setData("text/plain", drag.target.closest('[draggable="true"]').id);
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
    this.style.backgroundColor = "";
}

cards.forEach(card => card.addEventListener("dragstart", handleDragStart));
dropZones.forEach(zone => {
    zone.addEventListener("dragover", handleDragOver);
    zone.addEventListener("dragleave", handleDragLeave);
    zone.addEventListener("drop", handleDrop);
});