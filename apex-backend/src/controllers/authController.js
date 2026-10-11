// src/controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new Customer or Bank Admin
exports.registerCustomer = async (req, res) => {
    const { name, email, phone, password, address, city, dob, role, branchId } = req.body;

    try {
        // 1. Check if user already exists
        const userExists = await pool.query('SELECT * FROM "User" WHERE Email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // 2. Hash the password securely
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Determine target role (Admin vs Customer)
        const targetRole = (role && role.toLowerCase() === 'admin') ? 'Admin' : 'Customer';

        // 3. Resolve target branch ID
        let targetBranchId = branchId ? parseInt(branchId, 10) : null;
        if (!targetBranchId) {
            const defBranch = await pool.query('SELECT BranchID FROM Branch WHERE IsActive = true ORDER BY BranchID ASC LIMIT 1');
            if (defBranch.rows.length > 0) {
                targetBranchId = defBranch.rows[0].branchid;
            }
        }

        // 4. Start a PostgreSQL transaction
        await pool.query('BEGIN');

        // 5. Insert into the main "User" table
        const userResult = await pool.query(
            `INSERT INTO "User" (Name, Email, Phone, Password, Role) 
             VALUES ($1, $2, $3, $4, $5) RETURNING UserID`,
            [name, email, phone, hashedPassword, targetRole]
        );
        
        const newUserId = userResult.rows[0].userid;

        // 6. Insert into specialized Customer table with assigned branch
        await pool.query(
            `INSERT INTO Customer (UserID, Address, City, DateOfBirth, BranchID) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (UserID) DO UPDATE SET BranchID = $5`,
            [newUserId, address || (targetRole === 'Admin' ? 'Bank Headquarters' : 'Default Address'), city || 'Mumbai', dob || '1990-01-01', targetBranchId]
        );

        // 7. If role is Admin, also register in Employee table for branch affiliation
        if (targetRole === 'Admin' && targetBranchId) {
            await pool.query(
                `INSERT INTO Employee (UserID, BranchID, Designation, Salary)
                 VALUES ($1, $2, 'Administrator', 85000)
                 ON CONFLICT (UserID) DO UPDATE SET BranchID = $2`,
                [newUserId, targetBranchId]
            );
        }

        // 8. If role is Customer, auto-create default Savings Account in the chosen branch
        if (targetRole === 'Customer' && targetBranchId) {
            const accNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
            await pool.query(
                `INSERT INTO Account (AccountNumber, CustomerID, BranchID, AccountType, Balance, Status) 
                 VALUES ($1, $2, $3, 'Savings', 1000, 'Active') ON CONFLICT DO NOTHING`,
                [accNumber, newUserId, targetBranchId]
            );
        }

        // 9. Commit transaction if everything succeeded
        await pool.query('COMMIT');

        res.status(201).json({ 
            message: `${targetRole === 'Admin' ? 'Bank Admin' : 'Customer'} account created successfully!`, 
            userId: newUserId,
            role: targetRole,
            branchId: targetBranchId
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login an existing user
exports.loginUser = async (req, res) => {
    const { email, password, requiredRole } = req.body;

    try {
        // 1. Check if user exists
        const userResult = await pool.query('SELECT * FROM "User" WHERE Email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // 2. Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 3. Enforce strict role separation between Customer and Admin
        const dbRole = (user.role || '').toLowerCase();
        const reqRole = (requiredRole || '').toLowerCase();

        if (reqRole && dbRole !== reqRole) {
            const roleName = dbRole === 'admin' ? 'Bank Admin' : 'Customer';
            const allowedPortal = dbRole === 'admin' ? 'Bank Admin Portal' : 'Customer Portal';
            const portalName = reqRole === 'admin' ? 'Bank Admin Portal' : 'Customer Portal';
            return res.status(403).json({
                error: `Access Denied: This account was created as a ${roleName}. You can only log in through the ${allowedPortal}, not the ${portalName}.`
            });
        }

        // 4. Generate a JSON Web Token (JWT)
        const token = jwt.sign(
            { userId: user.userid, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.userid,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Change Password for logged in user (Admin or Customer)
exports.changePassword = async (req, res) => {
    const { userId, email, currentPassword, newPassword } = req.body;
    const targetUserId = req.user?.userId || userId;
    const targetEmail = req.user?.email || email;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current password and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    try {
        let userResult;
        if (targetUserId) {
            userResult = await pool.query('SELECT * FROM "User" WHERE UserID = $1', [targetUserId]);
        } else if (targetEmail) {
            userResult = await pool.query('SELECT * FROM "User" WHERE Email = $1', [targetEmail]);
        } else {
            return res.status(400).json({ error: 'User identifier required' });
        }

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User account not found' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password does not match' });
        }

        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        await pool.query('UPDATE "User" SET Password = $1 WHERE UserID = $2', [hashedNewPassword, user.userid]);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Server error while updating password' });
    }
};

// Update profile details for user (Admin or Customer)
exports.updateProfile = async (req, res) => {
    const { userId, email, name, phone, address, city } = req.body;
    const targetUserId = req.user?.userId || userId;
    const targetEmail = req.user?.email || email;

    try {
        let userResult;
        if (targetUserId) {
            userResult = await pool.query('SELECT * FROM "User" WHERE UserID = $1', [targetUserId]);
        } else if (targetEmail) {
            userResult = await pool.query('SELECT * FROM "User" WHERE Email = $1', [targetEmail]);
        } else {
            return res.status(400).json({ error: 'User identifier required' });
        }

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User account not found' });
        }

        const user = userResult.rows[0];

        if (name || phone) {
            await pool.query(
                'UPDATE "User" SET Name = COALESCE($1, Name), Phone = COALESCE($2, Phone) WHERE UserID = $3',
                [name || null, phone || null, user.userid]
            );
        }

        if (address || city) {
            await pool.query(
                `INSERT INTO Customer (UserID, Address, City) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (UserID) 
                 DO UPDATE SET Address = COALESCE($2, Customer.Address), City = COALESCE($3, Customer.City)`,
                [user.userid, address || null, city || null]
            );
        }

        const updatedUserRes = await pool.query(
            `SELECT u.UserID, u.Name, u.Email, u.Phone, u.Role, c.Address, c.City 
             FROM "User" u 
             LEFT JOIN Customer c ON u.UserID = c.UserID 
             WHERE u.UserID = $1`,
            [user.userid]
        );

        const updated = updatedUserRes.rows[0];

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updated.userid,
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
                role: updated.role,
                address: updated.address,
                city: updated.city
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error while updating profile' });
    }
};