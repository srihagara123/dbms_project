// index.js (Backend Entry Point)
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection pool
const pool = require('./src/config/db');

// Import authentication routes
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

// Test Route to verify server and database connectivity
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            message: 'Apex Bank API is running successfully!', 
            dbTimestamp: result.rows[0].now 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes); 
app.use('/api/transactions', transactionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);


// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});