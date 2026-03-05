const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Vibe Shopping Mall API', status: 'ok' });
});

// 미처리 에러 시 JSON으로 응답 (500 원인 확인용)
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    message: err.message || '서버 오류가 발생했습니다.',
  });
});

module.exports = app;
