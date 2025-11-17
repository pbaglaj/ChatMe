const { Pool } = require('pg');
require('dotenv').config();

// Tworzymy nową pulę połączeń.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Błąd podczas łączenia z bazą danych', err.stack);
  }
  console.log('Pomyślnie połączono z bazą danych PostgreSQL.');
  client.release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};