const express = require('express');
const ordersController = require('../controllers/ordersController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, ordersController.list);
router.get('/admin/all', authenticate, requireAdmin, ordersController.listAll);
router.get('/:id', authenticate, ordersController.getById);
router.post('/', authenticate, ordersController.create);
router.put('/:id', authenticate, requireAdmin, ordersController.update);
router.delete('/:id', authenticate, ordersController.remove);

module.exports = router;
