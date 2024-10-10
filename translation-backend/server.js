const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection using the connection string from the environment variables or fallback hardcoded string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.kmujxmbinptxieuohrbj:silent%40penguin95@aws-0-us-east-1.pooler.supabase.com:6543/postgres', // Make sure special characters like '@' are URL encoded
  ssl: {
    rejectUnauthorized: false,  // Supabase requires SSL
  },
});

// Test the connection to the database to make sure it works
pool.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.stack);
  } else {
    console.log('Connected to the database.');
  }
});

// Function to create the table if it doesn't exist
const createTableIfNotExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS translations (
      id SERIAL PRIMARY KEY,
      original_message TEXT NOT NULL,
      translated_message TEXT NOT NULL,
      language VARCHAR(50) NOT NULL,
      model VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Table "translations" is ready.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

// Create the table when the server starts
createTableIfNotExists();

// Route for handling POST requests
app.post('/api/translations', async (req, res) => {
  const { original_message, translated_message, language, model } = req.body;

  // Log the incoming request body to verify the data is received correctly
  console.log('Received data:', req.body);

  if (!original_message || !translated_message || !language || !model) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO translations (original_message, translated_message, language, model) VALUES ($1, $2, $3, $4) RETURNING *',
      [original_message, translated_message, language, model]
    );
    console.log('Insert successful:', result.rows[0]); // Log the inserted row
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Database insertion error:', error);  // Log the exact error
    res.status(500).json({ error: 'Database insertion error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
