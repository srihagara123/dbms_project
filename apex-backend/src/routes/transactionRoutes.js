// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/process', verifyToken, transactionController.processTransaction);
router.get('/', verifyToken, transactionController.getTransactions);
router.get('/statement', verifyToken, transactionController.getAccountStatement);

module.exports = router;