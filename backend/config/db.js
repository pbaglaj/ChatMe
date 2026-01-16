const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error while connecting to database', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database.');
  client.release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};