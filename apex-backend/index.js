// index.js (Backend Entry Point)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection pool and auto-migration
const pool = require('./src/config/db');
const { initializeDatabase } = require('./src/config/initDb');

// Import authentication and business routes
const authRoutes = require('./src/routes/authRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const loanRoutes = require('./src/routes/loanRoutes');
const userRoutes = require('./src/routes/userRoutes');
const branchRoutes = require('./src/routes/branchRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Allows Express to read JSON data from requests

// Health / Status verification endpoint
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            status: 'online',
            message: 'Apex Bank API is running successfully!', 
            dbTimestamp: result.rows[0].now 
        });
    } catch (err) {
        console.error('Database connection error in GET /:', err.message);
        res.status(500).json({ 
            status: 'error',
            error: 'Database connection failed',
            details: err.message,
            hint: 'Verify that DATABASE_URL is set correctly in your environment and your PostgreSQL server is active.'
        });
    }
});

// Explicit health check route for frontend / monitoring
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', database: 'connected', timestamp: result.rows[0].now });
    } catch (err) {
        res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
    }
});

// Setup / Auto-migration endpoint (can be triggered manually if needed)
app.post('/api/setup', async (req, res) => {
    const outcome = await initializeDatabase(pool);
    if (outcome.success) {
        res.json({ message: 'Database schema and seed data initialized successfully!' });
    } else {
        res.status(500).json({ error: 'Database initialization failed', details: outcome.error });
    }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes); 
app.use('/api/transactions', transactionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);

// Start the Server and automatically ensure database schema is ready
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    // Auto-initialize DB schema in background
    try {
        await initializeDatabase(pool);
    } catch (err) {
        console.warn('⚠️ Auto-initialization error on startup:', err.message);
    }
});