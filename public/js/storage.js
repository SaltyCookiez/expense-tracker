// storage.js - localStorage wrapper with namespacing and versioning
const STORE_KEY = "etp:data:v1";
const SETTINGS_KEY = "etp:settings:v1";
const CAT_KEY = "etp:categories:v1";

const defaultCategories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Shopping", "Other"];
const defaultSettings = { currency: "EUR", precision: 2, locale: "en" };

// Storage object with all methods
export const Storage = {
    // Transaction methods
    loadData() {
        try {
            const data = localStorage.getItem(STORE_KEY);
            if (!data) return [];
            return JSON.parse(data) || [];
        } catch (e) {
            console.error("Failed to load transaction data:", e);
            return [];
        }
    },

    saveData(transactions) {
        try {
            if (!Array.isArray(transactions)) {
                throw new Error("Transactions must be an array");
            }
            localStorage.setItem(STORE_KEY, JSON.stringify(transactions));
        } catch (e) {
            console.error("Failed to save transaction data:", e);
            throw e;
        }
    },

    clearData() {
        try {
            localStorage.removeItem(STORE_KEY);
        } catch (e) {
            console.error("Failed to clear transaction data:", e);
        }
    },

    // Settings methods
    loadSettings() {
        try {
            const settings = localStorage.getItem(SETTINGS_KEY);
            if (!settings) return { ...defaultSettings };
            return { ...defaultSettings, ...JSON.parse(settings) };
        } catch (e) {
            console.error("Failed to load settings:", e);
            return { ...defaultSettings };
        }
    },

    saveSettings(settings) {
        try {
            if (typeof settings !== 'object') {
                throw new Error("Settings must be an object");
            }
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save settings:", e);
            throw e;
        }
    },

    // Categories methods
    loadCategories() {
        try {
            const categories = localStorage.getItem(CAT_KEY);
            if (!categories) return [...defaultCategories];
            return JSON.parse(categories);
        } catch (e) {
            console.error("Failed to load categories:", e);
            return [...defaultCategories];
        }
    },

    saveCategories(categories) {
        try {
            if (!Array.isArray(categories)) {
                throw new Error("Categories must be an array");
            }
            localStorage.setItem(CAT_KEY, JSON.stringify(categories));
        } catch (e) {
            console.error("Failed to save categories:", e);
            throw e;
        }
    },

    // Import/Export
    exportAll() {
        try {
            return JSON.stringify({
                version: '1.0',
                data: this.loadData(),
                settings: this.loadSettings(),
                categories: this.loadCategories()
            });
        } catch (e) {
            console.error("Failed to export data:", e);
            throw e;
        }
    },

    importAll(json) {
        try {
            const data = JSON.parse(json);
            
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid import data format");
            }
            
            if (data.data) this.saveData(data.data);
            if (data.settings) this.saveSettings(data.settings);
            if (data.categories) this.saveCategories(data.categories);
            
            return true;
        } catch (e) {
            console.error("Failed to import data:", e);
            throw e;
        }
    }
};

// For backward compatibility
window.Storage = Storage;
