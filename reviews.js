/**
 * Reviews Module
 * Handles review creation, filtering, and analysis
 */

import {
  addReview,
  getReviews,
  getRecentReviews,
  getProperties,
  getGuests,
  addGuest
} from './api.js';
import {
  formatDate,
  formatNumber,
  getFormData,
  clearForm,
  show,
  hide
} from './utils.js';

/**
 * Render reviews management page
 * @param {Element} container - Container to render into
 */
export async function renderReviewsPage(container) {
  try {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading reviews...</span></div>';
    
    const reviews = await getRecentReviews(30);
    const properties = await getProperties();
    const guests = await getGuests();
    
    const html = `
      <div class="page-header">
        <h1 class="page-title">Review Intelligence</h1>
        <p class="page-description">Add new reviews, track sentiment, and manage guest feedback</p>
      </div>
      
      <div style="margin-bottom: var(--spacing-xl);">
        <button class="btn btn-primary" onclick="window.reviewsModule.openAddReviewModal()">
          + Add New Review
        </button>
      </div>
      
      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Rating</label>
          <select id="filterRating" class="form-select form-input" onchange="window.reviewsModule.applyFilters()">
            <option value="">All</option>
            <option value="Low">Low (1-2)</option>
            <option value="Medium">Medium (3-4)</option>
            <option value="High">High (5)</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Platform</label>
          <select id="filterPlatform" class="form-select form-input" onchange="window.reviewsModule.applyFilters()">
            <option value="">All Platforms</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Booking.com">Booking.com</option>
            <option value="Direct">Direct</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Sentiment</label>
          <select id="filterSentiment" class="form-select form-input" onchange="window.reviewsModule.applyFilters()">
            <option value="">All</option>
            <option value="Positive">Positive 😊</option>
            <option value="Neutral">Neutral 😐</option>
            <option value="Negative">Negative 😟</option>
          </select>
        </div>
      </div>
      
      <!-- Reviews List -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Reviews (${reviews.length})</h3>
        </div>
        <div id="reviewsContainer">
          ${renderReviewsList(reviews)}
        </div>
      </div>
      
      <!-- Add Review Modal -->
      <div id="reviewModal" class="modal-overlay">
        <div class="modal" style="max-width: 600px;">
          <div class="modal-header">
            <h3 class="modal-title">Add New Review</h3>
            <button class="modal-close" onclick="window.reviewsModule.closeAddReviewModal()">×</button>
          </div>
          <form id="reviewForm" onsubmit="window.reviewsModule.handleReviewSubmit(event)">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Property *</label>
                  <select name="propertyId" class="form-select" required>
                    <option value="">Select property</option>
                    ${properties.map(p => `<option value="${p.id}">${p.propertyName}</option>`).join('')}
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Guest Name *</label>
                  <input type="text" name="guestName" class="form-input" required />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Rating *</label>
                  <select name="rating" class="form-select" required onchange="updateRatingDisplay()">
                    <option value="">Select rating</option>
                    <option value="1">⭐ 1 - Poor</option>
                    <option value="2">⭐⭐ 2 - Fair</option>
                    <option value="3">⭐⭐⭐ 3 - Good</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Platform *</label>
                  <select name="platform" class="form-select" required>
                    <option value="">Select platform</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Direct">Direct Booking</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Review Comment</label>
                <textarea name="comment" class="form-textarea" placeholder="Guest feedback..."></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Sentiment</label>
                  <select name="sentiment" class="form-select">
                    <option value="Neutral">Neutral 😐</option>
                    <option value="Positive">Positive 😊</option>
                    <option value="Negative">Negative 😟</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Review Date *</label>
                  <input type="date" name="reviewDate" class="form-input" required />
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Issues Found (Select all that apply)</label>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                  <label class="form-checkbox">
                    <input type="checkbox" name="issueCategory" value="Cleaning" />
                    🧹 Cleanliness
                  </label>
                  <label class="form-checkbox">
                    <input type="checkbox" name="issueCategory" value="Maintenance" />
                    🔧 Maintenance Issues
                  </label>
                  <label class="form-checkbox">
                    <input type="checkbox" name="issueCategory" value="Communication" />
                    💬 Communication
                  </label>
                  <label class="form-checkbox">
                    <input type="checkbox" name="issueCategory" value="Check-in" />
                    🔑 Check-in/Check-out
                  </label>
                  <label class="form-checkbox">
                    <input type="checkbox" name="issueCategory" value="Noise" />
                    🔊 Noise/Disturbance
                  </label>
                  <label class="form-checkbox">
                    <input type="checkbox" name="issueCategory" value="Other" />
                    ❓ Other
                  </label>
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Guest Email</label>
                <input type="email" name="guestEmail" class="form-input" />
              </div>
              
              <div class="form-group">
                <label class="form-label">Guest Phone</label>
                <input type="tel" name="guestPhone" class="form-input" />
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="window.reviewsModule.closeAddReviewModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Review</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.querySelector('input[name="reviewDate"]');
    if (dateInput) {
      dateInput.value = today;
    }
    
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-danger">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">Error Loading Reviews</div>
          <p>${error.message}</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render reviews list
 * @param {Array} reviews - Reviews array
 * @returns {string} HTML string
 */
function renderReviewsList(reviews) {
  if (reviews.length === 0) {
    return '<div style="padding: var(--spacing-2xl); text-align: center; color: var(--color-text-secondary);">No reviews yet</div>';
  }
  
  return reviews.map(review => {
    const ratingColor = review.rating <= 2 ? 'danger' : review.rating <= 4 ? 'warning' : 'success';
    const sentimentEmoji = review.sentiment === 'Positive' ? '😊' : review.sentiment === 'Negative' ? '😟' : '😐';
    
    return `
      <div style="padding: var(--spacing-lg); border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-sm);">
            <span style="font-size: 1.5rem; font-weight: bold; color: var(--color-primary);">${'⭐'.repeat(review.rating)}</span>
            <span class="badge badge-${ratingColor}">${review.ratingCategory}</span>
            <span class="badge badge-info">${review.platform}</span>
            <span class="badge badge-${review.sentiment === 'Positive' ? 'success' : review.sentiment === 'Negative' ? 'danger' : 'info'}">
              ${sentimentEmoji} ${review.sentiment}
            </span>
          </div>
          
          <p style="margin: var(--spacing-md) 0; color: var(--color-text-secondary);">
            <strong>${review.comment || 'No comment provided'}</strong>
          </p>
          
          ${review.issueCategory && review.issueCategory.length > 0 ? `
            <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
              ${review.issueCategory.map(issue => `<span class="badge badge-warning">${issue}</span>`).join('')}
            </div>
          ` : ''}
          
          <div style="font-size: var(--font-size-sm); color: var(--color-text-tertiary); margin-top: var(--spacing-md);">
            ${formatDate(review.reviewDate)} • Guest ID: ${review.guestId ? review.guestId.substring(0, 8) : 'Unknown'}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Open add review modal
 */
export function openAddReviewModal() {
  const modal = document.getElementById('reviewModal');
  const form = document.getElementById('reviewForm');
  form.reset();
  
  const today = new Date().toISOString().split('T')[0];
  form.reviewDate.value = today;
  
  modal.classList.add('active');
}

/**
 * Close review modal
 */
export function closeAddReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal.classList.remove('active');
}

/**
 * Apply review filters
 */
export async function applyFilters() {
  try {
    const filterRating = document.getElementById('filterRating').value;
    const filterPlatform = document.getElementById('filterPlatform').value;
    const filterSentiment = document.getElementById('filterSentiment').value;
    
    const filters = {};
    if (filterRating) filters.ratingCategory = filterRating;
    if (filterPlatform) filters.platform = filterPlatform;
    if (filterSentiment) filters.sentiment = filterSentiment;
    
    const reviews = await getReviews(filters);
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = renderReviewsList(reviews);
  } catch (error) {
    console.error('Error applying filters:', error);
  }
}

/**
 * Handle review form submission
 * @param {Event} event - Form submit event
 */
export async function handleReviewSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  
  try {
    // Get issue categories (checkboxes return multiple values)
    const issueCategories = formData.getAll('issueCategory');
    
    // Convert reviewDate string to Date
    const reviewDate = new Date(formData.get('reviewDate'));
    
    // Get or create guest
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
        phone: formData.get('guestPhone') || '',
        notes: ''
      });
    }
    
    // Prepare review data
    const reviewData = {
      propertyId: formData.get('propertyId'),
      guestId: guestId,
      rating: parseInt(formData.get('rating')),
      comment: formData.get('comment'),
      platform: formData.get('platform'),
      sentiment: formData.get('sentiment'),
      issueCategory: issueCategories,
      reviewDate: { toDate: () => reviewDate } // Convert to Timestamp-like object
    };
    
    // Import Timestamp for proper conversion
    const { Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
    reviewData.reviewDate = Timestamp.fromDate(reviewDate);
    
    await addReview(reviewData);
    alert('Review added successfully!');
    
    closeAddReviewModal();
    
    // Reload reviews page
    const container = document.querySelector('.main-content');
    await renderReviewsPage(container);
  } catch (error) {
    alert('Error saving review: ' + error.message);
  }
}

/**
 * Update rating display (for visual feedback)
 */
export function updateRatingDisplay() {
  const rating = document.querySelector('select[name="rating"]').value;
  // Could add visual feedback here
}

/**
 * Export module to window for inline event handlers
 */
if (typeof window !== 'undefined') {
  window.reviewsModule = {
    renderReviewsPage,
    openAddReviewModal,
    closeAddReviewModal,
    applyFilters,
    handleReviewSubmit,
    updateRatingDisplay
  };
}
