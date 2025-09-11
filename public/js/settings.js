// public/js/settings.js
// Settings page logic: load/save settings, apply theme, and data export/import.
// Works with i18n/localStorage and refreshes the rest of the app.

// We rely on Bootstrap 5.3 color modes via [data-bs-theme].
// https://getbootstrap.com/docs/5.3/customize/color-modes/

import i18n from './i18n.js';
import { ApiService } from './api.js';

const api = new ApiService();

function initFxInputs() {
    const r = i18n.getFxRates();
    document.getElementById('fxUsd').value = r.USD;
    document.getElementById('fxRub').value = r.RUB;
  }
  
  function saveFxInputs() {
    const usd = Number(document.getElementById('fxUsd').value);
    const rub = Number(document.getElementById('fxRub').value);
    i18n.setFxRates({ USD: usd, RUB: rub }); // EUR locked at 1
    // trigger re-render everywhere that relies on UI currency
    document.dispatchEvent(new CustomEvent('transactions:refresh'));
  }

// ---- keys & defaults -------------------------------------------------------

const SETTINGS_KEY = 'expenseTrackerSettings';

const DEFAULTS = {
  language: 'en',
  currency: 'USD',           // restricted to USD/EUR/RUB in UI
  dateFormat: 'YYYY-MM-DD',
  decimalPlaces: 2,          // 0..4 realistic
  theme: 'system',           // 'light' | 'dark' | 'system'
};

// ---- helpers: storage ------------------------------------------------------

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(next) {
  const merged = { ...loadSettings(), ...next };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  // expose into global app state if present
  if (window.app && window.app.state) {
    window.app.state.settings = merged;
  }
  return merged;
}

// ---- THEME handling --------------------------------------------------------

/**
 * Resolve actual theme to 'light' or 'dark' based on user choice.
 */
function resolveTheme(mode) {
  if (mode === 'light' || mode === 'dark') return mode;
  // 'system': follow OS preference
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  return mq.matches ? 'dark' : 'light';
}

/**
 * Apply theme to <html data-bs-theme="..."> and keep in sync with “system”.
 * Returns a cleanup function to remove the media listener (if any).
 */
export function applyTheme(mode) {
  const html = document.documentElement;
  const real = resolveTheme(mode);
  html.setAttribute('data-bs-theme', real);

  // If mode is 'system', listen for OS changes and update live.
  let unsub = () => {};
  if (mode === 'system') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const current = resolveTheme('system');
      html.setAttribute('data-bs-theme', current);
    };
    mq.addEventListener('change', handler);
    unsub = () => mq.removeEventListener('change', handler);
  }
  return unsub;
}

/**
 * Read saved setting and apply it immediately (use on every page).
 */
export function applySavedTheme() {
  const { theme } = loadSettings();
  applyTheme(theme);
}

// ---- EXPORT / IMPORT (JSON) ------------------------------------------------

/**
 * Export all app data to JSON (settings + categories + transactions).
 */
async function exportAllData() {
  // Prefer using state (already loaded) and fall back to API if needed
  const state = (window.app && window.app.state) || {};
  let { categories = [], transactions = [], settings = loadSettings() } = state;

  try {
    if (!Array.isArray(categories) || !categories.length) {
      categories = await api.getCategories();
    }
  } catch {}
  try {
    if (!Array.isArray(transactions) || !transactions.length) {
      transactions = await api.getTransactions();
    }
  } catch {}

  const payload = {
    meta: { app: 'Expense Tracker Pro', exportedAt: new Date().toISOString(), version: 1 },
    settings,
    categories,
    transactions,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `expense-tracker-backup_${d}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  // update backup info (optional UI)
  const info = document.getElementById('backupInfo');
  if (info) {
    const size = `${(blob.size / 1024).toFixed(1)} KB`;
    info.querySelector('[data-i18n="lastBackup"]')?.parentElement?.querySelector('strong')
    // ignore, just leave text below:
    info.innerHTML = `
      <h6><i class="bi bi-info-circle me-2"></i><span data-i18n="backupInfo">Backup Information</span></h6>
      <p class="mb-1"><strong data-i18n="lastBackup">Last Backup</strong>: ${new Date().toLocaleString()}</p>
      <p class="mb-0"><strong data-i18n="backupSize">Backup Size</strong>: ${size}</p>
    `;
  }

  alert(i18n.t('dataExported') || 'Data exported successfully');
}

/**
 * Import data from JSON. Overwrites existing local data after confirmation.
 */
async function importAllData(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    alert(i18n.t('error.invalidFile') || 'Invalid file format');
    return;
  }

  if (!data || typeof data !== 'object') {
    alert(i18n.t('error.invalidFile') || 'Invalid file format');
    return;
  }

  if (!confirm(i18n.t('confirm.importData') || 'This will overwrite all existing data. Continue?')) {
    return;
  }

  // Basic shape checks
  const nextSettings = { ...DEFAULTS, ...(data.settings || {}) };
  const nextCategories = Array.isArray(data.categories) ? data.categories : [];
  const nextTransactions = Array.isArray(data.transactions) ? data.transactions : [];

  // Persist to localStorage (your ApiService likely reads from there)
  saveSettings(nextSettings);

  // If ApiService exposes bulk setters, prefer them; otherwise, overwrite known keys
  try {
    // Fallback: write raw arrays in user-known keys (adjust if your ApiService uses different keys)
    localStorage.setItem('expenseTrackerCategories', JSON.stringify(nextCategories));
    localStorage.setItem('expenseTrackerTransactions', JSON.stringify(nextTransactions));
  } catch {}

  // Update live state if available
  if (window.app && window.app.state) {
    window.app.state.settings = nextSettings;
    window.app.state.categories = nextCategories;
    window.app.state.transactions = nextTransactions;
  }

  // Apply language/currency/theme immediately
  await i18n.setLanguage(nextSettings.language || DEFAULTS.language);
  if (nextSettings.currency) i18n.setCurrency(nextSettings.currency);
  applyTheme(nextSettings.theme || 'system');

  // Notify other tabs via storage event and refresh current page
  if (window.app && typeof window.app.refreshPage === 'function') {
    window.app.refreshPage();
  } else {
    // Light fallback: force UI i18n refresh
    i18n.updatePageTranslations();
    document.dispatchEvent(new Event('transactions:refresh'));
  }

  alert(i18n.t('dataImported') || 'Data imported successfully');
}

// ---- INIT page -------------------------------------------------------------

/**
 * Initialize Settings page:
 * - Prefill form by saved settings
 * - Save/Reset handlers
 * - Export/Import handlers
 * - Live theme apply
 */
export async function initSettings() {
  // Apply saved theme immediately on this page
  applySavedTheme();

  const form = document.getElementById('settingsForm');
  const langEl = document.getElementById('language');
  const currEl = document.getElementById('currency');
  const fmtEl  = document.getElementById('dateFormat');
  const dpEl   = document.getElementById('decimalPlaces');
  const themeEl= document.getElementById('theme');

  const exportBtn = document.getElementById('exportJsonBtn');
  const importInput = document.getElementById('importFile');
  const resetBtn = document.getElementById('resetBtn');

  // Prefill
  const s = loadSettings();
  if (langEl) langEl.value = s.language || DEFAULTS.language;
  if (currEl) currEl.value = s.currency || DEFAULTS.currency;
  if (fmtEl)  fmtEl.value  = s.dateFormat || DEFAULTS.dateFormat;
  if (dpEl)   dpEl.value   = String(s.decimalPlaces ?? DEFAULTS.decimalPlaces);
  if (themeEl)themeEl.value= s.theme || DEFAULTS.theme;

  // Saving the form
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const next = {
        language: langEl?.value || DEFAULTS.language,
        currency: currEl?.value || DEFAULTS.currency,
        dateFormat: fmtEl?.value || DEFAULTS.dateFormat,
        decimalPlaces: Math.max(0, Math.min(4, parseInt(dpEl?.value ?? 2, 10))),
        theme: themeEl?.value || 'system',
      };

      // Persist settings
      saveSettings(next);

      // Apply language + currency across app
      await i18n.setLanguage(next.language);
      i18n.setCurrency(next.currency);

      // Apply theme
      applyTheme(next.theme);

      // Optional: refresh dashboard/charts if the app exposes hook
      if (window.app && typeof window.app.refreshPage === 'function') {
        window.app.refreshPage();
      } else {
        i18n.updatePageTranslations();
        document.dispatchEvent(new Event('transactions:refresh'));
      }

      alert(i18n.t('success.settingsSaved') || 'Settings saved successfully');
    });
  }

  // Reset to defaults
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (!confirm(i18n.t('confirm.resetSettings') || 'Reset all settings to defaults?')) return;

      const next = { ...DEFAULTS };
      saveSettings(next);

      // Refill form
      if (langEl) langEl.value = next.language;
      if (currEl) currEl.value = next.currency;
      if (fmtEl)  fmtEl.value  = next.dateFormat;
      if (dpEl)   dpEl.value   = String(next.decimalPlaces);
      if (themeEl)themeEl.value= next.theme;

      // Apply effects
      await i18n.setLanguage(next.language);
      i18n.setCurrency(next.currency);
      applyTheme(next.theme);

      if (window.app && typeof window.app.refreshPage === 'function') {
        window.app.refreshPage();
      } else {
        i18n.updatePageTranslations();
        document.dispatchEvent(new Event('transactions:refresh'));
      }

      alert(i18n.t('settingsReset') || 'Settings reset to defaults');
    });
  }

  // Export JSON
  if (exportBtn) {
    exportBtn.addEventListener('click', exportAllData);
  }

  // Import JSON
  if (importInput) {
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await importAllData(file);
      // clear the input so the same file can be re-imported if needed
      e.target.value = '';
    });
  }

  // Keep header selector (nav) in sync if you use it on this page
  const headerLang = document.getElementById('languageSelect');
  if (headerLang) headerLang.value = s.language || DEFAULTS.language;

  // Re-translate the page (labels may depend on language)
  i18n.updatePageTranslations();
}
