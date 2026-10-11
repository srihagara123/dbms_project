const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, accountController.getAccounts);
router.post('/create', verifyToken, accountController.createAccount);
router.patch('/:id/status', verifyToken, accountController.updateAccountStatus);

module.exports = router;