import { getInitials } from "../js/utility.js";

export function addAssignedToBarTask(name,uid,iconTemplate) {  
    const assignedToSelect = '<label class="checkbox-item"> <div class="assignedToCheckboxNameIcon">  ' + iconTemplate + ' '
     +name + '</div> <input type="checkbox" class="assignedToCheckbox" name="assignedTo" value="' +uid  + '"> </label>';
          return assignedToSelect;
}

export function addSubTask(subtaskString){
   const addSubTask=`<div class="subtask-label">
   
   <div class="subtask-label-left">
   <div class="point"></div>
   <span class="subtask-text">${subtaskString}</span>
   </div>
   <div class="edit-delete-subtask-buttons">
   <button class="edit-subtask-button-size" src="./assets/contacts/editButton.svg" alt="edit subtask button" style="display:none">
   <img src="./assets/contacts/editButton.svg" alt="edit subtask button">
   </button>
   <button class="delete-subtask-button-size" src="./assets/contacts/deleteButton.svg" alt="delete subtask button" style="display:none">
   <img src="./assets/contacts/deleteButton.svg" alt="delete subtask button">
   </button>
   </div>
   </div>`;

   return addSubTask;   


}