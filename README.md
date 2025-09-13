Expense Tracker Pro

README was styled using ChatGPT for a more user freindly look.

A modern full-stack expense tracking web app with a client-server architecture, built to demonstrate both front-end UI/UX and back-end API integration.
Backend powered by Node.js + Express, frontend built with HTML5, Bootstrap 5, Chart.js, and ES Modules.

✨ Features

Transactions:

Add, edit, delete income and expense entries

Per-transaction currency support

Notes, categories, and date selection

Persistent storage via server API

Dashboard:

Summary cards (income, expenses, balance)

Charts:

Doughnut chart by category

Line chart for income vs expense over time

Shows converted amounts (multi-currency)

Advanced Filters:

Filter by type, category, and date range

Real-time filtering without page reloads

Categories Management:

Add and delete categories

Type-specific categories (Income/Expense)

Settings:

Choose language: English, Русский, Eesti

Choose currency: EUR, USD, RUB with conversion

Light/Dark/System themes with instant preview

Import & Export:

Export filtered or all transactions to Excel (.xlsx) or JSON

Import data from JSON backups

Server-side Persistence:

All transactions and settings stored on a Node.js backend with a REST API

Local caching for faster load times

📂 Project Structure
/server.js          # Express.js backend
/routes/api.js      # REST API endpoints
/data/transactions.json # Server-side JSON database

/public/index.html  # Dashboard
/public/js/...      # Frontend modules
/public/css/...     # Custom styling

🚀 How to Run

Clone or download the repository.

Install dependencies:

npm install


Start the backend server:

npm start


Open http://localhost:3000
 in your browser.

📸 Suggested Screenshots

Dashboard with totals and charts

Pie chart of expenses by category

Line chart of income vs expenses

Transactions table with filters

API response example in browser DevTools

🧪 Testing Checklist
Feature	Steps	Expected Result
Add transaction	Fill modal, click Save	Transaction appears, charts update
Edit transaction	Click Edit → modify → Save	Row updated, charts recalc
Delete transaction	Click Delete	Row removed, charts recalc
API request check	Open DevTools → Network tab	CRUD requests sent to backend API
Filters	Set type/category/date	Table shows only matching entries
Categories CRUD	Add or delete category	Appears/Disappears instantly
🔮 Future Improvements

Migration from JSON storage to SQL/NoSQL database

Recurring transactions & budgeting

Progressive Web App (PWA) support

Accessibility & mobile optimization

🛠 Tech Stack
Tech	Usage
Node.js + Express	Backend API, routing
HTML5 + Bootstrap 5	Responsive frontend layout
JavaScript ES Modules	Modular, clean code organization
Chart.js	Interactive charts
SheetJS (xlsx.js)	Excel export support
REST API	CRUD operations for transactions
