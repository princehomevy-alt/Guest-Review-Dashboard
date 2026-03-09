import {
  addActionPlan,
  getActionPlans,
  updateActionPlan,
  deleteActionPlan
} from './api.js';
import { Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

export async function renderActionsPage(container) {
  try {
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const allActions = await getActionPlans();
    const openActions = allActions.filter(a => a.status !== 'Completed');
    const completedActions = allActions.filter(a => a.status === 'Completed');
    
    const html = `
      <div class="page-header">
        <h1 class="page-title">Action Plans</h1>
      </div>
      
      <button class="btn btn-primary" onclick="window.actionsModule.openAddActionModal()" style="margin-bottom: 20px;">Create Action Plan</button>
      
      <div class="grid grid-3">
        <div class="metric-card">
          <div class="metric-label">Total Actions</div>
          <div class="metric-value">${allActions.length}</div>
        </div>
        
        <div class="metric-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
          <div class="metric-label">Open</div>
          <div class="metric-value">${openActions.length}</div>
        </div>
        
        <div class="metric-card" style="background: linear-gradient(135deg, #10b981, #059669);">
          <div class="metric-label">Completed</div>
          <div class="metric-value">${completedActions.length}</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">All Actions</h3>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Impact</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="actionsTableBody">
              ${allActions.length === 0 ? '<tr><td colspan="6">No actions</td></tr>' : allActions.map(a => `
                <tr>
                  <td><strong>${a.issueCategory}</strong></td>
                  <td><span class="badge badge-${a.impactLevel === 'High' ? 'danger' : 'warning'}">${a.impactLevel}</span></td>
                  <td>${a.assignedTo}</td>
                  <td><span class="badge badge-${a.status === 'Completed' ? 'success' : 'primary'}">${a.status}</span></td>
                  <td>${new Date(a.deadline.toDate()).toLocaleDateString()}</td>
                  <td>
                    <button class="btn btn-secondary" onclick="window.actionsModule.editAction('${a.id}')" style="font-size: 12px;">Edit</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <div id="actionModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Create Action Plan</h3>
            <button class="modal-close" onclick="window.actionsModule.closeAddActionModal()">X</button>
          </div>
          <form id="actionForm" onsubmit="window.actionsModule.handleActionSubmit(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Issue Category</label>
                <select name="issueCategory" class="form-select" required>
                  <option value="">Select category</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Communication">Communication</option>
                  <option value="Check-in">Check-in</option>
                  <option value="Noise">Noise</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Impact Level</label>
                <select name="impactLevel" class="form-select" required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Frequency</label>
                <input type="number" name="frequency" class="form-input" min="1" value="1" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Action Description</label>
                <textarea name="actionDescription" class="form-textarea" required></textarea>
              </div>
              
              <div class="form-group">
                <label class="form-label">Assigned To</label>
                <input type="text" name="assignedTo" class="form-input" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Deadline</label>
                <input type="date" name="deadline" class="form-input" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-select">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="window.actionsModule.closeAddActionModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger"><p>Error: ${error.message}</p></div>`;
  }
}

export function openAddActionModal() {
  const modal = document.getElementById('actionModal');
  const form = document.getElementById('actionForm');
  
  form.reset();
  form.dataset.mode = 'add';
  
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  form.deadline.value = deadline.toISOString().split('T')[0];
  
  modal.classList.add('active');
}

export function closeAddActionModal() {
  const modal = document.getElementById('actionModal');
  modal.classList.remove('active');
}

export async function editAction(actionId) {
  try {
    const actions = await getActionPlans();
    const action = actions.find(a => a.id === actionId);
    
    if (!action) return;
    
    const modal = document.getElementById('actionModal');
    const form = document.getElementById('actionForm');
    const title = modal.querySelector('.modal-title');
    
    title.textContent = 'Edit Action Plan';
    form.dataset.mode = 'edit';
    form.dataset.actionId = actionId;
    
    form.issueCategory.value = action.issueCategory;
    form.impactLevel.value = action.impactLevel;
    form.frequency.value = action.frequency;
    form.actionDescription.value = action.actionDescription;
    form.assignedTo.value = action.assignedTo;
    form.deadline.value = action.deadline.toDate().toISOString().split('T')[0];
    form.status.value = action.status;
    
    modal.classList.add('active');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

export async function handleActionSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const mode = form.dataset.mode;
  
  try {
    data.deadline = Timestamp.fromDate(new Date(data.deadline));
    data.frequency = parseInt(data.frequency);
    
    if (mode === 'add') {
      await addActionPlan(data);
      alert('Action created successfully');
    } else {
      const actionId = form.dataset.actionId;
      await updateActionPlan(actionId, data);
      alert('Action updated successfully');
    }
    
    closeAddActionModal();
    const container = document.querySelector('.main-content');
    await renderActionsPage(container);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

if (typeof window !== 'undefined') {
  window.actionsModule = {
    renderActionsPage,
    openAddActionModal,
    closeAddActionModal,
    editAction,
    handleActionSubmit
  };
}
