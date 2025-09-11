/**
 * Utility functions for Expense Tracker Pro
 */

/**
 * Format a date string to a localized date
 * @param {string|Date} date - The date to format
 * @param {string} [locale] - The locale to use for formatting
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = undefined) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour12: true
  };
  
  return dateObj.toLocaleDateString(locale, options);
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (e.g., 'USD', 'EUR')
 * @param {number} [decimals=2] - Number of decimal places
 * @param {string} [locale] - The locale to use for formatting
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD', decimals = 2, locale = undefined) {
  if (amount === undefined || amount === null || isNaN(amount)) return '—';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount.toFixed(decimals)} ${currency}`;
  }
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce a function
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} The debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Throttle a function
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep clone an object
 * @param {Object} obj - The object to clone
 * @returns {Object} A deep clone of the object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const clone = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}

/**
 * Get the difference between two dates in days
 * @param {Date|string} date1 - The first date
 * @param {Date|string} date2 - The second date
 * @returns {number} The difference in days
 */
export function getDaysBetween(date1, date2) {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format a number with a specific number of decimal places
 * @param {number} num - The number to format
 * @param {number} [decimals=2] - The number of decimal places
 * @returns {string} The formatted number
 */
export function formatNumber(num, decimals = 2) {
  if (num === undefined || num === null || isNaN(num)) return '—';
  
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(num * factor) / factor;
  
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

/**
 * Check if a value is empty
 * @param {*} value - The value to check
 * @returns {boolean} True if the value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Parse a query string into an object
 * @param {string} queryString - The query string to parse
 * @returns {Object} The parsed query parameters
 */
export function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    // Try to parse JSON values
    try {
      result[key] = JSON.parse(value);
    } catch (e) {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Convert an object to a query string
 * @param {Object} obj - The object to convert
 * @returns {string} The query string
 */
export function toQueryString(obj) {
  if (!obj || typeof obj !== 'object') return '';
  
  const params = new URLSearchParams();
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Convert non-string values to JSON strings
      params.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }
  
  return params.toString();
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export function capitalize(str) {
  if (typeof str !== 'string' || !str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length of the string
 * @param {string} [ellipsis='...'] - The ellipsis to append if truncated
 * @returns {string} The truncated string
 */
export function truncate(str, maxLength, ellipsis = '...') {
  if (typeof str !== 'string' || str.length <= maxLength) return str || '';
  return str.slice(0, maxLength) + ellipsis;
}

/**
 * Generate a random color in hex format
 * @returns {string} A random hex color
 */
export function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} ms - The duration in milliseconds
 * @returns {string} A formatted duration string
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format a file size in a human-readable format
 * @param {number} bytes - The file size in bytes
 * @param {number} [decimals=2] - The number of decimal places
 * @returns {string} The formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Check if the current device is a mobile device
 * @returns {boolean} True if the device is a mobile device
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if the current device is in dark mode
 * @returns {boolean} True if the device is in dark mode
 */
export function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Add an event listener that will be automatically removed
 * @param {Element} element - The element to add the event listener to
 * @param {string} event - The event name
 * @param {Function} handler - The event handler
 * @param {Object} [options] - The event listener options
 * @returns {Function} A function to remove the event listener
 */
export function addAutoRemoveEventListener(element, event, handler, options) {
  element.addEventListener(event, handler, options);
  return () => element.removeEventListener(event, handler, options);
}

/**
 * Create a promise that resolves after a delay
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise} A promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export all functions as default
export default {
  formatDate,
  formatCurrency,
  generateId,
  debounce,
  throttle,
  deepClone,
  getDaysBetween,
  formatNumber,
  isEmpty,
  parseQueryString,
  toQueryString,
  capitalize,
  truncate,
  getRandomColor,
  formatDuration,
  formatFileSize,
  isMobileDevice,
  isDarkMode,
  addAutoRemoveEventListener,
  delay
};
