import i18n from './i18n.js';

/**
 * Bind language selectors on the page.
 * Keeps current value, saves to localStorage, updates UI immediately.
 */
export function initLanguageSelector() {
  const selectors = ['#languageSelect', '#language'];

  selectors.forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;

    // Set the current value from saved settings
    el.value = i18n.getCurrentLanguage();

    // Change language + persist + live update
    el.addEventListener('change', async (e) => {
      const lang = e.target.value;
      await i18n.setLanguage(lang);
      i18n.updatePageTranslations(); // force-update just in case
    });
  });
}