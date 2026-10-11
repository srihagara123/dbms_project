const pool = require('../config/db');

// Map Frontend types to Database types
const mapTypeToDB = (type) => {
    if (!type) return 'Personal';
    if (type.includes('Home')) return 'Home';
    if (type.includes('Auto')) return 'Auto';
    if (type.includes('Education')) return 'Education';
    return 'Personal';
};

const mapTypeToFrontend = (type) => {
    if (type === 'Home') return 'Home Mortgage';
    if (type === 'Auto') return 'Auto Loan';
    if (type === 'Education') return 'Education Loan';
    return 'Personal Loan';
};

// 1. Customer Applies for a Loan
exports.applyLoan = async (req, res) => {
    const { loanType, amount, interestRate, termMonths } = req.body;
    const userId = req.user.userId;

    try {
        const dbType = mapTypeToDB(loanType);
        await pool.query(
            `INSERT INTO Loan (CustomerID, LoanType, PrincipalAmount, InterestRate, TenureMonths, LoanStatus, DisbursedDate)
             VALUES ($1, $2, $3, $4, $5, 'Applied', CURRENT_TIMESTAMP)`,
            [userId, dbType, amount || 100000, interestRate || 8.5, termMonths || 48]
        );
        res.status(201).json({ message: 'Loan applied successfully!' });
    } catch (err) {
        console.error('Loan application error:', err);
        res.status(500).json({ error: 'Failed to apply for loan.' });
    }
};

// 2. Fetch Loans (For both Customers and Admins)
exports.getLoans = async (req, res) => {
    const { userId, role } = req.user;
    
    try {
        let query = `
            SELECT 
                l.LoanID, COALESCE(u.Name, 'Bank Customer') AS "customerName", l.CustomerID AS "customerId",
                l.LoanType, l.PrincipalAmount AS amount, l.InterestRate AS "interestRate",
                l.TenureMonths AS "termMonths", l.LoanStatus AS status,
                TO_CHAR(l.DisbursedDate, 'YYYY-MM-DD') AS "appliedDate"
            FROM Loan l
            LEFT JOIN "User" u ON l.CustomerID = u.UserID
        `;
        let values = [];

        // Case-insensitive check for customer role
        if (role && role.toLowerCase() === 'customer') {
            query += ` WHERE l.CustomerID = $1`;
            values.push(userId);
        }
        query += ` ORDER BY l.LoanID DESC`;

        const result = await pool.query(query, values);
        
        // Correctly placed mapping function
        const formattedLoans = result.rows.map(row => {
            const p = parseFloat(row.amount);
            const r = parseFloat(row.interestRate || 8.5) / 100 / 12;
            const n = parseInt(row.termMonths || 48);
            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

            let displayStatus = 'Pending';
            const rawStatus = (row.status || '').toLowerCase();
            if (rawStatus === 'approved' || rawStatus === 'accepted') displayStatus = 'Approved';
            else if (rawStatus === 'rejected') displayStatus = 'Rejected';

            return {
                id: `LOAN-${row.loanid}`,
                customerName: row.customerName,
                customerId: row.customerId, // Fixed mapping
                loanType: mapTypeToFrontend(row.loantype),
                amount: p,
                interestRate: parseFloat(row.interestRate || 8.5),
                termMonths: n,
                emi: isNaN(emi) ? 0 : parseFloat(emi.toFixed(2)),
                status: displayStatus,
                appliedDate: row.appliedDate || new Date().toISOString().split('T')[0],
                creditScore: 800
            };
        });

        res.status(200).json(formattedLoans);
    } catch (err) {
        console.error('Fetch loans error:', err);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
};

// 3. Admin Approves or Rejects a Loan
exports.updateLoanStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    
    try {
        const loanId = id.toString().replace(/[^0-9]/g, '');
        const dbStatus = String(status).toLowerCase() === 'approved' ? 'Approved' : 'Rejected';
        
        await pool.query(
            'UPDATE Loan SET LoanStatus = $1 WHERE LoanID = $2',
            [dbStatus, loanId]
        );
        res.status(200).json({ message: 'Loan status updated successfully!' });
    } catch (err) {
        console.error('Update loan error:', err);
        res.status(500).json({ error: 'Failed to update loan status.' });
    }
};