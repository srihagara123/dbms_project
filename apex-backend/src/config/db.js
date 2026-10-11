// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('✅ Successfully connected to the PostgreSQL Database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on database client', err);
    process.exit(-1);
});

module.exports = pool;