const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const authRouter = require('./auth');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRouter);
router.use('/users', usersRouter);

module.exports = router;
