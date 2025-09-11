/**
 * public/js/app.js
 * App bootstrap and shared state/helpers.
 * - Initializes i18n (language, currency, decimals, theme)
 * - Preloads minimal state (settings, categories, transactions)
 * - Wires the global language selector in the navbar
 * - Exposes helpers & shared state on window.app
 *
 * NOTE:
 *   Per-page logic lives in their own modules:
 *   - Dashboard rendering: index.html calls initApp() and uses window.app.state
 *   - Transactions page: transactions.html imports initializeTransactions() + initTransactionModal()
 *   - Settings page: settings.html imports initSettings() from settings.js
 */

import i18n from './i18n.js';
import { ApiService } from './api.js';
// (optional) If you created theme helpers in settings.js:
import { applySavedTheme } from './settings.js'; // safe to import; if you don't have it, remove this line

const api = new ApiService();

/* -------------------------------------------------------------------------- */
/*                              Shared application                             */
/* -------------------------------------------------------------------------- */

const state = {
  settings: {},        // loaded from storage/API
  categories: [],      // [{ id, name, type }]
  transactions: []     // [{ id, type, amount, currency, date, category, ... }]
};

// expose globally for convenience
window.app = { state, api };

/* -------------------------------------------------------------------------- */
/*                                   Loaders                                  */
/* -------------------------------------------------------------------------- */

async function preloadSettings() {
  try {
    // If your API has settings endpoint:
    const s = await api.getSettings?.();
    if (s && typeof s === 'object') state.settings = s;
  } catch (e) {
    console.warn('Settings preload skipped:', e);
  }
}

async function preloadCategories() {
  try {
    const cats = await api.getCategories();
    state.categories = Array.isArray(cats) ? cats : [];
  } catch (e) {
    console.warn('Categories preload failed:', e);
    state.categories = state.categories || [];
  }
}

async function preloadTransactions() {
  try {
    const tx = await api.getTransactions();
    state.transactions = Array.isArray(tx) ? tx : [];
  } catch (e) {
    console.warn('Transactions preload failed:', e);
    state.transactions = state.transactions || [];
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Convert a numeric amount between currencies using i18n.convertCurrency if present.
 * Falls back to identity if conversion not available.
 */
function convert(amount, fromCur, toCur) {
  if (typeof i18n.convertCurrency === 'function') {
    return i18n.convertCurrency(amount, fromCur, toCur);
  }
  return amount;
}

/**
 * Compute totals (income, expense, balance) in the CURRENT UI currency.
 * Each transaction can have its own currency; we convert into the UI currency first.
 */
function computeTotalsInUiCurrency(transactions = state.transactions) {
  const uiCurrency = i18n.getCurrentCurrency ? i18n.getCurrentCurrency() : 'USD';
  let income = 0, expense = 0;

  for (const tx of transactions) {
    const raw = Math.abs(Number(tx.amount) || 0);
    const from = tx.currency || uiCurrency;
    const val  = convert(raw, from, uiCurrency);
    if ((tx.type || '').toLowerCase() === 'income') income += val;
    else expense += val;
  }

  return { income, expense, balance: income - expense, currency: uiCurrency };
}

/**
 * Wire the language selector in the top navbar to i18n.
 * Also keeps the dropdown value in sync when language changes programmatically.
 */
function wireNavbarLanguageSelector() {
  const langSel = document.getElementById('languageSelect');
  if (!langSel) return;

  // set current
  langSel.value = i18n.getCurrentLanguage();

  // on change -> persist + live translate
  langSel.addEventListener('change', (e) => {
    i18n.setLanguage(e.target.value);
  });

  // keep in sync if language changes elsewhere
  i18n.onLanguageChange?.((lang) => {
    if (langSel.value !== lang) langSel.value = lang;
  });
}

/* -------------------------------------------------------------------------- */
/*                                Theme (optional)                            */
/* -------------------------------------------------------------------------- */

/**
 * Apply saved theme early to avoid flash (if you have this in settings.js).
 * If not using theme logic, you can safely remove applySavedTheme() calls.
 */
function initTheme() {
  try { applySavedTheme?.(); } catch {}
}

/* -------------------------------------------------------------------------- */
/*                                  initApp                                   */
/* -------------------------------------------------------------------------- */

/**
 * Initialize the app:
 * 1) Init i18n (sets language, currency, decimals, updates DOM text)
 * 2) Apply saved theme (optional)
 * 3) Preload settings, categories, and transactions (in parallel)
 * 4) Wire navbar language selector
 * 5) Broadcast a custom event that pages can listen to
 */
export async function initApp() {
  // 1) i18n (reads saved settings from localStorage inside i18n)
  await i18n.initI18n();

  // 2) Apply theme ASAP
  initTheme();

  // 3) Preload core data
  await Promise.all([preloadSettings(), preloadCategories(), preloadTransactions()]);

  // 4) Wire the navbar language selector
  wireNavbarLanguageSelector();

  // 5) Make sure freshly injected labels are translated
  i18n.updatePageTranslations?.();

  // 6) Notify listeners that app is ready / settings loaded
  document.dispatchEvent(new CustomEvent('app:ready', { detail: { state: window.app.state } }));

  // Also re-broadcast when language or currency changes so pages can re-render
  i18n.onLanguageChange?.(() => {
    i18n.updatePageTranslations?.();
    document.dispatchEvent(new CustomEvent('app:settingsChanged', { detail: { reason: 'language' } }));
  });
  i18n.onCurrencyChange?.(() => {
    document.dispatchEvent(new CustomEvent('app:settingsChanged', { detail: { reason: 'currency' } }));
  });

  return window.app;
}

/* -------------------------------------------------------------------------- */
/*                              Named Exports                                 */
/* -------------------------------------------------------------------------- */

export { api, computeTotalsInUiCurrency };
export default { initApp, api, computeTotalsInUiCurrency };
