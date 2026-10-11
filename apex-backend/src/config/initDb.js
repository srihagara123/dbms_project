// src/config/initDb.js
const bcrypt = require('bcrypt');

const initSql = `
-- 1. User Table
CREATE TABLE IF NOT EXISTS "User" (
    UserID SERIAL PRIMARY KEY,
    Name VARCHAR(80) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Customer', 'Employee', 'Admin')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Branch Table
CREATE TABLE IF NOT EXISTS Branch (
    BranchID SERIAL PRIMARY KEY,
    BranchName VARCHAR(100) NOT NULL,
    IFSCCode VARCHAR(11) UNIQUE NOT NULL,
    Address VARCHAR(150) NOT NULL,
    City VARCHAR(50) NOT NULL,
    ContactNumber VARCHAR(15),
    IsActive BOOLEAN DEFAULT TRUE
);

-- 3. Customer Table
CREATE TABLE IF NOT EXISTS Customer (
    UserID INT PRIMARY KEY REFERENCES "User"(UserID) ON DELETE CASCADE,
    Address VARCHAR(150),
    City VARCHAR(50),
    DateOfBirth DATE,
    KYCStatus VARCHAR(15) DEFAULT 'Verified',
    BranchID INT REFERENCES Branch(BranchID) ON DELETE SET NULL
);

-- 4. Employee Table
CREATE TABLE IF NOT EXISTS Employee (
    UserID INT PRIMARY KEY REFERENCES "User"(UserID) ON DELETE CASCADE,
    BranchID INT NOT NULL REFERENCES Branch(BranchID) ON DELETE CASCADE,
    Designation VARCHAR(40) DEFAULT 'Bank Staff',
    Salary DECIMAL(10,2) CHECK (Salary > 0)
);

-- 5. Admin Table
CREATE TABLE IF NOT EXISTS Admin (
    UserID INT PRIMARY KEY REFERENCES "User"(UserID) ON DELETE CASCADE,
    AccessLevel VARCHAR(20) DEFAULT 'SuperAdmin'
);

-- 6. Account Table
CREATE TABLE IF NOT EXISTS Account (
    AccountID SERIAL PRIMARY KEY,
    AccountNumber VARCHAR(18) UNIQUE NOT NULL,
    CustomerID INT NOT NULL REFERENCES Customer(UserID) ON DELETE CASCADE,
    BranchID INT NOT NULL REFERENCES Branch(BranchID) ON DELETE CASCADE,
    AccountType VARCHAR(20) NOT NULL,
    Balance DECIMAL(12,2) DEFAULT 0 CHECK (Balance >= 0),
    OpenedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(30) DEFAULT 'Active'
);

-- 7. Transaction Table
CREATE TABLE IF NOT EXISTS Transaction (
    AccountID INT NOT NULL REFERENCES Account(AccountID) ON DELETE CASCADE,
    TransactionSeqNo INT NOT NULL,
    TransactionType VARCHAR(20) NOT NULL,
    Amount DECIMAL(12,2) NOT NULL CHECK (Amount > 0),
    TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    BalanceAfter DECIMAL(12,2),
    Description VARCHAR(255),
    PRIMARY KEY (AccountID, TransactionSeqNo)
);

-- 8. Nominee Table
CREATE TABLE IF NOT EXISTS Nominee (
    AccountID INT NOT NULL REFERENCES Account(AccountID) ON DELETE CASCADE,
    NomineeSeqNo INT NOT NULL,
    NomineeName VARCHAR(80) NOT NULL,
    Relationship VARCHAR(30),
    SharePercentage DECIMAL(5,2),
    PRIMARY KEY (AccountID, NomineeSeqNo)
);

-- 9. Card Table
CREATE TABLE IF NOT EXISTS Card (
    CardID SERIAL PRIMARY KEY,
    AccountID INT UNIQUE NOT NULL REFERENCES Account(AccountID) ON DELETE CASCADE,
    CardNumber VARCHAR(16) UNIQUE NOT NULL,
    CardType VARCHAR(10) DEFAULT 'Debit',
    ExpiryDate DATE NOT NULL,
    CVV VARCHAR(255) NOT NULL,
    Status VARCHAR(10) DEFAULT 'Active'
);

-- 10. Loan Table
CREATE TABLE IF NOT EXISTS Loan (
    LoanID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL REFERENCES Customer(UserID) ON DELETE CASCADE,
    EmployeeID INT REFERENCES "User"(UserID) ON DELETE SET NULL,
    LoanType VARCHAR(20) NOT NULL,
    PrincipalAmount DECIMAL(12,2) NOT NULL CHECK (PrincipalAmount > 0),
    InterestRate DECIMAL(4,2) NOT NULL CHECK (InterestRate > 0),
    TenureMonths INT NOT NULL CHECK (TenureMonths > 0),
    LoanStatus VARCHAR(20) DEFAULT 'Applied',
    DisbursedDate TIMESTAMP
);
`;

const seedBranches = async (pool) => {
    try {
        const branchCheck = await pool.query('SELECT COUNT(*) FROM Branch');
        if (parseInt(branchCheck.rows[0].count, 10) === 0) {
            await pool.query(`
                INSERT INTO Branch (BranchID, BranchName, IFSCCode, Address, City, ContactNumber, IsActive)
                VALUES 
                    (1, 'Apex Main Branch - Mumbai', 'APEX0000001', 'Bandra-Kurla Complex', 'Mumbai', '+91 2226501100', true),
                    (2, 'Apex Silicon Valley - Bengaluru', 'APEX0000002', 'Indiranagar 100 Feet Road', 'Bengaluru', '+91 8025202200', true),
                    (3, 'Apex Capital Branch - New Delhi', 'APEX0000003', 'Connaught Place', 'New Delhi', '+91 1123303300', true),
                    (4, 'Apex South Hub - Chennai', 'APEX0000004', 'Anna Salai', 'Chennai', '+91 4428504400', true)
                ON CONFLICT (BranchID) DO NOTHING;
            `);
            try {
                await pool.query("SELECT setval(pg_get_serial_sequence('Branch', 'branchid'), COALESCE(MAX(BranchID), 1)) FROM Branch");
            } catch (e) {}
            console.log('✅ Default branches seeded successfully');
        }
    } catch (err) {
        console.warn('⚠️ Could not seed branches:', err.message);
    }
};

const seedAdminUser = async (pool) => {
    try {
        const adminCheck = await pool.query('SELECT * FROM "User" WHERE Role = $1 LIMIT 1', ['Admin']);
        if (adminCheck.rows.length === 0) {
            const hashedPwd = await bcrypt.hash('admin123', 10);
            const userRes = await pool.query(
                `INSERT INTO "User" (Name, Email, Phone, Password, Role)
                 VALUES ($1, $2, $3, $4, 'Admin') RETURNING UserID`,
                ['System Administrator', 'admin@apexbank.com', '+91 9876543210', hashedPwd]
            );
            const adminId = userRes.rows[0].userid;
            await pool.query(
                `INSERT INTO Admin (UserID, AccessLevel) VALUES ($1, 'SuperAdmin') ON CONFLICT DO NOTHING`,
                [adminId]
            );
            await pool.query(
                `INSERT INTO Customer (UserID, Address, City, DateOfBirth, KYCStatus, BranchID) 
                 VALUES ($1, 'Bank Headquarters', 'Mumbai', '1985-01-01', 'Verified', 1) 
                 ON CONFLICT (UserID) DO NOTHING`,
                [adminId]
            );
            console.log('✅ Default Bank Admin seeded: admin@apexbank.com / admin123');
        }
    } catch (err) {
        console.warn('⚠️ Could not seed admin user:', err.message);
    }
};

const initializeDatabase = async (pool) => {
    try {
        console.log('🔄 Checking / initializing database tables...');
        await pool.query(initSql);
        
        // Ensure BranchID column exists on Customer (if Customer existed previously without it)
        try {
            await pool.query(`ALTER TABLE Customer ADD COLUMN IF NOT EXISTS BranchID INT REFERENCES Branch(BranchID) ON DELETE SET NULL;`);
        } catch (e) {}
        
        await seedBranches(pool);
        await seedAdminUser(pool);
        console.log('✅ Database schema and seed data are ready');
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to auto-initialize database tables:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { initializeDatabase };

if (require.main === module) {
    const pool = require('./db');
    initializeDatabase(pool).then(() => {
        pool.end();
    });
}
