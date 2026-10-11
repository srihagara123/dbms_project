const pool = require('../config/db');

// Create a new Bank Account (Savings / Checking)
exports.createAccount = async (req, res) => {
    const { accountType, initialBalance, branchId } = req.body;
    const userId = req.user.userId; 

    try {
        // 1. Resolve target Branch ID: explicit body -> customer profile -> fallback default
        let targetBranchId = branchId ? parseInt(branchId, 10) : null;
        if (!targetBranchId) {
            const custRes = await pool.query('SELECT BranchID FROM Customer WHERE UserID = $1', [userId]);
            if (custRes.rows.length > 0 && custRes.rows[0].branchid) {
                targetBranchId = custRes.rows[0].branchid;
            }
        }
        if (!targetBranchId) {
            const branchCheck = await pool.query('SELECT BranchID FROM Branch WHERE IsActive = true ORDER BY BranchID ASC LIMIT 1');
            if (branchCheck.rows.length > 0) {
                targetBranchId = branchCheck.rows[0].branchid;
            } else {
                const newBranch = await pool.query(
                    `INSERT INTO Branch (BranchName, Address, City, IFSCCode) 
                     VALUES ('Apex Main Branch - Mumbai', 'Bandra-Kurla Complex', 'Mumbai', 'APEX0000001') RETURNING BranchID`
                );
                targetBranchId = newBranch.rows[0].branchid;
            }
        }

        // 2. Generate unique Account Number and Insert Account with Minimum Balance (Rs 1,000)
        const accNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const validAccountType = accountType === 'Checking' ? 'Checking' : (accountType || 'Savings');
        const startingBalance = (initialBalance !== undefined && Number(initialBalance) > 0) ? Number(initialBalance) : 1000;

        const result = await pool.query(
            `INSERT INTO Account (AccountNumber, CustomerID, BranchID, AccountType, Balance, Status) 
             VALUES ($1, $2, $3, $4, $5, 'Active') RETURNING *`,
            [accNumber, userId, targetBranchId, validAccountType, startingBalance]
        );
        
        res.status(201).json({ message: 'Account created successfully', account: result.rows[0] });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

// Get Accounts (Formatted for React with INR currency)
exports.getAccounts = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        let query = `
            SELECT 
                a.AccountID AS id,
                a.AccountNumber AS "accountNumber",
                'IN89APEX' || a.AccountNumber AS iban,
                COALESCE(u.Name, 'Customer #' || a.CustomerID) AS "customerName",
                a.CustomerID AS "userId",
                a.AccountType AS type,
                a.Balance AS balance,
                'INR' AS currency,
                CASE WHEN a.AccountType = 'Savings' THEN 4.25 ELSE 1.10 END AS "interestRate",
                a.Status AS status,
                COALESCE(b.BranchName, 'Apex Main Branch') AS branch,
                TO_CHAR(a.OpenedDate, 'YYYY-MM-DD') AS "openedDate"
            FROM Account a
            LEFT JOIN "User" u ON a.CustomerID = u.UserID
            LEFT JOIN Branch b ON a.BranchID = b.BranchID
        `;

        let values = [];
        
        if (role && role.toLowerCase() === 'customer') {
            query += ` WHERE a.CustomerID = $1`;
            values.push(userId);
        }

        query += ` ORDER BY a.AccountID DESC`;

        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
};

// Update Account Status (Deactivation Request, Approval, Rejection)
exports.updateAccountStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const role = req.user.role;
    const userId = req.user.userId;

    try {
        const numericId = parseInt(id.toString().replace(/\D/g, ''), 10) || id;
        
        // If customer is requesting deactivation, verify account belongs to customer
        if (role && role.toLowerCase() === 'customer') {
            const check = await pool.query('SELECT * FROM Account WHERE AccountID = $1 AND CustomerID = $2', [numericId, userId]);
            if (check.rows.length === 0) {
                return res.status(403).json({ error: 'Access denied to this account.' });
            }
            if (status !== 'Deactivation Requested') {
                return res.status(400).json({ error: 'Customers can only request deactivation.' });
            }
        }

        await pool.query('UPDATE Account SET Status = $1 WHERE AccountID = $2', [status, numericId]);
        res.status(200).json({ message: 'Account status updated successfully', status });
    } catch (error) {
        console.error('Error updating account status:', error);
        res.status(500).json({ error: 'Failed to update account status' });
    }
};