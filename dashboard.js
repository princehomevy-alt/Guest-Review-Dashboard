import { getDashboardStats, getRecentReviews } from './api.js';

export async function renderDashboard(container) {
  try {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading dashboard...</span></div>';
    
    const stats = await getDashboardStats(7);
    
    const metricsHTML = `
      <div class="grid grid-4">
        <div class="metric-card">
          <div class="metric-label">Total Reviews</div>
          <div class="metric-value">${stats.reviews.total}</div>
        </div>
        
        <div class="metric-card" style="background: linear-gradient(135deg, #10b981, #059669);">
          <div class="metric-label">Average Rating</div>
          <div class="metric-value">${stats.reviews.avgRating.toFixed(1)}</div>
        </div>
        
        <div class="metric-card" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
          <div class="metric-label">Low Ratings</div>
          <div class="metric-value">${stats.reviews.lowRating}</div>
        </div>
        
        <div class="metric-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
          <div class="metric-label">Medium Ratings</div>
          <div class="metric-value">${stats.reviews.mediumRating}</div>
        </div>
      </div>
    `;
    
    const chartsHTML = `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Weekly Trend</h3>
          </div>
          <div class="chart-container">
            <canvas id="reviewTrendChart"></canvas>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Rating Distribution</h3>
          </div>
          <div class="chart-container">
            <canvas id="ratingDistributionChart"></canvas>
          </div>
        </div>
      </div>
    `;
    
    const insightsHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Top Issues</h3>
        </div>
        <div>
          ${stats.topIssues.map(i => `
            <div style="padding: 12px 0; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between;">
              <span>${i.issue}</span>
              <strong>${i.frequency}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    const html = metricsHTML + chartsHTML + insightsHTML;
    container.innerHTML = html;
    
    initializeCharts(stats);
    
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger"><p>Error loading dashboard: ${error.message}</p></div>`;
  }
}

function initializeCharts(stats) {
  if (document.getElementById('reviewTrendChart')) {
    createWeeklyTrendChart(stats);
  }
  
  if (document.getElementById('ratingDistributionChart')) {
    createRatingDistributionChart(stats);
  }
}

async function createWeeklyTrendChart(stats) {
  try {
    const reviews = await getRecentReviews(7);
    const days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    
    const dayLabels = days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
    const dayData = days.map(day => {
      return reviews.filter(r => {
        const reviewDate = r.reviewDate.toDate();
        return reviewDate.toDateString() === day.toDateString();
      }).length;
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
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  } catch (error) {
    console.error('Error creating chart:', error);
  }
}

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
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}
