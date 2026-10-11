// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || '';

// Determine whether SSL should be enabled:
// - Disabled for local connections (localhost / 127.0.0.1) or if explicitly disabled
// - Enabled for remote cloud PostgreSQL services (Render, Supabase, Neon, AWS RDS)
const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('sslmode=disable');

const pool = new Pool({
  connectionString: dbUrl || 'postgres://postgres:postgres@localhost:5432/apex_bank',
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
