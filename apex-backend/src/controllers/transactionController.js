// src/controllers/transactionController.js
const pool = require('../config/db');

// --- HELPER FUNCTION: Calculate Opening Balance ---
const getOpeningBalance = async (accountId, days) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Using exact column names from your Transaction table
    const query = `
        SELECT COALESCE(SUM(CASE WHEN TransactionType = 'Deposit' THEN Amount ELSE -Amount END), 0) AS opening_balance
        FROM Transaction
        WHERE AccountID = $1 AND TransactionDate < $2
    `;

    const result = await pool.query(query, [accountId, startDate]);
    return parseFloat(result.rows[0].opening_balance);
};


// 1. Process a Deposit, Withdrawal, or Transfer
exports.processTransaction = async (req, res) => {
    const { type, accountId, amount, receiverName, receiverIban } = req.body;
    const userId = req.user.userId;

    try {
        // BEGIN SQL Transaction (ACID Compliance)
        await pool.query('BEGIN');

        // Get the account and Lock the row for updates (FOR UPDATE)
        const accountResult = await pool.query(
            'SELECT * FROM Account WHERE AccountID = $1 AND CustomerID = $2 FOR UPDATE',
            [accountId, userId]
        );

        if (accountResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'Account not found or access denied.' });
        }

        const account = accountResult.rows[0];

        // Validate sufficient balance
        if ((type === 'withdraw' || type === 'transfer') && parseFloat(account.balance) < parseFloat(amount)) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient funds.' });
        }

        // Calculate new balance
        let newBalance = parseFloat(account.balance);
        if (type === 'deposit') {
            newBalance += parseFloat(amount);
        } else {
            newBalance -= parseFloat(amount);
        }

        // Update the Account Balance
        await pool.query(
            'UPDATE Account SET Balance = $1 WHERE AccountID = $2',
            [newBalance, accountId]
        );

        // Record the Transaction in the Ledger
        const dbType = type === 'deposit' ? 'Deposit' : type === 'withdraw' ? 'Withdrawal' : 'TransferOut';
        const description = type === 'transfer' ? `Transfer to ${receiverName} (${receiverIban})` : `${dbType} via Web Portal`;

        // Get next sequence number for this account's transactions
        const seqResult = await pool.query(
            'SELECT COALESCE(MAX(TransactionSeqNo), 0) + 1 AS next_seq FROM Transaction WHERE AccountID = $1',
            [accountId]
        );
        const nextSeq = seqResult.rows[0].next_seq;

        await pool.query(
            `INSERT INTO Transaction (AccountID, TransactionSeqNo, TransactionType, Amount, BalanceAfter, Description)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [accountId, nextSeq, dbType, amount, newBalance, description]
        );

        // COMMIT the successful transaction
        await pool.query('COMMIT');
        res.status(200).json({ message: 'Transaction successful!', newBalance });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Transaction error:', error);
        res.status(500).json({ error: 'Transaction failed due to a server error.' });
    }
};

// 2. Fetch Transaction History mapped for the Frontend UI
exports.getTransactions = async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;
    try {
        let query = `
            SELECT 
                'TXN-' || t.AccountID || '-' || t.TransactionSeqNo AS id,
                'REF-' || t.AccountID || t.TransactionSeqNo AS "referenceNumber",
                u.Name AS "senderName",
                'IN89APEX' || a.AccountNumber AS "senderIban",
                CASE WHEN t.TransactionType = 'TransferOut' THEN t.Description ELSE u.Name END AS "receiverName",
                CASE WHEN t.TransactionType = 'TransferOut' THEN 'EXTERNAL_IBAN' ELSE 'IN89APEX' || a.AccountNumber END AS "receiverIban",
                t.Amount AS amount,
                'INR' AS currency,
                TO_CHAR(t.TransactionDate, 'YYYY-MM-DD') AS date,
                TO_CHAR(t.TransactionDate, 'HH12:MI:SS AM') AS time,
                CASE WHEN t.TransactionType = 'TransferOut' THEN 'Transfer' ELSE t.TransactionType END AS type,
                'Completed' AS status,
                COALESCE(b.BranchName, 'Apex Main Branch') AS branch,
                t.TransactionType AS category,
                0 AS fee,
                t.Description AS description
            FROM Transaction t
            JOIN Account a ON t.AccountID = a.AccountID
            LEFT JOIN "User" u ON a.CustomerID = u.UserID
            LEFT JOIN Branch b ON a.BranchID = b.BranchID
        `;
        let values = [];
        if (role && role.toLowerCase() === 'customer') {
            query += ` WHERE a.CustomerID = $1`;
            values.push(userId);
        }
        query += ` ORDER BY t.TransactionDate DESC`;
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// 3. Generate Account Statement (New function for the statement page)
exports.getAccountStatement = async (req, res) => {
    // Expected query parameters from frontend: /statement?accountId=1&periodDays=30
    const { accountId, periodDays = 30 } = req.query; 
    const userId = req.user.userId;

    if (!accountId) {
        return res.status(400).json({ error: 'Account ID is required.' });
    }

    try {
        // 1. Fetch the historical opening balance
        const openingBalance = await getOpeningBalance(accountId, periodDays);

        // 2. Calculate the cutoff date for fetching the actual statement rows
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        // 3. Fetch the transactions for just this specific period and account
        const query = `
            SELECT 
                'TXN-' || t.AccountID || '-' || t.TransactionSeqNo AS id,
                'REF-' || t.AccountID || t.TransactionSeqNo AS "referenceNumber",
                u.Name AS "senderName",
                'IN89APEX' || a.AccountNumber AS "senderIban",
                CASE WHEN t.TransactionType = 'TransferOut' THEN t.Description ELSE u.Name END AS "receiverName",
                CASE WHEN t.TransactionType = 'TransferOut' THEN 'EXTERNAL_IBAN' ELSE 'IN89APEX' || a.AccountNumber END AS "receiverIban",
                t.Amount AS amount,
                'INR' AS currency,
                TO_CHAR(t.TransactionDate, 'YYYY-MM-DD') AS date,
                TO_CHAR(t.TransactionDate, 'HH12:MI:SS AM') AS time,
                CASE WHEN t.TransactionType = 'TransferOut' THEN 'Transfer' ELSE t.TransactionType END AS type,
                'Completed' AS status,
                b.BranchName AS branch,
                t.TransactionType AS category,
                0 AS fee,
                t.Description AS description
            FROM Transaction t
            JOIN Account a ON t.AccountID = a.AccountID
            JOIN Customer c ON a.CustomerID = c.UserID
            JOIN "User" u ON c.UserID = u.UserID
            JOIN Branch b ON a.BranchID = b.BranchID
            WHERE a.AccountID = $1 AND a.CustomerID = $2 AND t.TransactionDate >= $3
            ORDER BY t.TransactionDate DESC
        `;
        const result = await pool.query(query, [accountId, userId, startDate]);

        // 4. Calculate Total Credits and Debits for the period
        let totalCredits = 0;
        let totalDebits = 0;
        
        result.rows.forEach(txn => {
            const amt = parseFloat(txn.amount);
            if (txn.category === 'Deposit') {
                totalCredits += amt;
            } else {
                totalDebits += amt;
            }
        });

        // 5. Send structured data back to React
        res.status(200).json({
            openingBalance,
            totalCredits,
            totalDebits,
            transactions: result.rows
        });
    } catch (error) {
        console.error('Error generating statement:', error);
        res.status(500).json({ error: 'Failed to generate statement' });
    }
};