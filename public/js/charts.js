// charts.js - Chart rendering utilities for Expense Tracker Pro
// Uses Chart.js for rendering interactive charts

// Import i18n module
import * as i18nModule from './i18n.js';

// Get the i18n instance
const i18n = i18nModule.default;

// Chart.js configuration
const chartConfig = {
  // Default colors for charts
  colors: {
    blue: '#4e73df',
    indigo: '#6610f2',
    purple: '#6f42c1',
    pink: '#e83e8c',
    red: '#e74a3b',
    orange: '#fd7e14',
    yellow: '#f6c23e',
    green: '#1cc88a',
    teal: '#20c9a6',
    cyan: '#36b9cc',
    gray: '#858796',
    grayDark: '#5a5c69',
    primary: '#4e73df',
    secondary: '#858796',
    success: '#1cc88a',
    info: '#36b9cc',
    warning: '#f6c23e',
    danger: '#e74a3b',
    light: '#f8f9fc',
    dark: '#5a5c69',
    white: '#fff',
    black: '#000'
  },
  
  // Default font settings
  font: {
    family: 'Nunito, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    size: 11,
    style: 'normal',
    lineHeight: 1
  },
  
  // Animation settings
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  },
  
  // Responsive settings
  responsive: true,
  maintainAspectRatio: false
};

// Store chart instances
const chartInstances = new Map();

/**
 * Initialize a chart with common settings
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} type - Chart type ('line', 'bar', 'pie', etc.)
 * @param {Object} data - Chart data
 * @param {Object} options - Chart options
 * @returns {Chart} Chart instance
 */
function initChart(canvas, type, data, options = {}) {
  // Destroy existing chart if it exists
  if (chartInstances.has(canvas)) {
    chartInstances.get(canvas).destroy();
  }
  
  // Merge default options with provided options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            family: chartConfig.font.family,
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: chartConfig.font.family,
          size: 12
        },
        bodyFont: {
          family: chartConfig.font.family,
          size: 12
        },
        padding: 10,
        cornerRadius: 3,
        displayColors: true,
        intersect: false,
        mode: 'index',
        position: 'nearest'
      }
    },
    scales: {},
    ...options
  };
  
  // Create new chart instance
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type,
    data,
    options: defaultOptions
  });
  
  // Store the chart instance
  chartInstances.set(canvas, chart);
  
  return chart;
}

/**
 * Render a pie chart
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} config - Chart configuration
 * @param {string} config.title - Chart title
 * @param {Array} config.data - Chart data array of {label, value, color}
 * @param {Array} [config.colors] - Array of colors for the chart
 * @returns {Chart} Chart instance
 */
export function renderPieChart(canvas, { title, data, colors = [] }) {
  if (!canvas) {
    console.error('Canvas element is required');
    return null;
  }
  
  // Default colors if not provided
  const defaultColors = [
    chartConfig.colors.primary,
    chartConfig.colors.success,
    chartConfig.colors.info,
    chartConfig.colors.warning,
    chartConfig.colors.danger,
    chartConfig.colors.secondary,
    chartConfig.colors.dark,
    chartConfig.colors.primaryLight = '#b5c8ff'
  ];
  
  // Prepare chart data
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: colors.length ? colors : defaultColors.slice(0, data.length),
      borderWidth: 1,
      borderColor: chartConfig.colors.white,
      hoverBorderColor: chartConfig.colors.white,
      hoverOffset: 10
    }]
  };
  
  // Chart options
  const options = {
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: '600'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
    radius: '80%'
  };
  
  return initChart(canvas, 'doughnut', chartData, options);
}

/**
 * Render a line chart
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} config - Chart configuration
 * @param {string} config.title - Chart title
 * @param {Array} config.labels - X-axis labels
 * @param {Array} config.datasets - Array of dataset configurations
 * @returns {Chart} Chart instance
 */
export function renderLineChart(canvas, { title, labels, datasets }) {
  if (!canvas) {
    console.error('Canvas element is required');
    return null;
  }
  
  // Prepare chart data
  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || `${chartConfig[`colors.${Object.keys(chartConfig.colors)[index]}`] || chartConfig.colors.primary}33`, // 20% opacity
      borderColor: dataset.borderColor || chartConfig[`colors.${Object.keys(chartConfig.colors)[index]}`] || chartConfig.colors.primary,
      borderWidth: 2,
      pointBackgroundColor: dataset.pointBackgroundColor || chartConfig.colors.white,
      pointBorderColor: dataset.pointBorderColor || (chartConfig[`colors.${Object.keys(chartConfig.colors)[index]}`] || chartConfig.colors.primary),
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: dataset.pointHoverBackgroundColor || chartConfig.colors.white,
      pointHoverBorderColor: dataset.pointHoverBorderColor || (chartConfig[`colors.${Object.keys(chartConfig.colors)[index]}`] || chartConfig.colors.primary),
      pointHoverBorderWidth: 2,
      fill: dataset.fill !== undefined ? dataset.fill : true,
      tension: dataset.tension !== undefined ? dataset.tension : 0.3
    }))
  };
  
  // Chart options
  const options = {
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: '600'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: (value) => {
            // Format numbers with commas for thousands
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          },
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };
  
  return initChart(canvas, 'line', chartData, options);
}

/**
 * Render a bar chart
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} config - Chart configuration
 * @param {string} config.title - Chart title
 * @param {Array} config.labels - X-axis labels
 * @param {Array} config.datasets - Array of dataset configurations
 * @returns {Chart} Chart instance
 */
export function renderBarChart(canvas, { title, labels, datasets }) {
  if (!canvas) {
    console.error('Canvas element is required');
    return null;
  }
  
  // Prepare chart data
  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || chartConfig[`colors.${Object.keys(chartConfig.colors)[index]}`] || chartConfig.colors.primary,
      borderColor: dataset.borderColor || chartConfig.colors.white,
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
      barPercentage: 0.8,
      categoryPercentage: 0.8
    }))
  };
  
  // Chart options
  const options = {
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: '600'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            return `${label}: ${value}`;
          }
        }
      },
      legend: {
        display: datasets.length > 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: (value) => {
            // Format numbers with commas for thousands
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          },
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };
  
  return initChart(canvas, 'bar', chartData, options);
}

/**
 * Update a chart with new data
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {Object} newData - New chart data
 */
export function updateChart(canvas, newData) {
  const chart = chartInstances.get(canvas);
  if (chart) {
    chart.data = newData;
    chart.update();
  }
}

/**
 * Destroy a chart instance
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
export function destroyChart(canvas) {
  const chart = chartInstances.get(canvas);
  if (chart) {
    chart.destroy();
    chartInstances.delete(canvas);
  }
}

/**
 * Destroy all chart instances
 */
export function destroyAllCharts() {
  chartInstances.forEach((chart, canvas) => {
    chart.destroy();
    chartInstances.delete(canvas);
  });
}

// Export default object with all functions
export default {
  renderPieChart,
  renderLineChart,
  renderBarChart,
  updateChart,
  destroyChart,
  destroyAllCharts
};
