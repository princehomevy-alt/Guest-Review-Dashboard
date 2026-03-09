import {
  addReview,
  getReviews,
  getRecentReviews,
  getProperties,
  getGuests,
  addGuest
} from './api.js';
import { Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

export async function renderReviewsPage(container) {
  try {
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const reviews = await getRecentReviews(30);
    const properties = await getProperties();
    
    const html = `
      <div class="page-header">
        <h1 class="page-title">Review Intelligence</h1>
      </div>
      
      <button class="btn btn-primary" onclick="window.reviewsModule.openAddReviewModal()" style="margin-bottom: 20px;">Add New Review</button>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Reviews (${reviews.length})</h3>
        </div>
        <div id="reviewsContainer">
          ${reviews.length === 0 ? '<p>No reviews yet</p>' : reviews.map(r => `
            <div style="padding: 16px; border-bottom: 1px solid var(--color-border);">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                  <strong>Rating: ${r.rating}/5</strong>
                  <span class="badge badge-${r.rating <= 2 ? 'danger' : r.rating <= 4 ? 'warning' : 'success'}" style="margin-left: 8px;">
                    ${r.ratingCategory}
                  </span>
                </div>
              </div>
              <p style="margin-bottom: 8px; color: var(--color-text-secondary);">
                ${r.comment || 'No comment'}
              </p>
              <div style="font-size: 12px;">
                <span class="badge badge-primary">${r.platform}</span>
                <span class="badge badge-${r.sentiment === 'Positive' ? 'success' : r.sentiment === 'Negative' ? 'danger' : 'primary'}" style="margin-left: 8px;">
                  ${r.sentiment}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div id="reviewModal" class="modal-overlay">
        <div class="modal" style="max-width: 600px;">
          <div class="modal-header">
            <h3 class="modal-title">Add New Review</h3>
            <button class="modal-close" onclick="window.reviewsModule.closeAddReviewModal()">X</button>
          </div>
          <form id="reviewForm" onsubmit="window.reviewsModule.handleReviewSubmit(event)">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Property</label>
                <select name="propertyId" class="form-select" required>
                  <option value="">Select property</option>
                  ${properties.map(p => `<option value="${p.id}">${p.propertyName}</option>`).join('')}
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Guest Name</label>
                <input type="text" name="guestName" class="form-input" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Rating</label>
                <select name="rating" class="form-select" required>
                  <option value="">Select rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
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
                <label class="form-label">Comment</label>
                <textarea name="comment" class="form-textarea" placeholder="Guest feedback..."></textarea>
              </div>
              
              <div class="form-group">
                <label class="form-label">Sentiment</label>
                <select name="sentiment" class="form-select">
                  <option value="Neutral">Neutral</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Review Date</label>
                <input type="date" name="reviewDate" class="form-input" required />
              </div>
              
              <div class="form-group">
                <label class="form-label">Guest Email</label>
                <input type="email" name="guestEmail" class="form-input" />
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="window.reviewsModule.closeAddReviewModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('input[name="reviewDate"]');
    if (dateInput) {
      dateInput.value = today;
    }
    
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger"><p>Error: ${error.message}</p></div>`;
  }
}

export function openAddReviewModal() {
  const modal = document.getElementById('reviewModal');
  const form = document.getElementById('reviewForm');
  form.reset();
  
  const today = new Date().toISOString().split('T')[0];
  form.reviewDate.value = today;
  
  modal.classList.add('active');
}

export function closeAddReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal.classList.remove('active');
}

export async function handleReviewSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  try {
    const issueCategories = formData.getAll('issueCategory');
    const reviewDate = new Date(formData.get('reviewDate'));
    
    let guestId;
    const guestEmail = formData.get('guestEmail');
    const guests = await getGuests();
    const existingGuest = guests.find(g => g.email === guestEmail);
    
    if (existingGuest) {
      guestId = existingGuest.id;
    } else {
      guestId = await addGuest({
        guestName: formData.get('guestName'),
        email: guestEmail,
        phone: '',
        notes: ''
      });
    }
    
    const reviewData = {
      propertyId: formData.get('propertyId'),
      guestId: guestId,
      rating: parseInt(formData.get('rating')),
      comment: formData.get('comment'),
      platform: formData.get('platform'),
      sentiment: formData.get('sentiment'),
      issueCategory: issueCategories,
      reviewDate: Timestamp.fromDate(reviewDate)
    };
    
    await addReview(reviewData);
    alert('Review added successfully');
    
    closeAddReviewModal();
    
    const container = document.querySelector('.main-content');
    await renderReviewsPage(container);
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

if (typeof window !== 'undefined') {
  window.reviewsModule = {
    renderReviewsPage,
    openAddReviewModal,
    closeAddReviewModal,
    handleReviewSubmit
  };
}
