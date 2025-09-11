
/**
 * i18n - Internationalization module for Expense Tracker Pro
 * Fully self-contained with EN/RU/ET translations and persistence.
 */

const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧', rtl: false, defaultCurrency: 'USD' },
  ru: { name: 'Русский', flag: '🇷🇺', rtl: false, defaultCurrency: 'USD' },
  et: { name: 'Eesti',   flag: '🇪🇪', rtl: false, defaultCurrency: 'EUR' }
};
const DEFAULT_LANGUAGE = 'en';
const SETTINGS_KEY = 'expenseTrackerSettings';

let currentLanguage = DEFAULT_LANGUAGE;
let currentCurrency = 'USD';

const translations = {
  en: {
    // App title
    appName: 'Expense Tracker Pro',

    // Navigation
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    categories: 'Categories',
    settings: 'Settings',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    loading: 'Loading...',
    confirmDelete: 'Are you sure you want to delete this item?',
    actions: 'Actions',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    filter: 'Filter',
    reset: 'Reset',
    apply: 'Apply',
    search: 'Search',

    // Dashboard
    welcome: 'Welcome back',
    balance: 'Balance',
    income: 'Income',
    expense: 'Expense',
    recentTransactions: 'Recent Transactions',
    noTransactions: 'No transactions yet. Add your first transaction to get started!',
    viewAll: 'View All',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    expenseByCategory: 'Expense by Category',
    incomeVsExpense: 'Income vs Expense',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    custom: 'Custom',

    // Transactions
    transaction: 'Transaction',
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    deleteTransaction: 'Delete Transaction',
    transactionAdded: 'Transaction added successfully',
    transactionUpdated: 'Transaction updated successfully',
    transactionDeleted: 'Transaction deleted',
    amount: 'Amount',
    date: 'Date',
    description: 'Description',
    category: 'Category',
    type: 'Type',
    note: 'Note',
    notes: 'Notes',
    incomeType: 'Income',
    expenseType: 'Expense',
    transactionHistory: 'Transaction History',
    transactionsFound: 'transactions found',
    transactionsCount: 'transactions',
    transactionDate: 'Date',
    transactionType: 'Type',
    transactionCategory: 'Category',
    transactionAmount: 'Amount',
    transactionNote: 'Note',
    fromDate: 'From Date',
    toDate: 'To Date',
    selectCategory: 'Select a category',
    selectType: 'Select a type',

    // Categories
    addCategory: 'Add Category',
    editCategory: 'Edit Category',
    deleteCategory: 'Delete Category',
    categoryName: 'Category Name',
    categoryType: 'Category Type',
    categoryAdded: 'Category added successfully',
    categoryUpdated: 'Category updated successfully',
    categoryDeleted: 'Category deleted',
    categoryManagement: 'Category Management',
    categoriesCount: 'categories',
    color: 'Color',
    icon: 'Icon',
    preview: 'Preview',

    // Settings
    language: 'Language',
    currency: 'Currency',
    dateFormat: 'Date Format',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    appSettings: 'Application Settings',
    customizeApp: 'Customize your application preferences',
    decimalPrecision: 'Decimal Precision',
    twoDecimals: '2 decimal places (e.g., 10.99)',
    noDecimals: 'No decimals (e.g., 11)',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    importData: 'Import Data',
    backupInfo: 'Backup Information',
    lastBackup: 'Last Backup',
    backupSize: 'Backup Size',
    accountSettings: 'Account Settings',
    emailAddress: 'Email Address',
    timeZone: 'Time Zone',
    saveChanges: 'Save Changes',
    resetToDefaults: 'Reset to Defaults',

    // Errors
    error: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      passwordMismatch: 'Passwords do not match',
      minLength: 'Minimum length: {{min}} characters',
      maxLength: 'Maximum length: {{max}} characters',
      invalidDate: 'Invalid date format',
      invalidAmount: 'Please enter a valid amount',
      invalidNumber: 'Please enter a valid number',
      invalidCategory: 'Please select a valid category',
      invalidType: 'Please select a valid type',
      invalidFile: 'Invalid file format',
      fileTooLarge: 'File is too large',
      uploadFailed: 'File upload failed',
      loadDashboard: 'Failed to load dashboard data',
      loadTransactions: 'Failed to load transactions',
      loadCategories: 'Failed to load categories',
      loadSettings: 'Failed to load settings',
      saveSettings: 'Failed to save settings',
      deleteCategory: 'Cannot delete category that is in use by transactions',
      pageInit: 'Failed to initialize the page',
      languageChange: 'Failed to change language',
      unknown: 'An unknown error occurred'
    },

    // Success messages
    success: {
      settingsSaved: 'Settings saved successfully',
      categoryAdded: 'Category added successfully',
      categoryUpdated: 'Category updated successfully',
      categoryDeleted: 'Category deleted successfully',
      transactionAdded: 'Transaction added successfully',
      transactionUpdated: 'Transaction updated successfully',
      transactionDeleted: 'Transaction deleted successfully'
    },

    // Confirmation dialogs
    confirm: {
      deleteTransaction: 'Are you sure you want to delete this transaction?',
      deleteCategory: 'Are you sure you want to delete this category?',
      resetSettings: 'Are you sure you want to reset all settings to default values?',
      importData: 'This will overwrite all existing data. Are you sure you want to continue?'
    },

    // Placeholders
    placeholder: {
      search: 'Search...',
      selectDate: 'Select a date',
      selectCategory: 'Select a category',
      selectType: 'Select a type',
      enterAmount: 'Enter amount',
      enterDescription: 'Enter description',
      enterNote: 'Add a note (optional)'
    }
  },

  ru: {
    appName: 'Учет расходов',
    // Navigation
    dashboard: 'Главная',
    transactions: 'Транзакции',
    categories: 'Категории',
    settings: 'Настройки',
    // Common
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    back: 'Назад',
    loading: 'Загрузка...',
    confirmDelete: 'Вы уверены, что хотите удалить этот элемент?',
    actions: 'Действия',
    close: 'Закрыть',
    yes: 'Да',
    no: 'Нет',
    all: 'Все',
    filter: 'Фильтр',
    reset: 'Сбросить',
    apply: 'Применить',
    search: 'Поиск',
    // Dashboard
    welcome: 'Добро пожаловать',
    balance: 'Баланс',
    income: 'Доход',
    expense: 'Расход',
    recentTransactions: 'Последние транзакции',
    noTransactions: 'Транзакций пока нет. Добавьте свою первую транзакцию!',
    viewAll: 'Просмотреть все',
    totalIncome: 'Общий доход',
    totalExpense: 'Общий расход',
    expenseByCategory: 'Расходы по категориям',
    incomeVsExpense: 'Доходы и расходы',
    thisMonth: 'Этот месяц',
    lastMonth: 'Прошлый месяц',
    thisYear: 'Этот год',
    custom: 'Выбрать период',
    // Transactions
    transaction: 'Транзакция',
    addTransaction: 'Добавить транзакцию',
    editTransaction: 'Редактировать транзакцию',
    deleteTransaction: 'Удалить транзакцию',
    transactionAdded: 'Транзакция успешно добавлена',
    transactionUpdated: 'Транзакция успешно обновлена',
    transactionDeleted: 'Транзакция удалена',
    amount: 'Сумма',
    date: 'Дата',
    description: 'Описание',
    category: 'Категория',
    type: 'Тип',
    note: 'Примечание',
    notes: 'Примечания',
    incomeType: 'Доход',
    expenseType: 'Расход',
    transactionHistory: 'История транзакций',
    transactionsFound: 'найдено транзакций',
    transactionsCount: 'транзакции',
    transactionDate: 'Дата',
    transactionType: 'Тип',
    transactionCategory: 'Категория',
    transactionAmount: 'Сумма',
    transactionNote: 'Примечание',
    fromDate: 'С даты',
    toDate: 'По дату',
    selectCategory: 'Выберите категорию',
    selectType: 'Выберите тип',
    // Categories
    addCategory: 'Добавить категорию',
    editCategory: 'Редактировать категорию',
    deleteCategory: 'Удалить категорию',
    categoryName: 'Название категории',
    categoryType: 'Тип категории',
    categoryAdded: 'Категория успешно добавлена',
    categoryUpdated: 'Категория успешно обновлена',
    categoryDeleted: 'Категория удалена',
    categoryManagement: 'Управление категориями',
    categoriesCount: 'категории',
    color: 'Цвет',
    icon: 'Иконка',
    preview: 'Предпросмотр',
    // Settings
    language: 'Язык',
    currency: 'Валюта',
    dateFormat: 'Формат даты',
    theme: 'Тема',
    light: 'Светлая',
    dark: 'Тёмная',
    system: 'Системная',
    appSettings: 'Настройки приложения',
    customizeApp: 'Настройте приложение',
    decimalPrecision: 'Точность отображения',
    twoDecimals: '2 знака после запятой (например, 10,99)',
    noDecimals: 'Без десятичных (например, 11)',
    dataManagement: 'Управление данными',
    exportData: 'Экспорт данных',
    importData: 'Импорт данных',
    backupInfo: 'Информация о резервных копиях',
    lastBackup: 'Последняя копия',
    backupSize: 'Размер копии',
    accountSettings: 'Настройки аккаунта',
    emailAddress: 'Эл. почта',
    timeZone: 'Часовой пояс',
    saveChanges: 'Сохранить изменения',
    resetToDefaults: 'Сбросить настройки',
    // Errors
    error: {
      required: 'Это поле обязательно',
      invalidEmail: 'Введите корректный e‑mail',
      passwordMismatch: 'Пароли не совпадают',
      minLength: 'Минимальная длина: {{min}} символов',
      maxLength: 'Максимальная длина: {{max}} символов',
      invalidDate: 'Неверный формат даты',
      invalidAmount: 'Введите корректную сумму',
      invalidNumber: 'Введите корректное число',
      invalidCategory: 'Выберите корректную категорию',
      invalidType: 'Выберите корректный тип',
      invalidFile: 'Неверный формат файла',
      fileTooLarge: 'Файл слишком большой',
      uploadFailed: 'Ошибка загрузки файла',
      loadDashboard: 'Ошибка загрузки данных панели',
      loadTransactions: 'Ошибка загрузки транзакций',
      loadCategories: 'Ошибка загрузки категорий',
      loadSettings: 'Ошибка загрузки настроек',
      saveSettings: 'Ошибка сохранения настроек',
      deleteCategory: 'Невозможно удалить категорию, используемую в транзакциях',
      pageInit: 'Ошибка инициализации страницы',
      languageChange: 'Не удалось изменить язык',
      unknown: 'Неизвестная ошибка'
    },
    success: {
      settingsSaved: 'Настройки сохранены',
      categoryAdded: 'Категория добавлена',
      categoryUpdated: 'Категория обновлена',
      categoryDeleted: 'Категория удалена',
      transactionAdded: 'Транзакция добавлена',
      transactionUpdated: 'Транзакция обновлена',
      transactionDeleted: 'Транзакция удалена'
    },
    confirm: {
      deleteTransaction: 'Удалить эту транзакцию?',
      deleteCategory: 'Удалить эту категорию?',
      resetSettings: 'Сбросить все настройки к значениям по умолчанию?',
      importData: 'Это перезапишет все данные. Продолжить?'
    },
    placeholder: {
      search: 'Поиск...',
      selectDate: 'Выберите дату',
      selectCategory: 'Выберите категорию',
      selectType: 'Выберите тип',
      enterAmount: 'Введите сумму',
      enterDescription: 'Введите описание',
      enterNote: 'Добавьте примечание (необязательно)'
    }
  },

  et: {
    appName: 'Kulude jälgija',
    dashboard: 'Töölaud',
    transactions: 'Tehingud',
    categories: 'Kategooriad',
    settings: 'Seaded',
    save: 'Salvesta',
    cancel: 'Tühista',
    delete: 'Kustuta',
    edit: 'Muuda',
    add: 'Lisa',
    back: 'Tagasi',
    loading: 'Laadin...',
    confirmDelete: 'Kas olete kindel, et soovite selle kustutada?',
    actions: 'Tegevused',
    close: 'Sulge',
    yes: 'Jah',
    no: 'Ei',
    all: 'Kõik',
    filter: 'Filter',
    reset: 'Lähtesta',
    apply: 'Rakenda',
    search: 'Otsi',
    welcome: 'Tere tulemast tagasi',
    balance: 'Saldo',
    income: 'Sissetulek',
    expense: 'Väljaminek',
    recentTransactions: 'Hiljutised tehingud',
    noTransactions: 'Tehinguid veel pole. Lisa esimene tehing!',
    viewAll: 'Vaata kõiki',
    totalIncome: 'Kogusissetulek',
    totalExpense: 'Koguväljaminek',
    expenseByCategory: 'Kulud kategooriate kaupa',
    incomeVsExpense: 'Sissetulek vs väljaminek',
    thisMonth: 'See kuu',
    lastMonth: 'Eelmine kuu',
    thisYear: 'See aasta',
    custom: 'Kohandatud',
    transaction: 'Tehing',
    addTransaction: 'Lisa tehing',
    editTransaction: 'Muuda tehingut',
    deleteTransaction: 'Kustuta tehing',
    transactionAdded: 'Tehing lisatud',
    transactionUpdated: 'Tehing uuendatud',
    transactionDeleted: 'Tehing kustutatud',
    amount: 'Summa',
    date: 'Kuupäev',
    description: 'Kirjeldus',
    category: 'Kategooria',
    type: 'Tüüp',
    note: 'Märkus',
    incomeType: 'Sissetulek',
    expenseType: 'Väljaminek',
    addFirstTransaction: 'Lisa oma esimene tehing',
    addCategory: 'Lisa kategooria',
    editCategory: 'Muuda kategooriat',
    deleteCategory: 'Kustuta kategooria',
    categoryName: 'Kategooria nimi',
    categoryType: 'Kategooria tüüp',
    categoryAdded: 'Kategooria lisatud',
    categoryUpdated: 'Kategooria uuendatud',
    categoryDeleted: 'Kategooria kustutatud',
    language: 'Keel',
    currency: 'Valuuta',
    dateFormat: 'Kuupäeva formaat',
    theme: 'Teema',
    light: 'Hele',
    dark: 'Tume',
    system: 'Süsteemi järgi',
    appSettings: 'Rakenduse seaded',
    customizeApp: 'Kohanda rakendust',
    decimalPrecision: 'Komakohtade arv',
    twoDecimals: '2 kohta peale koma (nt 10,99)',
    noDecimals: 'Täisarvud (nt 11)',
    dataManagement: 'Andmete haldamine',
    exportData: 'Ekspordi andmed',
    importData: 'Impordi andmed',
    backupInfo: 'Varukoopia info',
    lastBackup: 'Viimane varukoopia',
    backupSize: 'Varukoopia suurus',
    accountSettings: 'Konto seaded',
    emailAddress: 'E-post',
    timeZone: 'Ajavöönd',
    saveChanges: 'Salvesta muudatused',
    resetToDefaults: 'Lähtesta vaikeväärtustele',
    error: {
      required: 'See väli on kohustuslik',
      invalidEmail: 'Sisesta kehtiv e-post',
      minLength: 'Minimaalne pikkus: {{min}} tähemärki',
      maxLength: 'Maksimaalne pikkus: {{max}} tähemärki',
      invalidDate: 'Vale kuupäeva formaat',
      invalidAmount: 'Sisesta kehtiv summa',
      invalidNumber: 'Sisesta kehtiv number',
      invalidCategory: 'Vali kehtiv kategooria',
      invalidType: 'Vali kehtiv tüüp',
      loadTransactions: 'Tehingute laadimine ebaõnnestus',
      unknown: 'Tundmatu viga'
    },
    success: {
      settingsSaved: 'Seaded salvestatud',
      transactionAdded: 'Tehing lisatud'
    },
    confirm: {
      deleteTransaction: 'Kas kustutada see tehing?',
      deleteCategory: 'Kas kustutada see kategooria?'
    },
    placeholder: {
      search: 'Otsi...',
      selectDate: 'Vali kuupäev',
      selectCategory: 'Vali kategooria',
      selectType: 'Vali tüüp',
      enterAmount: 'Sisesta summa',
      enterDescription: 'Sisesta kirjeldus',
      enterNote: 'Lisa märkus (valikuline)'
    }
  }
};

// --- utilities for settings ---
function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
  catch { return {}; }
}
function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// API
function t(key, params={}) {
  const read = (lang, k) => k.split('.').reduce((o, p) => o && o[p], translations[lang]);
  let value = read(currentLanguage, key) ?? read(DEFAULT_LANGUAGE, key) ?? key;
  if (typeof value === 'string') {
    for (const [k, v] of Object.entries(params)) value = value.replaceAll(`{{${k}}}`, v);
  }
  return value;
}
function formatDate(date, opts={}) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return '';
  return new Intl.DateTimeFormat(currentLanguage, { year:'numeric', month:'short', day:'numeric', ...opts }).format(d);
}
function formatCurrency(amount, currency) {
  const s = getSettings();
  const curr = currency || s.currency || currentCurrency || 'USD';
  const decimals = s.decimalPlaces ?? 2;
  try {
    return new Intl.NumberFormat(currentLanguage, { style:'currency', currency: curr, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Number(amount)||0);
  } catch { return `${curr} ${(Number(amount)||0).toFixed(decimals)}`; }
}

const languageListeners = [];
function onLanguageChange(cb){ if (typeof cb==='function') languageListeners.push(cb); }
function notifyLanguage(lang){ languageListeners.forEach(cb=>{ try{cb(lang);}catch{}}); }

function isRTL(lang){ return ['ar','he','fa','ur'].includes(lang); }
function getSupportedLanguages(){ return SUPPORTED_LANGUAGES; }
function getCurrentLanguage(){ return currentLanguage; }

async function setLanguage(lang) {
  if (!translations[lang]) lang = DEFAULT_LANGUAGE;
  if (lang === currentLanguage) return;
  currentLanguage = lang;
  const s = getSettings(); s.language = lang;
  if (!s.currency) s.currency = SUPPORTED_LANGUAGES[lang]?.defaultCurrency || 'USD';
  saveSettings(s);
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
  updatePageTranslations();
  notifyLanguage(lang);
}

const currencyListeners = [];
function onCurrencyChange(cb){ if (typeof cb==='function') currencyListeners.push(cb); }
function notifyCurrencyChange(c){ currencyListeners.forEach(cb=>{ try{cb(c);}catch{}}); }
function getCurrentCurrency(){ const s=getSettings(); return s.currency || SUPPORTED_LANGUAGES[currentLanguage]?.defaultCurrency || 'USD'; }
function setCurrency(currency){
  const s=getSettings(); s.currency = currency; saveSettings(s);
  currentCurrency = currency;
  updatePageTranslations();
  notifyCurrencyChange(currency);
}

function updatePageTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n'); if (!key) return;
    if (key.startsWith('[')) {
      const m = key.match(/^\[([^\]]+)\](.+)$/); if (!m) return;
      el.setAttribute(m[1], t(m[2]));
    } else {
      if (el.tagName==='INPUT' || el.tagName==='TEXTAREA') {
        if (el.placeholder) el.placeholder = t(key);
      } else el.textContent = t(key);
    }
  });
}

async function initI18n(){
  const s = getSettings();
  let lang = s.language || navigator.language.split('-')[0];
  if (!translations[lang]) lang = DEFAULT_LANGUAGE;
  await setLanguage(lang);
  if (s.currency) setCurrency(s.currency);
  else setCurrency(SUPPORTED_LANGUAGES[lang]?.defaultCurrency || 'USD');
  updatePageTranslations();
  return lang;
}

// ---------------------------------------------------------------------------
// Currency helpers & simple FX storage (EUR / USD / RUB)
// Base currency for rates is EUR = 1. Numbers are stored in localStorage.
// ---------------------------------------------------------------------------

const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', RUB: '₽' };

/** Return a symbol for a given currency code (fallback to the code). */
function getCurrencySymbol(code) {
  const c = String(code || '').toUpperCase();
  return CURRENCY_SYMBOLS[c] || c || '';
}

/** Read FX rates (per 1 EUR) from localStorage. */
function getFxRates() {
  try {
    const raw = localStorage.getItem('expenseTrackerFx');
    const data = raw ? JSON.parse(raw) : null;
    // Reasonable defaults if nothing saved yet:
    return data || { EUR: 1, USD: 1.08, RUB: 95 };
  } catch {
    return { EUR: 1, USD: 1.08, RUB: 95 };
  }
}

/** Write FX rates (per 1 EUR) to localStorage with basic validation. */
function setFxRates(rates) {
  const current = getFxRates();
  const next = { ...current, ...rates };
  // sanitize: enforce positive finite numbers; EUR must be 1
  next.EUR = 1;
  ['USD', 'RUB'].forEach((k) => {
    const v = Number(next[k]);
    next[k] = Number.isFinite(v) && v > 0 ? v : current[k];
  });
  localStorage.setItem('expenseTrackerFx', JSON.stringify(next));
  return next;
}

/**
 * Convert amount from one currency to another using per-1 EUR quotes.
 * Example: if rates = {EUR:1, USD:1.08, RUB:95}
 *   convertCurrency(100, 'EUR', 'RUB') = 100 * 95
 *   convertCurrency(100, 'USD', 'EUR') = 100 / 1.08
 *   convertCurrency(100, 'USD', 'RUB') = 100 * (95 / 1.08)
 */
function convertCurrency(amount, from, to) {
  const a = Number(amount);
  if (!Number.isFinite(a)) return 0;

  const src = String(from || '').toUpperCase() || 'EUR';
  const dst = String(to || '').toUpperCase() || getCurrentCurrency();

  if (src === dst) return a;

  const r = getFxRates();
  const rf = Number(r[src] ?? 1); // how many src per 1 EUR? -> actually per-1 EUR rate of src
  const rt = Number(r[dst] ?? 1);

  // Convert src -> EUR -> dst
  const inEUR = a / rf;
  return inEUR * rt;
}

/**
 * Convenience helper: format a value that is stored in `fromCurrency`
 * into the current UI currency (or provided `displayCurrency`).
 */
function formatToDisplayCurrency(amount, fromCurrency, displayCurrency) {
  const target = displayCurrency || getCurrentCurrency();
  const converted = convertCurrency(amount, fromCurrency, target);
  return formatCurrency(converted, target);
}


export default {
  t,
  formatDate,
  formatCurrency,
  // language & currency
  setLanguage,
  getCurrentLanguage,
  getSupportedLanguages,
  onLanguageChange,
  onCurrencyChange,
  initI18n,
  isRTL,
  updatePageTranslations,
  setCurrency,
  getCurrentCurrency,
  // NEW: currency helpers + FX
  getCurrencySymbol,
  getFxRates,
  setFxRates,
  convertCurrency,
  formatToDisplayCurrency
};

// Also expose globally for convenience (useful in simple pages)
window.i18n = {
  t,
  formatDate,
  formatCurrency,
  setLanguage,
  getCurrentLanguage,
  getSupportedLanguages,
  onLanguageChange,
  onCurrencyChange,
  initI18n,
  isRTL,
  updatePageTranslations,
  setCurrency,
  getCurrentCurrency,
  // NEW: currency helpers + FX
  getCurrencySymbol,
  getFxRates,
  setFxRates,
  convertCurrency,
  formatToDisplayCurrency
};


// Also expose globally for convenience
window.i18n = { t, formatDate, formatCurrency, setLanguage, getCurrentLanguage, getSupportedLanguages, onLanguageChange, onCurrencyChange, initI18n, isRTL, updatePageTranslations, setCurrency, getCurrentCurrency };
