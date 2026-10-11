const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes match frontend API calls: /api/users, /api/users/all
router.get('/', userController.getAllUsers);
router.get('/all', userController.getAllUsers);
router.post('/create', userController.createUser);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;