const express = require('express');
const path = require('path');
const router = express.Router();
const usersRouter = require('./users');
const authRouter = require('./auth');
const productsRouter = require('./products');
const categoriesRouter = require('./categories');
const cartRouter = require('./cart');
const ordersRouter = require('./orders');
const uploadRouter = require('./upload');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 정적 이미지 서빙 (uploads 폴더)
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);
router.use('/upload', uploadRouter);

module.exports = router;
