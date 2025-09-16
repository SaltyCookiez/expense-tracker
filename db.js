// db.js
import 'dotenv/config';
import mysql from 'mysql2';

console.log('[DB cfg]', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASS || 'app',
  database: process.env.DB_NAME || 'appdb',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true     
}).promise();

// Ping Pong
(async () => {
  try {
    const [r] = await pool.query('SELECT 1 AS ok');
    console.log('DB ping ok:', r[0].ok);
  } catch (e) {
    console.error('DB ping FAILED:', e.code, e.message);
  }
})();
