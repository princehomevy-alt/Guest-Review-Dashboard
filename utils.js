/**
 * Utility Module
 * Shared helper functions for formatting, calculations, and DOM manipulation
 */

/**
 * ==========================================
 * DATE & TIME UTILITIES
 * ==========================================
 */

/**
 * Format timestamp to readable date
 * @param {Timestamp|Date} timestamp - Firebase Timestamp or JS Date
 * @param {string} format - 'short' | 'long' | 'time'
 * @returns {string} Formatted date
 */
export function formatDate(timestamp, format = 'short') {
  if (!timestamp) return '-';
  
  let date;
  if (timestamp.toDate) {
    // Firebase Timestamp
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return '-';
  }
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit', hour12: true }
  };
  
  return date.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Format timestamp to time only
 * @param {Timestamp|Date} timestamp - Firebase Timestamp or JS Date
 * @returns {string} Time string (HH:MM AM/PM)
 */
export function formatTime(timestamp) {
  if (!timestamp) return '-';
  
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return '-';
  }
  
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
}

/**
 * Get days ago string
 * @param {Timestamp|Date} timestamp - Firebase Timestamp or JS Date
 * @returns {string} Relative time (e.g., "2 days ago")
 */
export function getTimeAgo(timestamp) {
  if (!timestamp) return '-';
  
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    return '-';
  }
  
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);
  
  if (secondsAgo < 60) return 'just now';
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  
  const weeksAgo = Math.floor(daysAgo / 7);
  if (weeksAgo < 4) return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
}

/**
 * Get date N days ago
 * @param {number} days - Number of days
 * @returns {Date} Date object
 */
export function getDateNDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get start of week (Monday)
 * @returns {Date} Start of current week
 */
export function getWeekStart() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const start = new Date(now);
  start.setDate(start.getDate() - daysSinceMonday);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get array of last N days for charting
 * @param {number} days - Number of days
 * @returns {Array} Array of dates
 */
export function getLastNDays(days) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    result.push(date);
  }
  return result;
}

/**
 * ==========================================
 * NUMBER & CURRENCY FORMATTING
 * ==========================================
 */

/**
 * Format number with decimals
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places (default 2)
 * @returns {string} Formatted number
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(decimals);
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,234,567")
 */
export function formatNumberComma(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US');
}

/**
 * Format rating with star icon
 * @param {number} rating - Rating 1-5
 * @returns {string} HTML string with rating
 */
export function formatRating(rating) {
  if (!rating) return '—';
  const stars = '⭐'.repeat(Math.round(rating));
  return `${rating.toFixed(1)} ${stars}`;
}

/**
 * Percentage change indicator
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} HTML string with change indicator
 */
export function percentageChange(current, previous) {
  if (!previous) return '—';
  
  const change = ((current - previous) / previous) * 100;
  const direction = change > 0 ? '↑' : change < 0 ? '↓' : '→';
  const className = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  
  return `<span class="${className}">${direction} ${Math.abs(change).toFixed(1)}%</span>`;
}

/**
 * ==========================================
 * RATING UTILITIES
 * ==========================================
 */

/**
 * Get rating color class
 * @param {number} rating - Rating 1-5
 * @returns {string} CSS class name
 */
export function getRatingClass(rating) {
  if (rating <= 2) return 'danger';
  if (rating <= 4) return 'warning';
  return 'success';
}

/**
 * Get rating category
 * @param {number} rating - Rating 1-5
 * @returns {string} 'Low' | 'Medium' | 'High'
 */
export function getRatingCategory(rating) {
  if (rating <= 2) return 'Low';
  if (rating <= 4) return 'Medium';
  return 'High';
}

/**
 * Get sentiment emoji
 * @param {string} sentiment - 'Positive' | 'Neutral' | 'Negative'
 * @returns {string} Emoji
 */
export function getSentimentEmoji(sentiment) {
  const emojis = {
    'Positive': '😊',
    'Neutral': '😐',
    'Negative': '😟'
  };
  return emojis[sentiment] || '—';
}

/**
 * ==========================================
 * DOM MANIPULATION
 * ==========================================
 */

/**
 * Show element
 * @param {Element|string} element - DOM element or selector
 */
export function show(element) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.remove('hidden');
    element.classList.add('visible');
  }
}

/**
 * Hide element
 * @param {Element|string} element - DOM element or selector
 */
export function hide(element) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.add('hidden');
    element.classList.remove('visible');
  }
}

/**
 * Toggle element visibility
 * @param {Element|string} element - DOM element or selector
 */
export function toggle(element) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.toggle('hidden');
    element.classList.toggle('visible');
  }
}

/**
 * Show loading spinner
 * @param {Element|string} container - Container to show spinner in
 */
export function showLoading(container) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (container) {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading...</span></div>';
  }
}

/**
 * Show empty state
 * @param {Element|string} container - Container for empty state
 * @param {string} message - Empty state message
 */
export function showEmpty(container, message = 'No data available') {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <p>${message}</p>
      </div>
    `;
  }
}

/**
 * Clear container
 * @param {Element|string} container - Container to clear
 */
export function clear(container) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (container) {
    container.innerHTML = '';
  }
}

/**
 * ==========================================
 * BADGE & BADGE RENDERING
 * ==========================================
 */

/**
 * Create badge HTML
 * @param {string} text - Badge text
 * @param {string} type - 'primary' | 'success' | 'danger' | 'warning' | 'info'
 * @returns {string} HTML string
 */
export function createBadge(text, type = 'primary') {
  return `<span class="badge badge-${type}">${text}</span>`;
}

/**
 * Create status badge
 * @param {string} status - Status text
 * @returns {string} HTML string
 */
export function createStatusBadge(status) {
  const types = {
    'Active': 'success',
    'Inactive': 'danger',
    'Maintenance': 'warning',
    'Pending': 'info',
    'In Progress': 'primary',
    'Completed': 'success',
    'New': 'info',
    'Repeat': 'primary',
    'VIP': 'warning'
  };
  
  return createBadge(status, types[status] || 'primary');
}

/**
 * ==========================================
 * FORM UTILITIES
 * ==========================================
 */

/**
 * Get form data as object
 * @param {Element} form - Form element
 * @returns {Object} Form data
 */
export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
    // Handle multiple values (checkboxes)
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
}

/**
 * Set form data from object
 * @param {Element} form - Form element
 * @param {Object} data - Data to populate
 */
export function setFormData(form, data) {
  for (let [key, value] of Object.entries(data)) {
    const field = form.elements[key];
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = value === true || value === 'true';
      } else if (field.type === 'radio') {
        form.elements[key].value = value;
      } else {
        field.value = value;
      }
    }
  }
}

/**
 * Clear form
 * @param {Element} form - Form element
 */
export function clearForm(form) {
  form.reset();
}

/**
 * Show form error
 * @param {Element} field - Form field
 * @param {string} message - Error message
 */
export function showFieldError(field, message) {
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error';
  errorEl.textContent = message;
  
  // Remove previous error
  const previousError = field.parentElement?.querySelector('.form-error');
  if (previousError) previousError.remove();
  
  field.parentElement?.appendChild(errorEl);
}

/**
 * Clear field errors
 * @param {Element} field - Form field
 */
export function clearFieldError(field) {
  const errorEl = field.parentElement?.querySelector('.form-error');
  if (errorEl) errorEl.remove();
}

/**
 * ==========================================
 * MODAL UTILITIES
 * ==========================================
 */

/**
 * Open modal
 * @param {string} modalId - Modal element ID
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Close modal
 * @param {string} modalId - Modal element ID
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * ==========================================
 * VALIDATION
 * ==========================================
 */

/**
 * Validate email
 * @param {string} email - Email address
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid phone
 */
export function isValidPhone(phone) {
  const re = /^[\d\s\-\+\(\)]{10,}$/;
  return re.test(phone);
}

/**
 * Validate required field
 * @param {string} value - Field value
 * @returns {boolean} Is not empty
 */
export function isRequired(value) {
  return value && value.trim().length > 0;
}

/**
 * ==========================================
 * NOTIFICATION & ALERTS
 * ==========================================
 */

/**
 * Show success message
 * @param {string} message - Success message
 * @param {number} duration - Duration in ms (default 3000)
 */
export function showSuccess(message, duration = 3000) {
  console.log('✓', message);
  // Add toast/notification here if UI needs it
}

/**
 * Show error message
 * @param {string} message - Error message
 * @param {number} duration - Duration in ms (default 5000)
 */
export function showError(message, duration = 5000) {
  console.error('✗', message);
  // Add toast/notification here if UI needs it
}

/**
 * Show warning message
 * @param {string} message - Warning message
 */
export function showWarning(message) {
  console.warn('⚠️', message);
}

/**
 * ==========================================
 * ARRAY & OBJECT UTILITIES
 * ==========================================
 */

/**
 * Group array by property
 * @param {Array} array - Array to group
 * @param {string} property - Property name to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, property) {
  return array.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) acc[key] = [];
    acc[key].push(obj);
    return acc;
  }, {});
}

/**
 * Sort array by property
 * @param {Array} array - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} direction - 'asc' | 'desc'
 * @returns {Array} Sorted array
 */
export function sortBy(array, property, direction = 'asc') {
  const sorted = [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (typeof aVal === 'string') {
      return direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });
  
  return sorted;
}

/**
 * Filter array by multiple criteria
 * @param {Array} array - Array to filter
 * @param {Object} criteria - Filter criteria
 * @returns {Array} Filtered array
 */
export function filterBy(array, criteria) {
  return array.filter(item => {
    return Object.entries(criteria).every(([key, value]) => {
      return item[key] == value;
    });
  });
}

/**
 * Unique values from array
 * @param {Array} array - Source array
 * @param {string} property - Property to get unique values from
 * @returns {Array} Unique values
 */
export function unique(array, property) {
  return [...new Set(array.map(item => item[property]))];
}

/**
 * ==========================================
 * THEME MANAGEMENT
 * ==========================================
 */

/**
 * Toggle dark mode
 */
export function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  return newTheme;
}

/**
 * Get current theme
 * @returns {string} 'light' | 'dark'
 */
export function getCurrentTheme() {
  return localStorage.getItem('theme') || 'light';
}

/**
 * Set theme
 * @param {string} theme - 'light' | 'dark'
 */
export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

/**
 * Initialize theme from preference
 */
export function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  setTheme(theme);
}

/**
 * ==========================================
 * DEBOUNCE & THROTTLE
 * ==========================================
 */

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
