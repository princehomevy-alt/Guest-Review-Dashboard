/**
 * Properties Module
 * Handles property management CRUD and display
 */

import { 
  addProperty,
  getProperties,
  updateProperty,
  deleteProperty,
  getPropertyReviews
} from './api.js';
import { 
  formatDate,
  formatNumber,
  show,
  hide,
  getFormData,
  clearForm,
  showFieldError,
  clearFieldError
} from './utils.js';

/**
 * Render properties management page
 * @param {Element} container - Container to render into
 */
export async function renderPropertiesPage(container) {
  try {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading properties...</span></div>';
    
    const properties = await getProperties();
    
    const html = `
      <div class="page-header">
        <h1 class="page-title">Properties Management</h1>
        <p class="page-description">Manage all rental units and track performance</p>
      </div>
      
      <div style="margin-bottom: var(--spacing-xl);">
        <button class="btn btn-primary" onclick="window.propertiesModule.openAddModal()">
          + Add New Property
        </button>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">All Properties (${properties.length})</h3>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Property Name</th>
                <th>Location</th>
                <th>Platform</th>
                <th>Unit Type</th>
                <th>Reviews</th>
                <th>Avg Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${renderPropertiesTable(properties)}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Add/Edit Property Modal -->
      <div id="propertyModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="propertyModalTitle">Add New Property</h3>
            <button class="modal-close" onclick="window.propertiesModule.closeAddModal()">×</button>
          </div>
          <form id="propertyForm" onsubmit="window.propertiesModule.handlePropertySubmit(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Property Name *</label>
                <input type="text" name="propertyName" class="form-input" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Location (Address) *</label>
                <input type="text" name="location" class="form-input" required />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">City *</label>
                  <input type="text" name="city" class="form-input" required />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Unit Type *</label>
                  <select name="unitType" class="form-select" required>
                    <option value="">Select type</option>
                    <option value="Studio">Studio</option>
                    <option value="1BR">1 Bedroom</option>
                    <option value="2BR">2 Bedroom</option>
                    <option value="3BR">3 Bedroom</option>
                    <option value="House">House</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Platform *</label>
                  <select name="platform" class="form-select" required>
                    <option value="">Select platform</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Direct">Direct</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Status *</label>
                  <select name="status" class="form-select" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Owner Name *</label>
                <input type="text" name="owner" class="form-input" required />
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="window.propertiesModule.closeAddModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Property</button>
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
          <div class="alert-title">Error Loading Properties</div>
          <p>${error.message}</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render properties table rows
 * @param {Array} properties - Properties array
 * @returns {string} HTML string
 */
function renderPropertiesTable(properties) {
  if (properties.length === 0) {
    return '<tr><td colspan="8" class="table-empty">No properties yet. Create one to get started!</td></tr>';
  }
  
  return properties.map(prop => `
    <tr>
      <td><strong>${prop.propertyName}</strong></td>
      <td>${prop.city}</td>
      <td><span class="badge badge-info">${prop.platform}</span></td>
      <td>${prop.unitType}</td>
      <td>${prop.totalReviews || 0}</td>
      <td>
        <strong>${formatNumber(prop.averageRating || 0, 1)}</strong>
        <span style="color: var(--color-text-tertiary); font-size: var(--font-size-sm);">/ 5.0</span>
      </td>
      <td>${renderStatusBadge(prop.status)}</td>
      <td style="white-space: nowrap;">
        <button class="btn btn-sm btn-secondary" onclick="window.propertiesModule.viewProperty('${prop.id}')">View</button>
        <button class="btn btn-sm btn-secondary" onclick="window.propertiesModule.editProperty('${prop.id}')">Edit</button>
      </td>
    </tr>
  `).join('');
}

/**
 * Render status badge
 * @param {string} status - Status value
 * @returns {string} HTML string
 */
function renderStatusBadge(status) {
  const types = {
    'Active': 'success',
    'Inactive': 'danger',
    'Maintenance': 'warning'
  };
  return `<span class="badge badge-${types[status] || 'primary'}">${status}</span>`;
}

/**
 * Open add property modal
 */
export function openAddModal() {
  const modal = document.getElementById('propertyModal');
  const title = document.getElementById('propertyModalTitle');
  const form = document.getElementById('propertyForm');
  
  title.textContent = 'Add New Property';
  form.reset();
  form.dataset.mode = 'add';
  delete form.dataset.propertyId;
  
  modal.classList.add('active');
}

/**
 * Close property modal
 */
export function closeAddModal() {
  const modal = document.getElementById('propertyModal');
  modal.classList.remove('active');
}

/**
 * Edit property
 * @param {string} propertyId - Property document ID
 */
export async function editProperty(propertyId) {
  try {
    const properties = await getProperties();
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) {
      alert('Property not found');
      return;
    }
    
    const modal = document.getElementById('propertyModal');
    const title = document.getElementById('propertyModalTitle');
    const form = document.getElementById('propertyForm');
    
    title.textContent = 'Edit Property';
    form.dataset.mode = 'edit';
    form.dataset.propertyId = propertyId;
    
    // Populate form
    form.propertyName.value = property.propertyName;
    form.location.value = property.location;
    form.city.value = property.city;
    form.unitType.value = property.unitType;
    form.platform.value = property.platform;
    form.status.value = property.status;
    form.owner.value = property.owner;
    
    modal.classList.add('active');
  } catch (error) {
    alert('Error loading property: ' + error.message);
  }
}

/**
 * View property details
 * @param {string} propertyId - Property document ID
 */
export async function viewProperty(propertyId) {
  try {
    const reviews = await getPropertyReviews(propertyId);
    
    const reviewsHTML = reviews.slice(0, 10).map(r => `
      <div style="padding: var(--spacing-md); border-bottom: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-sm);">
          <div>
            <strong>Rating: ${r.rating}/5</strong>
            <span class="badge badge-${r.rating <= 2 ? 'danger' : r.rating <= 4 ? 'warning' : 'success'}" style="margin-left: var(--spacing-sm);">
              ${r.ratingCategory}
            </span>
          </div>
          <span style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">
            ${formatDate(r.reviewDate)}
          </span>
        </div>
        <p style="margin-bottom: var(--spacing-sm); color: var(--color-text-secondary);">
          ${r.comment}
        </p>
        <div style="font-size: var(--font-size-sm); display: flex; gap: var(--spacing-md);">
          <span class="badge badge-info">${r.platform}</span>
          <span class="badge badge-${r.sentiment === 'Positive' ? 'success' : r.sentiment === 'Negative' ? 'danger' : 'info'}">
            ${r.sentiment}
          </span>
        </div>
      </div>
    `).join('');
    
    alert(`
Property: ${propertyId}
Total Reviews: ${reviews.length}

Recent Reviews:
${reviewsHTML || 'No reviews yet'}
    `);
  } catch (error) {
    alert('Error loading property details: ' + error.message);
  }
}

/**
 * Handle property form submission
 * @param {Event} event - Form submit event
 */
export async function handlePropertySubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const mode = form.dataset.mode;
  
  try {
    if (mode === 'add') {
      await addProperty(data);
      alert('Property added successfully!');
    } else {
      const propertyId = form.dataset.propertyId;
      await updateProperty(propertyId, data);
      alert('Property updated successfully!');
    }
    
    closeAddModal();
    // Reload properties page
    const container = document.querySelector('.main-content');
    await renderPropertiesPage(container);
  } catch (error) {
    showFieldError(form.propertyName, 'Error: ' + error.message);
  }
}

/**
 * Export module to window for inline event handlers
 */
if (typeof window !== 'undefined') {
  window.propertiesModule = {
    openAddModal,
    closeAddModal,
    editProperty,
    viewProperty,
    handlePropertySubmit,
    renderPropertiesPage
  };
}
