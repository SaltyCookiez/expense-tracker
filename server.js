import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'htm'],
  index: false
}));

// Data file path
const DATA_FILE = path.join(__dirname, 'data.json');

// Helper function to read data from file
async function readData() {
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading data file:', error);
    // Return default data structure if file doesn't exist or is invalid
    return {
      transactions: [],
      categories: [],
      settings: {
        currency: 'USD',
        dateFormat: 'YYYY-MM-DD',
        language: 'en',
        decimalPlaces: 2
      },
      nextId: 1
    };
  }
}

// Helper function to write data to file
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to data file:', error);
    throw new Error('Failed to save data');
  }
}

// Initialize data
let data = await readData();

// Ensure required data structures exist
function ensureDataStructure() {
  if (!data.transactions) data.transactions = [];
  if (!data.categories) data.categories = [];
  if (!data.settings) {
    data.settings = {
      currency: 'USD',
      dateFormat: 'YYYY-MM-DD',
      language: 'en',
      decimalPlaces: 2
    };
  }
  if (!data.nextId) data.nextId = 1;
}

// Ensure data structure on startup
ensureDataStructure();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes

// Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let transactions = [...data.transactions];

    // Apply filters
    if (type) {
      transactions = transactions.filter(tx => tx.type === type);
    }
    if (category) {
      transactions = transactions.filter(tx => tx.category === category);
    }
    if (startDate) {
      transactions = transactions.filter(tx => new Date(tx.date) >= new Date(startDate));
    }
    if (endDate) {
      transactions = transactions.filter(tx => new Date(tx.date) <= new Date(endDate));
    }

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, type, category, date, description, note } = req.body;
    
    // Validate required fields
    if (!amount || !type || !category) {
      return res.status(400).json({ error: 'Amount, type, and category are required' });
    }

    const transaction = {
      id: uuidv4(),
      amount: parseFloat(amount),
      type,
      category,
      date: date || new Date().toISOString().split('T')[0],
      description: description || '',
      note: note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.transactions.push(transaction);
    await writeData(data);
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const index = data.transactions.findIndex(tx => tx.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update only allowed fields
    const updatedTransaction = {
      ...data.transactions[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    data.transactions[index] = updatedTransaction;
    await writeData(data);
    
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = data.transactions.length;
    
    data.transactions = data.transactions.filter(tx => tx.id !== id);
    
    if (data.transactions.length === initialLength) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    res.json(data.categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, type, color } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    // Check if category already exists
    if (data.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    
    const newCategory = {
      id: uuidv4(),
      name: name.trim(),
      type,
      color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.categories.push(newCategory);
    await writeData(data);
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, color } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    const index = data.categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if another category with the same name exists
    if (data.categories.some((cat, i) => 
      i !== index && cat.name.toLowerCase() === name.toLowerCase()
    )) {
      return res.status(400).json({ error: 'Another category with this name already exists' });
    }
    
    // Update category
    data.categories[index] = {
      ...data.categories[index],
      name: name.trim(),
      type,
      color: color || data.categories[index].color,
      updatedAt: new Date().toISOString()
    };
    
    await writeData(data);
    
    res.json(data.categories[index]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = data.categories.length;
    
    // Check if category is used in transactions
    const isUsed = data.transactions.some(tx => tx.category === id);
    if (isUsed) {
      return res.status(400).json({ 
        error: 'Cannot delete category that is being used by transactions' 
      });
    }
    
    data.categories = data.categories.filter(cat => cat.id !== id);
    
    if (data.categories.length === initialLength) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await writeData(data);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Settings
app.get('/api/settings', async (req, res) => {
  try {
    res.json(data.settings || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate updates
    if (updates.currency && typeof updates.currency !== 'string') {
      return res.status(400).json({ error: 'Invalid currency' });
    }
    
    if (updates.language && typeof updates.language !== 'string') {
      return res.status(400).json({ error: 'Invalid language' });
    }
    
    if (updates.decimalPlaces && 
        (typeof updates.decimalPlaces !== 'number' || 
         updates.decimalPlaces < 0 || 
         updates.decimalPlaces > 8)) {
      return res.status(400).json({ error: 'Invalid decimal places' });
    }
    
    // Update settings
    data.settings = {
      ...data.settings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await writeData(data);
    
    res.json(data.settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Import/Export
app.get('/api/export', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=expense-tracker-export.json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const importData = req.body;
    
    // Validate import data
    if (!importData || typeof importData !== 'object') {
      return res.status(400).json({ error: 'Invalid import data' });
    }
    
    // Backup current data
    const backup = { ...data };
    
    try {
      // Update data with imported data
      if (Array.isArray(importData.transactions)) {
        data.transactions = importData.transactions;
      }
      
      if (Array.isArray(importData.categories)) {
        data.categories = importData.categories;
      }
      
      if (importData.settings && typeof importData.settings === 'object') {
        data.settings = {
          ...data.settings,
          ...importData.settings
        };
      }
      
      // Save imported data
      await writeData(data);
      
      res.json({ message: 'Data imported successfully' });
    } catch (error) {
      // Restore backup if import fails
      data = backup;
      await writeData(data);
      throw error;
    }
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Serve the main HTML file for any other GET request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Data file:', DATA_FILE);
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
