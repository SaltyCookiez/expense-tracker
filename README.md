# Expense Tracker Pro

A **modern, front-end-only** expense tracking web app that looks and feels like a polished semester project.  
Built with **HTML5 + Bootstrap 5**, **modular JavaScript (ES Modules)**, **Chart.js**, and **LocalStorage** for data persistence.  

---

## ✨ Features

- **Transactions**:
  - Add, edit, delete income and expense entries
  - Per-transaction currency support
  - Notes, categories, and date selection

- **Dashboard**:
  - Summary cards (income, expenses, balance)
  - Charts:
    - Doughnut chart by category
    - Line chart for income vs expense over time
  - Shows converted amounts (multi-currency)

- **Advanced Filters**:
  - Filter by type, category, and date range
  - Real-time filtering without page reloads

- **Categories Management**:
  - Add and delete categories
  - Type-specific categories (Income/Expense)

- **Settings**:
  - Choose language: **English, Русский, Eesti** (+ "Coming Soon" placeholders)
  - Choose currency: **EUR, USD, RUB** with conversion between them
  - Decimal precision: realistic options (no decimals, 2 decimals)
  - Light/Dark/System themes with instant preview

- **Internationalization (i18n)**:
  - Full translations in EN, RU, ET
  - Dynamic language switching without page reload

- **Import & Export**:
  - Export filtered or all transactions to **Excel (.xlsx)** or JSON
  - Import data from JSON backups

- **LocalStorage Persistence**:
  - Fully client-side, works offline
  - Settings and data saved locally in the browser

---

## 📂 Project Structure

index.html # Dashboard
transactions.html # Transactions table + filters
categories.html # Category management
settings.html # App preferences
css/styles.css # Custom styling
js/app.js # Core app bootstrap
js/dashboard.js # Dashboard logic & charts
js/transactions.js # Transactions table & modal
js/categories.js # Category management
js/settings.js # Settings page
js/api.js # LocalStorage CRUD wrapper
js/i18n.js # Multi-language support


---

## 🚀 How to Run

1. Clone or download the repository.
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge).
3. No server or backend is required — it's **fully static**.

---

## 📸 Suggested Screenshots

- Dashboard with totals and charts
- Pie chart of expenses by category
- Line chart of income vs expenses
- Transactions table with filters
- Category management table
- Settings page with theme & currency selectors
- Export to Excel button demonstration
- Import JSON dialog

---

## 🧪 Testing Checklist

| Feature                 | Steps                                     | Expected Result                                 |
|-------------------------|------------------------------------------|------------------------------------------------|
| Add transaction         | Fill modal, click Save                   | Transaction appears, charts update             |
| Edit transaction        | Click Edit → modify → Save               | Row updated, charts recalc                     |
| Delete transaction      | Click Delete                             | Row removed, charts recalc                     |
| Filters                 | Set type/category/date                   | Table shows only matching entries              |
| Categories CRUD         | Add or delete category                   | Appears/Disappears instantly                   |
| Currency change         | Change to USD/EUR/RUB in settings        | All amounts update with conversion            |
| Language change         | Change to RU/EN/ET                       | UI text translated without reload              |
| Theme change            | Switch to Dark/Light/System              | Page theme updates instantly                   |
| Export Excel            | Click Export                             | Downloads `.xlsx` file                         |
| Import JSON             | Choose JSON file                         | Data restored                                  |

---

## 🔮 Future Improvements

- User accounts & server-side backend (Node.js/Express, ASP.NET, or other)
- Recurring transactions & budgeting
- Category colors on dashboard charts
- Progressive Web App (PWA) support for offline caching
- Accessibility & keyboard navigation improvements
- Mobile-optimized UI & swipe gestures

---

## 🛠 Tech Stack

| Tech                | Usage                                      |
|---------------------|-------------------------------------------|
| **HTML5 + Bootstrap 5** | Responsive layout, components           |
| **JavaScript ES Modules** | Modular, clean code organization  |
| **Chart.js**        | Interactive charts                        |
| **SheetJS (xlsx.js)** | Excel export support                   |
| **LocalStorage**    | Persistent client-side storage            |
| **i18n Framework**  | Live translations, multiple languages     |
