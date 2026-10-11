// src/routes/loanRoutes.js
const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Get all loans for current user / admin
router.get('/', verifyToken, loanController.getLoans);

// Apply for a new loan
router.post('/apply', verifyToken, loanController.applyLoan);

// Update loan status (Admin only)
router.patch('/:id/status', verifyToken, loanController.updateLoanStatus);

// Also support PUT just in case frontend sends PUT
router.put('/:id/status', verifyToken, loanController.updateLoanStatus);

module.exports = router;