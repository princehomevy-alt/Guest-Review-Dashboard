export function formatDate(timestamp, format = 'short') {
  if (!timestamp) return '-';
  
  let date;
  if (timestamp.toDate) {
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
  
  return formatDate(date);
}

export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '0';
  return Number(num).toFixed(decimals);
}

export function formatNumberComma(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-US');
}

export function getRatingClass(rating) {
  if (rating <= 2) return 'danger';
  if (rating <= 4) return 'warning';
  return 'success';
}

export function getRatingCategory(rating) {
  if (rating <= 2) return 'Low';
  if (rating <= 4) return 'Medium';
  return 'High';
}

export function show(element) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.remove('hidden');
  }
}

export function hide(element) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.add('hidden');
  }
}

export function clear(container) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (container) {
    container.innerHTML = '';
  }
}

export function getFormData(form) {
  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
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

export function setFormData(form, data) {
  for (let [key, value] of Object.entries(data)) {
    const field = form.elements[key];
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = value === true || value === 'true';
      } else {
        field.value = value;
      }
    }
  }
}

export function clearForm(form) {
  form.reset();
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isRequired(value) {
  return value && value.trim().length > 0;
}

export function showSuccess(message) {
  console.log('Success:', message);
}

export function showError(message) {
  console.error('Error:', message);
}

export function groupBy(array, property) {
  return array.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) acc[key] = [];
    acc[key].push(obj);
    return acc;
  }, {});
}

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

export function filterBy(array, criteria) {
  return array.filter(item => {
    return Object.entries(criteria).every(([key, value]) => {
      return item[key] == value;
    });
  });
}

export function unique(array, property) {
  return [...new Set(array.map(item => item[property]))];
}

export function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  return newTheme;
}

export function getCurrentTheme() {
  return localStorage.getItem('theme') || 'light';
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

export function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  
  setTheme(theme);
}

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
