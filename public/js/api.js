
/**
 * api.js - Client for server REST endpoints with graceful fallback to read-only /data.json.
 */
const API_BASE = '/api';

async function jsonFetch(url, opts={}){
  const res = await fetch(url, { headers: { 'Content-Type':'application/json', ...(opts.headers||{}) }, credentials:'same-origin', ...opts });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return null;
  return res.json();
}

export class ApiService {
  constructor(){ this.base = API_BASE; }

  // --- Transactions ---
  async getTransactions(){
    try { return await jsonFetch(`${this.base}/transactions`); }
    catch {
      // fallback
      const data = await jsonFetch('/data.json');
      return data.transactions || [];
    }
  }
  async getTransaction(id){ return jsonFetch(`${this.base}/transactions/${id}`); }
  async addTransaction(tx){ return jsonFetch(`${this.base}/transactions`, { method:'POST', body: JSON.stringify(tx) }); }
  async updateTransaction(id, tx){ return jsonFetch(`${this.base}/transactions/${id}`, { method:'PUT', body: JSON.stringify(tx) }); }
  async deleteTransaction(id){ return jsonFetch(`${this.base}/transactions/${id}`, { method:'DELETE' }); }

  // --- Categories ---
  async getCategories(){
    try { return await jsonFetch(`${this.base}/categories`); }
    catch {
      const data = await jsonFetch('/data.json');
      return data.categories || [];
    }
  }
  async addCategory(cat){ return jsonFetch(`${this.base}/categories`, { method:'POST', body: JSON.stringify(cat) }); }
  async updateCategory(id, cat){ return jsonFetch(`${this.base}/categories/${id}`, { method:'PUT', body: JSON.stringify(cat) }); }
  async deleteCategory(id){ return jsonFetch(`${this.base}/categories/${id}`, { method:'DELETE' }); }

  // --- Settings ---
  async getSettings(){
    try { return await jsonFetch(`${this.base}/settings`); }
    catch {
      const data = await jsonFetch('/data.json');
      return data.settings || { currency: 'USD', language: 'en', decimalPlaces: 2 };
    }
  }
  async updateSettings(settings){ return jsonFetch(`${this.base}/settings`, { method:'PUT', body: JSON.stringify(settings) }); }

  // --- Export/Import ---
  async exportData(format='json'){
    const res = await fetch(`${this.base}/export?format=${encodeURIComponent(format)}`);
    if (!res.ok) throw new Error('Export failed');
    return await res.blob();
  }
  async importData(file){
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${this.base}/import`, { method:'POST', body:fd });
    if (!res.ok) throw new Error('Import failed');
    return await res.json();
  }
}

export const api = new ApiService();
window.api = api;
