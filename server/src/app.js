const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');

const app = express();

// uploads 폴더 생성 (없을 경우)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
