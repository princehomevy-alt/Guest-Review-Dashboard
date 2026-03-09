/**
 * Actions Module
 * Handles operational action plan tracking
 */

import {
  addActionPlan,
  getActionPlans,
  updateActionPlan,
  deleteActionPlan
} from './api.js';
import {
  formatDate,
  formatNumber
} from './utils.js';

/**
 * Render action plans page
 * @param {Element} container - Container to render into
 */
export async function renderActionsPage(container) {
  try {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading action plans...</span></div>';
    
    const allActions = await getActionPlans();
    const openActions = allActions.filter(a => a.status !== 'Completed');
    const completedActions = allActions.filter(a => a.status === 'Completed');
    
    const html = `
      <div class="page-header">
        <h1 class="page-title">Action Plans & Issues</h1>
        <p class="page-description">Track operational issues and resolution progress</p>
      </div>
      
      <div style="margin-bottom: var(--spacing-xl);">
        <button class="btn btn-primary" onclick="window.actionsModule.openAddActionModal()">
          + Create Action Plan
        </button>
      </div>
      
      <!-- Status Overview -->
      <div class="grid grid-3" style="margin-bottom: var(--spacing-xl);">
        <div class="metric-card">
          <div class="metric-card-content">
            <div class="metric-label">Total Actions</div>
            <div class="metric-value">${allActions.length}</div>
          </div>
        </div>
        
        <div class="metric-card warning">
          <div class="metric-card-content">
            <div class="metric-label">Open / Pending</div>
            <div class="metric-value">${openActions.length}</div>
          </div>
        </div>
        
        <div class="metric-card success">
          <div class="metric-card-content">
            <div class="metric-label">Completed</div>
            <div class="metric-value">${completedActions.length}</div>
            <div class="metric-change">${allActions.length > 0 ? Math.round((completedActions.length / allActions.length) * 100) : 0}% Complete</div>
          </div>
        </div>
      </div>
      
      <!-- Tabs for filtering -->
      <div style="margin-bottom: var(--spacing-lg); border-bottom: 2px solid var(--color-border); display: flex; gap: var(--spacing-lg);">
        <button class="nav-item" style="border-left: none; border-bottom: 2px solid var(--color-primary); margin-bottom: -2px;" onclick="window.actionsModule.filterActions('all')">
          All (${allActions.length})
        </button>
        <button class="nav-item" style="border-left: none;" onclick="window.actionsModule.filterActions('open')">
          Open (${openActions.length})
        </button>
        <button class="nav-item" style="border-left: none;" onclick="window.actionsModule.filterActions('completed')">
          Completed (${completedActions.length})
        </button>
      </div>
      
      <!-- Actions Table -->
      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Impact</th>
                <th>Frequency</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="actionsTableBody">
              ${renderActionsTable(allActions)}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Add Action Modal -->
      <div id="actionModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Create Action Plan</h3>
            <button class="modal-close" onclick="window.actionsModule.closeAddActionModal()">×</button>
          </div>
          <form id="actionForm" onsubmit="window.actionsModule.handleActionSubmit(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Issue Category *</label>
                <select name="issueCategory" class="form-select" required>
                  <option value="">Select category</option>
                  <option value="Cleaning">🧹 Cleanliness</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Communication">💬 Communication</option>
                  <option value="Check-in">🔑 Check-in/Check-out</option>
                  <option value="Noise">🔊 Noise/Disturbance</option>
                  <option value="Other">❓ Other</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Impact Level *</label>
                <select name="impactLevel" class="form-select" required>
                  <option value="Low">Low - Minor inconvenience</option>
                  <option value="Medium">Medium - Affects guest experience</option>
                  <option value="High">High - Serious issue or safety concern</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">How Many Times Reported? *</label>
                <input type="number" name="frequency" class="form-input" min="1" value="1" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Action Description *</label>
                <textarea name="actionDescription" class="form-textarea" placeholder="What needs to be done to resolve this issue?" required></textarea>
              </div>
              
              <div class="form-group">
                <label class="form-label">Assigned To *</label>
                <input type="text" name="assignedTo" class="form-input" placeholder="Team member name" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Deadline *</label>
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
              <button type="submit" class="btn btn-primary">Create Action</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-danger">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">Error Loading Actions</div>
          <p>${error.message}</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render actions table
 * @param {Array} actions - Actions array
 * @returns {string} HTML string
 */
function renderActionsTable(actions) {
  if (actions.length === 0) {
    return '<tr><td colspan="7" class="table-empty">No action plans. Create one to get started!</td></tr>';
  }
  
  return actions.map(action => {
    const statusColor = action.status === 'Completed' ? 'success' : 
                       action.status === 'In Progress' ? 'info' : 'warning';
    const impactColor = action.impactLevel === 'High' ? 'danger' :
                       action.impactLevel === 'Medium' ? 'warning' : 'success';
    
    return `
      <tr>
        <td>
          <div><strong>${action.issueCategory}</strong></div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            ${action.actionDescription.substring(0, 50)}${action.actionDescription.length > 50 ? '...' : ''}
          </div>
        </td>
        <td><span class="badge badge-${impactColor}">${action.impactLevel}</span></td>
        <td><strong>${action.frequency}x</strong></td>
        <td>${action.assignedTo}</td>
        <td><span class="badge badge-${statusColor}">${action.status}</span></td>
        <td>${formatDate(action.deadline, 'short')}</td>
        <td style="white-space: nowrap;">
          <button class="btn btn-sm btn-secondary" onclick="window.actionsModule.editAction('${action.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="window.actionsModule.deleteAction('${action.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Filter actions by status
 * @param {string} filter - 'all' | 'open' | 'completed'
 */
export async function filterActions(filter) {
  try {
    let actions;
    
    if (filter === 'open') {
      actions = await getActionPlans({ status: 'Pending' });
    } else if (filter === 'completed') {
      actions = await getActionPlans({ status: 'Completed' });
    } else {
      actions = await getActionPlans();
    }
    
    const tbody = document.getElementById('actionsTableBody');
    tbody.innerHTML = renderActionsTable(actions);
  } catch (error) {
    console.error('Error filtering actions:', error);
  }
}

/**
 * Open add action modal
 */
export function openAddActionModal() {
  const modal = document.getElementById('actionModal');
  const form = document.getElementById('actionForm');
  
  form.reset();
  form.dataset.mode = 'add';
  delete form.dataset.actionId;
  
  // Set deadline to 7 days from now
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  form.deadline.value = deadline.toISOString().split('T')[0];
  
  modal.classList.add('active');
}

/**
 * Close action modal
 */
export function closeAddActionModal() {
  const modal = document.getElementById('actionModal');
  modal.classList.remove('active');
}

/**
 * Edit action
 * @param {string} actionId - Action document ID
 */
export async function editAction(actionId) {
  try {
    const actions = await getActionPlans();
    const action = actions.find(a => a.id === actionId);
    
    if (!action) {
      alert('Action not found');
      return;
    }
    
    const modal = document.getElementById('actionModal');
    const form = document.getElementById('actionForm');
    const title = modal.querySelector('.modal-title');
    
    title.textContent = 'Edit Action Plan';
    form.dataset.mode = 'edit';
    form.dataset.actionId = actionId;
    
    // Populate form
    form.issueCategory.value = action.issueCategory;
    form.impactLevel.value = action.impactLevel;
    form.frequency.value = action.frequency;
    form.actionDescription.value = action.actionDescription;
    form.assignedTo.value = action.assignedTo;
    form.deadline.value = action.deadline.toDate().toISOString().split('T')[0];
    form.status.value = action.status;
    
    modal.classList.add('active');
  } catch (error) {
    alert('Error loading action: ' + error.message);
  }
}

/**
 * Delete action
 * @param {string} actionId - Action document ID
 */
export async function deleteAction(actionId) {
  if (!confirm('Are you sure you want to delete this action plan?')) {
    return;
  }
  
  try {
    await deleteActionPlan(actionId);
    alert('Action deleted successfully');
    
    // Reload actions page
    const container = document.querySelector('.main-content');
    await renderActionsPage(container);
  } catch (error) {
    alert('Error deleting action: ' + error.message);
  }
}

/**
 * Handle action form submission
 * @param {Event} event - Form submit event
 */
export async function handleActionSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const mode = form.dataset.mode;
  
  try {
    // Convert deadline string to Date
    const { Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
    data.deadline = Timestamp.fromDate(new Date(data.deadline));
    data.frequency = parseInt(data.frequency);
    
    if (mode === 'add') {
      await addActionPlan(data);
      alert('Action plan created successfully!');
    } else {
      const actionId = form.dataset.actionId;
      await updateActionPlan(actionId, data);
      alert('Action plan updated successfully!');
    }
    
    closeAddActionModal();
    // Reload actions page
    const container = document.querySelector('.main-content');
    await renderActionsPage(container);
  } catch (error) {
    alert('Error saving action: ' + error.message);
  }
}

/**
 * Export module to window for inline event handlers
 */
if (typeof window !== 'undefined') {
  window.actionsModule = {
    renderActionsPage,
    filterActions,
    openAddActionModal,
    closeAddActionModal,
    editAction,
    deleteAction,
    handleActionSubmit
  };
}
