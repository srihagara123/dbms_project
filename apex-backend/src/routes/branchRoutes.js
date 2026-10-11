const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

router.get('/', branchController.getBranches);
router.post('/create', branchController.createBranch);

module.exports = router;
