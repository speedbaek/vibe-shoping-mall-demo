const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// uploads 폴더 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp)'));
  },
});

router.post(
  '/',
  authenticate,
  requireAdmin,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: '파일 크기는 5MB 이하만 가능합니다.' });
          }
        }
        return res.status(400).json({ message: err.message || '업로드 실패' });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일을 선택해 주세요.' });
    }
    // 클라이언트에서 사용할 URL (프록시 통해 /api -> 서버)
    const url = `/api/uploads/${req.file.filename}`;
    res.json({ url });
  }
);

module.exports = router;
