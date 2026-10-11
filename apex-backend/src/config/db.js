// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || '';
const dbHost = process.env.DB_HOST || '';

const isLocalHost = (value) => !value || value.includes('localhost') || value.includes('127.0.0.1');

// Connection settings are resolved in this order:
// 1. DATABASE_URL (single connection string)
// 2. DB_HOST / DB_USER / DB_PASSWORD / DB_NAME / DB_PORT (separate variables)
// 3. Local development default
let connection;
let isLocal;

if (dbUrl) {
  connection = { connectionString: dbUrl };
  isLocal = isLocalHost(dbUrl) || dbUrl.includes('sslmode=disable');
} else if (dbHost) {
  connection = {
    host: dbHost,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
  };
  isLocal = isLocalHost(dbHost);
} else {
  connection = { connectionString: 'postgres://postgres:postgres@localhost:5432/apex_bank' };
  isLocal = true;
}

// SSL is disabled for local connections and enabled for remote cloud
// PostgreSQL services (Render, Supabase, Neon, AWS RDS)
const pool = new Pool({
  ...connection,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on('connect', () => {
  console.log('✅ Successfully connected to the PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('❌ Database pool client error (reconnecting):', err.message);
  // Do NOT process.exit(-1) here so the server stays alive during transient disconnects
});

module.exports = pool;
