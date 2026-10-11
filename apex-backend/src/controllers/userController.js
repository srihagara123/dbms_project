const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Get all users with grouped profile & aggregated account balances for Admin views
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.UserID AS id,
        u.Name AS name,
        LOWER(REPLACE(u.Name, ' ', '_')) AS username,
        COALESCE(u.Phone, '') AS phone,
        u.Email AS email,
        COALESCE(c.Address, '') AS address,
        COALESCE(MAX(a.AccountNumber), 'N/A') AS "accountNumber",
        COALESCE(MAX(a.AccountType), 'Savings') AS "accountType",
        COALESCE(MAX(b.BranchName), 'Apex Main Branch') AS branch,
        CASE 
          WHEN c.KYCStatus = 'Verified' THEN 'Verified' 
          WHEN c.KYCStatus = 'Flagged' THEN 'Flagged' 
          ELSE 'Pending KYC' 
        END AS status,
        COALESCE(SUM(a.Balance), 0) AS "totalBalance",
        800 AS "creditScore",
        TO_CHAR(u.CreatedAt, 'YYYY-MM-DD') AS "joinedDate",
        TO_CHAR(u.CreatedAt, 'YYYY-MM-DD') AS "createdAt",
        'Active Today' AS "lastLogin",
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' AS avatar,
        u.Role AS role
      FROM "User" u
      LEFT JOIN customer c ON u.UserID = c.UserID
      LEFT JOIN account a ON u.UserID = a.CustomerID
      LEFT JOIN branch b ON a.BranchID = b.BranchID
      GROUP BY u.UserID, u.Name, u.Phone, u.Email, c.Address, c.KYCStatus, u.CreatedAt, u.Role
      ORDER BY u.UserID DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

// Create a new user manually
exports.createUser = async (req, res) => {
  const { name, email, phone, role, password, address, city, branchId } = req.body;
  try {
    const saltRounds = 10;
    const pwd = password || 'password123';
    const hashedPassword = await bcrypt.hash(pwd, saltRounds);

    const userRole = (role && role.toLowerCase() === 'admin') ? 'Admin' : 'Customer';

    let targetBranchId = branchId ? parseInt(branchId, 10) : null;
    if (!targetBranchId) {
      const defBranch = await pool.query('SELECT BranchID FROM Branch WHERE IsActive = true ORDER BY BranchID ASC LIMIT 1');
      if (defBranch.rows.length > 0) targetBranchId = defBranch.rows[0].branchid;
    }

    await pool.query('BEGIN');
    const newUser = await pool.query(
      `INSERT INTO "User" (Name, Email, Phone, Password, Role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, phone || '9999999999', hashedPassword, userRole]
    );

    const newUserId = newUser.rows[0].userid;

    await pool.query(
      `INSERT INTO Customer (UserID, Address, City, DateOfBirth, KYCStatus, BranchID) 
       VALUES ($1, $2, $3, CURRENT_DATE, 'Verified', $4) 
       ON CONFLICT (UserID) DO UPDATE SET BranchID = $4`,
      [newUserId, address || (userRole === 'Admin' ? 'Bank Headquarters' : 'Default Address'), city || 'Mumbai', targetBranchId]
    );

    if (userRole === 'Admin' && targetBranchId) {
      await pool.query(
        `INSERT INTO Employee (UserID, BranchID, Designation, Salary)
         VALUES ($1, $2, 'Administrator', 85000)
         ON CONFLICT (UserID) DO UPDATE SET BranchID = $2`,
        [newUserId, targetBranchId]
      );
    }

    if (userRole === 'Customer' && targetBranchId) {
      const accNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      await pool.query(
        `INSERT INTO Account (AccountNumber, CustomerID, BranchID, AccountType, Balance, Status) 
         VALUES ($1, $2, $3, 'Savings', 1000, 'Active') ON CONFLICT DO NOTHING`,
        [accNumber, newUserId, targetBranchId]
      );
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'User created successfully', user: newUser.rows[0], branchId: targetBranchId });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update a user's role (Admin / Customer)
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const numericId = parseInt(id.toString().replace(/\D/g, ''), 10) || id;
    await pool.query('UPDATE "User" SET Role = $1 WHERE UserID = $2', [role, numericId]);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error('Error updating role:', err.message);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

// Update a user's status (Active / Inactive / Locked)
exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const numericId = parseInt(id.toString().replace(/\D/g, ''), 10) || id;
    const kyc = status === 'Active' ? 'Verified' : status === 'Locked' ? 'Flagged' : 'Pending';
    await pool.query('UPDATE Customer SET KYCStatus = $1 WHERE UserID = $2', [kyc, numericId]);
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating status:', err.message);
    res.status(500).json({ error: 'Failed to update status' });
  }
};