// init.js - Application initialization

import { initI18n, updatePageLanguage, t, getCurrentLanguage, saveUserSettings, getUserSettings } from './i18n.js';

// Initialize the application
async function initApp() {
  try {
    // Initialize i18n and get current settings
    const settings = initI18n();
    
    // Set up language selector if it exists
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      // Set current language
      languageSelect.value = settings.language || 'en';
      
      // Handle language change
      languageSelect.addEventListener('change', async (e) => {
        const newLanguage = e.target.value;
        
        // Update the page language
        updatePageLanguage(newLanguage);
        
        // Save the new language preference
        const currentSettings = getUserSettings() || {};
        currentSettings.language = newLanguage;
        await saveUserSettings(currentSettings);
        
        // Show success message
        showNotification(t('settingsSaved'), 'success');
      });
    }
    
    // Add loading class to body and remove it when done
    document.body.classList.add('loading');
    
    // Initialize other modules here if needed
    
    // Remove loading class when everything is ready
    setTimeout(() => {
      document.body.classList.remove('loading');
    }, 100);
    
    return settings;
  } catch (error) {
    console.error('Error initializing application:', error);
    showNotification(t('error.initializationFailed'), 'error');
    document.body.classList.remove('loading');
    return {};
  }
}

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '1060';
    notification.role = 'alert';
    
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close';
    closeButton.setAttribute('data-bs-dismiss', 'alert');
    closeButton.setAttribute('aria-label', 'Close');
    
    notification.appendChild(closeButton);
    document.body.appendChild(notification);
  }
  
  // Update notification content and type
  notification.textContent = message;
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification) {
      const bsAlert = new bootstrap.Alert(notification);
      bsAlert.close();
    }
  }, 5000);
}

// Export public methods
export {
  initApp,
  t,
  showNotification
};

// Auto-initialize when imported as a module
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
