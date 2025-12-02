export function taskCardTemplate(tasks){
    let taskCards=` 
    
    <div class="task-card grabbable" id="task-card-${tasks.id}" draggable="true">
          <div class="tasks-card-content">
            <div class="task-category ${tasks.category}">${tasks.category}
            </div>
            <div class="task-texts">
              <h3 class="task-title">${tasks.title}</h3>
              <p class="task-description">${tasks.description}</p>
            </div>
            <div class="task-subtasks">
              <div class="subtasks-bar">
                <div class="subtasks-progress"></div>
              </div>
              <span>3/4 Subtasks</span>
            </div>
            <div class="task-footer">
              <div class="task-assignees">
                <div class="assignee-avatar" style="background-color: #0066ff;">AK</div>
                <div class="assignee-avatar" style="background-color: #13b0a0;">JS</div>
              </div>
              <svg class="priority-icon priority-medium" xmlns="http://www.w3.org/2000/svg" width="17" height="7"
                viewBox="0 0 17 7" fill="none">
                <g clip-path="url(#clip0_398410_3366)">
                  <path
                    d="M16.0685 6.33333L0.931507 6.33333C0.684456 6.33333 0.447523 6.23448 0.272832 6.05852C0.0981406 5.88256 0 5.6439 0 5.39506C0 5.14621 0.0981406 4.90756 0.272832 4.7316C0.447523 4.55564 0.684456 4.45679 0.931507 4.45679L16.0685 4.45679C16.3155 4.45679 16.5525 4.55564 16.7272 4.7316C16.9019 4.90756 17 5.14621 17 5.39506C17 5.6439 16.9019 5.88256 16.7272 6.05852C16.5525 6.23448 16.3155 6.33333 16.0685 6.33333Z"
                    fill="#FFA800" />
                  <path
                    d="M16.0685 1.87654L0.931507 1.87654C0.684456 1.87654 0.447523 1.77769 0.272832 1.60173C0.0981406 1.42577 0 1.18712 0 0.938272C0 0.689426 0.0981406 0.450773 0.272832 0.274813C0.447523 0.0988533 0.684456 0 0.931507 0L16.0685 0C16.3155 0 16.5525 0.0988533 16.7272 0.274813C16.9019 0.450773 17 0.689426 17 0.938272C17 1.18712 16.9019 1.42577 16.7272 1.60173C16.5525 1.77769 16.3155 1.87654 16.0685 1.87654Z"
                    fill="#FFA800" />
              </svg>
            </div>
          </div>
        </div>` ;
        console.log("Generated Task Card HTML:", taskCards);
    return taskCards;

} 


export function taskDetailTemplate(task){
  let taskDetail=`
    <!-- Overlay -->
 
    <div class="overlay-edit-card">
      <!-- Close Button -->
      <div class="overlay-header">
        <div class="task-category-overlay user-story">User Story</div>
        <button class="overlay-close-btn" id="overlayCloseBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#2A3647" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- Task Title -->
      <h2 class="overlay-title">${task.title}</h2>

      <!-- Task Description -->
      <p class="overlay-description">${task.description}</p>

      <!-- Due Date -->
      <div class="date-and-priority-section">
        <div class="overlay-field-label">
          <label>Due date:</label>
          <label>Priority:</label>
        </div>

        <!-- Priority -->
        <div class="overlay-field-content">
          <span>10/05/2023</span>
          <div class="overlay-priority">
            <span>Medium</span>
            <svg class="priority-icon priority-medium" xmlns="http://www.w3.org/2000/svg" width="17" height="7"
              viewBox="0 0 17 7" fill="none">
              <path
                d="M16.0685 6.33333L0.931507 6.33333C0.684456 6.33333 0.447523 6.23448 0.272832 6.05852C0.0981406 5.88256 0 5.6439 0 5.39506C0 5.14621 0.0981406 4.90756 0.272832 4.7316C0.447523 4.55564 0.684456 4.45679 0.931507 4.45679L16.0685 4.45679C16.3155 4.45679 16.5525 4.55564 16.7272 4.7316C16.9019 4.90756 17 5.14621 17 5.39506C17 5.6439 16.9019 5.88256 16.7272 6.05852C16.5525 6.23448 16.3155 6.33333 16.0685 6.33333Z"
                fill="#FFA800" />
              <path
                d="M16.0685 1.87654L0.931507 1.87654C0.684456 1.87654 0.447523 1.77769 0.272832 1.60173C0.0981406 1.42577 0 1.18712 0 0.938272C0 0.689426 0.0981406 0.450773 0.272832 0.274813C0.447523 0.0988533 0.684456 0 0.931507 0L16.0685 0C16.3155 0 16.5525 0.0988533 16.7272 0.274813C16.9019 0.450773 17 0.689426 17 0.938272C17 1.18712 16.9019 1.42577 16.7272 1.60173C16.5525 1.77769 16.3155 1.87654 16.0685 1.87654Z"
                fill="#FFA800" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Assigned To -->
      <div class="overlay-field">
        <label class="overlay-label">Assigned To:</label>
        <div class="overlay-assignees">
          <div class="overlay-assignee-item">
            <div class="assignee-avatar" style="background-color: #1FD7C1;">EM</div>
            <span>Emmanuel Mauer</span>
          </div>
          <div class="overlay-assignee-item">
            <div class="assignee-avatar" style="background-color: #7B68EE;">MB</div>
            <span>Marcel Bauer</span>
          </div>
          <div class="overlay-assignee-item">
            <div class="assignee-avatar" style="background-color: #0066ff;">AM</div>
            <span>Anton Mayer</span>
          </div>
        </div>
      </div>

      <!-- Subtasks -->
      <div class="overlay-field">
        <label class="overlay-label">Subtasks</label>
        <div class="overlay-subtasks">
          <div class="overlay-subtask-item">
            <input type="checkbox" id="subtask1" checked>
            <label for="subtask1">Implement Recipe Recommendation</label>
          </div>
          <div class="overlay-subtask-item">
            <input type="checkbox" id="subtask2">
            <label for="subtask2">Start Page Layout</label>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="overlay-actions">
        <button class="btn-delete">
          <svg class="action-btn-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
            <path
              d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" />
          </svg>
          Delete</button>
        <div class="action-btn-divider"></div>
        <button class="btn-edit">
          <svg class="action-btn-icon" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19">
            <path
              d="M2 16.25H3.4L12.025 7.625L10.625 6.225L2 14.85V16.25ZM16.3 6.175L12.05 1.975L13.45 0.575C13.8333 0.191667 14.3042 0 14.8625 0C15.4208 0 15.8917 0.191667 16.275 0.575L17.675 1.975C18.0583 2.35833 18.2583 2.82083 18.275 3.3625C18.2917 3.90417 18.1083 4.36667 17.725 4.75L16.3 6.175ZM14.85 7.65L4.25 18.25H0V14L10.6 3.4L14.85 7.65Z" />
          </svg>Edit</button>
      </div>
    </div>
  `;
  console.log("Generated Task Detail Overlay HTML:", taskDetail);
  return taskDetail;
}