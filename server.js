// server-mysql.mjs
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { pool } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

// Init
const app = express();
const port = process.env.PORT || 3000;

// __dirname In ES-Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// JSON
app.use(express.json());

// Static
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'htm'],
  index: false
}));

// Health
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1, timestamp: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error', error: 'DB connection failed' });
  }
});

/* -------------------- TRANSACTIONS -------------------- */

// GET /api/transactions?type=&category=&startDate=&endDate=
app.get('/api/transactions', async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const clauses = [];
    const params = {};

    if (type) { clauses.push('type = :type'); params.type = type; }
    if (category) { clauses.push('category = :category'); params.category = category; }
    if (startDate) { clauses.push('date >= :startDate'); params.startDate = startDate; }
    if (endDate) { clauses.push('date <= :endDate'); params.endDate = endDate; }

    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
    const [rows] = await pool.query(
      `SELECT id, type, amount, category, DATE_FORMAT(date, '%Y-%m-%d') AS date,
              note, description, createdAt, updatedAt
       FROM transactions
       ${where}
       ORDER BY date DESC, createdAt DESC`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions
app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, type, category, date, description, note } = req.body;

    if (amount == null || !type || !category) {
      return res.status(400).json({ error: 'Amount, type, and category are required' });
    }

    // Consider checking FK
    const [cat] = await pool.query('SELECT id FROM categories WHERE id = :id', { id: category });
    if (cat.length === 0) {
      return res.status(400).json({ error: 'Category does not exist' });
    }

    const id = uuidv4();
    const isoDate = (date && String(date).slice(0,10)) || new Date().toISOString().slice(0,10);

    await pool.execute(
      `INSERT INTO transactions
       (id, type, amount, category, date, note, description, createdAt, updatedAt)
       VALUES (:id, :type, :amount, :category, :date, :note, :description, NOW(), NOW())`,
      {
        id,
        type,
        amount: Number(amount),
        category,
        date: isoDate,
        note: note ?? '',
        description: description ?? ''
      }
    );

    const [rows] = await pool.query(
      `SELECT id, type, amount, category, DATE_FORMAT(date, '%Y-%m-%d') AS date,
              note, description, createdAt, updatedAt
       FROM transactions WHERE id = :id`,
      { id }
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// PUT /api/transactions/:id
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, description, note } = req.body;

    // Check if Transaction exists
    const [exists] = await pool.query('SELECT 1 FROM transactions WHERE id = :id', { id });
    if (exists.length === 0) return res.status(404).json({ error: 'Transaction not found' });

    // If category changes test FK
    if (category) {
      const [cat] = await pool.query('SELECT 1 FROM categories WHERE id = :id', { id: category });
      if (cat.length === 0) return res.status(400).json({ error: 'Category does not exist' });
    }

    // Dynamic set
    const sets = [];
    const params = { id };

    if (amount != null) { sets.push('amount = :amount'); params.amount = Number(amount); }
    if (type) { sets.push('type = :type'); params.type = type; }
    if (category) { sets.push('category = :category'); params.category = category; }
    if (date) { sets.push('date = :date'); params.date = String(date).slice(0,10); }
    if (description != null) { sets.push('description = :description'); params.description = description; }
    if (note != null) { sets.push('note = :note'); params.note = note; }

    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    sets.push('updatedAt = NOW()');

    await pool.execute(
      `UPDATE transactions SET ${sets.join(', ')} WHERE id = :id`, params
    );

    const [rows] = await pool.query(
      `SELECT id, type, amount, category, DATE_FORMAT(date, '%Y-%m-%d') AS date,
              note, description, createdAt, updatedAt
       FROM transactions WHERE id = :id`,
      { id }
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM transactions WHERE id = :id', { id });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Transaction not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

/* -------------------- CATEGORIES -------------------- */

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, type, color, updatedAt
       FROM categories ORDER BY name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { id, name, type, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const catId = (id ?? name).toString().trim().toLowerCase();

    // Checking Unique
    const [exists] = await pool.query('SELECT 1 FROM categories WHERE id = :id', { id: catId });
    if (exists.length) return res.status(400).json({ error: 'Category with this id/name already exists' });

    await pool.execute(
      `INSERT INTO categories (id, name, type, color, updatedAt)
       VALUES (:id, :name, :type, :color, NOW())`,
      { id: catId, name: name.trim(), type, color: color || '#6c757d' }
    );

    const [rows] = await pool.query(
      `SELECT id, name, type, color, updatedAt FROM categories WHERE id = :id`,
      { id: catId }
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, color } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

    // Exists?
    const [exists] = await pool.query('SELECT 1 FROM categories WHERE id = :id', { id });
    if (exists.length === 0) return res.status(404).json({ error: 'Category not found' });

    await pool.execute(
      `UPDATE categories
       SET name = :name, type = :type, color = :color, updatedAt = NOW()
       WHERE id = :id`,
      { id, name: name.trim(), type, color: color || '#6c757d' }
    );

    const [rows] = await pool.query(
      `SELECT id, name, type, color, updatedAt FROM categories WHERE id = :id`,
      { id }
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [used] = await pool.query(
      'SELECT 1 FROM transactions WHERE category = :id LIMIT 1', { id }
    );
    if (used.length) {
      return res.status(400).json({ error: 'Cannot delete category that is used by transactions' });
    }

    const [result] = await pool.execute('DELETE FROM categories WHERE id = :id', { id });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

/* -------------------- SETTINGS -------------------- */

app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
    res.json(rows[0] ?? {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { currency, language, decimalPlaces, decimalPrecision, dateFormat, theme } = req.body;

    const [existing] = await pool.query('SELECT id FROM settings ORDER BY id ASC LIMIT 1');
    if (existing.length === 0) {
      await pool.execute(
        `INSERT INTO settings (currency, language, decimalPlaces, decimalPrecision, dateFormat, theme, updatedAt)
         VALUES (:currency, :language, :decimalPlaces, :decimalPrecision, :dateFormat, :theme, NOW())`,
        { currency, language, decimalPlaces, decimalPrecision, dateFormat, theme }
      );
    } else {
      await pool.execute(
        `UPDATE settings
         SET currency = COALESCE(:currency, currency),
             language = COALESCE(:language, language),
             decimalPlaces = COALESCE(:decimalPlaces, decimalPlaces),
             decimalPrecision = COALESCE(:decimalPrecision, decimalPrecision),
             dateFormat = COALESCE(:dateFormat, dateFormat),
             theme = COALESCE(:theme, theme),
             updatedAt = NOW()
         WHERE id = :id`,
        { id: existing[0].id, currency, language, decimalPlaces, decimalPrecision, dateFormat, theme }
      );
    }

    const [rows] = await pool.query('SELECT * FROM settings ORDER BY id ASC LIMIT 1');
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

/* -------------------- EXPORT / IMPORT -------------------- */

app.get('/api/export', async (req, res) => {
  try {
    const [tx] = await pool.query(`SELECT * FROM transactions ORDER BY date DESC, createdAt DESC`);
    const [cats] = await pool.query(`SELECT * FROM categories ORDER BY name ASC`);
    const [setts] = await pool.query(`SELECT * FROM settings ORDER BY id ASC LIMIT 1`);

    const payload = {
      transactions: tx,
      categories: cats,
      settings: setts || null
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=expense-tracker-export.json');
    res.send(JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.post('/api/import', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { transactions, categories, settings } = req.body || {};
    await conn.beginTransaction();

    if (Array.isArray(categories)) {
      await conn.query('DELETE FROM categories');
      if (categories.length) {
        const rows = categories.map(c => [c.id, c.name, c.type, c.color ?? '#6c757d', c.updatedAt?.slice(0,19).replace('T',' ') ?? null]);
        await conn.query(
          `INSERT INTO categories (id, name, type, color, updatedAt) VALUES ?`,
          [rows]
        );
      }
    }

    if (Array.isArray(transactions)) {
      await conn.query('DELETE FROM transactions');
      if (transactions.length) {
        const rows = transactions.map(t => [
          String(t.id),
          t.type,
          Number(t.amount),
          t.category,
          (t.date || new Date().toISOString().slice(0,10)).slice(0,10),
          t.note ?? '',
          t.description ?? '',
          t.createdAt ? t.createdAt.slice(0,19).replace('T',' ') : null,
          t.updatedAt ? t.updatedAt.slice(0,19).replace('T',' ') : null
        ]);
        await conn.query(
          `INSERT INTO transactions
           (id, type, amount, category, date, note, description, createdAt, updatedAt)
           VALUES ?`,
          [rows]
        );
      }
    }

    if (settings && typeof settings === 'object') {
      await conn.query('DELETE FROM settings');
      await conn.query(
        `INSERT INTO settings (currency, dateFormat, language, decimalPlaces, decimalPrecision, theme, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          settings.currency ?? 'USD',
          settings.dateFormat ?? 'YYYY-MM-DD',
          settings.language ?? 'en',
          settings.decimalPlaces ?? 2,
          settings.decimalPrecision ?? 2,
          settings.theme ?? 'system',
          (settings.updatedAt ? settings.updatedAt.slice(0,19).replace('T',' ') : null)
        ]
      );
    }

    await conn.commit();
    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    await conn.rollback();
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  } finally {
    conn.release();
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
