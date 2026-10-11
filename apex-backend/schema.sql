-- ====================================================================
-- Apex Bank Management System - Relational Database Schema
-- Based on 23CSE202 DBMS Project Design Specification (Group C4)
-- Compatible with PostgreSQL 13+
-- ====================================================================

-- 1. Create USER Table (Core Authentication & Identity)
CREATE TABLE IF NOT EXISTS "User" (
    UserID SERIAL PRIMARY KEY,
    Name VARCHAR(80) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('Customer', 'Employee', 'Admin')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create BRANCH Table (Physical Bank Branch Locations)
CREATE TABLE IF NOT EXISTS Branch (
    BranchID SERIAL PRIMARY KEY,
    BranchName VARCHAR(100) NOT NULL,
    IFSCCode VARCHAR(11) UNIQUE NOT NULL,
    Address VARCHAR(150) NOT NULL,
    City VARCHAR(50) NOT NULL,
    ContactNumber VARCHAR(15),
    IsActive BOOLEAN DEFAULT TRUE
);

-- 3. Create CUSTOMER Table (Specialisation of User)
CREATE TABLE IF NOT EXISTS Customer (
    UserID INT PRIMARY KEY REFERENCES "User"(UserID) ON DELETE CASCADE,
    Address VARCHAR(150),
    City VARCHAR(50),
    DateOfBirth DATE,
    KYCStatus VARCHAR(15) DEFAULT 'Verified' CHECK (KYCStatus IN ('Pending', 'Verified', 'Rejected', 'Flagged')),
    BranchID INT REFERENCES Branch(BranchID) ON DELETE SET NULL
);

-- 4. Create EMPLOYEE Table (Specialisation of User)
CREATE TABLE IF NOT EXISTS Employee (
    UserID INT PRIMARY KEY REFERENCES "User"(UserID) ON DELETE CASCADE,
    BranchID INT NOT NULL REFERENCES Branch(BranchID) ON DELETE CASCADE,
    Designation VARCHAR(40) DEFAULT 'Bank Staff',
    Salary DECIMAL(10,2) CHECK (Salary > 0)
);

-- 5. Create ADMIN Table (Specialisation of User)
CREATE TABLE IF NOT EXISTS Admin (
    UserID INT PRIMARY KEY REFERENCES "User"(UserID) ON DELETE CASCADE,
    AccessLevel VARCHAR(20) DEFAULT 'SuperAdmin'
);

-- 6. Create ACCOUNT Table (Core Banking Accounts)
CREATE TABLE IF NOT EXISTS Account (
    AccountID SERIAL PRIMARY KEY,
    AccountNumber VARCHAR(18) UNIQUE NOT NULL,
    CustomerID INT NOT NULL REFERENCES Customer(UserID) ON DELETE CASCADE,
    BranchID INT NOT NULL REFERENCES Branch(BranchID) ON DELETE CASCADE,
    AccountType VARCHAR(20) NOT NULL CHECK (AccountType IN ('Savings', 'Checking', 'Current', 'FixedDeposit')),
    Balance DECIMAL(12,2) DEFAULT 0 CHECK (Balance >= 0),
    OpenedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(30) DEFAULT 'Active' CHECK (Status IN ('Active', 'Frozen', 'Closed', 'Dormant', 'Deactivation Requested', 'Deactivated'))
);

-- 7. Create TRANSACTION Table (Append-only Ledger)
CREATE TABLE IF NOT EXISTS Transaction (
    AccountID INT NOT NULL REFERENCES Account(AccountID) ON DELETE CASCADE,
    TransactionSeqNo INT NOT NULL,
    TransactionType VARCHAR(20) NOT NULL CHECK (TransactionType IN ('Deposit', 'Withdrawal', 'TransferIn', 'TransferOut')),
    Amount DECIMAL(12,2) NOT NULL CHECK (Amount > 0),
    TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    BalanceAfter DECIMAL(12,2),
    Description VARCHAR(255),
    PRIMARY KEY (AccountID, TransactionSeqNo)
);

-- 8. Create NOMINEE Table (Beneficiaries)
CREATE TABLE IF NOT EXISTS Nominee (
    AccountID INT NOT NULL REFERENCES Account(AccountID) ON DELETE CASCADE,
    NomineeSeqNo INT NOT NULL,
    NomineeName VARCHAR(80) NOT NULL,
    Relationship VARCHAR(30),
    SharePercentage DECIMAL(5,2) CHECK (SharePercentage >= 0 AND SharePercentage <= 100),
    PRIMARY KEY (AccountID, NomineeSeqNo)
);

-- 9. Create CARD Table (Debit/Credit Cards)
CREATE TABLE IF NOT EXISTS Card (
    CardID SERIAL PRIMARY KEY,
    AccountID INT UNIQUE NOT NULL REFERENCES Account(AccountID) ON DELETE CASCADE,
    CardNumber VARCHAR(16) UNIQUE NOT NULL,
    CardType VARCHAR(10) DEFAULT 'Debit' CHECK (CardType IN ('Debit', 'Credit')),
    ExpiryDate DATE NOT NULL,
    CVV VARCHAR(255) NOT NULL,
    Status VARCHAR(10) DEFAULT 'Active' CHECK (Status IN ('Active', 'Blocked', 'Expired'))
);

-- 10. Create LOAN Table (Loan Applications)
CREATE TABLE IF NOT EXISTS Loan (
    LoanID SERIAL PRIMARY KEY,
    CustomerID INT NOT NULL REFERENCES Customer(UserID) ON DELETE CASCADE,
    EmployeeID INT REFERENCES "User"(UserID) ON DELETE SET NULL,
    LoanType VARCHAR(20) NOT NULL CHECK (LoanType IN ('Personal', 'Home', 'Auto', 'Education')),
    PrincipalAmount DECIMAL(12,2) NOT NULL CHECK (PrincipalAmount > 0),
    InterestRate DECIMAL(4,2) NOT NULL CHECK (InterestRate > 0),
    TenureMonths INT NOT NULL CHECK (TenureMonths > 0),
    LoanStatus VARCHAR(20) DEFAULT 'Applied' CHECK (LoanStatus IN ('Applied', 'UnderReview', 'Approved', 'Rejected', 'Disbursed', 'Closed', 'Defaulted')),
    DisbursedDate TIMESTAMP
);

-- ====================================================================
-- SEED ESSENTIAL INITIAL DATA
-- ====================================================================

-- Seed Default Branches so foreign keys and registrations succeed immediately
INSERT INTO Branch (BranchID, BranchName, IFSCCode, Address, City, ContactNumber, IsActive)
VALUES 
    (1, 'Apex Main Branch - Mumbai', 'APEX0000001', 'Bandra-Kurla Complex', 'Mumbai', '+91 22 2650 1100', true),
    (2, 'Apex Silicon Valley - Bengaluru', 'APEX0000002', 'Indiranagar 100 Feet Road', 'Bengaluru', '+91 80 2520 2200', true),
    (3, 'Apex Capital Branch - New Delhi', 'APEX0000003', 'Connaught Place', 'New Delhi', '+91 11 2330 3300', true),
    (4, 'Apex South Hub - Chennai', 'APEX0000004', 'Anna Salai', 'Chennai', '+91 44 2850 4400', true)
ON CONFLICT (BranchID) DO NOTHING;

-- Reset sequence for BranchID if rows were manually inserted
SELECT setval(pg_get_serial_sequence('Branch', 'branchid'), COALESCE(MAX(BranchID), 1)) FROM Branch;
