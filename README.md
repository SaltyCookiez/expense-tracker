# Expense Tracker Pro

A feature-rich, front-end only expense tracking web app designed to look and feel like a semester-long project.
It uses **HTML + Bootstrap**, **modular JavaScript (ES modules)**, **Chart.js**, and **LocalStorage**.

## Features
- Transactions: income & expenses with date, category, note
- Dashboard summary cards (income, expense, balance)
- Charts: Pie (by category) + Line (monthly balance)
- Filters: type, category, date range
- Categories CRUD
- Settings: currency & decimal precision
- Localization scaffold (EN/RU/ET)
- Import/Export JSON
- Demo data seeding
- LocalStorage persistence (no backend)

## Structure
```
index.html
css/styles.css
js/app.js         # main controller
js/storage.js     # localStorage wrapper (with versioned keys)
js/utils.js       # helpers (formatting, filters, download)
js/charts.js      # Chart.js renderers
js/i18n.js        # simple localization (EN/RU/ET)
js/seed.js        # generate demo data
assets/           # (put screenshots for your report here)
```

## How to run
Just open `index.html` in a modern browser. No server is required.

## Suggested screenshots for your report
- Dashboard with totals
- Pie chart by category
- Line chart by month
- Transactions table with filters
- Categories management
- Settings page
- Import/Export dialog (choose file/open file picker)

## Testing checklist (sample)
| Test | Steps | Expected |
|------|-------|----------|
| Add expense | Fill form, click Add | Row appears in table, chart updates |
| Edit expense | Click pencil → form prefilled → submit | Row updated |
| Delete expense | Click trash | Row removed, charts recalc |
| Filters | Set type/category/date, Apply | Table shows filtered rows |
| Seed demo | Click "Seed Demo Data" | Data added, dashboard/charts change |
| Clear all | Click "Clear All" | All transactions removed |
| Export | Click Export | Downloads JSON file |
| Import | Click Import, pick JSON | Data/settings/categories restored |
| Settings | Change currency/precision, Save | Amounts re-render with new format |
| Locale | Change EN/RU/ET | Texts translated |

## Future work (for your conclusion chapter)
- User accounts & backend (Node/ASP.NET + DB)
- Recurring payments & budgets
- CSV/Excel export
- Mobile PWA + offline caching
- Accessibility audit & keyboard shortcuts
