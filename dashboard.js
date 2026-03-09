/**
 * Dashboard Module
 * Handles all dashboard metrics calculation and data aggregation
 */

import { getDashboardStats, getRecentReviews, getProperties } from './api.js';
import { 
  formatNumber, 
  formatDate,
  getLastNDays,
  groupBy,
  sortBy,
  unique 
} from './utils.js';

/**
 * Render main dashboard
 * @param {Element} container - Container to render into
 */
export async function renderDashboard(container) {
  try {
    // Show loading state
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading dashboard...</span></div>';
    
    // Get all metrics
    const stats = await getDashboardStats(7);
    
    // Render KPI cards
    const metricsHTML = renderMetricCards(stats);
    
    // Render charts section
    const chartsHTML = renderChartsSection(stats);
    
    // Render insights section
    const insightsHTML = renderInsightsSection(stats);
    
    // Combine all sections
    const html = `
      <div class="grid grid-4">
        ${metricsHTML}
      </div>
      
      <div style="margin-top: var(--spacing-2xl);">
        ${chartsHTML}
      </div>
      
      <div style="margin-top: var(--spacing-2xl);">
        ${insightsHTML}
      </div>
    `;
    
    container.innerHTML = html;
    
    // Initialize charts
    initializeCharts(stats);
    
  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-danger">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">Error Loading Dashboard</div>
          <p>${error.message}</p>
        </div>
      </div>
    `;
  }
}

/**
 * Render metric cards (KPIs)
 * @param {Object} stats - Dashboard statistics
 * @returns {string} HTML string
 */
function renderMetricCards(stats) {
  return `
    <!-- Total Reviews -->
    <div class="metric-card">
      <div class="metric-card-content">
        <div class="metric-label">Reviews This Week</div>
        <div class="metric-value">${stats.reviews.total}</div>
        <div class="metric-change positive">vs. last week</div>
      </div>
    </div>
    
    <!-- Average Rating -->
    <div class="metric-card success">
      <div class="metric-card-content">
        <div class="metric-label">Average Rating</div>
        <div class="metric-value">${formatNumber(stats.reviews.avgRating, 1)}</div>
        <div class="metric-change">⭐ Out of 5.0</div>
      </div>
    </div>
    
    <!-- Low Ratings -->
    <div class="metric-card ${stats.reviews.lowRating > 0 ? 'danger' : 'success'}">
      <div class="metric-card-content">
        <div class="metric-label">Low Ratings (1-2)</div>
        <div class="metric-value">${stats.reviews.lowRating}</div>
        <div class="metric-change">${stats.reviews.total > 0 ? formatNumber((stats.reviews.lowRating / stats.reviews.total) * 100) : 0}% of reviews</div>
      </div>
    </div>
    
    <!-- High Ratings -->
    <div class="metric-card success">
      <div class="metric-card-content">
        <div class="metric-label">High Ratings (5)</div>
        <div class="metric-value">${stats.reviews.highRating}</div>
        <div class="metric-change">${stats.reviews.total > 0 ? formatNumber((stats.reviews.highRating / stats.reviews.total) * 100) : 0}% of reviews</div>
      </div>
    </div>
    
    <!-- Properties -->
    <div class="metric-card" style="background: linear-gradient(135deg, #06b6d4, #0891b2);">
      <div class="metric-card-content">
        <div class="metric-label">Total Properties</div>
        <div class="metric-value">${stats.properties.total}</div>
        <div class="metric-change">Avg rating: ${formatNumber(stats.properties.avgRating, 1)}</div>
      </div>
    </div>
    
    <!-- Repeat Guests -->
    <div class="metric-card" style="background: linear-gradient(135deg, #a855f7, #9333ea);">
      <div class="metric-card-content">
        <div class="metric-label">Repeat Guests</div>
        <div class="metric-value">${stats.guests.repeat}</div>
        <div class="metric-change">${stats.guests.repeatRatio}% of all guests</div>
      </div>
    </div>
    
    <!-- Open Actions -->
    <div class="metric-card warning">
      <div class="metric-card-content">
        <div class="metric-label">Open Actions</div>
        <div class="metric-value">${stats.actions.open}</div>
        <div class="metric-change">${stats.actions.resolutionRate}% resolved</div>
      </div>
    </div>
  `;
}

/**
 * Render charts section
 * @param {Object} stats - Dashboard statistics
 * @returns {string} HTML string
 */
function renderChartsSection(stats) {
  return `
    <div class="grid grid-2">
      <!-- Weekly Review Trend -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Weekly Review Trend</h3>
        </div>
        <div class="chart-container">
          <canvas id="reviewTrendChart"></canvas>
        </div>
      </div>
      
      <!-- Rating Distribution -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Rating Distribution</h3>
        </div>
        <div class="chart-container">
          <canvas id="ratingDistributionChart"></canvas>
        </div>
      </div>
      
      <!-- Sentiment Analysis -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Sentiment Analysis</h3>
        </div>
        <div class="chart-container">
          <canvas id="sentimentChart"></canvas>
        </div>
      </div>
      
      <!-- Platform Comparison -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Platform Performance</h3>
        </div>
        <div class="chart-container">
          <canvas id="platformChart"></canvas>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render insights section
 * @param {Object} stats - Dashboard statistics
 * @returns {string} HTML string
 */
function renderInsightsSection(stats) {
  const topIssuesHTML = stats.topIssues
    .map((issue, index) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) 0; border-bottom: 1px solid var(--color-border);">
        <div>
          <div style="font-weight: var(--font-weight-semibold);">${index + 1}. ${issue.issue}</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">Reported ${issue.frequency} times</div>
        </div>
        <div style="background: var(--color-primary); color: white; padding: 0.5rem 1rem; border-radius: var(--radius-md); font-weight: var(--font-weight-semibold);">
          ${issue.frequency}
        </div>
      </div>
    `)
    .join('');
  
  const platformHTML = stats.platforms
    .map(p => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-md) 0; border-bottom: 1px solid var(--color-border);">
        <div>
          <div style="font-weight: var(--font-weight-semibold);">${p.name}</div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${p.count} review${p.count !== 1 ? 's' : ''}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-primary);">
            ${formatNumber(p.avgRating, 1)}
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">avg rating</div>
        </div>
      </div>
    `)
    .join('');
  
  return `
    <div class="grid grid-2">
      <!-- Top Issues -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Top 5 Recurring Issues</h3>
        </div>
        <div class="card-body">
          ${topIssuesHTML || '<p style="color: var(--color-text-secondary);">No issues reported</p>'}
        </div>
      </div>
      
      <!-- Platform Performance -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Platform Performance</h3>
        </div>
        <div class="card-body">
          ${platformHTML || '<p style="color: var(--color-text-secondary);">No data available</p>'}
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize all charts
 * @param {Object} stats - Dashboard statistics
 */
function initializeCharts(stats) {
  // Weekly trend chart
  if (document.getElementById('reviewTrendChart')) {
    createWeeklyTrendChart(stats);
  }
  
  // Rating distribution chart
  if (document.getElementById('ratingDistributionChart')) {
    createRatingDistributionChart(stats);
  }
  
  // Sentiment chart
  if (document.getElementById('sentimentChart')) {
    createSentimentChart(stats);
  }
  
  // Platform chart
  if (document.getElementById('platformChart')) {
    createPlatformChart(stats);
  }
}

/**
 * Create weekly trend chart
 * @param {Object} stats - Dashboard statistics
 */
async function createWeeklyTrendChart(stats) {
  try {
    const reviews = await getRecentReviews(7);
    
    // Group reviews by day
    const days = getLastNDays(7);
    const dayLabels = days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
    
    const dayData = days.map(day => {
      const dayReviews = reviews.filter(r => {
        const reviewDate = r.reviewDate.toDate();
        return reviewDate.toDateString() === day.toDateString();
      });
      return dayReviews.length;
    });
    
    const ctx = document.getElementById('reviewTrendChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Reviews',
          data: dayData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              padding: 15
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating weekly trend chart:', error);
  }
}

/**
 * Create rating distribution chart
 * @param {Object} stats - Dashboard statistics
 */
function createRatingDistributionChart(stats) {
  const ctx = document.getElementById('ratingDistributionChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Low (1-2)', 'Medium (3-4)', 'High (5)'],
      datasets: [{
        data: [
          stats.reviews.lowRating,
          stats.reviews.mediumRating,
          stats.reviews.highRating
        ],
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#10b981'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        }
      }
    }
  });
}

/**
 * Create sentiment chart
 * @param {Object} stats - Dashboard statistics
 */
function createSentimentChart(stats) {
  const sentimentLabels = Object.keys(stats.sentiment);
  const sentimentData = Object.values(stats.sentiment);
  
  const ctx = document.getElementById('sentimentChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sentimentLabels,
      datasets: [{
        label: 'Count',
        data: sentimentData,
        backgroundColor: [
          '#10b981',  // Positive
          '#6b7280',  // Neutral
          '#ef4444'   // Negative
        ]
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

/**
 * Create platform comparison chart
 * @param {Object} stats - Dashboard statistics
 */
function createPlatformChart(stats) {
  const platformLabels = stats.platforms.map(p => p.name);
  const platformData = stats.platforms.map(p => p.avgRating);
  
  const ctx = document.getElementById('platformChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: platformLabels,
      datasets: [{
        label: 'Average Rating',
        data: platformData,
        backgroundColor: '#2563eb',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}
