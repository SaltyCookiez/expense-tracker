Expense Tracker Pro

README layout was refined with ChatGPT for CLARITY and readability.

A modern full-stack expense tracking web app with a clear client–server architecture.
Backend: Node.js + Express + MySQL (mysql2)
Frontend: HTML5, Bootstrap 5, Chart.js, ES Modules

✨ Features

Transactions
Add, edit, delete income and expense entries
Per-transaction currency (stored in DB)
Notes, categories, date selection
Server-side persistence via REST API
Dashboard
Summary cards (income, expenses, balance)

Charts:
Doughnut chart by category
Line chart for income vs. expense over time
Multi-currency display (transaction currency → UI currency)
Advanced Filters
Filter by type, category, date range
Real-time filtering without page reload

Categories:
Create, update, delete categories
Income/Expense types, color support
Safe deletion (prevents deleting categories in use)
Settings
Languages: English, Русский, Eesti
UI currency: EUR, USD, RUB
Decimal precision and theme (Light/Dark/System)
Import & Export
Export all data to JSON
Import JSON backup into MySQL within a transaction

📂 Project Structure
server.js            # Express server with REST API (MySQL)
db.js                # MySQL pool (mysql2)

/public/
  index.html         # Dashboard
  transactions.html
  categories.html
  settings.html
  css/styles.css
  js/app.js
  js/dashboard.js
  js/transactions.js
  js/categories.js
  js/settings.js
  js/i18n.js
  js/nav.js

🧰 Prerequisites

Node.js 18+ (ESM enabled)

MySQL 8.x running locally (default example uses port 3307)

⚙️ Environment

Create a .env file in the project root:

PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=app
DB_PASS=app
DB_NAME=appdb

🗄️ Database Schema (MySQL)

Run this SQL once to prepare the database:

CREATE TABLE IF NOT EXISTS categories (
  id        VARCHAR(191) PRIMARY KEY,
  name      VARCHAR(191) NOT NULL,
  type      ENUM('income','expense') NOT NULL,
  color     VARCHAR(32) DEFAULT '#6c757d',
  updatedAt DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transactions (
  id          VARCHAR(191) PRIMARY KEY,
  type        ENUM('income','expense') NOT NULL,
  amount      DECIMAL(18,2) NOT NULL,
  currency    VARCHAR(10) NOT NULL DEFAULT 'EUR',
  category    VARCHAR(191) NOT NULL,
  date        DATE NOT NULL,
  note        TEXT NULL,
  description TEXT NULL,
  createdAt   DATETIME NULL,
  updatedAt   DATETIME NULL,
  CONSTRAINT fk_tx_category
    FOREIGN KEY (category) REFERENCES categories(id)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  currency         VARCHAR(10) DEFAULT 'EUR',
  dateFormat       VARCHAR(32) DEFAULT 'YYYY-MM-DD',
  language         VARCHAR(10) DEFAULT 'en',
  decimalPlaces    INT DEFAULT 2,
  decimalPrecision INT DEFAULT 2,
  theme            VARCHAR(16) DEFAULT 'system',
  updatedAt        DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

🚀 Run Locally
npm install
npm start

Open http://localhost:3000

🔌 API Overview

GET /api/transactions — list (filters: type, category, startDate, endDate)
POST /api/transactions — create (validates category, stores currency)
PUT /api/transactions/:id — update (partial updates, FK validation)
DELETE /api/transactions/:id — delete
GET /api/categories — list
POST /api/categories — create (unique id/name)
PUT /api/categories/:id — update
DELETE /api/categories/:id — delete (blocked if used by transactions)
GET /api/settings — fetch current settings
PUT /api/settings — upsert settings
GET /api/export — full JSON export
POST /api/import — transactional import of JSON payload

🧪 Testing Checklist:

| Feature            | Steps                       | Expected Result                    | Result                              |
| ------------------ | --------------------------- | ---------------------------------- | ----------------------------------- |
| Add transaction    | Fill modal, click Save      | Transaction appears, charts update | Works: record is created, charts update correctly |
| Edit transaction   | Click Edit → modify → Save  | Row updated, charts recalc         | Works: row is updated, charts are recalculated |
| Delete transaction | Click Delete                | Row removed, charts recalc         | Works: row is removed, charts are recalculated |
| API request check  | Open DevTools → Network tab | CRUD requests sent to backend API  | Requests are sent and processed successfully |
| Filters            | Set type/category/date      | Table shows only matching entries  | Works: filters correctly limit the list |
| Categories CRUD    | Add or delete category      | Appears/Disappears instantly       | Works: categories add/remove instantly |

🔮 Future Improvements

Recurring transactions & budgeting
Role-based users (auth + per-user data)
PWA offline caching
Accessibility & mobile gestures
Server-side currency rates with scheduled updates

🛠 Tech Stack

| Tech                      | Usage                            |
| ------------------------- | -------------------------------- |
| **Node.js + Express**     | Backend API, routing             |
| **HTML5 + Bootstrap 5**   | Responsive frontend layout       |
| **JavaScript ES Modules** | Modular, clean code organization |
| **Chart.js**              | Interactive charts               |
| **SheetJS (xlsx.js)**     | Excel export support             |
| **REST API**              | CRUD operations for transactions |
