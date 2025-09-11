// public/js/transactions.js
// Full Transactions page logic:
// - Live filters + counters + summary
// - Add/Edit modal wiring (includes per-transaction currency + symbol)
// - Delete action
// - Export visible rows to Excel (.xlsx) with original+converted amounts
// Requires: SheetJS (XLSX) included in HTML before this module:
// <script src="https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js"></script>

import i18n from './i18n.js';
import { ApiService } from './api.js';

const api = new ApiService();

// Keeps the last rendered, filtered list for exporting
let _lastRenderedList = [];

/* -------------------------------------------------------------------------- */
/*                                   Utils                                    */
/* -------------------------------------------------------------------------- */

/** Debounce helper for live filtering */
function debounce(fn, wait = 120) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Clear all children of an element */
function _clear(el) {
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** Create <option> element */
function _option(value, text, { disabled = false, selected = false } = {}) {
  const o = document.createElement('option');
  o.value = value;
  o.textContent = text;
  if (disabled) o.disabled = true;
  if (selected) o.selected = selected;
  return o;
}

/** Filter categories by tx type */
function _byType(categories = [], type) {
  if (!type || type === 'all') return categories;
  const t = String(type).toLowerCase();
  return categories.filter((c) => String(c.type).toLowerCase() === t);
}

/** Safe currency conversion helper (falls back to identity if missing) */
function convert(amount, fromCur, toCur) {
  if (typeof i18n.convertCurrency === 'function') {
    return i18n.convertCurrency(amount, fromCur, toCur);
  }
  // fallback: no conversion support
  return amount;
}

/* -------------------------------------------------------------------------- */
/*                              Filters: Category                             */
/* -------------------------------------------------------------------------- */

/** Build the Filters “Category” <select> from scratch (no duplicates) */
function populateCategoryFilter(categories) {
  const select = document.getElementById('filterCategory');
  if (!select) return;

  const prev = select.value;
  select.innerHTML = '';

  // single “All” option (empty value === all)
  const optAll = document.createElement('option');
  optAll.value = '';
  optAll.setAttribute('data-i18n', 'allCategories');
  optAll.textContent = i18n.t('allCategories') || 'All Categories';
  select.appendChild(optAll);

  (categories || []).forEach((c) => {
    select.appendChild(_option(c.id ?? c.name, c.name));
  });

  const values = Array.from(select.options).map((o) => o.value);
  if (values.includes(prev)) select.value = prev;

  // keep the All label translated
  i18n.onLanguageChange(() => {
    const first = select.querySelector('option[value=""]');
    if (first) first.textContent = i18n.t('allCategories') || 'All Categories';
  });
}

/* -------------------------------------------------------------------------- */
/*                          Modal: Category <select>                          */
/* -------------------------------------------------------------------------- */

async function ensureCategoriesLoaded(state) {
  if (Array.isArray(state.categories) && state.categories.length) return state.categories;
  try {
    state.categories = await api.getCategories();
  } catch (e) {
    console.warn('Unable to load categories from API', e);
    state.categories = state.categories || [];
  }
  return state.categories;
}

/** Build the modal “Category” <select> based on current Type */
function populateCategorySelect(selectEl, categories, type) {
  if (!selectEl) return;

  const prev = selectEl.value;
  _clear(selectEl);

  // single placeholder
  selectEl.appendChild(
    _option('', i18n.t('selectCategory') || 'Select a category', {
      disabled: true,
      selected: true
    })
  );

  const list = _byType(categories, type);
  list.forEach((c) => {
    selectEl.appendChild(_option(c.id ?? c.name, c.name));
  });

  if (prev && [...selectEl.options].some((o) => o.value === prev)) {
    selectEl.value = prev;
  }

  // keep placeholder translated
  i18n.onLanguageChange(() => {
    const ph = selectEl.querySelector('option[value=""]');
    if (ph) ph.textContent = i18n.t('selectCategory') || 'Select a category';
  });
}

/* -------------------------------------------------------------------------- */
/*                           Add / Edit Transaction                           */
/* -------------------------------------------------------------------------- */

/**
 * Wire the Add/Edit Transaction modal:
 * - Add mode: empty form, placeholders (date=today, currency=UI currency)
 * - Edit mode: prefill by id, change title/button text, keep categories by type
 * - Submit: validate, persist (add or update), refresh list, close modal
 * Also: maintains a currency symbol in the amount input group.
 */
export async function initTransactionModal() {
  const app = (window.app ||= { state: {} });
  const state = app.state;

  const modalEl = document.getElementById('transactionModal');
  if (!modalEl) return;

  // form elements
  const titleEl = modalEl.querySelector('#transactionModalLabel');
  const formEl = modalEl.querySelector('#transactionForm');
  const typeEl = modalEl.querySelector('#type');
  const catEl = modalEl.querySelector('#category');
  const dateEl = modalEl.querySelector('#date');
  const amountEl = modalEl.querySelector('#amount');
  const descriptionEl = modalEl.querySelector('#description');
  const noteEl = modalEl.querySelector('#note');
  const submitBtn = modalEl.querySelector('button[type="submit"]');

  // NEW: currency selector + symbol span inside modal amount input group
  const txCurrencyEl = modalEl.querySelector('#txCurrency');      // <select id="txCurrency">
  const amountSymbolEl = modalEl.querySelector('#amountSymbol');  // <span id="amountSymbol">

  // edit state
  let editingId = null;

  await ensureCategoriesLoaded(state);

  // Keep amount symbol in sync with selected tx currency
  function updateAmountSymbol() {
    if (!amountSymbolEl) return;
    const cur = txCurrencyEl?.value || i18n.getCurrentCurrency();
    const sym = (typeof i18n.getCurrencySymbol === 'function')
      ? i18n.getCurrencySymbol(cur)
      : cur; // fallback: show code if symbol helper not present
    amountSymbolEl.textContent = sym;
  }

  // OPEN in Add mode
  function openAdd() {
    editingId = null;
    titleEl.textContent = i18n.t('addTransaction') || 'Add Transaction';
    submitBtn.textContent = i18n.t('save') || 'Save';
    formEl.reset();
    // defaults
    if (typeEl) typeEl.value = 'expense';
    if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);
    // default tx currency = current UI currency
    if (txCurrencyEl) txCurrencyEl.value = i18n.getCurrentCurrency();
    updateAmountSymbol();
    populateCategorySelect(catEl, state.categories, typeEl.value);
  }

  // OPEN in Edit mode by id
  function openEdit(id) {
    const tx = (state.transactions || []).find((t) => String(t.id) === String(id));
    if (!tx) return;

    editingId = tx.id;
    titleEl.textContent = i18n.t('editTransaction') || 'Edit Transaction';
    submitBtn.textContent = i18n.t('saveChanges') || i18n.t('save') || 'Save';

    // prefill fields
    if (typeEl) typeEl.value = tx.type || 'expense';
    populateCategorySelect(catEl, state.categories, typeEl.value);
    if (catEl) catEl.value = tx.category || '';
    if (dateEl) dateEl.value = (tx.date || '').slice(0, 10);
    if (amountEl) amountEl.value = Math.abs(Number(tx.amount) || 0);
    if (descriptionEl) descriptionEl.value = tx.description || '';
    if (noteEl) noteEl.value = tx.note || '';
    if (txCurrencyEl) txCurrencyEl.value = tx.currency || i18n.getCurrentCurrency();
    updateAmountSymbol();

    // show modal
    if (window.bootstrap) {
      const instance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
      instance.show();
    }
  }

  // keep categories synced when switching type inside modal
  if (typeEl) {
    typeEl.addEventListener('change', () => {
      populateCategorySelect(catEl, state.categories, typeEl.value);
    });
  }

  // keep symbol synced with currency select
  if (txCurrencyEl) {
    txCurrencyEl.addEventListener('change', updateAmountSymbol);
  }

  // When opened without edit -> Add mode defaults
  modalEl.addEventListener('show.bs.modal', () => {
    if (!editingId) openAdd();
  });

  // SUBMIT handler (add or update)
  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();

      // validation
      const amount = parseFloat(amountEl?.value ?? '');
      if (!typeEl?.value) return alert(i18n.t('error.invalidType') || 'Please select a type');
      if (!catEl?.value) return alert(i18n.t('error.invalidCategory') || 'Please select a category');
      if (!dateEl?.value) return alert(i18n.t('error.invalidDate') || 'Please choose a date');
      if (Number.isNaN(amount) || amount <= 0) {
        return alert(i18n.t('error.invalidAmount') || 'Please enter a valid amount');
      }

      const payload = {
        type: typeEl.value,                                // 'income' | 'expense'
        amount,                                            // positive number (original in tx currency)
        currency: txCurrencyEl?.value || i18n.getCurrentCurrency(), // NEW field
        category: catEl.value,                             // id or name
        date: dateEl.value,                                // 'YYYY-MM-DD'
        description: (descriptionEl?.value || '').trim(),
        note: (noteEl?.value || '').trim()
      };

      try {
        let saved;
        if (editingId) {
          // UPDATE preferred path
          if (typeof api.updateTransaction === 'function') {
            saved = await api.updateTransaction(editingId, payload);
          } else {
            // Fallback if API lacks update endpoint
            saved = await api.addTransaction({ id: editingId, ...payload });
          }

          // replace in state
          state.transactions = (state.transactions || []).map((t) =>
            String(t.id) === String(editingId) ? { ...t, ...payload, ...(saved || {}) } : t
          );
        } else {
          // ADD
          saved = await api.addTransaction(payload);
          const newItem = saved || payload;
          if (!newItem.id) {
            newItem.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
          }
          state.transactions = [...(state.transactions || []), newItem];
        }

        // refresh table/summary
        if (window.__tx?.render) window.__tx.render();
        document.dispatchEvent(new CustomEvent('transactions:refresh'));

        // close modal + reset
        formEl.reset();
        editingId = null;
        if (window.bootstrap) {
          const instance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
          instance.hide();
        }
      } catch (err) {
        console.error('Save transaction failed:', err);
        alert(i18n.t('error.loadTransactions') || 'Failed to save transaction');
      }
    });
  }

  // expose control to open Edit from table
  window.__tx = Object.assign(window.__tx || {}, { openEdit });
}

/* -------------------------------------------------------------------------- */
/*                              Export to Excel                               */
/* -------------------------------------------------------------------------- */

/**
 * Export transactions to an Excel (.xlsx) file.
 * scope='filtered' -> export currently visible rows (default)
 * scope='all'      -> export all transactions in state
 * Includes original Amount+Currency and converted AmountInUI+UI_Currency.
 */
export async function exportTransactionsToExcel({ scope = 'filtered' } = {}) {
  const list =
    scope === 'all'
      ? (window.__tx?.state?.transactions || [])
      : (_lastRenderedList || []);

  if (!list || list.length === 0) {
    alert(i18n.t('noResults') || 'No transactions to export');
    return;
  }

  if (typeof XLSX === 'undefined') {
    alert('XLSX library is not loaded. Make sure xlsx.full.min.js is included.');
    return;
  }

  try {
    const uiCur = i18n.getCurrentCurrency();
    const rows = list.map((tx) => {
      const amt = Number(tx.amount) || 0;
      const from = tx.currency || uiCur;
      const conv = convert(Math.abs(amt), from, uiCur) * (amt < 0 ? -1 : 1);
      return {
        Date: tx.date,
        Type: tx.type,
        Category: tx.category,
        Amount: amt,                 // original value (signed)
        Currency: from,              // original currency
        AmountInUI: conv,            // converted into UI currency (signed)
        UI_Currency: uiCur,
        Description: tx.description || '',
        Note: tx.note || '',
        ID: tx.id || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 16 }, // Category
      { wch: 12 }, // Amount
      { wch: 10 }, // Currency
      { wch: 14 }, // AmountInUI
      { wch: 12 }, // UI_Currency
      { wch: 28 }, // Description
      { wch: 28 }, // Note
      { wch: 26 }  // ID
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    const filename = `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);

    alert(i18n.t('dataExported') || 'Data exported successfully');
  } catch (err) {
    console.error('Export failed:', err);
    alert(i18n.t('error.exportFailed') || 'Failed to export data');
  }
}

/* -------------------------------------------------------------------------- */
/*                           Page (table) initialization                      */
/* -------------------------------------------------------------------------- */

/**
 * Bootstraps the Transactions page:
 * - ensure state is loaded
 * - build filters
 * - render table/counters/summary (in UI currency, with original shown)
 * - expose render() for modal
 * - wire Export button
 */
export async function initializeTransactions() {
  const app = (window.app ||= {});
  const state = (app.state ||= { transactions: [], categories: [] });

  // preload if needed
  if (!state.transactions?.length) {
    try { state.transactions = await api.getTransactions(); }
    catch (e) { console.warn('Failed to load transactions via API, using current state.', e); }
  }
  if (!state.categories?.length) {
    try { state.categories = await api.getCategories(); }
    catch (e) { console.warn('Failed to load categories via API, using current state.', e); }
  }

  // DOM references
  const $tbody = document.querySelector('#transactionsTable tbody');
  const $countInline = document.getElementById('txCount');                  // “0 transactions found”
  const $countFooterNumber = document.getElementById('transactionsNumber'); // footer counter

  const $totalIncome = document.getElementById('totalIncome');
  const $totalExpense = document.getElementById('totalExpense');
  const $balance = document.getElementById('balance');

  const $fType = document.getElementById('filterType');
  const $fCat  = document.getElementById('filterCategory');
  const $fFrom = document.getElementById('filterFrom');
  const $fTo   = document.getElementById('filterTo');
  const $search = document.getElementById('filterSearch') || document.getElementById('search');

  // Build category filter once (no duplicates)
  populateCategoryFilter(state.categories);

  // helpers
  const getUiCurrency = () => (i18n.getCurrentCurrency ? i18n.getCurrentCurrency() : 'USD');

  function getFilters() {
    const type = ($fType?.value || '').trim();     // '' | 'income' | 'expense'
    const category = ($fCat?.value || '').trim();  // '' | categoryId/name
    const from = $fFrom?.value ? new Date($fFrom.value) : null;
    const to   = $fTo?.value   ? new Date($fTo.value)   : null;
    const q = ($search?.value || '').trim().toLowerCase();
    return { type, category, from, to, q };
  }

  function matchesFilters(tx, f) {
    if (f.type && tx.type !== f.type) return false;

    if (f.category) {
      const wanted = String(f.category).toLowerCase();
      const txCatStr = String(tx.category ?? '').toLowerCase();
      if (txCatStr !== wanted) {
        const catObj = (state.categories || []).find(
          (c) => c.id === tx.category || c.name === tx.category
        );
        const resolved = String(catObj?.id ?? catObj?.name ?? '').toLowerCase();
        if (resolved !== wanted) return false;
      }
    }

    const txDate = new Date(tx.date);
    if (f.from && txDate < f.from) return false;
    if (f.to) {
      const toInc = new Date(f.to.getFullYear(), f.to.getMonth(), f.to.getDate(), 23, 59, 59, 999);
      if (txDate > toInc) return false;
    }

    if (f.q) {
      const blob = `${tx.description || ''} ${tx.note || ''} ${tx.category || ''}`.toLowerCase();
      if (!blob.includes(f.q)) return false;
    }

    return true;
  }

  // Summaries in current UI currency
  function summarize(list) {
    const uiCur = getUiCurrency();
    let income = 0, expense = 0;
    list.forEach((tx) => {
      const raw = Math.abs(Number(tx.amount) || 0);
      const from = tx.currency || uiCur;
      const val = convert(raw, from, uiCur);
      if (tx.type === 'income') income += val; else expense += val;
    });
    return { income, expense, balance: income - expense };
  }

  function render() {
    const filters = getFilters();

    // filter + newest first
    const list = (state.transactions || [])
      .filter((tx) => matchesFilters(tx, filters))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // store for export
    _lastRenderedList = list;

    // table
    if ($tbody) {
      const uiCur = getUiCurrency();
      const rowsHtml = list.map((tx) => {
        const abs = Math.abs(Number(tx.amount) || 0);
        const from = tx.currency || uiCur;
        const convAbs = convert(abs, from, uiCur);
        const isExpense = tx.type === 'expense';
        const sign = isExpense ? '-' : '+';
        const cls  = isExpense ? 'text-danger' : 'text-success';

        const showConversion = from !== uiCur;
        const originalStr  = i18n.formatCurrency(abs, from);
        const convertedStr = i18n.formatCurrency(convAbs, uiCur);

        // Optional FX note: "1 EUR = 1.0800 USD"
        let fxNote = '';
        if (showConversion && typeof i18n.getFxRates === 'function') {
          const rates = i18n.getFxRates(); // { EUR:1, USD:..., RUB:... }
          const rate = ((rates[uiCur] || 1) / (rates[from] || 1));
          if (isFinite(rate)) fxNote = `1 ${from} = ${rate.toFixed(4)} ${uiCur}`;
        }

        return `
          <tr>
            <td>${i18n.formatDate(tx.date)}</td>
            <td class="text-capitalize">${tx.type}</td>
            <td>${tx.category || ''}</td>
            <td class="text-end ${cls}">
              ${sign}${showConversion ? convertedStr : i18n.formatCurrency(abs, uiCur)}
              ${showConversion ? `
                <div class="small text-muted">
                  (${originalStr} → ${convertedStr}${fxNote ? `, ${fxNote}` : ''})
                </div>` : ''
              }
            </td>
            <td>${tx.note || ''}</td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" data-action="edit" data-id="${tx.id}">${i18n.t('edit') || 'Edit'}</button>
                <button class="btn btn-outline-danger"    data-action="del"  data-id="${tx.id}">${i18n.t('delete') || 'Delete'}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      $tbody.innerHTML = rowsHtml || `
        <tr><td colspan="6" class="text-center text-muted">
          ${i18n.t('noResults') || 'No results found'}
        </td></tr>`;
    }

    // counts (use the same filtered list)
    const filteredCount = _lastRenderedList.length;
    if ($countInline) {
      $countInline.textContent = `${filteredCount} ${i18n.t('transactionsFound') || 'transactions found'}`;
    }
    if ($countFooterNumber) {
      $countFooterNumber.textContent = String(filteredCount);
    }

    // summary cards (based on filtered list, in UI currency)
    const sums = summarize(_lastRenderedList);
    const uiCur = getUiCurrency();
    if ($totalIncome)  $totalIncome.textContent  = i18n.formatCurrency(sums.income,  uiCur);
    if ($totalExpense) $totalExpense.textContent = i18n.formatCurrency(sums.expense, uiCur);
    if ($balance)      $balance.textContent      = i18n.formatCurrency(sums.balance, uiCur);
  }

  // live filters
  const rerender = debounce(render, 120);
  [$fType, $fCat, $fFrom, $fTo, $search].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', rerender);
    el.addEventListener('change', rerender);
  });

  // table actions: Edit / Delete
  if ($tbody) {
    $tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');

      if (action === 'edit') {
        if (window.__tx?.openEdit) window.__tx.openEdit(id);
        return;
      }

      if (action === 'del') {
        if (!confirm(i18n.t('confirm.deleteTransaction') || 'Delete this transaction?')) return;
        try {
          await api.deleteTransaction(id);
          state.transactions = (state.transactions || []).filter((t) => String(t.id) !== String(id));
          render();
        } catch (err) {
          console.error(err);
          alert(i18n.t('error.deleteTransaction') || 'Failed to delete transaction');
        }
      }
    });
  }

  // i18n: on language or currency changes — rerender (labels & amounts)
  i18n.onLanguageChange(() => {
    const first = document.querySelector('#filterCategory option[value=""]');
    if (first) first.textContent = i18n.t('allCategories') || 'All Categories';
    render();
  });
  if (typeof i18n.onCurrencyChange === 'function') {
    i18n.onCurrencyChange(() => render());
  }

  // initial paint
  render();

  // expose for modal/use elsewhere
  window.__tx = Object.assign(window.__tx || {}, {
    render,
    state,
    getCurrentList: () => [..._lastRenderedList]
  });

  // Export button wiring (exports the visible/filtered rows)
  const $exportBtn = document.getElementById('exportBtn');
  if ($exportBtn) {
    $exportBtn.addEventListener('click', () => {
      exportTransactionsToExcel({ scope: 'filtered' });
    });
  }

  // Also listen to a generic refresh event (fallback path)
  document.addEventListener('transactions:refresh', render);
}
