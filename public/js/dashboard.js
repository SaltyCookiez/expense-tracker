// public/js/dashboard.js
// Renders dashboard cards, recent transactions and charts.
// Works with window.app.state that initApp() fills.
// Requires Chart.js on the page.

import i18n from './i18n.js';

function convert(amount, fromCur, toCur) {
  if (typeof i18n.convertCurrency === 'function') {
    return i18n.convertCurrency(amount, fromCur, toCur);
  }
  // no FX configured -> identity
  return amount;
}

function getUICurrency() {
  return (typeof i18n.getCurrentCurrency === 'function')
    ? i18n.getCurrentCurrency()
    : 'USD';
}

/* ------------------------------ Summary cards ----------------------------- */
function computeSummaryInUI(transactions) {
  const ui = getUICurrency();
  let income = 0, expense = 0;

  (transactions || []).forEach(tx => {
    const raw = Number(tx.amount) || 0;              // signed
    const from = tx.currency || ui;
    const valAbs = convert(Math.abs(raw), from, ui); // converted abs
    if (tx.type === 'income') income += valAbs;
    else expense += valAbs;
  });

  return { income, expense, balance: income - expense, currency: ui };
}

function renderSummaryCards(state) {
  const { income, expense, balance, currency } = computeSummaryInUI(state.transactions);
  const $ti = document.getElementById('totalIncome');
  const $te = document.getElementById('totalExpense');
  const $b  = document.getElementById('balance');

  if ($ti) $ti.textContent = i18n.formatCurrency(income, currency);
  if ($te) $te.textContent = i18n.formatCurrency(expense, currency);
  if ($b)  {
    $b.textContent = i18n.formatCurrency(balance, currency);
    $b.classList.toggle('text-danger', balance < 0);
    $b.classList.toggle('text-success', balance >= 0);
  }
}

/* --------------------------- Recent transactions -------------------------- */
function renderRecent(state, limit = 5) {
  const tbody = document.getElementById('recentTransactionsList');
  if (!tbody) return;

  const ui = getUICurrency();

  const rows = [...(state.transactions || [])]
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
    .map(tx => {
      const abs = Math.abs(Number(tx.amount) || 0);
      const from = tx.currency || ui;
      const conv = convert(abs, from, ui);
      const sign = tx.type === 'expense' ? '-' : '+';
      const cls  = tx.type === 'expense' ? 'text-danger' : 'text-success';

      const showFx = from !== ui;
      const origStr = i18n.formatCurrency(abs, from);
      const convStr = i18n.formatCurrency(conv, ui);

      let fxNote = '';
      if (showFx && typeof i18n.getFxRates === 'function') {
        const rates = i18n.getFxRates();
        const rate = ((rates[ui] || 1) / (rates[from] || 1));
        if (isFinite(rate)) fxNote = `, 1 ${from} = ${rate.toFixed(4)} ${ui}`;
      }

      return `
        <tr>
          <td>${i18n.formatDate(tx.date)}</td>
          <td>${tx.description || ''}</td>
          <td>${tx.category || ''}</td>
          <td class="text-end ${cls}">
            ${sign}${convStr}
            ${showFx ? `<div class="small text-muted">(${origStr} → ${convStr}${fxNote})</div>` : ''}
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.innerHTML = rows || `
    <tr><td colspan="4" class="text-center text-muted">
      ${i18n.t('noTransactions') || 'No transactions yet. Add your first transaction to get started!'}
    </td></tr>`;
}

/* --------------------------------- Charts -------------------------------- */
function groupExpenseByCategoryInUI(state) {
  const ui = getUICurrency();
  const map = new Map();
  (state.transactions || [])
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const abs = Math.abs(Number(t.amount) || 0);
      const from = t.currency || ui;
      const val = convert(abs, from, ui);
      const key = t.category || 'Other';
      map.set(key, (map.get(key) || 0) + val);
    });
  return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
}

function seriesByDateInUI(state) {
  const ui = getUICurrency();
  const by = {};
  (state.transactions || []).forEach(t => {
    const d = new Date(t.date);
    if (Number.isNaN(+d)) return;
    const key = d.toISOString().slice(0,10);
    if (!by[key]) by[key] = { income: 0, expense: 0 };
    const abs = Math.abs(Number(t.amount) || 0);
    const from = t.currency || ui;
    const val = convert(abs, from, ui);
    if (t.type === 'income') by[key].income += val;
    else by[key].expense += val;
  });
  const labels = Object.keys(by).sort();
  return { 
    labels: labels.map(k => new Date(k)),
    income: labels.map(k => by[k].income),
    expense: labels.map(k => by[k].expense)
  };
}

function renderCharts(state) {
  if (!window.Chart) return;

  // Doughnut: expenses by category
  const catCanvas = document.getElementById('expenseByCategoryChart');
  if (catCanvas) {
    const data = groupExpenseByCategoryInUI(state);
    const labels = data.map(x => x.category);
    const values = data.map(x => x.amount);
    if (window._catChart) window._catChart.destroy();
    window._catChart = new Chart(catCanvas.getContext('2d'), {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  // Line: income vs expense
  const lineCanvas = document.getElementById('incomeExpenseChart');
  if (lineCanvas) {
    const s = seriesByDateInUI(state);
    const lang = (typeof i18n.getCurrentLanguage === 'function') ? i18n.getCurrentLanguage() : 'en';
    const labels = s.labels.map(d => new Intl.DateTimeFormat(lang, { month:'short', day:'numeric' }).format(d));
    if (window._lineChart) window._lineChart.destroy();
    window._lineChart = new Chart(lineCanvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: i18n.t('income') || 'Income',  data: s.income,  fill: true },
          { label: i18n.t('expense') || 'Expense', data: s.expense, fill: true }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
  }
}

/* ------------------------------- Entrypoint ------------------------------- */
function renderAll() {
  const state = window.app?.state || { transactions: [], categories: [] };
  renderSummaryCards(state);
  renderRecent(state, 5);
  renderCharts(state);
}

export async function initDashboard() {
  // Wait for initApp to populate state
  if (!window.app?.state?.transactions) {
    await new Promise(res => document.addEventListener('app:ready', res, { once: true }));
  }
  renderAll();

  // Re-render on language / currency change
  if (typeof i18n.onCurrencyChange === 'function') {
    i18n.onCurrencyChange(() => renderAll());
  }
  i18n.onLanguageChange(() => renderAll());

  // Re-render when transactions change (e.g., after add/edit)
  document.addEventListener('transactions:refresh', renderAll);
}
