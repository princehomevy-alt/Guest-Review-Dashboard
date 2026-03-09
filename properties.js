import { 
  addProperty,
  getProperties,
  updateProperty,
  deleteProperty,
  getPropertyReviews
} from './api.js';

export async function renderPropertiesPage(container) {
  try {
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const properties = await getProperties();
    
    const html = `
      <div class="page-header">
        <h1 class="page-title">Properties Management</h1>
      </div>
      
      <button class="btn btn-primary" onclick="window.propertiesModule.openAddModal()" style="margin-bottom: 20px;">Add New Property</button>
      
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
                <th>Reviews</th>
                <th>Avg Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${properties.length === 0 ? '<tr><td colspan="7">No properties yet</td></tr>' : properties.map(p => `
                <tr>
                  <td><strong>${p.propertyName}</strong></td>
                  <td>${p.location}</td>
                  <td><span class="badge badge-primary">${p.platform}</span></td>
                  <td>${p.totalReviews || 0}</td>
                  <td><strong>${(p.averageRating || 0).toFixed(1)}</strong></td>
                  <td><span class="badge badge-success">${p.status}</span></td>
                  <td>
                    <button class="btn btn-secondary" onclick="window.propertiesModule.editProperty('${p.id}')" style="font-size: 12px;">Edit</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <div id="propertyModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Add New Property</h3>
            <button class="modal-close" onclick="window.propertiesModule.closeAddModal()">X</button>
          </div>
          <form id="propertyForm" onsubmit="window.propertiesModule.handlePropertySubmit(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Property Name</label>
                <input type="text" name="propertyName" class="form-input" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" name="location" class="form-input" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">City</label>
                <input type="text" name="city" class="form-input" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Unit Type</label>
                <select name="unitType" class="form-select" required>
                  <option value="">Select type</option>
                  <option value="Studio">Studio</option>
                  <option value="1BR">1BR</option>
                  <option value="2BR">2BR</option>
                  <option value="3BR">3BR</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Platform</label>
                <select name="platform" class="form-select" required>
                  <option value="">Select platform</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Direct">Direct</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-select" required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Owner</label>
                <input type="text" name="owner" class="form-input" required />
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="window.propertiesModule.closeAddModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
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

export function openAddModal() {
  const modal = document.getElementById('propertyModal');
  const form = document.getElementById('propertyForm');
  form.reset();
  form.dataset.mode = 'add';
  modal.classList.add('active');
}

export function closeAddModal() {
  const modal = document.getElementById('propertyModal');
  modal.classList.remove('active');
}

export async function editProperty(propertyId) {
  try {
    const properties = await getProperties();
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) return;
    
    const form = document.getElementById('propertyForm');
    const modal = document.getElementById('propertyModal');
    const title = modal.querySelector('.modal-title');
    
    title.textContent = 'Edit Property';
    form.dataset.mode = 'edit';
    form.dataset.propertyId = propertyId;
    
    form.propertyName.value = property.propertyName;
    form.location.value = property.location;
    form.city.value = property.city;
    form.unitType.value = property.unitType;
    form.platform.value = property.platform;
    form.status.value = property.status;
    form.owner.value = property.owner;
    
    modal.classList.add('active');
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

export async function handlePropertySubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const mode = form.dataset.mode;
  
  try {
    if (mode === 'add') {
      await addProperty(data);
      alert('Property added successfully');
    } else {
      const propertyId = form.dataset.propertyId;
      await updateProperty(propertyId, data);
      alert('Property updated successfully');
    }
    
    closeAddModal();
    const container = document.querySelector('.main-content');
    await renderPropertiesPage(container);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

if (typeof window !== 'undefined') {
  window.propertiesModule = {
    openAddModal,
    closeAddModal,
    editProperty,
    handlePropertySubmit,
    renderPropertiesPage
  };
}
