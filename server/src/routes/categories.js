const express = require('express');
const categoriesController = require('../controllers/categoriesController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 공개: 카테고리 목록 (메인 화면용)
router.get('/', categoriesController.list);

// 어드민 전용: 등록, 수정, 삭제
router.post('/', authenticate, requireAdmin, categoriesController.create);
router.get('/:id', authenticate, requireAdmin, categoriesController.getById);
router.put('/:id', authenticate, requireAdmin, categoriesController.update);
router.delete('/:id', authenticate, requireAdmin, categoriesController.remove);

module.exports = router;
