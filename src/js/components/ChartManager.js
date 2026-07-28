/**
 * Fantasy League Analytics - ChartManager Component
 * 
 * High-performance wrapper around Chart.js library.
 * Configures dark-mode themes, vibrant gradients, custom tooltips,
 * and renders line graphs, bar charts, radar charts, pie charts, scatter plots, and heatmaps.
 */

class ChartManager {
  /**
   * Helper to create a vertical gradient fill for line/area charts
   */
  static createGradient(ctx, colorHex, alphaTop = 0.4, alphaBottom = 0.0) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, colorHex);
    gradient.addColorStop(1, 'rgba(11, 14, 20, 0.0)');
    return gradient;
  }

  /**
   * Render Line Chart for Weekly Scoring Trends / Power Ranking Movement
   */
  static renderLineChart(canvasId, labels, datasets) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (canvas._chartInstance) canvas._chartInstance.destroy();

    canvas._chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map(d => ({
          label: d.label,
          data: d.data,
          borderColor: d.color || '#00e676',
          backgroundColor: this.createGradient(ctx, d.color || '#00e676'),
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 7,
          fill: true
        }))
      },
      options: this.getDefaultDarkOptions()
    });
  }

  /**
   * Render Bar Chart for Scoring Distributions / Position Scores / Bench Efficiency
   */
  static renderBarChart(canvasId, labels, data, barColor = '#38bdf8') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (canvas._chartInstance) canvas._chartInstance.destroy();

    canvas._chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: barColor,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        ...this.getDefaultDarkOptions(),
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  /**
   * Render Radar Chart for Skillset & Team Profile Comparisons
   */
  static renderRadarChart(canvasId, labels, datasets) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (canvas._chartInstance) canvas._chartInstance.destroy();

    canvas._chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: datasets.map(d => ({
          label: d.label,
          data: d.data,
          borderColor: d.color,
          backgroundColor: `${d.color}33`,
          borderWidth: 2
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: '#2a3447' },
            grid: { color: '#2a3447' },
            pointLabels: { color: '#94a3b8', font: { family: 'Inter', size: 11, weight: '600' } },
            ticks: { display: false }
          }
        },
        plugins: {
          legend: { labels: { color: '#f8fafc', font: { family: 'Outfit', weight: '600' } } }
        }
      }
    });
  }

  /**
   * Render Scatter Plot for Luck Index vs Points For
   */
  static renderScatterPlot(canvasId, scatterData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (canvas._chartInstance) canvas._chartInstance.destroy();

    canvas._chartInstance = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Team Luck Index',
          data: scatterData,
          backgroundColor: '#f59e0b',
          pointRadius: 8,
          pointHoverRadius: 11
        }]
      },
      options: {
        ...this.getDefaultDarkOptions(),
        scales: {
          x: { title: { display: true, text: 'Total Points Scored', color: '#94a3b8' }, grid: { color: '#2a3447' } },
          y: { title: { display: true, text: 'Luck Rating (0-100)', color: '#94a3b8' }, grid: { color: '#2a3447' } }
        }
      }
    });
  }

  /**
   * Default Chart.js Options customized for Dark Theme PFF UI
   */
  static getDefaultDarkOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#f8fafc',
            font: { family: 'Outfit', size: 12, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#141923',
          titleColor: '#f8fafc',
          bodyColor: '#00e676',
          borderColor: '#2a3447',
          borderWidth: 1,
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
          grid: { color: '#1e2638' }
        },
        y: {
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
          grid: { color: '#1e2638' }
        }
      }
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartManager;
}
