const express = require('express');
const productsController = require('../controllers/productsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 공개: 상품 목록, 상세
router.get('/', productsController.list);
router.get('/:id', productsController.getById);

// 어드민 전용: 등록, 수정, 삭제
router.post('/', authenticate, requireAdmin, productsController.create);
router.put('/:id', authenticate, requireAdmin, productsController.update);
router.delete('/:id', authenticate, requireAdmin, productsController.remove);

module.exports = router;
