const express = require('express');
const ordersController = require('../controllers/ordersController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, ordersController.create);

module.exports = router;
