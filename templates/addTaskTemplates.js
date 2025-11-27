import { getInitials } from "../js/utility.js";

export function addAssignedToBarTask(name) {  
    const assignedToSelect = '<label class="checkbox-item">   ' +name + '<input type="checkbox" class="assignedToCheckbox" name="assignedTo" value="' + getInitials(name) + '"> </label>';
          return assignedToSelect;
}

export function addSubTask(subtaskString){
   const addSubTask=`<label> <div class="point"> </div>  ${subtaskString}
   <div class= "edit-delete-subtask-buttons">
   <button class="edit-subtask-button-size" src="./assets/contacts/editButton.svg" alt="edit subtask button"> </button>
   <button class="delete-subtask-button-size" src="./assets/contacts/deleteButton.svg" alt="delete subtask button"> </button>
   </div>
   </label>`;

   return addSubTask;   


}